-- Estas colunas apontam para quem criou o registro com "on delete set null", mas eram
-- "not null": apagar a conta de alguém que sugeriu um livro, marcou um debate, propôs
-- um tema ou uma enquete dava erro. Agora o registro fica e o autor vira vazio
-- (o app já mostra "alguém que saiu"). Quem cria continua sendo gravado sempre
-- (default auth.uid() e as políticas de insert exigem o próprio usuário).

alter table public.livros alter column sugerido_por drop not null;
alter table public.debates alter column criado_por drop not null;
alter table public.temas alter column proposto_por drop not null;
alter table public.enquetes alter column proposta_por drop not null;
