-- Quem nao votou antes pode registrar sua posicao historica depois que o debate
-- termina. Esse registro so pode ser feito uma vez; votos anteriores existentes
-- continuam sem edicao ou remocao apos o encerramento.
create or replace function public.pode_votar_enquete(e bigint, m text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
      from public.enquetes q
      join public.debates d on d.id = q.debate_id
     where q.id = e
       and q.status = 'aprovada'
       and public.eh_membro(d.clube_id)
       and (
         (m = 'antes' and (
           d.status = 'agendado'
           or (
             d.status = 'encerrado'
             and not exists (
               select 1
                 from public.votos_enquete v
                where v.enquete_id = q.id
                  and v.user_id = auth.uid()
                  and v.momento = 'antes'
             )
           )
         ))
         or (m = 'depois' and d.status = 'encerrado')
       )
  );
$$;
