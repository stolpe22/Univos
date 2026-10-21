-- A taxonomia do catálogo é mantida no banco e pode ser ampliada por moderadores.
create table public.catalogo_temas (
  codigo text primary key check (codigo ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nome text not null unique check (char_length(nome) between 2 and 80),
  criado_em timestamptz not null default now()
);

create table public.catalogo_tipos (
  nome text primary key check (char_length(nome) between 2 and 60),
  criado_em timestamptz not null default now()
);

create table public.catalogo_niveis (
  nivel int primary key check (nivel > 0),
  nome text not null unique check (char_length(nome) between 2 and 60),
  criado_em timestamptz not null default now()
);

insert into public.catalogo_temas (codigo, nome) values
  ('base', 'Mapa geral e conceitos'),
  ('lib', 'Revoluções liberais e capitalismo'),
  ('rf', 'Revolução Francesa'),
  ('cap', 'Capitalismo e liberalismo econômico'),
  ('soc', 'Socialismo, marxismo e anarquismo'),
  ('rr', 'Revolução Russa e União Soviética'),
  ('rsoc', 'China, Cuba e revoluções socialistas'),
  ('fas', 'Fascismo'),
  ('naz', 'Nazismo e Holocausto'),
  ('dir', 'Conservadorismo e liberalismo político'),
  ('cont', 'Guerra Fria e mundo atual'),
  ('br', 'Brasil');

insert into public.catalogo_tipos (nome) values
  ('Biografia'), ('Ensaio'), ('Ficção'), ('Fonte primária'), ('História'), ('Manual'), ('Memória');

insert into public.catalogo_niveis (nivel, nome) values
  (1, 'Iniciante'), (2, 'Intermediário'), (3, 'Avançado');

create unique index catalogo_temas_nome_normalizado_idx on public.catalogo_temas (lower(nome));
create unique index catalogo_tipos_nome_normalizado_idx on public.catalogo_tipos (lower(nome));
create unique index catalogo_niveis_nome_normalizado_idx on public.catalogo_niveis (lower(nome));

alter table public.livros
  drop constraint if exists livros_tema_check,
  drop constraint if exists livros_tipo_check,
  drop constraint if exists livros_nivel_check,
  alter column nivel type int;

alter table public.livros
  add constraint livros_tema_fkey foreign key (tema) references public.catalogo_temas(codigo) on update cascade,
  add constraint livros_tipo_fkey foreign key (tipo) references public.catalogo_tipos(nome) on update cascade,
  add constraint livros_nivel_fkey foreign key (nivel) references public.catalogo_niveis(nivel) on update cascade;

create or replace function public.eh_admin_catalogo() returns boolean
language sql stable security definer set search_path = public as $$
  select public.eh_dono();
$$;
revoke execute on function public.eh_admin_catalogo() from public, anon;
grant execute on function public.eh_admin_catalogo() to authenticated;

alter table public.catalogo_temas enable row level security;
alter table public.catalogo_tipos enable row level security;
alter table public.catalogo_niveis enable row level security;

create policy "membros leem temas do catalogo" on public.catalogo_temas
  for select to authenticated using (true);
create policy "admins cadastram temas do catalogo" on public.catalogo_temas
  for insert to authenticated with check (public.eh_admin_catalogo());

create policy "membros leem tipos do catalogo" on public.catalogo_tipos
  for select to authenticated using (true);
create policy "admins cadastram tipos do catalogo" on public.catalogo_tipos
  for insert to authenticated with check (public.eh_admin_catalogo());

create policy "membros leem niveis do catalogo" on public.catalogo_niveis
  for select to authenticated using (true);
create policy "admins cadastram niveis do catalogo" on public.catalogo_niveis
  for insert to authenticated with check (public.eh_admin_catalogo());
