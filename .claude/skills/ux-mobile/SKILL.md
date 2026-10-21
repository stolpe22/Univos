---
name: ux-mobile
description: Regras obrigatórias de UX do Uni-vos (10 heurísticas de Nielsen, WCAG 2.2 AA e mobile-first). Carregue sempre antes de criar ou alterar qualquer tela, componente, formulário, estilo ou texto de interface.
paths:
  - "src/**/*.tsx"
  - "src/**/*.css"
  - "src/features/ajuda/**"
---

Toda interface do Uni-vos segue estas regras. A versão completa, com exemplos, está em `docs/ux/heuristicas-e-mobile.md`; leia a seção da heurística sempre que houver dúvida.

## Antes de escrever o código
1. Abra a tela equivalente em `docs/prototipo.html`.
2. Liste os estados: carregando (>1 s), vazio, sucesso, erro de validação, erro de rede, sem internet.
3. Decida o que tem **Desfazer** e o que precisa de **confirmação** (só o irreversível).

## As 10 heurísticas (resumo operacional)
1. **Estado visível**: aba ativa (`aria-current`), título "<Aba> · Uni-vos", toast em toda ação. Até 1 s: atualização otimista; acima de 1 s: "Enviando…"/skeleton; acima de 10 s: progresso com % e Cancelar.
2. **Mundo real**: pt-BR do grupo; sem OTP, RSVP, token, código de erro; ícone sempre com texto.
3. **Controle**: Desfazer no toast (6 s); Fechar, Esc e voltar do navegador funcionam; Voltar e Pausar em fluxos longos.
4. **Consistência**: aba = título; primário em degradê e secundário contornado; Ajuda sempre no mesmo lugar (WCAG 3.2.6); padrões iOS/Android.
5. **Prevenção**: `min`/`max`/`maxlength`/`inputmode`; bons padrões; sem duplicado; não pedir de novo o que já foi dito (WCAG 3.3.7); desabilitar o envio durante o envio.
6. **Reconhecimento**: `<label>` visível sempre; mostrar o que está marcado; ajuda contextual; login sem decorar nada (WCAG 3.3.8).
7. **Eficiência**: atalhos de teclado e passos rápidos (±10), atalhos entre módulos; gesto é atalho, nunca o único caminho.
8. **Minimalismo**: uma tarefa por card; animação só para comunicar; `prefers-reduced-motion`.
9. **Erros**: ao lado do campo, vermelho + ícone, `role="alert"`, `aria-invalid`, foco no primeiro erro; diz o que fazer; erro de rede com "Tentar de novo"; nunca apagar o que foi digitado.
10. **Ajuda**: 2–4 perguntas da feature em `src/features/ajuda/conteudo.ts`; estado vazio ensina o próximo passo.

## Mobile (obrigatório)
- Comece em **390×844**; teste em 360 px e em paisagem. Zero rolagem horizontal.
- Toque **≥ 44×44 px** (WCAG 2.5.8 exige ≥ 24; a meta do projeto é 44), com 8 px entre alvos.
- Ação principal na metade de baixo (zona do polegar). Barra inferior com ícone + texto abaixo de 760 px.
- Janelas = sheet que sobe de baixo.
- Inputs **≥ 16 px**, com `type`, `inputmode`, `autocomplete` e `enterkeyhint` certos.
- Barras fixas não cobrem o foco (WCAG 2.4.11): `scroll-padding` + `scrollIntoView({ block: "center" })`.
- `min-h-dvh` (nunca `100vh`), `env(safe-area-inset-*)`, sem `user-scalable=no`/`maximum-scale=1`.
- Nada depende de hover; tudo que arrasta também funciona com toque (WCAG 2.5.7).
- Contraste ≥ 4,5:1 nos dois temas; foco visível; cor nunca é a única pista.
- Desempenho: INP ≤ 200 ms, LCP ≤ 2,5 s, CLS ≤ 0,1 no celular.

## Antes de dizer que terminou
Rode `/mobile-check <modulo>` e `/nielsen-audit <modulo>` e corrija tudo que vier como ❌.
