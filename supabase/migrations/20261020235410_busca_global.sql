-- Busca global (Ctrl+K): livros, debates, temas da pauta e pessoas de um grupo.
-- Ignora acento e caixa ("politica" acha "Política"), usando public.normalizar da migration inicial.
-- security invoker: roda com as permissões de quem busca, então a RLS decide o que aparece.

create or replace function public.buscar(clube uuid, termo text)
returns table (tipo text, id text, titulo text, detalhe text)
language sql stable security invoker set search_path = public as $$
  with t as (
    -- escapa \ % _ para o termo ser procurado ao pé da letra
    select '%' || replace(replace(replace(public.normalizar(trim(termo)), '\', '\\'), '%', '\%'), '_', '\_') || '%' as padrao
  )
  (select 'livro', l.id::text, l.titulo,
          l.autor || ' · ' || case l.status when 'atual' then 'livro da vez' when 'lido' then 'já lido' else 'na fila' end
     from public.livros l, t
    where l.clube_id = clube
      and (public.normalizar(l.titulo) like t.padrao or public.normalizar(l.autor) like t.padrao)
    order by l.criado_em desc limit 5)
  union all
  (select 'debate', d.id::text, d.tema,
          to_char(d.data at time zone 'America/Sao_Paulo', 'DD/MM "às" HH24:MI')
     from public.debates d, t
    where d.clube_id = clube and public.normalizar(d.tema) like t.padrao
    order by d.data desc limit 5)
  union all
  (select 'tema', tm.id::text, tm.tema, null
     from public.temas tm, t
    where tm.clube_id = clube and public.normalizar(tm.tema) like t.padrao
    order by tm.criado_em desc limit 5)
  union all
  (select 'pessoa', p.id::text, p.nome, null
     from public.membros m join public.perfis p on p.id = m.user_id, t
    where m.clube_id = clube and public.normalizar(p.nome) like t.padrao
    order by p.nome limit 5);
$$;

revoke execute on function public.buscar(uuid, text) from public, anon;
grant execute on function public.buscar(uuid, text) to authenticated;
