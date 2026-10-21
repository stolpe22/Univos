-- Grupos privados: só se entra por link de convite, só o dono do sistema cria grupos.
--
-- Quem é quem:
--   dono       = dono do sistema (tabela donos). Vê e faz tudo em todos os grupos, cria grupos,
--                escolhe moderadores e é o único que lê a auditoria.
--   moderador  = papel por grupo (membros.papel). Gera e desativa links de convite e modera o grupo.
--   membro     = participa do grupo.
--
-- No banco, "grupo" é a tabela clubes. Substitui o modelo da migration de convites
-- (um código fixo por clube e qualquer pessoa criando clube).

-- ---------- sai o modelo antigo ----------
drop function if exists public.criar_clube(text);
drop function if exists public.trocar_convite(uuid);
drop function if exists public.entrar_no_clube(text);
drop function if exists public.ver_convite(text);
alter table public.clubes drop column if exists codigo_convite;
drop function if exists public.novo_codigo_convite();

-- Moderador adicionava gente direto, sem convite e sem auditoria. Agora só por convite.
drop policy if exists "admin adiciona membro" on public.membros;

-- ---------- dono do sistema ----------
-- Sem política de RLS: ninguém lê pela API.
create table public.donos (
  email text primary key check (email = lower(email))
);
alter table public.donos enable row level security;

insert into public.donos (email) values ('stolpe02@gmail.com');

create or replace function public.eh_dono() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from auth.users u join public.donos d on d.email = lower(u.email)
    where u.id = auth.uid());
$$;

-- ---------- papéis por grupo ----------
alter table public.membros drop constraint if exists membros_papel_check;
update public.membros set papel = 'moderador' where papel <> 'membro';
alter table public.membros alter column papel set default 'membro';
alter table public.membros
  add constraint membros_papel_check check (papel in ('membro', 'moderador'));

