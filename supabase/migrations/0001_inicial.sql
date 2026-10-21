-- Uni-vos: schema inicial com RLS em todas as tabelas.
create extension if not exists unaccent with schema extensions;

-- unaccent() não é IMMUTABLE, então não pode ir direto num índice. Este wrapper pode.
create or replace function public.normalizar(t text) returns text
language sql immutable parallel safe strict as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, t));
$$;

-- ---------- clubes e membros ----------
create table public.clubes (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 2 and 60),
  meta_pagina int,
  meta_prazo date,
  criado_em timestamptz not null default now()
);

create table public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 40),
  cor text not null default 'purple' check (cor in ('blue','red','purple','slate')),
  criado_em timestamptz not null default now()
);

create table public.membros (
  clube_id uuid not null references public.clubes(id) on delete cascade,
  user_id uuid not null references public.perfis(id) on delete cascade,
  papel text not null default 'membro' check (papel in ('membro','admin')),
  entrou_em timestamptz not null default now(),
  primary key (clube_id, user_id)
);
create index on public.membros (user_id);

-- Funções de apoio às políticas (security definer evita recursão de RLS em membros)
create or replace function public.eh_membro(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.membros where clube_id = c and user_id = auth.uid());
$$;
create or replace function public.eh_admin(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.membros where clube_id = c and user_id = auth.uid() and papel = 'admin');
$$;

-- Cria o perfil automaticamente no primeiro login
create or replace function public.criar_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end $$;
create trigger ao_criar_usuario after insert on auth.users
  for each row execute function public.criar_perfil();

-- ---------- livros ----------
create table public.livros (
  id bigint generated always as identity primary key,
  clube_id uuid not null references public.clubes(id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 160),
  autor text not null check (char_length(autor) between 1 and 120),
  paginas int not null check (paginas between 1 and 3000),
  status text not null default 'fila' check (status in ('fila','atual','lido')),
  sugerido_por uuid not null default auth.uid() references public.perfis(id) on delete set null,
  criado_em timestamptz not null default now()
);
create index on public.livros (clube_id, status);
-- Prevenção de erro: sem livro duplicado no clube (ignora caixa e acento)
create unique index livros_titulo_unico on public.livros (clube_id, public.normalizar(titulo));
-- Só um livro "atual" por clube
create unique index um_livro_atual on public.livros (clube_id) where status = 'atual';

create table public.votos_livro (
  livro_id bigint not null references public.livros(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.perfis(id) on delete cascade,
  primary key (livro_id, user_id)
);

create table public.progresso_leitura (
  livro_id bigint not null references public.livros(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.perfis(id) on delete cascade,
  pagina int not null check (pagina >= 0),
  atualizado_em timestamptz not null default now(),
  primary key (livro_id, user_id)
);

create table public.comentarios (
  id bigint generated always as identity primary key,
  livro_id bigint not null references public.livros(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.perfis(id) on delete cascade,
  pagina int not null check (pagina >= 0),
  texto text not null check (char_length(texto) between 1 and 500),
  criado_em timestamptz not null default now()
);
create index on public.comentarios (livro_id, pagina);

-- ---------- debates e pauta ----------
create table public.debates (
  id bigint generated always as identity primary key,
  clube_id uuid not null references public.clubes(id) on delete cascade,
  tema text not null check (char_length(tema) between 2 and 120),
  data timestamptz not null,
  formato text not null default 'Rodada com FINALIZADO!' check (formato in ('Rodada com FINALIZADO!','Clube do livro','Livre')),
  status text not null default 'agendado' check (status in ('agendado','ao_vivo','encerrado')),
  criado_por uuid not null default auth.uid() references public.perfis(id) on delete set null,
  criado_em timestamptz not null default now()
);
create index on public.debates (clube_id, data);

create table public.presencas (
  debate_id bigint not null references public.debates(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.perfis(id) on delete cascade,
  primary key (debate_id, user_id)
);

create table public.temas (
  id bigint generated always as identity primary key,
  clube_id uuid not null references public.clubes(id) on delete cascade,
  tema text not null check (char_length(tema) between 2 and 120),
  proposto_por uuid not null default auth.uid() references public.perfis(id) on delete set null,
  criado_em timestamptz not null default now()
);
create unique index temas_unico on public.temas (clube_id, public.normalizar(tema));

create table public.votos_tema (
  tema_id bigint not null references public.temas(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.perfis(id) on delete cascade,
  primary key (tema_id, user_id)
);

-- ---------- mapa político ----------
create table public.quiz_respostas (
  user_id uuid not null default auth.uid() references public.perfis(id) on delete cascade,
  afirmacao int not null check (afirmacao between 0 and 39),
  valor int not null check (valor between 1 and 5),
  respondido_em timestamptz not null default now(),
  primary key (user_id, afirmacao)
);

create table public.quiz_resultados (
  user_id uuid primary key default auth.uid() references public.perfis(id) on delete cascade,
  economia int not null check (economia between -100 and 100),
  costumes int not null check (costumes between -100 and 100),
  semente int not null, -- ordem embaralhada estável ao retomar
  atualizado_em timestamptz not null default now()
);

-- ---------- RLS ----------
alter table public.clubes enable row level security;
alter table public.perfis enable row level security;
alter table public.membros enable row level security;
alter table public.livros enable row level security;
alter table public.votos_livro enable row level security;
alter table public.progresso_leitura enable row level security;
alter table public.comentarios enable row level security;
alter table public.debates enable row level security;
alter table public.presencas enable row level security;
alter table public.temas enable row level security;
alter table public.votos_tema enable row level security;
alter table public.quiz_respostas enable row level security;
alter table public.quiz_resultados enable row level security;

-- clubes
create policy "membros veem o clube" on public.clubes for select to authenticated using (public.eh_membro(id));
create policy "admin edita o clube" on public.clubes for update to authenticated using (public.eh_admin(id)) with check (public.eh_admin(id));

-- perfis: vê o próprio e o de quem divide clube com você
create policy "ver perfis do clube" on public.perfis for select to authenticated using (
  id = auth.uid() or exists (
    select 1 from public.membros a join public.membros b on a.clube_id = b.clube_id
    where a.user_id = auth.uid() and b.user_id = perfis.id));
create policy "editar o próprio perfil" on public.perfis for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- membros
create policy "ver membros do clube" on public.membros for select to authenticated using (public.eh_membro(clube_id));
create policy "admin adiciona membro" on public.membros for insert to authenticated with check (public.eh_admin(clube_id));
create policy "admin remove ou membro sai" on public.membros for delete to authenticated using (public.eh_admin(clube_id) or user_id = auth.uid());

-- livros
create policy "ver livros" on public.livros for select to authenticated using (public.eh_membro(clube_id));
create policy "sugerir livro" on public.livros for insert to authenticated with check (public.eh_membro(clube_id) and sugerido_por = auth.uid() and status = 'fila');
create policy "admin muda status" on public.livros for update to authenticated using (public.eh_admin(clube_id)) with check (public.eh_admin(clube_id));
create policy "autor ou admin apaga livro" on public.livros for delete to authenticated using (sugerido_por = auth.uid() or public.eh_admin(clube_id));

-- tabelas "do usuário" ligadas a um livro
create policy "ver votos de livro" on public.votos_livro for select to authenticated using (exists (select 1 from public.livros l where l.id = livro_id and public.eh_membro(l.clube_id)));
create policy "votar" on public.votos_livro for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.livros l where l.id = livro_id and public.eh_membro(l.clube_id)));
create policy "tirar voto" on public.votos_livro for delete to authenticated using (user_id = auth.uid());

create policy "ver progresso" on public.progresso_leitura for select to authenticated using (exists (select 1 from public.livros l where l.id = livro_id and public.eh_membro(l.clube_id)));
create policy "registrar progresso" on public.progresso_leitura for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.livros l where l.id = livro_id and public.eh_membro(l.clube_id) and pagina <= l.paginas));
create policy "atualizar progresso" on public.progresso_leitura for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and exists (select 1 from public.livros l where l.id = livro_id and pagina <= l.paginas));

