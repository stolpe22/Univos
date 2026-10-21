-- Conclusoes alternativas propostas pelos membros e votos de concordancia.
-- Sao independentes da enquete principal (que mede mudanca antes/depois).
create table public.conclusoes_debate (
  id bigint generated always as identity primary key,
  debate_id bigint not null references public.debates(id) on delete cascade,
  texto text not null check (char_length(trim(texto)) between 5 and 240),
  proposta_por uuid not null default auth.uid() references public.perfis(id) on delete cascade,
  criado_em timestamptz not null default now()
);
create index conclusoes_debate_debate_id_idx on public.conclusoes_debate (debate_id, criado_em);

create table public.votos_conclusao (
  conclusao_id bigint not null references public.conclusoes_debate(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.perfis(id) on delete cascade,
  posicao text not null check (posicao in ('concordo', 'discordo')),
  votado_em timestamptz not null default now(),
  primary key (conclusao_id, user_id)
);

alter table public.conclusoes_debate enable row level security;
alter table public.votos_conclusao enable row level security;

create policy "membros veem conclusoes" on public.conclusoes_debate
  for select to authenticated
  using (exists (
    select 1 from public.debates d
    where d.id = debate_id and public.eh_membro(d.clube_id)
  ));
create policy "membros propoem conclusoes" on public.conclusoes_debate
  for insert to authenticated
  with check (
    proposta_por = auth.uid()
    and exists (
      select 1 from public.debates d
      where d.id = debate_id and public.eh_membro(d.clube_id)
    )
  );
create policy "autor ou moderador apaga conclusao" on public.conclusoes_debate
  for delete to authenticated
  using (
    proposta_por = auth.uid()
    or exists (
      select 1 from public.debates d
      where d.id = debate_id and public.eh_admin(d.clube_id)
    )
  );

create policy "membros veem votos de conclusao" on public.votos_conclusao
  for select to authenticated
  using (exists (
    select 1 from public.conclusoes_debate c
    join public.debates d on d.id = c.debate_id
    where c.id = conclusao_id and public.eh_membro(d.clube_id)
  ));
create policy "membro vota na conclusao" on public.votos_conclusao
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.conclusoes_debate c
      join public.debates d on d.id = c.debate_id
      where c.id = conclusao_id and public.eh_membro(d.clube_id)
    )
  );
create policy "membro muda voto da conclusao" on public.votos_conclusao
  for update to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.conclusoes_debate c
      join public.debates d on d.id = c.debate_id
      where c.id = conclusao_id and public.eh_membro(d.clube_id)
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.conclusoes_debate c
      join public.debates d on d.id = c.debate_id
      where c.id = conclusao_id and public.eh_membro(d.clube_id)
    )
  );
create policy "membro tira voto da conclusao" on public.votos_conclusao
  for delete to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.conclusoes_debate c
      join public.debates d on d.id = c.debate_id
      where c.id = conclusao_id and public.eh_membro(d.clube_id)
    )
  );

alter publication supabase_realtime add table public.conclusoes_debate, public.votos_conclusao;
