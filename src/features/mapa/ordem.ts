/**
 * Ordem embaralhada por pessoa. A semente fica salva no banco (quiz_ordem), então a
 * ordem é a mesma ao pausar e voltar, em qualquer aparelho.
 */

/** Gerador pseudoaleatório simples e determinístico (mulberry32). */
function gerador(semente: number) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Índices 0..n-1 embaralhados (Fisher-Yates) a partir da semente. */
export function embaralhar(semente: number, n: number): number[] {
  const aleatorio = gerador(semente);
  const ordem = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
  }
  return ordem;
}

/** Semente nova entre 1 e 2147483646 (limite da coluna). */
export function novaSemente() {
  return 1 + Math.floor(Math.random() * 2147483645);
}

/** Primeira posição da ordem ainda sem resposta (para continuar de onde parou). */
export function proximaPendente(ordem: number[], respostas: Record<number, number>) {
  const i = ordem.findIndex((a) => respostas[a] === undefined);
  return i === -1 ? ordem.length - 1 : i;
}
