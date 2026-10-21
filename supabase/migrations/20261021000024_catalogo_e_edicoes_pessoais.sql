-- Metadados editoriais do catálogo compartilhado da estante.
alter table public.livros
  add column tema text check (tema in (
    'base', 'lib', 'rf', 'cap', 'soc', 'rr', 'rsoc', 'fas', 'naz', 'dir', 'cont', 'br'
  )),
  add column ano_publicacao int check (ano_publicacao between -3000 and 2200),
  add column editora text check (editora is null or char_length(editora) <= 120),
  add column preco_referencia numeric(10, 2) check (preco_referencia is null or preco_referencia >= 0),
  add column nivel smallint check (nivel in (1, 2, 3)),
  add column tipo text check (tipo in (
    'Biografia', 'Ensaio', 'Ficção', 'Fonte primária', 'História', 'Manual', 'Memória'
  )),
  add column nota text check (nota is null or char_length(nota) <= 1000);

-- paginas em livros é a estimativa da edição de referência. Cada membro pode
-- informar as páginas reais da própria edição e acompanhar seu progresso.
alter table public.progresso_leitura
  add column paginas_edicao int,
  add column edicao_confirmada boolean not null default false,
  add column status text not null default 'nao_lido'
    check (status in ('nao_lido', 'lendo', 'lido'));

update public.progresso_leitura p
   set paginas_edicao = l.paginas,
       status = case
         when p.pagina >= l.paginas then 'lido'
         when p.pagina > 0 then 'lendo'
         else 'nao_lido'
       end
  from public.livros l
 where l.id = p.livro_id;

alter table public.progresso_leitura
  alter column paginas_edicao set not null,
  add constraint progresso_paginas_edicao_check check (paginas_edicao between 1 and 30000),
  add constraint progresso_pagina_na_edicao_check check (pagina between 0 and paginas_edicao);

drop policy if exists "registrar progresso" on public.progresso_leitura;
drop policy if exists "atualizar progresso" on public.progresso_leitura;
drop policy if exists "apagar próprio progresso" on public.progresso_leitura;

create policy "registrar progresso na própria edição" on public.progresso_leitura
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and pagina <= paginas_edicao
    and exists (
      select 1 from public.livros l
       where l.id = livro_id and public.eh_membro(l.clube_id)
    )
  );

create policy "atualizar progresso na própria edição" on public.progresso_leitura
  for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and pagina <= paginas_edicao
    and exists (
      select 1 from public.livros l
       where l.id = livro_id and public.eh_membro(l.clube_id)
    )
  );

create policy "apagar próprio progresso" on public.progresso_leitura
  for delete to authenticated using (user_id = auth.uid());
