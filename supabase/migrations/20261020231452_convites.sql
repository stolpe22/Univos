-- Entrada no clube por link de convite.
-- A primeira pessoa cria o clube e vira admin; o resto entra pelo link /convite/<codigo>.

create or replace function public.novo_codigo_convite() returns text
language sql volatile as $$
  select substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
$$;

alter table public.clubes
  add column codigo_convite text not null unique default public.novo_codigo_convite()
  check (codigo_convite ~ '^[0-9a-f]{16}$');

-- Cria um clube e coloca quem criou como admin.
create or replace function public.criar_clube(nome text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  novo uuid;
begin
  if auth.uid() is null then
    raise exception 'precisa estar logado' using errcode = '28000';
  end if;
  insert into public.clubes (nome) values (trim(nome)) returning id into novo;
  insert into public.membros (clube_id, user_id, papel) values (novo, auth.uid(), 'admin');
  return novo;
end $$;

-- Mostra o nome do clube de um convite, para a tela de convite antes do login.
-- Devolve só o nome: sem membros, sem livros, sem id.
create or replace function public.ver_convite(codigo text) returns text
language sql stable security definer set search_path = public as $$
  select nome from public.clubes where codigo_convite = codigo;
$$;

-- Entra no clube do convite. Devolve o id do clube, ou null se o código não vale.
create or replace function public.entrar_no_clube(codigo text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  alvo uuid;
begin
  if auth.uid() is null then
    raise exception 'precisa estar logado' using errcode = '28000';
  end if;
  select id into alvo from public.clubes where codigo_convite = codigo;
  if alvo is null then
    return null;
  end if;
  insert into public.membros (clube_id, user_id) values (alvo, auth.uid())
    on conflict (clube_id, user_id) do nothing;
  return alvo;
end $$;

-- Gera um link novo; o antigo deixa de funcionar. Só admin.
create or replace function public.trocar_convite(clube uuid) returns text
language plpgsql security definer set search_path = public as $$
declare
  codigo text;
begin
  if not public.eh_admin(clube) then
    raise exception 'só admin troca o convite' using errcode = '42501';
  end if;
  update public.clubes set codigo_convite = public.novo_codigo_convite()
    where id = clube returning codigo_convite into codigo;
  return codigo;
end $$;

-- Por padrão o Postgres libera execute para todo mundo; aqui fica só quem precisa.
revoke execute on function public.novo_codigo_convite() from public, anon, authenticated;
revoke execute on function public.criar_clube(text) from public, anon;
revoke execute on function public.ver_convite(text) from public;
revoke execute on function public.entrar_no_clube(text) from public, anon;
revoke execute on function public.trocar_convite(uuid) from public, anon;
grant execute on function public.criar_clube(text) to authenticated;
grant execute on function public.ver_convite(text) to anon, authenticated;
grant execute on function public.entrar_no_clube(text) to authenticated;
grant execute on function public.trocar_convite(uuid) to authenticated;
