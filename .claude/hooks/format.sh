#!/usr/bin/env bash
# PostToolUse: formata o arquivo editado e devolve erros de lint pro Claude.
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[ -z "$FILE" ] || [ ! -f "$FILE" ] && exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -d node_modules ] || exit 0

case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.css|*.json|*.md|*.mdx)
    npx --no-install prettier --write "$FILE" >/dev/null 2>&1 ;;
  *) exit 0 ;;
esac

case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx)
    if ! OUT=$(npx --no-install eslint --fix "$FILE" 2>&1); then
      echo "ESLint encontrou problemas em $FILE:" >&2
      echo "$OUT" | tail -n 30 >&2
      exit 2
    fi ;;
esac
exit 0
