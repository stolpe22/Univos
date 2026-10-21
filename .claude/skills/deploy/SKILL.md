---
name: deploy
description: Checklist e passos para publicar o Uni-vos na Vercel com o Supabase de produção. Use só quando o usuário pedir para fazer deploy ou publicar.
disable-model-invocation: true
---

Faça o deploy do Uni-vos com segurança. Pare e pergunte ao usuário antes de qualquer passo que mexe em produção.

1. **Qualidade**: `npm run typecheck && npm run lint && npm run test && npm run build`. Se falhar, pare.
2. **Revisões**: use o agente `security-reviewer` nas mudanças desde o último deploy (`git log` / `git diff`). Bloqueie se houver item Crítico ou Alto.
3. **Banco**: liste as migrations novas e pergunte se pode rodar `npx supabase db push` no projeto de produção.
4. **Supabase Auth (produção)**: confirme com o usuário que em Authentication → URL Configuration estão o domínio da Vercel em *Site URL* e `https://<dominio>/auth/callback` em *Redirect URLs* (o login é só por email e senha: não há provedor social).
5. **Vercel**: confirme que `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão nas variáveis do projeto (a service role só se alguma rota de servidor precisar, nunca como `NEXT_PUBLIC`).
6. **Publicar**: `git push` na branch principal (a Vercel faz o deploy) ou `npx vercel --prod`, com autorização.
7. **Smoke test**: depois do deploy, abra o site, faça login, atualize uma página do livro e desfaça. Informe a URL e o resultado ao usuário.
