-- A pergunta inicial da enquete também pode ser proposta (e votada no "antes") com o
-- debate em andamento. Sem isso, um debate aberto com "Já está rolando" nunca tinha
-- enquete inicial. O "depois" continua abrindo só quando o debate encerra.

drop policy if exists "membro propõe enquete na fase certa" on public.enquetes;
create policy "membro propõe enquete na fase certa" on public.enquetes
  for insert to authenticated
  with check (
    proposta_por = auth.uid()
    and status = 'proposta'
    and decidida_por is null
    and exists (
      select 1 from public.debates d
       where d.id = debate_id
         and public.eh_membro(d.clube_id)
         and (
           (tipo = 'inicial' and d.status in ('agendado', 'ao_vivo'))
           or (tipo = 'pos_debate' and d.status = 'encerrado')
         )
    )
  );

-- "antes" = como a pessoa pensava quando o debate começou: vale marcado, em andamento
-- e, como registro tardio, depois de encerrado. "depois" só com o debate encerrado.
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
         (m = 'antes' and d.status in ('agendado', 'ao_vivo', 'encerrado'))
         or (m = 'depois' and d.status = 'encerrado')
       )
  );
$$;
