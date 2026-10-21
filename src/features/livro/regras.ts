/** Regras puras do Livro da vez (testadas em regras.test.ts). */

/**
 * Comentário vira spoiler quando foi marcado numa página depois da página de quem lê.
 * O próprio comentário nunca fica escondido para quem escreveu.
 */
export function ehSpoiler(
  comentario: { pagina: number; autor: string },
  minhaPagina: number,
  eu: string,
) {
  return comentario.autor !== eu && comentario.pagina > minhaPagina;
}

export function porcentagem(pagina: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((Math.min(Math.max(pagina, 0), total) / total) * 100);
}

/** Página dentro de 0..total depois de um passo (±10). */
export function passo(pagina: number, delta: number, total: number) {
  return Math.min(Math.max((Number.isFinite(pagina) ? pagina : 0) + delta, 0), total);
}
