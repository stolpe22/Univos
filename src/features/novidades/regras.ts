/** Páginas com indicador de novidade no menu (a mesma lista da tabela vistos). */
export const PAGINAS_NOVIDADE = ["livro", "estante", "debates", "mapa", "membros"] as const;
export type PaginaNovidade = (typeof PAGINAS_NOVIDADE)[number];

/** A última novidade de cada página e quando a pessoa abriu cada uma (ISO ou null). */
export type Novidades = {
  ultimas: Partial<Record<PaginaNovidade, string | null>>;
  vistos: Partial<Record<PaginaNovidade, string>>;
  /** Sem "visto" ainda, vale desde quando a pessoa entrou no grupo. */
  desde: string | null;
};

/** A página da rota ("/estante/12" → "estante"), se ela tem indicador. */
export function paginaDaRota(caminho: string): PaginaNovidade | null {
  const primeira = caminho.split("/")[1] ?? "";
  return (PAGINAS_NOVIDADE as readonly string[]).includes(primeira)
    ? (primeira as PaginaNovidade)
    : null;
}

/**
 * Páginas com algo novo pra esta pessoa: a última novidade é depois da última vez que
 * ela abriu a página. `vistoAte` é, nesta sessão, a última novidade de cada página que
 * a pessoa já viu na tela (antes do servidor responder), para a bolinha sumir na hora.
 */
export function paginasComNovidade(
  n: Novidades,
  vistoAte: Partial<Record<PaginaNovidade, string>> = {},
): Set<PaginaNovidade> {
  const novas = new Set<PaginaNovidade>();
  for (const pagina of PAGINAS_NOVIDADE) {
    const ultima = n.ultimas[pagina];
    if (!ultima) continue;
    const marcos = [n.vistos[pagina] ?? n.desde, vistoAte[pagina]]
      .filter((m): m is string => !!m)
      .map((m) => Date.parse(m));
    const visto = marcos.length ? Math.max(...marcos) : 0;
    if (Date.parse(ultima) > visto) novas.add(pagina);
  }
  return novas;
}
