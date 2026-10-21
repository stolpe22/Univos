-- A Estante deixa de ser fila: nenhum livro sai dela. O status 'fila' passa a significar
-- "na estante, o grupo ainda não leu". Terminar o livro da vez e escolher o próximo viram
-- dois passos separados: o grupo combina qual ler (votos + quem tem o livro) e quem
-- modera escolhe. avancar_livro (termina e já começa o mais votado) fica sem uso.

-- ---------- terminar o livro da vez (sem começar outro) ----------
create or replace function public.terminar_livro(clube uuid) returns void
language plpgsql security invoker set search_path = public as $$
begin
  if not public.eh_admin(clube) then
    raise exception 'só moderador termina o livro da vez' using errcode = '42501';
  end if;
  update public.livros set status = 'lido' where clube_id = clube and status = 'atual';
end $$;

-- ---------- escolher o livro da vez ----------
-- Só vale para um livro da estante que o grupo ainda não leu, e só quando não há livro da vez.
create or replace function public.escolher_livro(livro bigint) returns void
language plpgsql security invoker set search_path = public as $$
declare
  grupo uuid;
begin
  select l.clube_id into grupo from public.livros l where l.id = livro and l.status = 'fila';
  if grupo is null then
    raise exception 'livro não está na estante' using errcode = 'P0002';
  end if;
  if not public.eh_admin(grupo) then
    raise exception 'só moderador escolhe o livro da vez' using errcode = '42501';
  end if;
  if exists (select 1 from public.livros where clube_id = grupo and status = 'atual') then
    raise exception 'o grupo já tem livro da vez' using errcode = '23505';
  end if;
  update public.livros set status = 'atual' where id = livro;
end $$;

revoke execute on function public.terminar_livro(uuid) from public, anon;
revoke execute on function public.escolher_livro(bigint) from public, anon;
grant execute on function public.terminar_livro(uuid) to authenticated;
grant execute on function public.escolher_livro(bigint) to authenticated;
