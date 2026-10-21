-- Mantem aberta a edicao da posicao "antes" mesmo depois do encerramento.
-- Assim, quem registrou um voto historico pode corrigir ou atualizar sua resposta.
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
         (m = 'antes' and d.status in ('agendado', 'encerrado'))
         or (m = 'depois' and d.status = 'encerrado')
       )
  );
$$;
