/**
 * Perguntas da Ajuda, por seção. A chave é a mesma de `ajuda` em src/lib/rotas.ts.
 * Toda feature nova adiciona aqui 2 a 4 perguntas (heurística 10).
 */
export type Pergunta = { pergunta: string; resposta: string };
export type SecaoAjuda = {
  titulo: string;
  /** O que a página faz, em uma ou duas frases (botão "?" ao lado do título). */
  sobre: string;
  perguntas: Pergunta[];
};

/** A regra de convivência do grupo. Aparece no Mapa, nos perfis e na Ajuda. */
export const REGRA_DA_CASA =
  "Aqui todo mundo expõe o que pensa. O errado não é ter opinião, é menosprezar ou julgar quem pensa diferente.";

export const AJUDA: Record<string, SecaoAjuda> = {
  inicio: {
    titulo: "Início",
    sobre:
      "O resumo da semana do grupo: o livro da vez e a sua página, a meta, o próximo debate e o progresso de todo mundo.",
    perguntas: [
      {
        pergunta: "O que aparece aqui?",
        resposta:
          "Um resumo da semana: o livro da vez, sua meta de leitura, o próximo debate e o progresso do grupo.",
      },
      {
        pergunta: "Como acho alguma coisa rápido?",
        resposta:
          "Toque na lupa (Buscar) no topo, ou aperte Ctrl+K no computador. Dá pra achar páginas, livros, debates, temas da pauta, pessoas e perguntas da ajuda, sem precisar acertar acento.",
      },
      {
        pergunta: "Como volto para cá?",
        resposta: "Toque na logo Uni-vos no topo ou em Início.",
      },
    ],
  },
  livro: {
    titulo: "Livro da vez",
    sobre:
      "Onde o grupo acompanha o livro que está lendo agora. Atualize sua página, veja até onde cada um chegou e comente sem dar spoiler: comentários de páginas depois da sua ficam escondidos.",
    perguntas: [
      {
        pergunta: "Como atualizo minha página?",
        resposta:
          "Digite a página em que parou e toque em Salvar página. Os botões −10 e +10 ajustam rápido.",
      },
      {
        pergunta: "Por que alguns comentários estão escondidos?",
        resposta:
          "Comentários de páginas depois da sua ficam escondidos para evitar spoiler. Toque em “Mostrar mesmo assim” se quiser ler.",
      },
      {
        pergunta: "Posso apagar meu comentário?",
        resposta: "Sim. Toque em Apagar e, se foi engano, em Desfazer logo em seguida.",
      },
      {
        pergunta: "Quem define a meta da semana?",
        resposta:
          "Quem modera o grupo, no card Moderação do Livro da vez: escolhe até que página ler e o prazo.",
      },
      {
        pergunta: "Como trocamos de livro?",
        resposta:
          "Quando o grupo terminar, quem modera toca em Terminamos este livro. Ele vai para Já lidos e o mais votado da Estante vira o livro da vez.",
      },
    ],
  },
  debates: {
    titulo: "Debates",
    sobre:
      "A agenda dos debates do grupo. Confirme presença, marque um debate novo e vote na enquete de antes e depois pra ver quem mudou de ideia. Cada debate tem um formato: rodada com FINALIZADO! (uma pessoa fala por vez), clube do livro ou livre.",
    perguntas: [
      {
        pergunta: "Qual é a regra do FINALIZADO!?",
        resposta:
          "Uma pessoa fala por vez e termina a mensagem com FINALIZADO! para a próxima começar.",
      },
      {
        pergunta: "Como confirmo presença?",
        resposta: "Toque em “Vou participar”. Toque de novo para cancelar.",
      },
      {
        pergunta: "Como marco um debate?",
        resposta: "Preencha tema, data e formato em Marcar debate. A data precisa ser no futuro.",
      },
      {
        pergunta: "Como funciona a enquete do debate?",
        resposta:
          "Qualquer pessoa propõe uma pergunta (ex: Privatizar os Correios?) e um moderador aprova. Antes do debate todo mundo vota a favor, contra ou indeciso; quando o debate termina, vota de novo. O app mostra quem manteve e quem mudou de ideia.",
      },
      {
        pergunta: "A enquete é anônima?",
        resposta: "Não. O voto é aberto: todo mundo vê quem votou o quê, antes e depois.",
      },
      {
        pergunta: "Quem começa e encerra o debate?",
        resposta:
          "Quem marcou o debate ou quem modera o grupo, pelos botões Começar agora e Encerrar debate.",
      },
    ],
  },
  mapa: {
    titulo: "Mapa político",
    sobre:
      "Um questionário de 40 afirmações que mostra onde você está em dois eixos: economia (esquerda ou direita) e costumes (progressista ou conservador). Seu resultado aparece no seu perfil e no mapa do grupo, pra puxar conversa. É um jogo, não um teste científico.",
    perguntas: [
      {
        pergunta: "O que é o mapa político?",
        resposta:
          "Um questionário de 40 afirmações em dois eixos: economia (esquerda–direita) e costumes (progressista–conservador).",
      },
      {
        pergunta: "Posso parar no meio?",
        resposta: "Sim. Toque em Pausar e suas respostas ficam guardadas.",
      },
      {
        pergunta: "Tem atalho?",
        resposta: "No computador, use as teclas 1 a 5 para responder e ← para voltar.",
      },
      {
        pergunta: "É científico?",
        resposta: "Não. É um jogo para puxar debate, não um teste científico.",
      },
      {
        pergunta: "Quem vê minhas respostas?",
        resposta:
          "Ninguém. As respostas são só suas; o grupo vê apenas o resultado (o ponto no mapa e o rótulo).",
      },
    ],
  },
  estante: {
    titulo: "Estante",
    sobre:
      "Os livros do grupo. Sugira o que quer ler e vote na fila: o mais votado vira o próximo livro da vez. Embaixo ficam os que o grupo já leu.",
    perguntas: [
      {
        pergunta: "Como o próximo livro é escolhido?",
        resposta: "O livro mais votado da fila vira o próximo livro da vez.",
      },
      {
        pergunta: "Como sugiro um livro?",
        resposta: "Preencha título, autor e número de páginas em Sugerir livro.",
      },
      {
        pergunta: "Posso tirar um livro da fila?",
        resposta:
          "Sim, se foi você que sugeriu (ou se você modera o grupo). Toque em Tirar da fila; se foi engano, toque em Desfazer.",
      },
    ],
  },
  pauta: {
    titulo: "Pauta",
    sobre:
      "Temas que o grupo quer debater. Proponha, vote nos que te interessam e use Virar debate pra marcar o debate já com o tema preenchido.",
    perguntas: [
      {
        pergunta: "Para que serve a pauta?",
        resposta: "Para sugerir e votar temas de debate.",
      },
      {
        pergunta: "Como transformo um tema em debate?",
        resposta: "Toque em “Virar debate”. O tema já vai preenchido no formulário de Debates.",
      },
    ],
  },
  membros: {
    titulo: "Membros",
    sobre:
      "Quem faz parte do grupo. Toque numa pessoa pra ver o perfil dela, com o resultado do mapa político, o que ela sugeriu e de quais debates participou.",
    perguntas: [
      {
        pergunta: "Todo mundo vê meu resultado do mapa político?",
        resposta:
          "Sim: o resultado (o rótulo e os dois eixos) aparece no seu perfil e no mapa do grupo. As respostas de cada afirmação são só suas. Aqui todo mundo expõe o que pensa; o errado não é ter opinião, é menosprezar ou julgar quem pensa diferente.",
      },
      {
        pergunta: "O que aparece no card de cada pessoa?",
        resposta:
          "Livros sugeridos, debates confirmados e o resultado do mapa político, se a pessoa já respondeu.",
      },
      {
        pergunta: "Como chamo alguém pro grupo?",
        resposta:
          "Os grupos são privados: só entra quem recebe um link de convite. Quem modera o grupo gera o link em Membros, toca em Copiar e manda pra pessoa.",
      },
      {
        pergunta: "Por que dar nome ao link?",
        resposta:
          "Pra saber por onde cada pessoa entrou. Gere um link pra cada lugar (ex: grupo do zap, Instagram) e veja em cada um quem entrou por ele.",
      },
      {
        pergunta: "O link de convite vazou. E agora?",
        resposta:
          "Em Membros, toque em Desativar no link. Ele para de funcionar na hora, e quem já entrou continua no grupo. Se foi engano, toque em Desfazer.",
      },
      {
        pergunta: "Estou em mais de um grupo. Como troco?",
        resposta:
          "Toque no nome do grupo no topo (no celular, também em Mais › Trocar de grupo) e escolha o outro.",
      },
      {
        pergunta: "Como crio minha conta?",
        resposta:
          "Só com um link de convite de quem modera um grupo. Abra o link, preencha nome, email e uma senha e toque em Criar conta e entrar no grupo. Depois confirme pelo email que chega.",
      },
      {
        pergunta: "Esqueci minha senha. E agora?",
        resposta:
          "Na tela de entrada, toque em Esqueci minha senha e digite seu email. Chega um link pra criar uma senha nova; abra no mesmo aparelho.",
      },
    ],
  },
  admin: {
    titulo: "Admin",
    sobre:
      "Só o dono do sistema vê esta página: criar grupos, escolher quem modera cada um e ver a auditoria dos convites.",
    perguntas: [
      {
        pergunta: "Quem vê a aba Admin?",
        resposta:
          "Só o dono do sistema. Ele cria grupos, escolhe quem modera cada grupo e vê a auditoria de todos.",
      },
      {
        pergunta: "O que um moderador pode fazer?",
        resposta:
          "Gerar e desativar links de convite do grupo dele e ver quem entrou por cada link. Pra tornar alguém moderador, abra o grupo em Admin e toque em Tornar moderador.",
      },
      {
        pergunta: "O que fica na auditoria?",
        resposta:
          "Grupos criados, links gerados, desativados e reativados, quem entrou por qual link e quem virou (ou deixou de ser) moderador, com data e hora.",
      },
    ],
  },
};

/** Minúsculas e sem acento, para a busca achar "politico" em "político". */
export function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Seções na ordem de exibição (a da página atual primeiro), filtradas pela busca. */
export function filtrarAjuda(busca: string, secaoAtual?: string) {
  const termo = normalizar(busca.trim());
  const chaves = Object.keys(AJUDA);
  const ordem =
    secaoAtual && AJUDA[secaoAtual]
      ? [secaoAtual, ...chaves.filter((k) => k !== secaoAtual)]
      : chaves;

  return ordem
    .map((chave) => ({
      chave,
      titulo: AJUDA[chave].titulo,
      perguntas: AJUDA[chave].perguntas.filter(
        (p) => !termo || normalizar(`${p.pergunta} ${p.resposta}`).includes(termo),
      ),
    }))
    .filter((s) => s.perguntas.length > 0);
}
