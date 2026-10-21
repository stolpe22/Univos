# Uni-vos: instruções para agentes (Codex e outros)

**Antes de qualquer mudança, leia o `CLAUDE.md` deste repositório inteiro.** Ele vale para
todo agente, não só para o Claude: stack, design system (só tokens, nunca cor hex em
componente), as 10 heurísticas de Nielsen, as regras de mobile, segurança (RLS, Zod em toda
server action) e a seção "Padrões de código". Os guias completos estão em `docs/ux/` e as
skills do projeto em `.claude/skills/` (leia o `SKILL.md` da tarefa, ex: `nova-feature`).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
