---
name: nielsen-audit
description: Audita uma tela ou o app inteiro do Uni-vos contra as 10 heurísticas de Nielsen e as regras de mobile, e propõe correções. Use quando o usuário pedir revisão de UX/usabilidade, ou ao terminar uma feature.
argument-hint: "[modulo ou 'tudo']"
context: fork
agent: ux-nielsen-reviewer
background: false
---

Audite **$ARGUMENTS** do Uni-vos.

Se for "tudo", passe por cada rota de `src/app/(app)/` e pela tela de login. Para cada tela, gere a tabela das 10 heurísticas + mobile com ✅ / ⚠️ / ❌ e evidência (arquivo:linha). No fim, junte as correções numa lista única, da mais grave para a menos grave, e diga quais podem ser resolvidas em menos de 10 minutos.
