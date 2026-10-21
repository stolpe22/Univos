#!/usr/bin/env bash
# PreToolUse: impede editar arquivos sensíveis ou gerados.
# Exit 2 bloqueia a ação e o texto do stderr volta pro Claude.
set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[ -z "$FILE" ] && exit 0

ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
REL="${FILE#"$ROOT"/}"

case "$REL" in
  .env|.env.*)
    [ "$REL" = ".env.example" ] && exit 0
    echo "Bloqueado: $REL tem segredos. Documente variáveis novas em .env.example e peça ao usuário para preencher o .env." >&2
    exit 2 ;;
  src/lib/database.types.ts)
    echo "Bloqueado: database.types.ts é gerado. Mude o banco com uma migration e rode 'npm run db:types'." >&2
    exit 2 ;;
  package-lock.json)
    echo "Bloqueado: não edite o package-lock.json à mão. Use 'npm install <pacote>'." >&2
    exit 2 ;;
esac

# Migration que já existe no git (ou seja, provavelmente já aplicada) não se edita.
if [[ "$REL" == supabase/migrations/*.sql ]] && [ -f "$FILE" ]; then
  if git -C "$ROOT" ls-files --error-unmatch "$REL" >/dev/null 2>&1; then
    echo "Bloqueado: $REL já está versionada e pode ter sido aplicada. Crie uma migration nova com 'npx supabase migration new <nome>'." >&2
    exit 2
  fi
fi

exit 0
