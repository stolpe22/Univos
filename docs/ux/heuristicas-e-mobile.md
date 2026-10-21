# Guia de UX do Uni-vos: heurísticas de Nielsen + mobile

Referência obrigatória para qualquer tela do Uni-vos. O resumo operacional fica na skill `ux-mobile` (carrega sozinha ao editar `.tsx`/`.css`); este arquivo é a versão completa.

## Base e atualizações

- As **10 heurísticas de Nielsen** (NN/g) são de 1994. A redação foi refinada em 2020, e o artigo oficial foi revisado em 30/01/2024. **As 10 continuam as mesmas.**
- Jakob Nielsen afirma que elas seguem válidas, inclusive em produtos com IA, porque falam de como pessoas usam tecnologia, e pessoas não mudaram.
- O que mudou em volta, e este guia incorpora:
  - **WCAG 2.2** (W3C, 2023): 9 critérios novos, vários pensados para toque e mobile. A meta do Uni-vos é **nível AA**.
  - **Tempos de resposta** da NN/g (0,1 s / 1 s / 10 s) para decidir que feedback mostrar.
  - **Core Web Vitals**: desde março de 2024 a responsividade é medida pelo **INP** (substituiu o FID).

---

## As 10 heurísticas aplicadas ao Uni-vos

### 1. Visibilidade do estado do sistema
> Manter as pessoas informadas sobre o que está acontecendo, com feedback apropriado e em tempo razoável.

- Aba atual destacada no topo (desktop) e na barra inferior (mobile), com `aria-current="page"`.
- `document.title` = "<Aba> · Uni-vos".
- Toda ação gera feedback: toast curto ("Página 165 salva.").
- **Regra dos tempos de resposta (NN/g):**
  - **até 0,1 s:** parece instantâneo; basta mostrar o resultado. Use atualização otimista (votos, presença, página).
  - **0,1 a 1 s:** a pessoa percebe, mas não perde o fio. Não precisa de indicador.
  - **acima de 1 s:** mostrar que está trabalhando: botão em "Enviando…" desabilitado, skeleton no lugar do conteúdo.
  - **acima de 10 s:** barra de progresso com porcentagem **e** botão de cancelar.
- Fluxos longos mostram onde a pessoa está ("Pergunta 12 de 40").
- Tempo real (Supabase Realtime) para progresso do grupo e debate ao vivo, com indicador "🔴 ao vivo".
- Sem conexão: aviso visível ("Você está sem internet. O que fizer agora será salvo quando voltar.") em vez de falhar em silêncio.

### 2. Correspondência entre o sistema e o mundo real
> Falar a língua das pessoas, com palavras e conceitos familiares, e seguir convenções do mundo real em ordem natural.

- pt-BR informal do grupo. Proibido: "OTP", "RSVP", "token", "payload", "erro 500", "null".
- Termos do grupo: "link de acesso", "Vou participar", "FINALIZADO!", "livro da vez", "Virar debate".
- Ordem natural: datas futuras primeiro na agenda, livro mais votado no topo da fila, páginas em ordem.
- Ícones sempre com texto embaixo na barra inferior (ícone sozinho é ambíguo).

### 3. Controle e liberdade do usuário
> Oferecer uma "saída de emergência" claramente sinalizada para desfazer ações por engano.

- **Desfazer** no toast (6 s) para toda ação reversível: salvar página, votar, comentar, apagar comentário, confirmar presença, agendar, propor tema.
- Sheets e modais: botão **Fechar** visível, Esc fecha, toque fora fecha.
- O botão voltar do navegador e o gesto de voltar do celular funcionam (rotas reais; abrir um sheet não pode "prender" o voltar).
- Fluxos longos têm **Voltar** e **Pausar** (quiz guarda as respostas).
- Spoiler escondido pode ser revelado ("Mostrar mesmo assim").

### 4. Consistência e padrões
> Não fazer a pessoa se perguntar se palavras ou ações diferentes significam a mesma coisa. Seguir as convenções da plataforma (Lei de Jakob).

- **Interna:** o nome da aba é o título da página; botão principal sempre em degradê, secundário sempre contornado; "Votar"/"✓ Votado" igual na Estante e na Pauta; a logo sempre leva ao Início.
- **Externa:** barra inferior com até 5 itens (padrão iOS/Android); sheet que sobe de baixo; puxar para atualizar onde houver lista; campos com teclado certo.
- **WCAG 3.2.6 Ajuda consistente:** o botão Ajuda fica **no mesmo lugar em todas as telas** (topo, à direita).

