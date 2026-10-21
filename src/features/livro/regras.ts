/**
 * Regras puras do Livro da vez (testadas em regras.test.ts).
 *
 * Cada pessoa lê a própria edição, com um número de páginas diferente. Por isso
 * comparações entre pessoas (spoiler, ranking) usam a POSIÇÃO no livro
 * (fração de 0 a 1 da edição de cada um), nunca o número da página.
 */

/** Quanto do livro a pessoa já leu, de 0 a 1, na edição dela. */
export function posicao(pagina: number, totalEdicao: number) {
  if (totalEdicao <= 0) return 0;
  return Math.min(Math.max(pagina, 0), totalEdicao) / totalEdicao;
}

export function porcentagem(pagina: number, total: number) {
  return Math.round(posicao(pagina, total) * 100);
}

/**
 * Comentário vira spoiler quando foi escrito num ponto do livro depois de onde a
 * pessoa está. O próprio comentário nunca fica escondido para quem escreveu.
 */
export function ehSpoiler(
  comentario: { posicao: number; autor: string },
  minhaPosicao: number,
  eu: string,
) {
  return comentario.autor !== eu && comentario.posicao > minhaPosicao;
}

/** Página dentro de 0..total depois de um passo (±10). */
export function passo(pagina: number, delta: number, total: number) {
  return Math.min(Math.max((Number.isFinite(pagina) ? pagina : 0) + delta, 0), total);
}

/**
 * A situação que vale, coerente com a página: chegou à última página é "lido" mesmo se a
 * pessoa esqueceu de trocar a situação; passou da página 0 já está lendo.
 */
export function situacaoDaLeitura(
  status: "nao_lido" | "lendo" | "lido",
  pagina: number,
  paginas: number,
): "nao_lido" | "lendo" | "lido" {
  if (status === "lido" || (paginas > 0 && pagina >= paginas)) return "lido";
  if (pagina > 0) return "lendo";
  return status;
}

/** No formulário: ao digitar a página, a situação acompanha (última página = Já li). */
export function situacaoPelaPagina(
  atual: "nao_lido" | "lendo" | "lido",
  pagina: number,
  paginas: number,
): "nao_lido" | "lendo" | "lido" {
  if (paginas > 0 && pagina >= paginas) return "lido";
  if (pagina > 0) return "lendo";
  return atual === "lido" ? "nao_lido" : atual;
}

/** No formulário: ao trocar a situação, a página acompanha (Já li = total, não comecei = 0). */
export function paginaPelaSituacao(
  situacao: "nao_lido" | "lendo" | "lido",
  pagina: number,
  paginas: number,
) {
  if (situacao === "lido") return paginas;
  if (situacao === "nao_lido") return 0;
  return pagina;
}
