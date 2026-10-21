-- Marcar debate de três jeitos:
--   1. data e hora (como antes): precisa ser no futuro;
--   2. só a data, sem hora: de hoje em diante (guardada como 00:00 de Brasília, com_hora = false);
--   3. "já está rolando": o debate nasce em andamento, com a data/hora de agora.
-- Debates antigos têm hora (com_hora = true, o padrão).

alter table public.debates
  add column if not exists com_hora boolean not null default true;

drop policy if exists "marcar debate" on public.debates;
create policy "marcar debate" on public.debates for insert to authenticated
  with check (
    public.eh_membro(clube_id)
    and criado_por = auth.uid()
    and (
      -- com hora: no futuro
      (status = 'agendado' and com_hora and data > now())
      -- só a data: hoje ou depois (comparado no dia de Brasília)
      or (status = 'agendado' and not com_hora
          and (data at time zone 'America/Sao_Paulo')::date
              >= (now() at time zone 'America/Sao_Paulo')::date)
      -- já está rolando: nasce em andamento, com o horário de agora (folga pro relógio)
      or (status = 'ao_vivo' and com_hora
          and data between now() - interval '10 minutes' and now() + interval '10 minutes')
    )
  );
