-- Peças que faltavam para os módulos: enquete dos debates, ordem do mapa político
-- e a troca do livro da vez.

-- ---------- enquete do debate ----------
-- Qualquer membro propõe a pergunta; um moderador aprova antes de abrir.
-- Votos abertos: "antes" enquanto o debate está agendado, "depois" quando ele termina.
create table public.enquetes (
  id bigint generated always as identity primary key,
  debate_id bigint not null references public.debates(id) on delete cascade,
  pergunta text not null check (char_length(pergunta) between 5 and 160),
  status text not null default 'proposta' check (status in ('proposta', 'aprovada', 'recusada')),
  proposta_por uuid not null default auth.uid() references public.perfis(id) on delete set null,
  decidida_por uuid references public.perfis(id) on delete set null,
  decidida_em timestamptz,
  criado_em timestamptz not null default now()
);
-- Uma enquete viva por debate (recusada não conta, dá pra propor outra).
create unique index uma_enquete_por_debate on public.enquetes (debate_id) where status <> 'recusada';

create table public.votos_enquete (
  enquete_id bigint not null references public.enquetes(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.perfis(id) on delete cascade,
  momento text not null check (momento in ('antes', 'depois')),
  posicao text not null check (posicao in ('a_favor', 'contra', 'indeciso')),
  votado_em timestamptz not null default now(),
  primary key (enquete_id, user_id, momento)
);

create or replace function public.clube_da_enquete(e bigint) returns uuid
language sql stable security definer set search_path = public as $$
  select d.clube_id from public.enquetes q join public.debates d on d.id = q.debate_id where q.id = e;
$$;

-- Pode votar neste momento? Enquete aprovada e o debate na fase certa.
create or replace function public.pode_votar_enquete(e bigint, m text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.enquetes q join public.debates d on d.id = q.debate_id
    where q.id = e and q.status = 'aprovada' and public.eh_membro(d.clube_id)
      and ((m = 'antes' and d.status = 'agendado') or (m = 'depois' and d.status = 'encerrado')));
$$;

alter table public.enquetes enable row level security;
alter table public.votos_enquete enable row level security;

create policy "membros veem enquetes" on public.enquetes for select to authenticated
  using (public.eh_membro(public.clube_da_enquete(id)));
create policy "membro propõe enquete" on public.enquetes for insert to authenticated
  with check (
    proposta_por = auth.uid() and status = 'proposta' and decidida_por is null
    and exists (select 1 from public.debates d where d.id = debate_id
                and d.status = 'agendado' and public.eh_membro(d.clube_id)));
-- Quem propôs retira enquanto ninguém decidiu; moderador apaga qualquer uma.
create policy "autor retira ou moderador apaga enquete" on public.enquetes for delete to authenticated
  using ((proposta_por = auth.uid() and status = 'proposta')
         or public.eh_admin(public.clube_da_enquete(id)));

create policy "membros veem votos (voto aberto)" on public.votos_enquete for select to authenticated
  using (public.eh_membro(public.clube_da_enquete(enquete_id)));
create policy "votar na enquete" on public.votos_enquete for insert to authenticated
  with check (user_id = auth.uid() and public.pode_votar_enquete(enquete_id, momento));
create policy "mudar o voto" on public.votos_enquete for update to authenticated
  using (user_id = auth.uid() and public.pode_votar_enquete(enquete_id, momento))
  with check (user_id = auth.uid() and public.pode_votar_enquete(enquete_id, momento));
create policy "tirar o voto" on public.votos_enquete for delete to authenticated
  using (user_id = auth.uid() and public.pode_votar_enquete(enquete_id, momento));

-- Moderador (ou dono) aprova ou recusa a pergunta.
create or replace function public.decidir_enquete(enquete bigint, aprovar boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_admin(public.clube_da_enquete(enquete)) then
    raise exception 'só moderador decide a enquete' using errcode = '42501';
  end if;
  update public.enquetes
     set status = case when aprovar then 'aprovada' else 'recusada' end,
         decidida_por = auth.uid(), decidida_em = now()
   where id = enquete and status = 'proposta';
  if not found then
    raise exception 'essa enquete já foi decidida' using errcode = '22023';
  end if;
end $$;

-- ---------- debates: só a pessoa que marcou ou o moderador mudam o status ----------
-- (a política de update da migration inicial já cobre isso; aqui só garantimos a ordem
--  agendado → ao_vivo → encerrado, para a enquete não voltar de fase)
create or replace function public.checar_fase_debate() returns trigger
language plpgsql as $$
begin
  if new.status <> old.status and not (
    (old.status = 'agendado' and new.status in ('ao_vivo', 'encerrado'))
    or (old.status = 'ao_vivo' and new.status = 'encerrado')) then
    raise exception 'o debate só anda pra frente: agendado, ao vivo, encerrado' using errcode = '22023';
  end if;
  return new;
end $$;
create trigger fase_do_debate before update on public.debates
  for each row execute function public.checar_fase_debate();

-- ---------- mapa político: ordem estável ao pausar e voltar ----------
create table public.quiz_ordem (
  user_id uuid primary key default auth.uid() references public.perfis(id) on delete cascade,
  semente int not null check (semente between 1 and 2147483646),
  criado_em timestamptz not null default now()
);
alter table public.quiz_ordem enable row level security;
create policy "ver a própria ordem" on public.quiz_ordem for select to authenticated using (user_id = auth.uid());
create policy "criar a própria ordem" on public.quiz_ordem for insert to authenticated with check (user_id = auth.uid());
create policy "refazer a própria ordem" on public.quiz_ordem for delete to authenticated using (user_id = auth.uid());

-- ---------- estante: terminar o livro da vez ----------
-- O atual vira "lido" e o mais votado da fila vira o novo livro da vez (empate: o mais antigo).
-- security invoker: a RLS de livros já exige moderador para mudar status.
create or replace function public.avancar_livro(clube uuid) returns bigint
language plpgsql security invoker set search_path = public as $$
declare
  proximo bigint;
begin
  if not public.eh_admin(clube) then
    raise exception 'só moderador troca o livro da vez' using errcode = '42501';
  end if;
  update public.livros set status = 'lido' where clube_id = clube and status = 'atual';
  select l.id into proximo
    from public.livros l left join public.votos_livro v on v.livro_id = l.id
   where l.clube_id = clube and l.status = 'fila'
   group by l.id, l.criado_em
   order by count(v.user_id) desc, l.criado_em
   limit 1;
  if proximo is not null then
    update public.livros set status = 'atual' where id = proximo;
  end if;
  update public.clubes set meta_pagina = null, meta_prazo = null where id = clube;
  return proximo;
end $$;

-- ---------- tempo real ----------
alter publication supabase_realtime add table public.enquetes, public.votos_enquete;

-- ---------- permissões das funções ----------
revoke execute on function public.clube_da_enquete(bigint) from public, anon;
revoke execute on function public.pode_votar_enquete(bigint, text) from public, anon;
revoke execute on function public.decidir_enquete(bigint, boolean) from public, anon;
revoke execute on function public.avancar_livro(uuid) from public, anon;
grant execute on function public.clube_da_enquete(bigint) to authenticated;
grant execute on function public.pode_votar_enquete(bigint, text) to authenticated;
grant execute on function public.decidir_enquete(bigint, boolean) to authenticated;
grant execute on function public.avancar_livro(uuid) to authenticated;
