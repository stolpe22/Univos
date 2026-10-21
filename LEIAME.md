# Kit Claude Code do Uni-vos

Copie **todo o conteúdo desta pasta** para a raiz do repositório do Uni-vos (inclusive os arquivos que começam com ponto).

## O que tem aqui

```
CLAUDE.md                       regras do projeto: stack, módulos, design, Nielsen, mobile, segurança
.mcp.json                       Supabase MCP (somente leitura) para o Claude consultar o banco
.env.example                    variáveis de ambiente
.claude/
  settings.json                 permissões e hooks
  hooks/
    protect-files.sh            bloqueia editar .env, tipos gerados e migrations já versionadas
    format.sh                   Prettier + ESLint em cada arquivo editado
    ui-lint.sh                  pega cor hex solta, onClick em div, input sem label, 100vh, jargão
    typecheck-on-stop.sh        roda o typecheck antes do Claude encerrar
  agents/
    ux-nielsen-reviewer.md      audita as 10 heurísticas + mobile
    mobile-qa.md                testa no celular com Playwright
    supabase-architect.md       banco, migrations e RLS
    content-balance-reviewer.md neutralidade das afirmações do mapa político
    security-reviewer.md        auth, actions, segredos, XSS
  skills/                       viram comandos com /
    ux-mobile/                  carrega SOZINHA ao editar telas: Nielsen + WCAG 2.2 + mobile
    setup-projeto/              /setup-projeto  cria o projeto do zero
    nova-feature/               /nova-feature estante
    migration/                  /migration adicionar citações favoritas
    nielsen-audit/              /nielsen-audit livro  (ou "tudo")
    mobile-check/               /mobile-check debates
    deploy/                     /deploy
supabase/
  migrations/0001_inicial.sql   schema completo com RLS (testado)
  seed.sql                      dados demo: Lucas, Karol, Joju, Freakonomics…
src/features/mapa/afirmacoes.ts as 40 afirmações + funções de pontuação e rótulo
docs/prototipo.html             o protótipo, como referência visual
docs/ux/heuristicas-e-mobile.md guia completo e atualizado de Nielsen, WCAG 2.2 e mobile
```

## Passo a passo

1. Instale: Node 20+, Docker (pro Supabase local), `jq` (os hooks usam) e o Claude Code.
2. Crie a pasta do projeto, `git init`, e copie este kit pra dentro.
3. No Linux/macOS: `chmod +x .claude/hooks/*.sh`. No Windows, rode o Claude Code dentro do WSL.
4. Abra o Claude Code na pasta e rode **`/setup-projeto`**.
5. Crie o `.env.local` a partir do `.env.example` com os valores de `npx supabase status`.
6. Vá módulo por módulo: `/nova-feature login`, `/nova-feature livro da vez`, `/nova-feature mapa político`…
7. Depois de cada um: `/mobile-check <modulo>` e `/nielsen-audit <modulo>`.
8. Para o MCP do Supabase: troque `SEU_PROJECT_REF` no `.mcp.json`, rode `/mcp` no Claude Code, escolha **supabase** e autentique.
9. Para publicar: `/deploy`.

## Ordem sugerida dos módulos

Login → layout e navegação → Livro da vez (com progresso) → Início → Debates → Pauta → Estante → Mapa político → Membros → Ajuda.
