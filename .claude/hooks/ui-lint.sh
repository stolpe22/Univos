#!/usr/bin/env bash
# PostToolUse: checagens rápidas das regras de design, Nielsen e mobile do CLAUDE.md.
# Não substitui o agente ux-nielsen-reviewer; pega só os erros mais comuns.
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[[ "$FILE" == *.tsx || "$FILE" == *.css ]] || exit 0
[[ "$FILE" == */src/* || "$FILE" == */app/* ]] || exit 0
[ -f "$FILE" ] || exit 0

PROBLEMS=()

# Cor solta em componente (tokens ficam só no globals.css / tailwind.config)
if [[ "$FILE" == *.tsx ]] && grep -nE '#[0-9a-fA-F]{3,8}\b' "$FILE" | grep -vE '^\s*[0-9]+:\s*(//|\*)' | grep -q .; then
  PROBLEMS+=("Cor em hex no componente. Use os tokens (bg-card, text-ink, bg-grad, text-red…). Linhas: $(grep -nE '#[0-9a-fA-F]{3,8}\b' "$FILE" | cut -d: -f1 | tr '\n' ' ')")
fi

# Clique em elemento não interativo (acessibilidade + teclado)
if grep -nE '<(div|span|li)[^>]*onClick=' "$FILE" | grep -q .; then
  PROBLEMS+=("onClick em <div>/<span>/<li>. Use <button> ou <Link> (teclado e leitor de tela).")
fi

# Imagem sem alt
if grep -nE '<(img|Image)\b[^>]*>' "$FILE" | grep -v 'alt=' | grep -q .; then
  PROBLEMS+=("<img>/<Image> sem alt. Use alt descritivo ou alt=\"\" se for decorativa.")
fi

# Input sem label associado (heurística 6: label sempre visível)
if [[ "$FILE" == *.tsx ]] && grep -qE '<input\b' "$FILE" && ! grep -qE '<(label|Field)\b' "$FILE"; then
  PROBLEMS+=("Arquivo tem <input> mas nenhum <label>/<Field>. Placeholder não substitui label.")
fi

# 100vh quebra no mobile
if grep -nE '\b(h|min-h)-screen\b|100vh' "$FILE" | grep -vq 'dvh'; then
  PROBLEMS+=("Uso de 100vh/h-screen. No mobile use 100dvh (min-h-dvh).")
fi

# Zoom bloqueado (WCAG 1.4.4)
if grep -qE 'user-scalable *= *(no|0)|maximum-scale *= *1([^.0-9]|$)|maximumScale *: *1([^.0-9]|$)|userScalable *: *false' "$FILE"; then
  PROBLEMS+=("Viewport bloqueando zoom (user-scalable=no / maximum-scale=1). Remova: viola a WCAG 1.4.4.")
fi

# Foco removido sem substituto
if grep -qE 'outline-none|outline: *none|outline: *0' "$FILE" && ! grep -qE 'focus-visible|ring-|box-shadow' "$FILE"; then
  PROBLEMS+=("outline removido sem outro indicador de foco. Adicione focus-visible:ring-* ou equivalente.")
fi

# Jargão proibido na interface (heurística 2)
if grep -niE '>[^<]*(OTP|RSVP|token|erro [0-9]{3}|undefined|null)[^<]*<' "$FILE" | grep -q .; then
  PROBLEMS+=("Jargão técnico em texto da interface (OTP, RSVP, token, código de erro…). Use linguagem do grupo.")
fi

if [ ${#PROBLEMS[@]} -gt 0 ]; then
  echo "Regras de UI do Uni-vos (CLAUDE.md) violadas em ${FILE##*/src/}:" >&2
  for p in "${PROBLEMS[@]}"; do echo "- $p" >&2; done
  exit 2
fi
exit 0
