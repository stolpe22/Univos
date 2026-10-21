---
name: nova-feature
description: Implementa um módulo ou feature do Uni-vos de ponta a ponta (banco, actions, tela, ajuda, testes) seguindo o CLAUDE.md e o protótipo. Use quando o usuário pedir para criar ou implementar uma tela, módulo ou funcionalidade.
argument-hint: "[modulo ou feature, ex: estante, comentarios sem spoiler]"
---

Implemente **$ARGUMENTS** no Uni-vos.

## 1. Entender
- Leia a seção do módulo no `CLAUDE.md` e a tela correspondente em `docs/prototipo.html` (busque pela função `V.<modulo>` e pelas ações relacionadas).
- Liste os casos: caminho feliz, validações, estado vazio, erro de rede, o que tem Desfazer, o que precisa de confirmação.
- Se algo for ambíguo e caro de refazer, pergunte antes.

## 2. Dados
- Se precisar mudar o banco, use a skill `/migration` (ou o agente `supabase-architect`).
- Queries em `src/features/<modulo>/queries.ts` (server). Tipos de `database.types.ts`.

## 3. Mutações
- `src/features/<modulo>/schemas.ts`: schemas Zod com mensagens de erro em pt-BR **que dizem o que fazer**.
- `src/features/<modulo>/actions.ts`: server actions que validam, chamam o Supabase, retornam `{ ok: true, data }` ou `{ ok: false, erros: { campo: "mensagem" } }`, e chamam `revalidatePath`.
- Toda ação reversível retorna o que for preciso para o **Desfazer** (ex: id criado ou valor anterior).

## 4. Tela
- `src/app/(app)/<modulo>/page.tsx` (Server Component) + componentes client só onde houver interação.
- Use somente `components/ui` e os tokens. Nada de hex solto.
- `export const metadata = { title: "<Aba> · Uni-vos" }`.
- Mobile primeiro (390 px), depois desktop.
- Toast após cada ação; Desfazer quando reversível; foco vai para o primeiro campo com erro.
- Estado vazio com texto e ação.

## 5. Ajuda
- Adicione 2–4 perguntas da feature em `src/features/ajuda/conteudo.ts`.

## 6. Testes
- Unidade (Vitest) para schemas e para lógica pura (ex: pontuação do quiz, regra de spoiler).
- E2E em `tests/e2e/<modulo>.spec.ts` no projeto `mobile` (pode delegar ao agente `mobile-qa`).

## 7. Verificar
- `npm run typecheck && npm run lint && npm run test`
- Rode `/nielsen-audit <modulo>` e corrija o que vier como ❌.
- Resuma ao usuário o que foi feito, o que ficou de fora e como testar.
