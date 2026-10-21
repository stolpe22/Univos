-- Indicador de novidade no menu: uma bolinha na aba quando aparece algo novo desde a
-- última vez que AQUELA pessoa abriu a página. Cada pessoa tem o seu "visto": ver não
-- apaga a bolinha de mais ninguém.

-- ---------- quando cada pessoa abriu cada página por último ----------
create table if not exists public.vistos (
  user_id uuid not null default auth.uid() references public.perfis(id) on delete cascade,
  clube_id uuid not null references public.clubes(id) on delete cascade,
  pagina text not null check (pagina in ('livro', 'estante', 'debates', 'mapa', 'membros')),
  visto_em timestamptz not null default now(),
  primary key (user_id, clube_id, pagina)
);
alter table public.vistos enable row level security;
create policy "ver os próprios vistos" on public.vistos for select to authenticated
  using (user_id = auth.uid());
create policy "marcar o próprio visto" on public.vistos for insert to authenticated
  with check (user_id = auth.uid() and public.eh_membro(clube_id));
create policy "atualizar o próprio visto" on public.vistos for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.eh_membro(clube_id));

-- ---------- datas que faltavam para saber o que é novo ----------
-- quando o livro virou livro da vez
alter table public.livros add column if not exists virou_atual_em timestamptz;
update public.livros set virou_atual_em = criado_em where status = 'atual' and virou_atual_em is null;

-- quando o debate começou (marcado que foi iniciado, ou aberto com "Já está rolando")
alter table public.debates add column if not exists iniciado_em timestamptz;
update public.debates set iniciado_em = criado_em where status <> 'agendado' and iniciado_em is null;

create or replace function public.marcar_inicio_debate() returns trigger
language plpgsql as $$
begin
  if new.status = 'ao_vivo' and (tg_op = 'INSERT' or old.status <> 'ao_vivo') then
    new.iniciado_em := now();
  end if;
  return new;
end $$;
drop trigger if exists inicio_do_debate on public.debates;
create trigger inicio_do_debate before insert or update on public.debates
  for each row execute function public.marcar_inicio_debate();

-- escolher o livro da vez também grava quando isso aconteceu
create or replace function public.escolher_livro(livro bigint) returns void
language plpgsql security invoker set search_path = public as $$
declare
  grupo uuid;
begin
  select l.clube_id into grupo from public.livros l where l.id = livro and l.status = 'fila';
  if grupo is null then
    raise exception 'livro não está na estante' using errcode = 'P0002';
  end if;
  if not public.eh_admin(grupo) then
    raise exception 'só moderador escolhe o livro da vez' using errcode = '42501';
  end if;
  if exists (select 1 from public.livros where clube_id = grupo and status = 'atual') then
    raise exception 'o grupo já tem livro da vez' using errcode = '23505';
  end if;
  update public.livros set status = 'atual', virou_atual_em = now() where id = livro;
end $$;

-- ---------- a última novidade de cada página (sem contar o que a própria pessoa fez) ----------
-- security invoker: a RLS de cada tabela vale, então só conta o que a pessoa pode ver.
create or replace function public.novidades(clube uuid)
returns table (pagina text, ultima timestamptz)
language sql stable security invoker set search_path = public as $$
  select 'membros', max(m.entrou_em)
    from public.membros m
   where m.clube_id = clube and m.user_id <> auth.uid()
  union all
  select 'estante', max(l.criado_em)
    from public.livros l
   where l.clube_id = clube and l.sugerido_por is distinct from auth.uid()
  union all
  select 'livro', max(l.virou_atual_em)
    from public.livros l
   where l.clube_id = clube and l.status = 'atual'
  union all
  select 'debates', greatest(
      (select max(d.criado_em) from public.debates d
        where d.clube_id = clube and d.criado_por is distinct from auth.uid()),
      (select max(d.iniciado_em) from public.debates d
        where d.clube_id = clube and d.status = 'ao_vivo'))
  union all
  select 'mapa', max(q.atualizado_em)
    from public.quiz_resultados q
    join public.membros m on m.user_id = q.user_id and m.clube_id = clube
   where q.user_id <> auth.uid();
$$;
revoke execute on function public.novidades(uuid) from public, anon;
grant execute on function public.novidades(uuid) to authenticated;

-- ---------- tempo real: a bolinha acende sem recarregar ----------
-- (debates já está na publicação desde a migration inicial)
alter publication supabase_realtime add table public.livros, public.membros, public.quiz_resultados;
