-- Comentários em qualquer livro da estante (não só no livro da vez), guardando como
-- estava a leitura de quem comentou NAQUELE momento: antes de ler, lendo ou depois de ler.
-- Assim, se a pessoa comenta antes de ler e de novo depois, a lista mostra os dois
-- comentários, cada um com a situação da época.

alter table public.comentarios
  add column if not exists situacao text not null default 'nao_lido'
    check (situacao in ('nao_lido', 'lendo', 'lido')),
  -- total da edição de quem comentou, na hora (base do "sem spoiler" entre edições);
  -- null nos comentários antigos: aí vale a edição atual da pessoa ou a de referência
  add column if not exists paginas_edicao int check (paginas_edicao between 1 and 30000);

-- Comentários antigos (todos do livro da vez): estima a situação pela página em que foram
-- escritos, comparando com a edição atual de quem escreveu (ou a de referência).
update public.comentarios c
   set situacao = case
         when c.pagina >= coalesce(
           (select p.paginas_edicao from public.progresso_leitura p
             where p.livro_id = c.livro_id and p.user_id = c.user_id),
           (select l.paginas from public.livros l where l.id = c.livro_id)
         ) then 'lido'
         when c.pagina > 0 then 'lendo'
         else 'nao_lido'
       end;

-- As permissões (RLS) de comentarios não mudam: ver e comentar valem para qualquer livro
-- do grupo de quem está logado, e cada pessoa só apaga o próprio comentário.
