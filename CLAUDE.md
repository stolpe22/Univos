# Uni-vos

Clube do livro e de debates de um grupo de amigos com visões políticas diferentes.
Nome e proposta: "Esquerda, direita e quem tá no meio: uni-vos."
O protótipo navegável está em `docs/prototipo.html`. Ele é a referência visual e de fluxo, mas não deve ser copiado como código (é HTML único com estado em memória).

## Stack

- **Next.js (App Router) + TypeScript estrito**, deploy na **Vercel**
- **Supabase**: Auth (**email e senha**; sem Google nem outro login social; conta nova só nasce de um convite de moderador), Postgres com **RLS em todas as tabelas**, Realtime para progresso e debates ao vivo
- **Tailwind CSS** com os tokens do design system (seção abaixo)
- **Zod** para validar todo input (formulário e server action)
- **Vitest** para unidade, **Playwright** para e2e (viewport mobile 390×844 é o padrão)

## Comandos

```bash
npm run dev            # app local em http://localhost:3000
npm run build          # build de produção (rodar antes de abrir PR)
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run test           # Vitest
npm run test:e2e       # Playwright (sobe o dev server sozinho)
npx supabase start     # Supabase local (Docker)
npx supabase migration new <nome>   # cria migration nova
npx supabase db reset  # recria o banco local com migrations + seed (só local!)
npm run db:types       # gera src/lib/database.types.ts a partir do banco local
```

## Estrutura

```
src/
  app/
    (auth)/login/            # tela de login animada
    (app)/                   # rotas logadas, layout com navegação
      inicio/ livro/ debates/ mapa/ estante/ pauta/ membros/
    auth/callback/route.ts   # troca do código do link mágico/OAuth
  components/ui/             # Button, Field, Toast (com Desfazer), Sheet, ProgressBar, Avatar
  features/<modulo>/         # queries, actions, schemas zod e componentes de cada módulo
  lib/supabase/              # client.ts (browser), server.ts (RSC/actions), middleware.ts
  lib/database.types.ts      # GERADO, não editar à mão
supabase/
  migrations/                # SQL versionado; migration aplicada nunca é editada
  seed.sql                   # dados demo (Lucas, Karol, Joju, Freakonomics…)
tests/e2e/                   # Playwright
docs/prototipo.html          # protótipo de referência
docs/ux/heuristicas-e-mobile.md  # guia completo de Nielsen + WCAG 2.2 + mobile
```

## Módulos (o que o sistema faz)

| Módulo | Rota | Regras principais |
|---|---|---|
| Início | `/inicio` | Resumo: livro da vez, meta da semana, próximo debate (ou ao vivo), convite ao mapa político, progresso do grupo |
| Livro da vez | `/livro` | Atualizar página (0 a total, botões ±10), progresso do grupo em tempo real, comentários marcados com página e **sem spoiler** (escondidos se a página do comentário > página de quem lê, com "Mostrar mesmo assim") |
| Debates | `/debates` | Agenda, confirmar presença, marcar debate (data no futuro), regra da casa "FINALIZADO!" fixada |
| Mapa político | `/mapa` | 40 afirmações, escala de 5 pontos, 2 eixos (economia e costumes), pausa e retoma, resultado com rótulo e mapa do grupo |
| Estante | `/estante` | Fila com votação (mais votado vira o próximo), sugerir livro (sem duplicado), já lidos |
| Pauta | `/pauta` | Propor e votar temas, botão "Virar debate" que preenche o formulário de Debates |
| Membros | `/membros` | Card de cada pessoa com sugestões, debates e rótulo do mapa |

## Design system

Nunca use cor solta (hex) em componente. Use só os tokens abaixo, definidos em `globals.css` e expostos no Tailwind.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--blue` | `#2f5bea` | igual | capitalismo / tese |
| `--red` | `#dc2626` | igual | socialismo / antítese. **Vermelho de verdade, nunca rosado** |
| `--purple` | `#7b3fe4` | igual | síntese, cor de destaque |
| `--grad` | `linear-gradient(120deg, blue 0%, purple 45%, red 92%)` | igual | botão principal, barras, faixa do topo |
| `--bg` | `#f4f2fb` | `#0f0d1a` | fundo |
| `--card` | `#ffffff` | `#1a1729` | cards |
| `--ink` | `#1d1a2e` | `#ece9f8` | texto |
| `--muted` | `#5f5a7a` | `#a9a4c4` | texto secundário (contraste ≥ 4.5:1) |
| `--accent` | `#6a2fd6` | `#b08cff` | links, aba ativa |
| `--err` | `#c81e1e` | `#ff6b6b` | erros |

- Fontes: **Fraunces** (títulos) e **Inter** (texto).
- **Logo**: círculo em degradê com foice e martelo, em que o cabo do martelo forma o traço vertical do cifrão. Está como `<symbol id="logo">` no protótipo. O dono do projeto **não quer** uma versão com foice e martelo cruzados em destaque.
- Botão principal = degradê. Secundário = contornado (`ghost`). Nunca o contrário.
- Animações respeitam `prefers-reduced-motion`.

