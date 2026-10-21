-- Meta de leitura em texto livre ("Capítulo 5", "Até o fim da parte 2") com prazo.
-- Cada pessoa marca "Cheguei!" quando alcança. Substitui a meta em páginas
-- (clubes.meta_pagina/meta_prazo), que não fazia sentido com edições diferentes.
-- As colunas antigas ficam, sem uso, porque a função avancar_livro ainda as limpa.

create table public.metas (
  id bigint generated always as identity primary key,
  livro_id bigint not null references public.livros(id) on delete cascade,
  texto text not null check (char_length(texto) between 2 and 120),
  prazo date not null,
  criada_por uuid default auth.uid() references public.perfis(id) on delete set null,
  criada_em timestamptz not null default now()
);
-- A meta valendo é a mais recente do livro da vez; as anteriores ficam de histórico.
create index on public.metas (livro_id, criada_em desc);

create table public.metas_alcancadas (
  meta_id bigint not null references public.metas(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.perfis(id) on delete cascade,
  alcancada_em timestamptz not null default now(),
  primary key (meta_id, user_id)
);

alter table public.metas enable row level security;
alter table public.metas_alcancadas enable row level security;

-- metas: o grupo vê; moderador (ou dono) define e remove
create policy "membros veem metas" on public.metas for select to authenticated
  using (exists (select 1 from public.livros l where l.id = livro_id and public.eh_membro(l.clube_id)));
create policy "moderador define meta" on public.metas for insert to authenticated
  with check (criada_por = auth.uid()
    and exists (select 1 from public.livros l where l.id = livro_id and public.eh_admin(l.clube_id)));
create policy "moderador remove meta" on public.metas for delete to authenticated
  using (exists (select 1 from public.livros l where l.id = livro_id and public.eh_admin(l.clube_id)));

-- metas_alcancadas: o grupo vê quem chegou; cada um marca e desmarca o próprio
create policy "membros veem quem chegou" on public.metas_alcancadas for select to authenticated
  using (exists (
    select 1 from public.metas m join public.livros l on l.id = m.livro_id
    where m.id = meta_id and public.eh_membro(l.clube_id)));
create policy "marcar que chegou" on public.metas_alcancadas for insert to authenticated
  with check (user_id = auth.uid() and exists (
    select 1 from public.metas m join public.livros l on l.id = m.livro_id
    where m.id = meta_id and public.eh_membro(l.clube_id)));
create policy "desmarcar que chegou" on public.metas_alcancadas for delete to authenticated
  using (user_id = auth.uid());

alter publication supabase_realtime add table public.metas, public.metas_alcancadas;
