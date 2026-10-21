---
name: setup-projeto
description: Cria o projeto Uni-vos do zero (Next.js, Tailwind, Supabase, Playwright) seguindo o CLAUDE.md. Use uma única vez, no repositório vazio, quando o usuário pedir para iniciar ou montar o projeto.
disable-model-invocation: true
---

Monte a base do Uni-vos. Leia o `CLAUDE.md` inteiro e o `docs/ux/heuristicas-e-mobile.md` antes. Faça em etapas e confirme cada uma rodando os comandos.

1. **Next.js**: `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm` (aceite os padrões restantes). Adicione `"typecheck": "tsc --noEmit"` e `"db:types": "supabase gen types typescript --local > src/lib/database.types.ts"` ao `package.json`.
2. **Dependências**: `npm i @supabase/supabase-js @supabase/ssr zod` e `npm i -D prettier vitest @vitejs/plugin-react @playwright/test supabase`.
3. **Supabase local**: `npx supabase init`; copie `supabase/migrations/0001_inicial.sql` e `supabase/seed.sql` deste kit se ainda não estiverem lá. Rode `npx supabase start` (precisa de Docker) e peça autorização antes do `npx supabase db reset`. Depois, `npm run db:types`.
4. **Variáveis**: crie `.env.example` com `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` (comentado: "só servidor"). Peça ao usuário para criar o `.env.local` com os valores do `npx supabase status`. **Não leia nem escreva o .env.**
5. **Design system**: em `src/app/globals.css`, defina os tokens do CLAUDE.md (claro e escuro com `prefers-color-scheme`), fontes Fraunces e Inter via `next/font`, e exponha no Tailwind (`bg-card`, `text-ink`, `text-muted`, `bg-grad`, `text-accent`, `text-err`). Adicione `min-h-dvh`, `scroll-padding-top`/`scroll-padding-bottom` iguais à altura do topo e da barra inferior, `:focus-visible` com anel de foco, e o respeito a `prefers-reduced-motion`. No `layout.tsx` raiz, exporte `viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', interactiveWidget: 'resizes-content', themeColor: '#7b3fe4' }` (nunca `maximumScale: 1` nem `userScalable: false`).
6. **Supabase no app**: `src/lib/supabase/client.ts`, `server.ts` e `middleware.ts` com `@supabase/ssr`; `src/middleware.ts` protegendo `(app)`; `src/app/auth/callback/route.ts`.
7. **UI base** em `src/components/ui/`: `Button` (variantes `primary` em degradê e `ghost`, `size` normal/small, mínimo de 44 px), `Field` (label + input + hint + erro com `role="alert"` e `aria-invalid`), `Toast` com provider e ação **Desfazer** (6 s), `Sheet` (sobe de baixo no mobile, modal no desktop, Esc fecha, foco preso), `ProgressBar` (com `role="progressbar"`), `Avatar`.
8. **Layout logado** `(app)/layout.tsx`: topo com a logo (do `docs/prototipo.html`) que leva ao Início, botão Ajuda, abas no desktop e **barra inferior no mobile** (Início, Livro da vez, Debates, Mapa político, Mais).
9. **Playwright**: `playwright.config.ts` com projetos `mobile` (390×844, `hasTouch`, `isMobile`), `mobile-pequeno` (360×800), `paisagem` (844×390) e `desktop` (1280×800), e `webServer` rodando `npm run dev`. Crie `tests/e2e/ux-base.spec.ts` que, em toda rota, confere: sem rolagem horizontal, alvos ≥ 44 px, inputs ≥ 16 px e `document.title` no formato "<Aba> · Uni-vos".
10. Rode `npm run typecheck && npm run lint && npm run build`. Mostre um resumo do que foi criado e o próximo passo sugerido (`/nova-feature login`).