## Regras de UX: heurísticas de Nielsen (obrigatórias)

**Toda** tela, componente e texto de interface segue as 10 heurísticas de Nielsen, a **WCAG 2.2 nível AA** e as regras de mobile abaixo, sem exceção. A skill `ux-mobile` carrega sozinha quando você edita `src/**/*.tsx` ou `.css`; o guia completo, com fontes atualizadas, está em `docs/ux/heuristicas-e-mobile.md`. Use o agente `ux-nielsen-reviewer` ou `/nielsen-audit` para checar.

1. **Visibilidade do estado**: aba atual destacada (topo e barra inferior), `document.title` = "<Aba> · Uni-vos", toast após toda ação, progresso visível em fluxos longos. Tempos de resposta: até 1 s, atualização otimista; acima de 1 s, "Enviando…" ou skeleton; acima de 10 s, progresso com % e Cancelar.
2. **Mundo real**: linguagem do grupo em pt-BR informal e claro. Proibido jargão: nada de "OTP", "RSVP", "token", "erro 500". Diga "link de acesso", "Vou participar", "Não deu pra salvar agora".
3. **Controle e liberdade**: toda ação reversível mostra **Desfazer** no toast (6 s). Esc fecha janelas. Botão voltar do navegador funciona (rota real). Fluxos longos têm Voltar e Pausar.
4. **Consistência**: nome da aba = título da página. Mesmos componentes para a mesma função. A logo leva ao Início. O botão Ajuda fica sempre no mesmo lugar (WCAG 3.2.6).
5. **Prevenção de erros**: limites no input (`min`, `max`, `inputmode`), bloqueio de duplicados, data no futuro, nunca pedir de novo o que já foi informado (WCAG 3.3.7), e confirmação antes de qualquer ação destrutiva sem desfazer.
6. **Reconhecimento**: `<label>` sempre visível (placeholder nunca substitui label). Mostrar a resposta marcada ao voltar. Mostrar "você" no próprio item. Login por email e senha aceitando colar e gerenciador de senhas (`autocomplete`), com botão de mostrar a senha e "Esqueci minha senha" (WCAG 3.3.8).
7. **Flexibilidade**: atalhos para usuário experiente (quiz: teclas 1–5 e ←), botões de passo (±10 páginas), atalhos entre módulos ("Virar debate").
8. **Minimalismo**: uma tarefa principal por card. Nada decorativo dentro de fluxos.
9. **Erros**: mensagem em vermelho, ao lado do campo, com `role="alert"` e `aria-invalid`, dizendo **o que fazer** ("A página precisa estar entre 0 e 320.").
10. **Ajuda**: botão Ajuda com busca, que abre na seção da página atual. Conteúdo em `src/features/ajuda/conteudo.ts`. **Toda feature nova adiciona suas perguntas na ajuda.**

Estados vazios sempre têm texto e uma ação ("Nenhum comentário ainda. Seja a primeira pessoa a comentar.").

## Regras de mobile (obrigatórias)

- Projetar primeiro para **390×844**. Desktop é a adaptação.
- Menu em **seções** (`SECOES` em `src/lib/rotas.ts`): Início, Livros (Livro da vez · Estante · Meus livros), Debates (Debates · Pauta), Mapa político e Membros. Seção com mais de uma página mostra **sub-abas sublinhadas** no topo; cada página continua com rota própria. Página nova entra numa seção existente antes de virar seção nova.
- Desktop: as seções viram abas no topo. Abaixo de 760 px: **barra inferior** com as seções + **Mais**. "Mais" abre um sheet com o que é da conta: Meu perfil, Trocar de grupo, Tema, Ajuda, Admin (só o dono) e Sair.
- Área de toque **≥ 44×44 px** em tudo que é clicável (a WCAG 2.5.8 exige no mínimo 24; a meta do projeto é 44), com 8 px entre alvos. Ação principal na metade de baixo da tela.
- Inputs com **font-size ≥ 16 px** (evita zoom no iOS) e `inputmode`/`autocomplete` corretos.
- Respeitar `env(safe-area-inset-*)` (notch e barra do iPhone). Usar `100dvh`, nunca `100vh` sozinho.
- Janelas no mobile são **sheets que sobem de baixo**. No desktop, modal centralizado.
- Nenhuma rolagem horizontal, inclusive em 360 px e em paisagem. Nada depende de hover. Tudo que se faz arrastando também se faz com um toque (WCAG 2.5.7).
- Barras fixas nunca cobrem o campo focado (WCAG 2.4.11): `scroll-padding` + `scrollIntoView`. Nunca bloquear zoom (`user-scalable=no`).
- Desempenho é usabilidade: **INP ≤ 200 ms, LCP ≤ 2,5 s, CLS ≤ 0,1** no celular.
- Toasts ficam acima da barra inferior e somem quando um sheet abre.

