-- Uma enquete inicial pode ser proposta antes do debate; outra enquete de
-- posicionamento pode ser proposta depois. Ambas registram votos de antes/depois.
alter table public.enquetes
  add column tipo text not null default 'inicial'
  check (tipo in ('inicial', 'pos_debate'));

drop index if exists public.uma_enquete_por_debate;
create unique index uma_enquete_por_debate_e_tipo
  on public.enquetes (debate_id, tipo)
  where status <> 'recusada';

drop policy if exists "membro propõe enquete" on public.enquetes;
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
           (tipo = 'inicial' and d.status = 'agendado')
           or (tipo = 'pos_debate' and d.status = 'encerrado')
         )
    )
  );
