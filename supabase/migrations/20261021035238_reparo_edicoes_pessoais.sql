-- Reparo da migration 20261021000024_catalogo_e_edicoes_pessoais.
--
-- O arquivo dela foi editado DEPOIS de aplicado no banco: a coluna
-- progresso_leitura.edicao_confirmada (e talvez as regras abaixo) só existem no arquivo.
-- Sem ela, salvar o exemplar em Meus livros e a lista "Quem está lendo" dão erro.
--
-- Esta migration reaplica tudo o que a 24 deveria ter feito em progresso_leitura.
-- É segura para rodar mais de uma vez: o que já existe não é recriado nem duplicado.

-- 1) A coluna que faltou: "a pessoa cadastrou o próprio exemplar em Meus livros".
-- As linhas que já existem vieram do Livro da vez antigo (sem exemplar), então ficam false.
alter table public.progresso_leitura
  add column if not exists edicao_confirmada boolean not null default false;

-- Toda linha precisa saber o total da edição: quem ficou sem, usa o da referência.
update public.progresso_leitura p
   set paginas_edicao = l.paginas
  from public.livros l
 where l.id = p.livro_id and p.paginas_edicao is null;
alter table public.progresso_leitura alter column paginas_edicao set not null;

-- 2) Limites de página da edição (só cria se não existir).
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'progresso_paginas_edicao_check'
       and conrelid = 'public.progresso_leitura'::regclass
  ) then
    alter table public.progresso_leitura
      add constraint progresso_paginas_edicao_check check (paginas_edicao between 1 and 30000);
  end if;

  if not exists (
    select 1 from pg_constraint
     where conname = 'progresso_pagina_na_edicao_check'
       and conrelid = 'public.progresso_leitura'::regclass
  ) then
    alter table public.progresso_leitura
      add constraint progresso_pagina_na_edicao_check check (pagina between 0 and paginas_edicao);
  end if;
end
$$;

-- 3) Permissões (RLS) em cima da edição de cada pessoa: apaga as antigas e as da 24
--    (seja qual for o estado) e cria de novo, iguais às do arquivo da 24.
drop policy if exists "registrar progresso" on public.progresso_leitura;
drop policy if exists "atualizar progresso" on public.progresso_leitura;
drop policy if exists "apagar próprio progresso" on public.progresso_leitura;
drop policy if exists "registrar progresso na própria edição" on public.progresso_leitura;
drop policy if exists "atualizar progresso na própria edição" on public.progresso_leitura;

alter table public.progresso_leitura enable row level security;

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

-- O select ("ver progresso") vem da migration inicial e não mudou.