## Dados e segurança

- **RLS em todas as tabelas, sem exceção.** Leitura para `authenticated` dentro do clube. Escrita só onde `user_id = auth.uid()`.
- Toda mutação passa por **server action** que valida com Zod e depende da RLS. Nunca confiar em `user_id` vindo do cliente.
- `SUPABASE_SERVICE_ROLE_KEY` **nunca** vai para o cliente nem para variáveis `NEXT_PUBLIC_*`.
- Não ler nem editar `.env*` (um hook bloqueia). Variáveis documentadas em `.env.example`.
- Migration já aplicada **não se edita**: crie uma nova. Depois de mudar o banco, rode `npm run db:types`.
- Escapar todo texto de usuário (o React já faz; **proibido** `dangerouslySetInnerHTML` com conteúdo do usuário).

## Mapa político (regras de conteúdo)

- 40 afirmações em `src/features/mapa/afirmacoes.ts`: **20 de economia (10 esquerda, 10 direita)** e **20 de costumes (10 progressistas, 10 conservadoras)**. Cada uma tem `eixo` (`economia` | `costumes`) e `direcao` (`-1` esquerda/progressista, `+1` direita/conservador).
- Pontuação: resposta 1–5 vira −2…+2, multiplicada pela direção, somada por eixo e normalizada para −100…+100. Sem resposta = neutro.
- Rótulo: |valor| < 20 é centro/moderado em cada eixo.
- Ordem embaralhada por pessoa (salvar a semente para a ordem não mudar ao retomar).
- Linguagem **neutra**: nenhuma afirmação pode ser caricatura de um lado. Use o agente `content-balance-reviewer` ao mudar o texto.
- O app sempre avisa: "É um jogo para puxar debate, não um teste científico."

## Padrões de código

- **Um componente por arquivo** em `features/<modulo>/` (ex: `ItemDebate.tsx`, `Presenca.tsx`). Arquivo passando de ~250 linhas é sinal de que dá pra dividir. Regra pura (cálculo, filtro, contagem) vai num `.ts` sem React, com teste (`enquete.ts` + `enquete.test.ts`).
- **Formulários**: `useActionState` + `useRetornoForm(estado, formRef, { desfazer?, aoOk?, limpar? })` (`components/ui/useRetornoForm.ts`). Ele faz o toast, o Desfazer e o foco no primeiro campo inválido; não repita esse `useEffect` à mão.
- **Server actions** devolvem `EstadoForm` (formulário) ou `Resultado<T>` (botão), os dois de `lib/resultado.ts`. Use `ERRO_REDE` e `DUPLICADO` de lá. Toda entrada passa por um schema Zod em `schemas.ts`, **com mensagem em pt-BR em cada regra** (sem mensagem, o Zod mostra inglês para a pessoa).
- **Uma fonte da verdade**: listas de opções (ex: `components/ui/avatar/opcoes.ts`) alimentam o componente e o schema; nunca repita a lista à mão no `z.enum`.
- **Utilitários compartilhados**: datas em `lib/datas.ts` (`formatarData`, `formatarDataComDia`, `formatarDia`), texto em `lib/texto.ts` (`normalizar`, `slug`), porcentagem em `features/livro/regras.ts`. Não formate data nem tire acento inline.
- **Cores**: só tokens de `globals.css` (`bg-card`, `text-accent`, `bg-perfil-green`…). Arte com cor fixa (logo, ilustrações do avatar) fica em `.ts` (`lib/logo.ts`, `components/ui/avatar/arte.ts`), nunca em `.tsx`.
- **Dados do servidor**: página logada lê com `getClubeAtual()` e queries de `features/*/queries.ts`; para mostrar um item, crie uma query de um item (ex: `getDebate`), não filtre a lista inteira. Depois de uma action, `revalidatePath` atualiza a tela; não sincronize estado com eventos no `window`.
- **Moldura logada**: `components/layout/AppShell.tsx` só compõe as partes de `components/layout/shell/` (Cabecalho, BarraInferior, Menus) e controla qual janela está aberta.

## Como trabalhar neste repo

- Antes de codar uma feature: ler a tela correspondente em `docs/prototipo.html` e a seção do módulo acima.
- Feature nova: usar a skill `/nova-feature`. Mudança no banco: `/migration`.
- Ao terminar: `npm run typecheck && npm run lint && npm run test`, depois `/mobile-check` e `/nielsen-audit` na tela alterada.
- Commits em pt-BR, curtos, no imperativo ("Adiciona votação na pauta").
- Textos da interface em pt-BR. Código, nomes de variáveis e de tabelas em português sem acento quando forem conceitos do domínio (`livros`, `debates`, `progresso_leitura`).