### 5. Prevenção de erros
> Melhor que boa mensagem de erro é impedir o erro: eliminar condições propensas a erro ou pedir confirmação.

- Restrições no campo: `type="number"` com `min`/`max`, `inputmode="numeric"`, `type="datetime-local"` com `min` = agora, `maxlength` com contador.
- Bons padrões: página atual já preenchida, formato "Rodada com FINALIZADO!" selecionado.
- Bloquear duplicados (livro e tema) e dizer o que fazer ("Já está na estante. Que tal votar nele?").
- Confirmação **só** para o que não tem Desfazer (ex: "Apagar e refazer" o quiz). Confirmar demais vira ruído.
- **WCAG 3.3.7 Entrada redundante:** não pedir de novo algo que a pessoa já informou (ex: "Virar debate" leva o tema preenchido).
- Botão de enviar desabilita durante o envio, evitando duplo toque.

### 6. Reconhecimento em vez de memorização
> Minimizar a carga de memória deixando elementos, ações e opções visíveis.

- `<label>` sempre visível; placeholder é só exemplo, nunca o rótulo.
- Mostrar o estado: resposta marcada ao voltar no quiz, "✓ Confirmado", "você" no próprio item, "Última atualização: agora há pouco".
- Ajuda **contextual**: abre na seção da tela atual.
- **WCAG 3.3.8 Autenticação acessível:** o login é por email e senha (decisão do dono do projeto), então o campo de senha aceita colar e gerenciador de senhas (`autocomplete="current-password"`/`"new-password"`), tem botão de mostrar a senha e o fluxo "Esqueci minha senha". Sem login social (nada de Google).

### 7. Flexibilidade e eficiência de uso
> Atalhos, escondidos para iniciantes, aceleram o uso de quem já é experiente.

- Quiz: teclas 1–5 respondem, ← volta (anunciados só na tela de introdução, no desktop).
- Botões ±10 páginas.
- Atalhos entre módulos: "Virar debate", "Atualizar página" no Início, "Marcar um debate" no resultado do mapa.
- Enter envia formulário.
- Gestos (deslizar) são **atalho**, nunca o único caminho (ver WCAG 2.5.7 abaixo).

### 8. Design estético e minimalista
> Cada informação extra compete com a relevante. Não é "design plano": é foco no essencial.

- Uma tarefa principal por card.
- Animação só para comunicar (entrada de conteúdo, progresso, ao vivo), nunca dentro de fluxo de digitação.
- Respeitar `prefers-reduced-motion`.
- No mobile, esconder o secundário atrás de "Mais", não espremer tudo na tela.

### 9. Ajudar a reconhecer, diagnosticar e se recuperar de erros
> Mensagens em linguagem clara, sem códigos, dizendo exatamente o problema e sugerindo a solução.

- Mensagem **ao lado do campo**, em vermelho (`--err`), com ícone, `role="alert"` e `aria-invalid="true"`, e o foco vai para o primeiro campo com erro.
- Formato: o que aconteceu + o que fazer. "A página precisa estar entre 0 e 320." / "Essa data já passou. Escolha uma data no futuro."
- Erro de rede: "Não deu pra salvar agora. Confira sua internet e tente de novo." + botão **Tentar de novo**.
- Nunca apagar o que a pessoa digitou quando der erro.

### 10. Ajuda e documentação
> O ideal é não precisar de ajuda, mas quando precisar, ela deve ser fácil de buscar, focada na tarefa e em passos concretos.

- Botão Ajuda com **busca** (ignora acento), abrindo na seção da tela atual.
- Respostas curtas, em passos.
- Toda feature nova adiciona 2–4 perguntas em `src/features/ajuda/conteudo.ts`.
- Estados vazios ensinam o próximo passo ("Nenhum comentário ainda. Seja a primeira pessoa a comentar.").

---

## Mobile: regras obrigatórias

### Tamanho e toque
- **Área de toque ≥ 44×44 px** (padrão Apple HIG 44 pt; Material usa 48 dp). A WCAG 2.2 (2.5.8, AA) exige no mínimo **24×24 px**, mas isso é o piso legal, não a meta.
- Espaço de pelo menos 8 px entre alvos vizinhos.
- Ações principais na **metade de baixo da tela** (zona do polegar): barra inferior, botão principal no fim do card ou fixo embaixo em formulários longos.

