/** Regras puras da enquete antes/depois do debate (testadas em enquete.test.ts). */

export type Posicao = "a_favor" | "contra" | "indeciso";
export type Momento = "antes" | "depois";

export const POSICOES: { valor: Posicao; rotulo: string }[] = [
  { valor: "a_favor", rotulo: "A favor" },
  { valor: "contra", rotulo: "Contra" },
  { valor: "indeciso", rotulo: "Indeciso" },
];

export const nomePosicao = (p: Posicao) => POSICOES.find((x) => x.valor === p)?.rotulo ?? p;

export type Voto = { pessoa: string; nome: string; momento: Momento; posicao: Posicao };

export type Mudanca =
  "manteve" | "mudou_de_lado" | "decidiu" | "ficou_em_duvida" | "so_antes" | "so_depois";

export const NOME_MUDANCA: Record<Mudanca, string> = {
  manteve: "Mantiveram a posição",
  mudou_de_lado: "Mudaram de lado",
  decidiu: "Saíram do indeciso",
  ficou_em_duvida: "Ficaram em dúvida",
  so_antes: "Só votaram antes",
  so_depois: "Só votaram depois",
};

export type Cruzamento = {
  pessoa: string;
  nome: string;
  antes?: Posicao;
  depois?: Posicao;
  mudanca: Mudanca;
};

export function classificar(antes?: Posicao, depois?: Posicao): Mudanca {
  if (antes && !depois) return "so_antes";
  if (!antes && depois) return "so_depois";
  if (antes === depois) return "manteve";
  if (antes === "indeciso") return "decidiu";
  if (depois === "indeciso") return "ficou_em_duvida";
  return "mudou_de_lado";
}

/** Junta o voto de antes e o de depois de cada pessoa e diz o que mudou. */
export function cruzarVotos(votos: Voto[]): Cruzamento[] {
  const porPessoa = new Map<string, { nome: string; antes?: Posicao; depois?: Posicao }>();
  for (const v of votos) {
    const p = porPessoa.get(v.pessoa) ?? { nome: v.nome };
    p[v.momento] = v.posicao;
    porPessoa.set(v.pessoa, p);
  }
  return [...porPessoa.entries()]
    .map(([pessoa, p]) => ({ pessoa, ...p, mudanca: classificar(p.antes, p.depois) }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/** Quantos votaram em cada posição num momento, com os nomes (voto aberto). */
export function contar(votos: Voto[], momento: Momento) {
  return POSICOES.map(({ valor, rotulo }) => {
    const nomes = votos
      .filter((v) => v.momento === momento && v.posicao === valor)
      .map((v) => v.nome)
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
    return { valor, rotulo, nomes };
  });
}