-- As políticas da migration inicial usam eh_membro e eh_admin. O dono passa em todas,
-- e "admin" de um grupo agora é o moderador.
create or replace function public.eh_membro(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.eh_dono() or exists (
    select 1 from public.membros where clube_id = c and user_id = auth.uid());
$$;

create or replace function public.eh_admin(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.eh_dono() or exists (
    select 1 from public.membros where clube_id = c and user_id = auth.uid() and papel = 'moderador');
$$;

-- Perfis e resultados do mapa: o dono também vê os de quem não divide grupo com ele.
drop policy "ver perfis do clube" on public.perfis;
create policy "ver perfis do grupo" on public.perfis for select to authenticated using (
  id = auth.uid() or public.eh_dono() or exists (
    select 1 from public.membros a join public.membros b on a.clube_id = b.clube_id
    where a.user_id = auth.uid() and b.user_id = perfis.id));

drop policy "ver resultados do clube" on public.quiz_resultados;
create policy "ver resultados do grupo" on public.quiz_resultados for select to authenticated using (
  user_id = auth.uid() or public.eh_dono() or exists (
    select 1 from public.membros a join public.membros b on a.clube_id = b.clube_id
    where a.user_id = auth.uid() and b.user_id = quiz_resultados.user_id));

-- ---------- primeiro grupo ----------
insert into public.clubes (nome)
select 'Uni-vos' where not exists (select 1 from public.clubes);

-- O dono que já fez login entra no primeiro grupo como moderador.
insert into public.membros (clube_id, user_id, papel)
select (select id from public.clubes order by criado_em, id limit 1), u.id, 'moderador'
from auth.users u join public.perfis p on p.id = u.id
where lower(u.email) in (select email from public.donos)
on conflict (clube_id, user_id) do update set papel = 'moderador';

-- ---------- convites ----------
create table public.convites (
  id bigint generated always as identity primary key,
  clube_id uuid not null references public.clubes(id) on delete cascade,
  codigo text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 16)
    check (codigo ~ '^[0-9a-f]{16}$'),
  rotulo text not null check (char_length(rotulo) between 1 and 60),
  criado_por uuid references public.perfis(id) on delete set null,
  criado_em timestamptz not null default now(),
  desativado_em timestamptz,
  desativado_por uuid references public.perfis(id) on delete set null
);
create index on public.convites (clube_id, criado_em desc);
create index on public.convites (criado_por);

-- Por qual convite cada pessoa entrou (null = entrou sem convite, ex: quem criou o grupo).
alter table public.membros
  add column convite_id bigint references public.convites(id) on delete set null;
create index on public.membros (convite_id);

alter table public.convites enable row level security;

-- Moderador vê os convites do grupo dele; o dono vê todos. Escrita só pelas funções abaixo.
create policy "moderador e dono veem convites" on public.convites
  for select to authenticated using (public.eh_admin(clube_id));

-- ---------- auditoria ----------
create table public.auditoria (
  id bigint generated always as identity primary key,
  clube_id uuid references public.clubes(id) on delete set null,
  autor uuid references public.perfis(id) on delete set null,
  acao text not null check (acao in (
    'grupo_criado', 'convite_criado', 'convite_desativado', 'convite_reativado',
    'entrou_por_convite', 'papel_alterado')),
  convite_id bigint references public.convites(id) on delete set null,
  alvo uuid references public.perfis(id) on delete set null,
  detalhes jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);
create index on public.auditoria (criado_em desc);
create index on public.auditoria (clube_id, criado_em desc);

alter table public.auditoria enable row level security;

-- Só o dono lê. Ninguém escreve pela API: só as funções security definer.
create policy "dono lê a auditoria" on public.auditoria
  for select to authenticated using (public.eh_dono());

create or replace function public.registrar(
  c uuid, acao text, convite bigint default null, alvo uuid default null,
  detalhes jsonb default '{}'::jsonb
) returns void
language sql security definer set search_path = public as $$
  insert into public.auditoria (clube_id, autor, acao, convite_id, alvo, detalhes)
  values (c, auth.uid(), acao, convite, alvo, detalhes);
$$;

-- ---------- funções ----------

-- Cria um grupo. Só o dono. Quem criou entra como moderador.
create or replace function public.criar_grupo(nome text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  novo uuid;
begin
  if not public.eh_dono() then
    raise exception 'só o dono cria grupos' using errcode = '42501';
  end if;
  insert into public.clubes (nome) values (trim(criar_grupo.nome)) returning id into novo;
  insert into public.membros (clube_id, user_id, papel) values (novo, auth.uid(), 'moderador');
  perform public.registrar(novo, 'grupo_criado', null, null, jsonb_build_object('nome', trim(criar_grupo.nome)));
  return novo;
end $$;

-- Nome do grupo de um convite válido (funciona sem login). Não mostra mais nada.
create or replace function public.ver_convite(codigo text) returns text
language sql stable security definer set search_path = public as $$
  select c.nome from public.convites v join public.clubes c on c.id = v.clube_id
  where v.codigo = ver_convite.codigo and v.desativado_em is null;
$$;

-- Entra pelo convite. Devolve o id do grupo, ou null se o convite não vale.
create or replace function public.entrar_no_clube(codigo text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v public.convites;
begin
  if auth.uid() is null then
    raise exception 'precisa estar logado' using errcode = '28000';
  end if;
  select * into v from public.convites
    where convites.codigo = entrar_no_clube.codigo and desativado_em is null;
  if v.id is null then
    return null;
  end if;

  if not exists (select 1 from public.membros where clube_id = v.clube_id and user_id = auth.uid()) then
    insert into public.membros (clube_id, user_id, convite_id) values (v.clube_id, auth.uid(), v.id);
    perform public.registrar(v.clube_id, 'entrou_por_convite', v.id, auth.uid());
  end if;
  return v.clube_id;
end $$;

-- Gera um link de convite para um grupo. Moderador do grupo ou dono.
create or replace function public.criar_convite(clube uuid, rotulo text) returns text
language plpgsql security definer set search_path = public as $$
declare
  novo public.convites;
begin
  if not public.eh_admin(clube) then
    raise exception 'só moderador gera convite' using errcode = '42501';
  end if;
  insert into public.convites (clube_id, rotulo, criado_por)
    values (clube, trim(criar_convite.rotulo), auth.uid())
    returning * into novo;
  perform public.registrar(clube, 'convite_criado', novo.id, null,
    jsonb_build_object('rotulo', novo.rotulo));
  return novo.codigo;
end $$;

-- Desativa (ou reativa) um link. Moderador do grupo ou dono. Quem já entrou continua no grupo.
create or replace function public.desativar_convite(convite bigint, desativar boolean default true)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v public.convites;
begin
  select * into v from public.convites where id = convite;
  if v.id is null or not public.eh_admin(v.clube_id) then
    raise exception 'sem permissão para mudar este convite' using errcode = '42501';
  end if;
  update public.convites
    set desativado_em = case when desativar then now() end,
        desativado_por = case when desativar then auth.uid() end
    where id = convite;
  perform public.registrar(v.clube_id,
    case when desativar then 'convite_desativado' else 'convite_reativado' end, convite);
end $$;

-- Torna alguém moderador ou membro num grupo. Só o dono.
create or replace function public.definir_papel(clube uuid, pessoa uuid, novo_papel text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  antigo text;
begin
  if not public.eh_dono() then
    raise exception 'só o dono muda papéis' using errcode = '42501';
  end if;
  if novo_papel not in ('membro', 'moderador') then
    raise exception 'papel inválido' using errcode = '22023';
  end if;
  select papel into antigo from public.membros where clube_id = clube and user_id = pessoa;
  if antigo is null then
    raise exception 'essa pessoa não está no grupo' using errcode = '22023';
  end if;
  if antigo = novo_papel then
    return;
  end if;
  update public.membros set papel = novo_papel where clube_id = clube and user_id = pessoa;
  perform public.registrar(clube, 'papel_alterado', null, pessoa,
    jsonb_build_object('de', antigo, 'para', novo_papel));
end $$;

-- ---------- permissões das funções ----------
revoke execute on function public.eh_dono() from public, anon;
revoke execute on function public.registrar(uuid, text, bigint, uuid, jsonb) from public, anon, authenticated;
revoke execute on function public.criar_grupo(text) from public, anon;
revoke execute on function public.ver_convite(text) from public;
revoke execute on function public.entrar_no_clube(text) from public, anon;
revoke execute on function public.criar_convite(uuid, text) from public, anon;
revoke execute on function public.desativar_convite(bigint, boolean) from public, anon;
revoke execute on function public.definir_papel(uuid, uuid, text) from public, anon;

grant execute on function public.eh_dono() to authenticated;
grant execute on function public.criar_grupo(text) to authenticated;
grant execute on function public.ver_convite(text) to anon, authenticated;
grant execute on function public.entrar_no_clube(text) to authenticated;
grant execute on function public.criar_convite(uuid, text) to authenticated;
grant execute on function public.desativar_convite(bigint, boolean) to authenticated;
grant execute on function public.definir_papel(uuid, uuid, text) to authenticated;