create policy "ver comentários" on public.comentarios for select to authenticated using (exists (select 1 from public.livros l where l.id = livro_id and public.eh_membro(l.clube_id)));
create policy "comentar" on public.comentarios for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.livros l where l.id = livro_id and public.eh_membro(l.clube_id)));
create policy "apagar o próprio comentário" on public.comentarios for delete to authenticated using (user_id = auth.uid());

-- debates
create policy "ver debates" on public.debates for select to authenticated using (public.eh_membro(clube_id));
create policy "marcar debate" on public.debates for insert to authenticated with check (public.eh_membro(clube_id) and criado_por = auth.uid() and data > now());
create policy "autor ou admin edita debate" on public.debates for update to authenticated using (criado_por = auth.uid() or public.eh_admin(clube_id)) with check (public.eh_membro(clube_id));
create policy "autor ou admin apaga debate" on public.debates for delete to authenticated using (criado_por = auth.uid() or public.eh_admin(clube_id));

create policy "ver presenças" on public.presencas for select to authenticated using (exists (select 1 from public.debates d where d.id = debate_id and public.eh_membro(d.clube_id)));
create policy "confirmar presença" on public.presencas for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.debates d where d.id = debate_id and public.eh_membro(d.clube_id)));
create policy "cancelar presença" on public.presencas for delete to authenticated using (user_id = auth.uid());

-- pauta
create policy "ver temas" on public.temas for select to authenticated using (public.eh_membro(clube_id));
create policy "propor tema" on public.temas for insert to authenticated with check (public.eh_membro(clube_id) and proposto_por = auth.uid());
create policy "autor ou admin apaga tema" on public.temas for delete to authenticated using (proposto_por = auth.uid() or public.eh_admin(clube_id));

create policy "ver votos de tema" on public.votos_tema for select to authenticated using (exists (select 1 from public.temas t where t.id = tema_id and public.eh_membro(t.clube_id)));
create policy "votar tema" on public.votos_tema for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.temas t where t.id = tema_id and public.eh_membro(t.clube_id)));
create policy "tirar voto de tema" on public.votos_tema for delete to authenticated using (user_id = auth.uid());

-- quiz: respostas são privadas; o resultado é visto por quem divide clube
create policy "ver as próprias respostas" on public.quiz_respostas for select to authenticated using (user_id = auth.uid());
create policy "responder" on public.quiz_respostas for insert to authenticated with check (user_id = auth.uid());
create policy "mudar resposta" on public.quiz_respostas for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "apagar respostas (refazer)" on public.quiz_respostas for delete to authenticated using (user_id = auth.uid());

create policy "ver resultados do clube" on public.quiz_resultados for select to authenticated using (
  user_id = auth.uid() or exists (
    select 1 from public.membros a join public.membros b on a.clube_id = b.clube_id
    where a.user_id = auth.uid() and b.user_id = quiz_resultados.user_id));
create policy "salvar resultado" on public.quiz_resultados for insert to authenticated with check (user_id = auth.uid());
create policy "atualizar resultado" on public.quiz_resultados for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "apagar resultado (refazer)" on public.quiz_resultados for delete to authenticated using (user_id = auth.uid());

-- ---------- tempo real ----------
alter publication supabase_realtime add table public.progresso_leitura, public.comentarios, public.debates, public.presencas;
