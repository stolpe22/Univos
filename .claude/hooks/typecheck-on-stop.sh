#!/usr/bin/env bash
# Stop: antes do Claude encerrar, roda o typecheck se algum .ts/.tsx mudou.
# Se falhar, exit 2 faz o Claude continuar e corrigir.
INPUT=$(cat)
# Evita loop: se já estamos continuando por causa deste hook, deixa parar.
[ "$(echo "$INPUT" | jq -r '.stop_hook_active // false')" = "true" ] && exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -d node_modules ] || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

CHANGED=$( { git diff --name-only; git diff --name-only --cached; git ls-files --others --exclude-standard; } | grep -E '\.(ts|tsx)$' | sort -u)
[ -z "$CHANGED" ] && exit 0

if ! OUT=$(npm run -s typecheck 2>&1); then
  echo "Typecheck falhou. Corrija antes de terminar:" >&2
  echo "$OUT" | tail -n 40 >&2
  exit 2
fi
exit 0
