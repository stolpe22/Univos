-- O gerenciamento do catálogo é restrito ao dono do sistema.
create or replace function public.eh_admin_catalogo() returns boolean
language sql stable security definer set search_path = public as $$
  select public.eh_dono();
$$;
