-- Conclusoes alternativas pertencem a uma enquete principal.
-- Registros sem enquete correspondente nao podem continuar existindo.
alter table public.conclusoes_debate
  add column if not exists enquete_id bigint references public.enquetes(id) on delete cascade;

update public.conclusoes_debate c
   set enquete_id = e.id
  from public.enquetes e
 where e.debate_id = c.debate_id and e.status <> 'recusada';

delete from public.conclusoes_debate where enquete_id is null;
alter table public.conclusoes_debate alter column enquete_id set not null;
-- As políticas antigas dependem de debate_id. Remova também as políticas dos
-- votos antes da coluna para evitar dependências indiretas via conclusoes_debate.
drop policy if exists "membros veem conclusoes" on public.conclusoes_debate;
drop policy if exists "membros propoem conclusoes" on public.conclusoes_debate;
drop policy if exists "autor ou moderador apaga conclusao" on public.conclusoes_debate;
drop policy if exists "membros veem votos de conclusao" on public.votos_conclusao;
drop policy if exists "membro vota na conclusao" on public.votos_conclusao;
drop policy if exists "membro muda voto da conclusao" on public.votos_conclusao;
drop policy if exists "membro tira voto da conclusao" on public.votos_conclusao;

drop index if exists public.conclusoes_debate_debate_id_idx;
alter table public.conclusoes_debate drop column if exists debate_id;
create index if not exists conclusoes_debate_enquete_id_idx on public.conclusoes_debate (enquete_id, criado_em);

create policy "membros veem conclusoes" on public.conclusoes_debate
  for select to authenticated using (exists (
    select 1 from public.enquetes e join public.debates d on d.id = e.debate_id
    where e.id = enquete_id and e.status <> 'recusada' and public.eh_membro(d.clube_id)
  ));
create policy "membros propoem conclusoes" on public.conclusoes_debate
  for insert to authenticated with check (
    proposta_por = auth.uid() and exists (
      select 1 from public.enquetes e join public.debates d on d.id = e.debate_id
      where e.id = enquete_id and e.status <> 'recusada' and public.eh_membro(d.clube_id)
    )
  );
create policy "autor ou moderador apaga conclusao" on public.conclusoes_debate
  for delete to authenticated using (
    proposta_por = auth.uid() or exists (
      select 1 from public.enquetes e join public.debates d on d.id = e.debate_id
      where e.id = enquete_id and public.eh_admin(d.clube_id)
    )
  );

create policy "membros veem votos de conclusao" on public.votos_conclusao
  for select to authenticated using (exists (
    select 1 from public.conclusoes_debate c
    join public.enquetes e on e.id = c.enquete_id
    join public.debates d on d.id = e.debate_id
    where c.id = conclusao_id and e.status <> 'recusada' and public.eh_membro(d.clube_id)
  ));
create policy "membro vota na conclusao" on public.votos_conclusao
  for insert to authenticated with check (user_id = auth.uid() and exists (
    select 1 from public.conclusoes_debate c
    join public.enquetes e on e.id = c.enquete_id
    join public.debates d on d.id = e.debate_id
    where c.id = conclusao_id and e.status <> 'recusada' and public.eh_membro(d.clube_id)
  ));
create policy "membro muda voto da conclusao" on public.votos_conclusao
  for update to authenticated using (user_id = auth.uid() and exists (
    select 1 from public.conclusoes_debate c
    join public.enquetes e on e.id = c.enquete_id
    join public.debates d on d.id = e.debate_id
    where c.id = conclusao_id and e.status <> 'recusada' and public.eh_membro(d.clube_id)
  )) with check (user_id = auth.uid() and exists (
    select 1 from public.conclusoes_debate c
    join public.enquetes e on e.id = c.enquete_id
    join public.debates d on d.id = e.debate_id
    where c.id = conclusao_id and e.status <> 'recusada' and public.eh_membro(d.clube_id)
  ));
create policy "membro tira voto da conclusao" on public.votos_conclusao
  for delete to authenticated using (user_id = auth.uid() and exists (
    select 1 from public.conclusoes_debate c
    join public.enquetes e on e.id = c.enquete_id
    join public.debates d on d.id = e.debate_id
    where c.id = conclusao_id and e.status <> 'recusada' and public.eh_membro(d.clube_id)
  ));

create table public.comentarios_debate (
  id bigint generated always as identity primary key,
  debate_id bigint not null references public.debates(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.perfis(id) on delete cascade,
  texto text not null check (char_length(trim(texto)) between 1 and 1000),
  criado_em timestamptz not null default now()
);
create index comentarios_debate_debate_id_idx on public.comentarios_debate (debate_id, criado_em);
alter table public.comentarios_debate enable row level security;
create policy "membros veem comentarios do debate" on public.comentarios_debate
  for select to authenticated using (exists (
    select 1 from public.debates d where d.id = debate_id and public.eh_membro(d.clube_id)
  ));
create policy "membros comentam debate" on public.comentarios_debate
  for insert to authenticated with check (
    user_id = auth.uid() and exists (
      select 1 from public.debates d where d.id = debate_id and public.eh_membro(d.clube_id)
    )
  );
create policy "autor ou moderador apaga comentario do debate" on public.comentarios_debate
  for delete to authenticated using (
    user_id = auth.uid() or exists (
      select 1 from public.debates d where d.id = debate_id and public.eh_admin(d.clube_id)
    )
  );

alter publication supabase_realtime add table public.comentarios_debate;
