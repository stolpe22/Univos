---
name: migration
description: Cria uma migration nova do Supabase para o Uni-vos com RLS, constraints e índices, e regenera os tipos. Use sempre que for criar ou alterar tabela, coluna, política, função ou índice.
argument-hint: "[o que muda no banco]"
---

Mudança pedida: **$ARGUMENTS**

1. Leia todas as migrations em `supabase/migrations/` para entender o estado atual. **Nunca edite uma migration existente.**
2. Crie o arquivo: `npx supabase migration new <nome_em_snake_case>`.
3. Escreva o SQL seguindo este molde:

```sql
create table public.exemplo (
  id bigint generated always as identity primary key,
  clube_id uuid not null references public.clubes(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.perfis(id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 500),
  criado_em timestamptz not null default now()
);
create index on public.exemplo (clube_id);

alter table public.exemplo enable row level security;

create policy "membros leem" on public.exemplo
  for select to authenticated using (public.eh_membro(clube_id));
create policy "autor cria" on public.exemplo
  for insert to authenticated with check (user_id = auth.uid() and public.eh_membro(clube_id));
create policy "autor edita" on public.exemplo
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "autor apaga" on public.exemplo
  for delete to authenticated using (user_id = auth.uid());
```

4. Se a tabela precisa de tempo real (progresso, debates ao vivo): `alter publication supabase_realtime add table public.exemplo;`
5. Peça autorização e rode `npx supabase db reset` (local), depois `npm run db:types`.
6. Atualize `supabase/seed.sql` se a tabela precisar de dados demo.
7. Explique ao usuário o que mudou e lembre que em produção é `npx supabase db push` (pede confirmação).
