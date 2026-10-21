// 40 afirmações do Mapa político.
// 20 economia (10 esquerda, 10 direita) + 20 costumes (10 progressistas, 10 conservadoras).
// direcao: -1 = esquerda/progressista, +1 = direita/conservador.
// O índice no array é o id salvo em quiz_respostas.afirmacao: NÃO reordene, só acrescente no fim.
// Ao mudar o texto, rode o agente content-balance-reviewer.

export type Eixo = "economia" | "costumes";
export type Afirmacao = { texto: string; eixo: Eixo; direcao: -1 | 1 };

export const AFIRMACOES: readonly Afirmacao[] = [
  {
    texto: "Saúde e educação deveriam ser oferecidas só pelo Estado, sem setor privado.",
    eixo: "economia",
    direcao: -1,
  },
  {
    texto: "O Estado deve controlar setores estratégicos, como petróleo e energia.",
    eixo: "economia",
    direcao: -1,
  },
  { texto: "Grandes fortunas deveriam pagar um imposto especial.", eixo: "economia", direcao: -1 },
  {
    texto: "O salário mínimo deveria subir acima da inflação todo ano.",
    eixo: "economia",
    direcao: -1,
  },
  {
    texto: "Programas de transferência de renda, como o Bolsa Família, deveriam ser ampliados.",
    eixo: "economia",
    direcao: -1,
  },
  {
    texto:
      "Os direitos trabalhistas deveriam ser mais fortes, mesmo que isso encareça a contratação.",
    eixo: "economia",
    direcao: -1,
  },
  { texto: "O lucro de grandes empresas deveria ser mais taxado.", eixo: "economia", direcao: -1 },
  {
    texto: "Terras improdutivas deveriam ser desapropriadas para reforma agrária.",
    eixo: "economia",
    direcao: -1,
  },
  {
    texto:
      "O Estado deve intervir na economia para reduzir a desigualdade, mesmo que o crescimento seja menor.",
    eixo: "economia",
    direcao: -1,
  },
  {
    texto: "Bancos e serviços essenciais funcionariam melhor se fossem públicos.",
    eixo: "economia",
    direcao: -1,
  },
  {
    texto: "Privatizar estatais costuma melhorar a qualidade dos serviços.",
    eixo: "economia",
    direcao: 1,
  },
  {
    texto: "Cortar impostos gera mais empregos do que ampliar programas sociais.",
    eixo: "economia",
    direcao: 1,
  },
  {
    texto: "O livre mercado distribui recursos melhor do que o governo.",
    eixo: "economia",
    direcao: 1,
  },
  {
    texto: "Abrir e tocar um negócio deveria ter bem menos burocracia e regulação.",
    eixo: "economia",
    direcao: 1,
  },
  {
    texto:
      "Quem trabalha e arrisca mais deve ganhar mais, e a desigualdade que resulta disso é justa.",
    eixo: "economia",
    direcao: 1,
  },
  {
    texto: "O governo deveria cortar gastos para equilibrar as contas, mesmo em áreas sociais.",
    eixo: "economia",
    direcao: 1,
  },
  {
    texto: "Vouchers para estudar em escola privada são uma boa alternativa à escola pública.",
    eixo: "economia",
    direcao: 1,
  },
  {
    texto: "Flexibilizar as leis trabalhistas ajuda a criar empregos.",
    eixo: "economia",
    direcao: 1,
  },
  {
    texto: "O agronegócio deveria ter mais liberdade para expandir a produção.",
    eixo: "economia",
    direcao: 1,
  },
  {
    texto: "Sindicatos atrapalham mais do que ajudam o trabalhador.",
    eixo: "economia",
    direcao: 1,
  },
  {
    texto: "O aborto deveria ser descriminalizado até a 12ª semana.",
    eixo: "costumes",
    direcao: -1,
  },
  {
    texto: "Casais do mesmo sexo devem ter os mesmos direitos de adoção que os demais.",
    eixo: "costumes",
    direcao: -1,
  },
  { texto: "O uso recreativo da maconha deveria ser legalizado.", eixo: "costumes", direcao: -1 },
  {
    texto: "A escola deve ensinar educação sexual, incluindo prevenção de abuso e contraceptivos.",
    eixo: "costumes",
    direcao: -1,
  },
  {
    texto:
      "Cotas raciais nas universidades são necessárias para corrigir desigualdades históricas.",
    eixo: "costumes",
    direcao: -1,
  },
  {
    texto: "A religião não deveria influenciar leis e políticas públicas.",
    eixo: "costumes",
    direcao: -1,
  },
  {
    texto: "Prender mais gente não resolve a criminalidade; o foco deveria ser prevenção.",
    eixo: "costumes",
    direcao: -1,
  },
  {
    texto: "Questões de gênero devem ser discutidas abertamente nas escolas.",
    eixo: "costumes",
    direcao: -1,
  },
  {
    texto: "Imigrantes e refugiados devem ser acolhidos com facilidade.",
    eixo: "costumes",
    direcao: -1,
  },
  {
    texto: "O Estado deve garantir direitos de pessoas trans, como o uso do nome social.",
    eixo: "costumes",
    direcao: -1,
  },
  {
    texto: "A família tradicional é a base da sociedade e deve ser protegida pelo Estado.",
    eixo: "costumes",
    direcao: 1,
  },
  {
    texto: "Penas para crimes hediondos deveriam ser bem mais duras.",
    eixo: "costumes",
    direcao: 1,
  },
  { texto: "A maioridade penal deveria ser reduzida para 16 anos.", eixo: "costumes", direcao: 1 },
  {
    texto: "O cidadão comum deveria ter mais facilidade para ter arma em casa.",
    eixo: "costumes",
    direcao: 1,
  },
  {
    texto: "Valores religiosos são importantes para a moral de um país.",
    eixo: "costumes",
    direcao: 1,
  },
  {
    texto: "Educação sexual e temas de gênero são responsabilidade da família, não da escola.",
    eixo: "costumes",
    direcao: 1,
  },
  {
    texto: "O aborto deveria continuar proibido, exceto nos casos já previstos em lei.",
    eixo: "costumes",
    direcao: 1,
  },
  {
    texto: "A polícia deveria ter mais liberdade para agir contra o crime.",
    eixo: "costumes",
    direcao: 1,
  },
  {
    texto: "As drogas devem continuar proibidas, inclusive a maconha.",
    eixo: "costumes",
    direcao: 1,
  },
  {
    texto: "Patriotismo e tradições nacionais deveriam ser mais valorizados nas escolas.",
    eixo: "costumes",
    direcao: 1,
  },
] as const;

/** Resposta 1–5 → −2…+2, vezes a direção, somada por eixo e normalizada para −100…+100. Sem resposta = neutro. */
export function pontuar(respostas: Record<number, number>) {
  const soma = { economia: 0, costumes: 0 };
  const max = { economia: 0, costumes: 0 };
  AFIRMACOES.forEach((a, i) => {
    soma[a.eixo] += ((respostas[i] ?? 3) - 3) * a.direcao;
    max[a.eixo] += 2;
  });
  return {
    economia: Math.round((soma.economia / max.economia) * 100),
    costumes: Math.round((soma.costumes / max.costumes) * 100),
  };
}

/** Rótulo descritivo do resultado. |valor| < 20 = centro/moderado. */
export function rotulo({ economia, costumes }: { economia: number; costumes: number }) {
  const e = economia <= -20 ? "Esquerda" : economia >= 20 ? "Direita" : "Centro";
  if (e === "Centro" && Math.abs(costumes) < 20) return "Centro";
  const c =
    costumes >= 20
      ? e === "Centro"
        ? "conservador"
        : "conservadora"
      : costumes <= -20
        ? "progressista"
        : e === "Centro"
          ? "moderado nos costumes"
          : "moderada nos costumes";
  return `${e} ${c}`;
}
