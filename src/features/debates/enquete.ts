/** Regras puras da enquete antes/depois do debate (testadas em enquete.test.ts). */

import type { CorPerfil, IconePerfil } from "@/components/ui/Avatar";

export type Posicao = "a_favor" | "contra" | "nenhum_dos_dois";
export type Momento = "antes" | "depois";
export type TipoEnquete = "inicial" | "pos_debate";

export const POSICOES: { valor: Posicao; rotulo: string }[] = [
  { valor: "a_favor", rotulo: "A favor" },
  { valor: "contra", rotulo: "Contra" },
  { valor: "nenhum_dos_dois", rotulo: "Nenhum dos dois" },
];

export const nomePosicao = (p: Posicao) => POSICOES.find((x) => x.valor === p)?.rotulo ?? p;

export type Voto = {
  pessoa: string;
  nome: string;
  momento: Momento;
  posicao: Posicao;
  cor?: CorPerfil;
  icone?: IconePerfil | "";
};

export type Mudanca =
  "manteve" | "mudou_de_lado" | "decidiu" | "ficou_em_duvida" | "so_antes" | "so_depois";

export const NOME_MUDANCA: Record<Mudanca, string> = {
  manteve: "Mantiveram a posição",
  mudou_de_lado: "Mudaram de lado",
  decidiu: "Saíram de “Nenhum dos dois”",
  ficou_em_duvida: "Passaram para “Nenhum dos dois”",
  so_antes: "Só votaram antes",
  so_depois: "Só votaram depois",
};

export type Cruzamento = {
  pessoa: string;
  nome: string;
  antes?: Posicao;
  depois?: Posicao;
  mudanca: Mudanca;
  cor?: CorPerfil;
  icone?: IconePerfil | "";
};

export function classificar(antes?: Posicao, depois?: Posicao): Mudanca {
  if (antes && !depois) return "so_antes";
  if (!antes && depois) return "so_depois";
  if (antes === depois) return "manteve";
  if (antes === "nenhum_dos_dois") return "decidiu";
  if (depois === "nenhum_dos_dois") return "ficou_em_duvida";
  return "mudou_de_lado";
}

/** Junta o voto de antes e o de depois de cada pessoa e diz o que mudou. */
export function cruzarVotos(votos: Voto[]): Cruzamento[] {
  const porPessoa = new Map<
    string,
    {
      nome: string;
      antes?: Posicao;
      depois?: Posicao;
      cor?: CorPerfil;
      icone?: IconePerfil | "";
    }
  >();
  for (const v of votos) {
    const p = porPessoa.get(v.pessoa) ?? { nome: v.nome };
    p[v.momento] = v.posicao;
    if (v.cor) p.cor = v.cor;
    if (v.icone) p.icone = v.icone;
    porPessoa.set(v.pessoa, p);
  }
  return [...porPessoa.entries()]
    .map(([pessoa, p]) => ({ pessoa, ...p, mudanca: classificar(p.antes, p.depois) }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/** Pessoas com votos nos dois momentos e quantas mudaram entre favor e contra. */
export function resumirViradas(votos: Voto[]) {
  const comparaveis = cruzarVotos(votos).filter((v) => v.antes && v.depois);
  return {
    comparaveis: comparaveis.length,
    viradas: comparaveis.filter((v) => v.mudanca === "mudou_de_lado").length,
  };
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

type ConclusaoComVotos = { votos: { posicao: "concordo" | "discordo" }[] };

/**
 * A conclusão com mais votos (empate: a com mais concordância), para o resumo da agenda.
 * Devolve null se ninguém votou em nenhuma.
 */
export function conclusaoMaisVotada(conclusoes: ConclusaoComVotos[]) {
  return (
    conclusoes
      .map((c) => {
        const total = c.votos.length;
        const concordam = c.votos.filter((v) => v.posicao === "concordo").length;
        return { total, concordam, percentual: total ? Math.round((concordam / total) * 100) : 0 };
      })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total || b.percentual - a.percentual)[0] ?? null
  );
}
