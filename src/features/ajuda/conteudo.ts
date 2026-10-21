import { normalizar } from "@/lib/texto";

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
/** Lembrete curto no topo de Debates. */
export const AVISO_DEBATE =
  "Respeito sempre: discorde da ideia, não da pessoa. E traga fatos e fontes pra conversa.";

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
        pergunta: "Onde fica cada coisa no menu?",
        resposta:
          "O menu tem 5 partes: Início, Livros (Livro da vez, Estante e Meus livros), Debates (agenda e Pauta), Mapa político e Membros. Dentro de Livros e de Debates, as abas no topo da página trocam entre elas. No celular, Mais guarda seu perfil, a troca de grupo, o tema, a Ajuda e Sair.",
      },
      {
        pergunta: "Como volto para cá?",
        resposta: "Toque na logo Uni-vos no topo ou em Início.",
      },
      {
        pergunta: "Como mudo entre tema claro e escuro?",
        resposta:
          "No computador, use o botão de tema no topo. No celular, abra Mais e toque em Tema. Sua escolha fica salva neste aparelho.",
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
        pergunta: "Minha edição tem outro número de páginas. E aí?",
        resposta:
          "Sem problema: cadastre seu exemplar em Meus livros, com o total de páginas da sua edição. Sua página e a porcentagem usam a sua edição, e os comentários sem spoiler comparam a parte do livro, não o número da página.",
      },
      {
        pergunta: "Por que não apareço em Quem está lendo?",
        resposta:
          "A lista mostra só quem cadastrou o exemplar do livro em Meus livros. Cadastre o seu (com o total de páginas da sua edição) e você aparece lá, com a página e a porcentagem.",
      },
      {
        pergunta: "Como funciona a meta da semana?",
        resposta:
          "Quem modera o grupo escreve até onde ler (ex: Capítulo 5) e o prazo, no card Moderação. Quando você chegar lá, toque em Cheguei! — todo mundo vê quem já chegou. Se tocou sem querer, toque em Desfazer.",
      },
      {
        pergunta: "Como trocamos de livro?",
        resposta:
          "Quando o grupo terminar, quem modera toca em Terminamos este livro. Ele continua na Estante, marcado como lido pelo grupo. O próximo não começa sozinho: vocês combinam qual ler e quem modera toca em Começar como livro da vez.",
      },
    ],
  },
  debates: {
    titulo: "Debates",
    sobre:
      "A agenda dos debates do grupo. Confirme presença, compartilhe o link e vote na pergunta inicial antes e depois pra ver quem mudou de ideia. Depois do debate, o grupo também pode propor uma enquete de posicionamento. Cada debate tem um formato: rodada com FINALIZADO! (uma pessoa fala por vez), clube do livro ou livre.",
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
        resposta:
          "Preencha o tema e escolha Quando: em Marcar data, informe o dia (de hoje em diante) e, se quiser, a hora; sem hora, vale o dia todo. Em Já está rolando, o debate abre na hora, como em andamento, e fica registrado com a data e a hora de agora. Depois escolha o formato.",
      },
      {
        pergunta: "Como funciona a enquete do debate?",
        resposta:
          "A pergunta inicial é proposta antes ou durante o debate (inclusive num debate aberto com Já está rolando) e precisa da aprovação de quem modera. Depois de encerrar, também dá pra propor uma enquete de posicionamento. Nas duas, cada pessoa pode registrar como pensava antes e como ficou depois; quem não votou antes pode registrar essa posição histórica ao final. Também dá pra sugerir outras conclusões e votar concordo ou discordo.",
      },
      {
        pergunta: "A enquete é anônima?",
        resposta:
          "Não. Os votos das enquetes e das conclusões são abertos: todo mundo vê quem votou o quê.",
      },
      {
        pergunta: "Quem começa e encerra o debate?",
        resposta:
          "Quem marcou o debate ou quem modera pode iniciar e encerrar. Iniciar só marca o debate como em andamento no Uni-vos; não abre chamada nem transmissão. Encerrar abre a votação de depois.",
      },
      {
        pergunta: "O que tem na página de um debate?",
        resposta:
          "Toque no tema ou em Abrir debate, na agenda, para ver a página dele: presença, enquete com as outras conclusões e comentários. O link dessa página é o que vai no Compartilhar.",
      },
      {
        pergunta: "Como comento num debate?",
        resposta:
          "Na página do debate, escreva em Comentários e envie. Dá pra apagar o seu comentário; se foi engano, toque em Desfazer.",
      },
      {
        pergunta: "O que são as outras conclusões?",
        resposta:
          "Quando a enquete principal não dá conta, qualquer pessoa pode sugerir outra conclusão. O grupo vota Concordo ou Discordo em cada uma, separado do antes e depois da enquete.",
      },
      {
        pergunta: "O que é virada?",
        resposta:
          "É quem mudou de posição entre o voto de antes e o de depois do debate. O card do debate mostra quantas viradas teve.",
      },
      {
        pergunta: "Como compartilho um debate?",
        resposta:
          "Use Compartilhar no WhatsApp ou Copiar link no card do debate. Quem abrir o link vai direto para ele; precisa entrar na conta e fazer parte do grupo para votar.",
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
      "Todos os livros do grupo num lugar só, inclusive os já lidos. Vote no que quer ler, veja quem tem cada livro, o que o grupo já leu junto e o que cada pessoa leu.",
    perguntas: [
      {
        pergunta: "Como o próximo livro é escolhido?",
        resposta:
          "Pelos votos e pela conversa. O mais votado aparece com 🥇, e cada livro mostra quantas pessoas já têm o exemplar. Quando o grupo combinar qual vai ler junto, quem modera toca em Começar como livro da vez nele.",
      },
      {
        pergunta: "Qual a diferença entre O grupo leu e Eu li?",
        resposta:
          "O grupo leu mostra só os livros que quem modera marcou como terminados no Livro da vez. Ali você escolhe uma Pessoa e vê o que ela Leu, Está lendo ou Os dois, só nos livros do grupo (Com o grupo) ou em tudo, inclusive o que leu por conta própria (Tudo). Eu li mostra os livros em que você marcou Já li no seu exemplar. Livro lido continua na Estante.",
      },
      {
        pergunta: "Sugerir um livro é o mesmo que votar nele?",
        resposta:
          "Não. Sugerir só coloca o livro na estante. Votar (▲ Votar) é dizer que você quer ler: os livros que o grupo ainda não leu ficam em ordem de votos. Se quiser ler o que você mesmo sugeriu, vote nele também.",
      },
      {
        pergunta: "Cada livro tem uma página própria?",
        resposta:
          "Tem. Toque no título do livro na Estante, em Minha biblioteca ou na busca. Lá estão os dados do livro, quem tem e quem leu, os exemplares do grupo e os comentários.",
      },
      {
        pergunta: "Posso comentar num livro que ainda não li?",
        resposta:
          "Pode, em qualquer livro da estante. O comentário guarda como estava sua leitura na hora: antes de ler, lendo (com a página) ou depois de ler. Se você comentar antes e de novo depois, os dois aparecem, cada um com o seu selo.",
      },
      {
        pergunta: "Como acho um livro rápido na lista?",
        resposta:
          "Digite em Filtrar livros: vale título, autor, tema, tipo, nível e editora, sem precisar de acento. Em Mais filtros dá pra escolher tema, tipo, nível e se o livro tem comentários. O filtro vale em Todos, O grupo leu e Eu li; toque em Limpar filtros pra ver tudo de novo.",
      },
      {
        pergunta: "O que são as bolinhas no canto de cada livro?",
        resposta:
          "São as pessoas daquele livro: ao lado do ✓ quem já leu, ao lado do 📖 quem está lendo. Isso vem do que cada uma marcou no próprio exemplar, em Exemplares e progresso do grupo, na página do livro.",
      },
      {
        pergunta: "O que é o 💬 com número no livro?",
        resposta:
          "É quantos comentários o livro tem. No computador, passe o mouse em cima para ler uma prévia; no celular, toque nele. A prévia é só leitura e esconde o que for spoiler pra você; pra comentar, abra o livro.",
      },
      {
        pergunta: "Como sugiro um livro?",
        resposta:
          "Preencha título, autor e páginas aproximadas. Em Classificação e dados do catálogo, você também pode indicar tema, tipo, nível, ano, editora, preço e uma nota.",
      },
      {
        pergunta: "Como registro meu exemplar e meu progresso?",
        resposta:
          "Toque no título do livro na Estante, abra Exemplares e progresso do grupo e informe o total de páginas da sua edição, a página atual e a situação. O grupo verá esses dados; eles são diferentes da estimativa da edição de referência.",
      },
      {
        pergunta: "Posso tirar um livro da estante?",
        resposta:
          "Sim, se foi você que sugeriu (ou se você modera o grupo) e o grupo ainda não leu. Toque em Tirar da estante; se foi engano, toque em Desfazer.",
      },
    ],
  },
  "meus-livros": {
    titulo: "Meus livros",
    sobre:
      "Sua biblioteca: os livros da estante que você tem. Cadastre seu exemplar com as páginas da sua edição e acompanhe sua leitura; o grupo vê seu progresso.",
    perguntas: [
      {
        pergunta: "Como coloco um livro na minha biblioteca?",
        resposta:
          "Em Adicionar à minha biblioteca, busque o título ou o autor e escolha o livro. Informe as páginas da sua edição, a página em que está e a situação, e toque em Salvar meu progresso.",
      },
      {
        pergunta: "Não achei o livro na busca. E agora?",
        resposta:
          "A busca procura nos livros da Estante deste grupo. Use Não encontrou o livro? › Cadastrar livro na estante; depois ele aparece na busca para você registrar seu exemplar.",
      },
      {
        pergunta: "Tocar em Eu tenho este livro já cadastra?",
        resposta:
          "Não. Só abre o formulário. O exemplar só é registrado quando você toca em Salvar meu progresso; se desistir, nada fica gravado.",
      },
      {
        pergunta: "A página e a situação mudam sozinhas?",
        resposta:
          "Sim. Escolher Já li leva a página ao total da sua edição, e Ainda não comecei volta para 0. Digitar a última página muda a situação para Já li; uma página no meio vira Estou lendo.",
      },
      {
        pergunta: "Como acho um livro na minha biblioteca?",
        resposta:
          "Digite em Filtrar livros (título, autor, tema…) e, em Mais filtros, escolha a situação, o tema, o tipo, o nível ou só os livros com comentários. As situações têm cor própria: ✓ Já li em verde, 📖 Estou lendo em azul e ○ Ainda não comecei sem cor.",
      },
      {
        pergunta: "Quem vê minha biblioteca?",
        resposta:
          "As pessoas do grupo: seus exemplares e seu progresso aparecem na Estante, em Quem está lendo do Livro da vez e no seu perfil em Membros.",
      },
    ],
  },
  pauta: {
    titulo: "Pautas",
    sobre:
      "Temas que o grupo quer debater. Proponha, vote nos que te interessam e use Virar debate pra marcar o debate já com o tema preenchido.",
    perguntas: [
      {
        pergunta: "Para que serve a pauta?",
        resposta: "Para sugerir e votar temas de debate.",
      },
      {
        pergunta: "Como proponho um tema?",
        resposta:
          "Escreva o tema e toque em Propor tema. Propor já conta o seu voto nele; se não quiser, toque no voto para tirar.",
      },
      {
        pergunta: "Como voto num tema?",
        resposta:
          "Toque no botão de voto do tema. Os temas mais votados ficam em cima. Toque de novo para tirar o voto.",
      },
      {
        pergunta: "Posso tirar um tema da pauta?",
        resposta:
          "Sim, se foi você que propôs ou se você modera o grupo. Toque em Tirar da pauta; se foi engano, toque em Desfazer.",
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
          "Livros sugeridos, livros adquiridos (exemplares cadastrados em Meus livros, com o progresso), debates confirmados e o resultado do mapa político. Toque no card para ver o perfil completo.",
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
  "meu-perfil": {
    titulo: "Meu perfil",
    sobre: "Personalize seu nome e avatar, e troque sua senha de acesso.",
    perguntas: [
      {
        pergunta: "Como mudo a cor ou o ícone do meu avatar?",
        resposta:
          "Abra Meu perfil, escolha uma cor e selecione suas iniciais ou um dos ícones. A prévia mostra como vai aparecer antes de salvar.",
      },
      {
        pergunta: "Quem vê meu nome?",
        resposta:
          "O nome aparece para as pessoas dos grupos de que você participa, em comentários e votações.",
      },
      {
        pergunta: "Troquei minha senha. Preciso entrar de novo?",
        resposta:
          "Não. A senha nova vale no próximo acesso; você continua conectado neste aparelho.",
      },
    ],
  },
  admin: {
    titulo: "Admin",
    sobre:
      "Só o dono do sistema vê esta página: criar grupos, escolher quem modera cada um e ver a auditoria dos convites. O dono também é quem acrescenta temas, tipos e níveis ao catálogo de livros.",
    perguntas: [
      {
        pergunta: "Quem vê a aba Admin?",
        resposta:
          "Só o dono do sistema. Ele cria grupos, escolhe quem modera cada grupo e vê a auditoria de todos.",
      },
      {
        pergunta: "O que um moderador pode fazer?",
        resposta:
          "No grupo dele: gerar e desativar links de convite e ver quem entrou por cada um, aprovar ou recusar enquetes, iniciar e encerrar debates, definir a meta de leitura, terminar o livro da vez e começar o próximo, e tirar livros e temas sugeridos. Pra tornar alguém moderador, abra o grupo em Admin e toque em Tornar moderador.",
      },
      {
        pergunta: "Como crio um grupo?",
        resposta:
          "Em Admin, preencha o nome em Criar grupo. Depois escolha quem modera e gere o primeiro link de convite.",
      },
      {
        pergunta: "Como acrescento tema, tipo ou nível ao catálogo?",
        resposta:
          "Só o dono faz isso. Ao sugerir um livro, abra Classificação e dados do catálogo e toque em + Criar ao lado do campo.",
      },
      {
        pergunta: "O que fica na auditoria?",
        resposta:
          "Grupos criados, links gerados, desativados e reativados, quem entrou por qual link e quem virou (ou deixou de ser) moderador, com data e hora.",
      },
    ],
  },
};

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