### Navegação
- Abaixo de 760 px: **barra inferior** com Início, Livro da vez, Debates, Mapa político e Mais; ícone + texto; item ativo destacado.
- "Mais" abre um sheet com Estante, Pauta, Membros, Ajuda e Sair.
- Janelas são **sheets que sobem de baixo**, com alça visual, Fechar e Esc.

### Teclado virtual e foco
- Inputs com **font-size ≥ 16 px** (evita o zoom automático do iOS).
- `type`, `inputmode`, `autocomplete` e `enterkeyhint` corretos (`email`, `numeric`, `search`; `enterkeyhint="send"` em comentário).
- **WCAG 2.4.11 Foco não encoberto (AA):** a barra inferior e o topo fixo não podem cobrir o campo focado. Use `scroll-padding-top`/`scroll-padding-bottom` iguais à altura das barras e `scrollIntoView({ block: "center" })` ao focar.
- Considere `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">` para o teclado redimensionar o layout em vez de cobri-lo.
- **Nunca** use `maximum-scale=1` ou `user-scalable=no` (bloqueia zoom: WCAG 1.4.4).

### Layout
- Projetar em **390×844** primeiro; testar também em 360 px (Android pequeno) e em paisagem.
- `100dvh`/`min-h-dvh` em vez de `100vh` (a barra do navegador mobile muda de tamanho).
- Respeitar `env(safe-area-inset-*)` (notch, ilha dinâmica, barra de gestos).
- Zero rolagem horizontal. Texto longo quebra (`overflow-wrap: anywhere`).
- Funciona com zoom de texto em 200% (WCAG 1.4.4) e em retrato e paisagem (WCAG 1.3.4).

### Gestos e hover
- **WCAG 2.5.7 Movimentos de arrastar (AA):** tudo que se faz arrastando também se faz com um toque (ex: reordenar a fila tem botões ↑ ↓).
- Nada depende de hover: tooltip e menu também abrem com toque e com foco do teclado.
- Gesto de deslizar para apagar = atalho; o botão Apagar continua visível.

### Desempenho (é usabilidade)
- **INP ≤ 200 ms** (bom), **LCP ≤ 2,5 s**, **CLS ≤ 0,1**, medidos em 4G no celular.
- Atualização otimista para ações frequentes; skeleton em vez de tela em branco; reservar espaço de imagens (evita pulo de layout).
- Fontes com `next/font` e `display: swap`.

### Acessibilidade junto do mobile
- Contraste de texto ≥ 4,5:1 (≥ 3:1 para texto grande e ícones), nos temas claro e escuro.
- Foco visível em tudo (`:focus-visible`); se remover o `outline`, ponha outro indicador.
- Cor nunca é a única pista (erro tem ícone e texto; voto tem "✓").
- Leitor de tela: `aria-label` em botões só de ícone, `role="progressbar"` com valores, `aria-live` nos toasts.

---

## Checklist rápido antes de dar uma tela como pronta

- [ ] As 10 heurísticas acima, cada uma com evidência
- [ ] 390×844 e 360×800, retrato e paisagem, sem rolagem horizontal
- [ ] Tudo clicável ≥ 44×44 px; inputs ≥ 16 px
- [ ] Teclado aberto não cobre o campo; barra inferior não cobre o foco
- [ ] Nada depende de hover ou de arrastar
- [ ] Estados: carregando (>1 s), vazio, erro de validação, erro de rede, sem internet
- [ ] Desfazer em toda ação reversível; confirmação só no irreversível
- [ ] Perguntas da tela na Ajuda
- [ ] Contraste e foco visível nos dois temas; `prefers-reduced-motion`
- [ ] INP ≤ 200 ms nas ações principais

## Fontes

- NN/g, *10 Usability Heuristics for User Interface Design* (rev. 30/01/2024): https://www.nngroup.com/articles/ten-usability-heuristics/
- NN/g, *Response Times: The 3 Important Limits*: https://www.nngroup.com/articles/response-times-3-important-limits/
- Dovetail, entrevista com Jakob Nielsen sobre passado e futuro da usabilidade: https://dovetail.com/blog/past-present-future-of-usability-with-jakob-nielsen/
- Deque, *WCAG 2.2 Updates*: https://dequeuniversity.com/resources/wcag-2.2
- Deque, *What WCAG 2.2 Means for Native Mobile Accessibility*: https://www.deque.com/blog/what-wcag-2-2-means-for-native-mobile-accessibility/
- *Interaction to Next Paint (INP)*: https://www.corewebvitals.io/core-web-vitals/interaction-to-next-paint
