export type GrupoResultado = "Páginas" | "Livros" | "Debates" | "Pauta" | "Pessoas" | "Ajuda";

export type Resultado = {
  /** Único na lista (ex: "livro-12"). */
  id: string;
  grupo: GrupoResultado;
  titulo: string;
  detalhe?: string | null;
  /** Para onde vai ao escolher. */
  href?: string;
  /** Resultado da Ajuda: abre a Ajuda já buscando esta pergunta. */
  pergunta?: string;
};

/** Ordem em que os grupos aparecem na lista. */
export const ORDEM_GRUPOS: GrupoResultado[] = [
  "Páginas",
  "Livros",
  "Debates",
  "Pauta",
  "Pessoas",
  "Ajuda",
];
