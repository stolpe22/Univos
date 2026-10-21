import { describe, expect, it } from "vitest";
import type { EdicaoLeitura, LivroEstante } from "./queries";
import {
  comExemplar,
  filtrarEstante,
  filtroDaUrl,
  leitores,
  leiturasDoLivro,
  naoLidosPorVoto,
  ordenarEstante,
  urlDoFiltro,
  type FiltroEstante,
} from "./regras";

function leitura(userId: string, status: EdicaoLeitura["status"], temEdicao = true): EdicaoLeitura {
  return {
    userId,
    nome: userId,
    cor: "slate",
    icone: "",
    paginas: 300,
    pagina: 0,
    status,
    temEdicao,
    atualizadoEm: "2026-10-01T00:00:00Z",
  };
}

function livro(id: number, status: LivroEstante["status"], extra: Partial<LivroEstante> = {}) {
  return {
    id,
    titulo: `Livro ${id}`,
    autor: "Autor",
    paginas: 300,
    status,
    sugeridoPor: null,
    sugeridoPorNome: "alguém",
    votos: [],
    tema: null,
    temaNome: null,
    anoPublicacao: null,
    editora: null,
    precoReferencia: null,
    nivel: null,
    nivelNome: null,
    tipo: null,
    nota: null,
    leituras: [],
    ...extra,
  } satisfies LivroEstante;
}

const estante = [
  livro(1, "lido", { leituras: [leitura("karol", "lido"), leitura("lucas", "lendo")] }),
  livro(2, "fila", { votos: ["karol"] }),
  livro(3, "atual", { leituras: [leitura("lucas", "lido"), leitura("joju", "lendo", false)] }),
  livro(4, "fila", { votos: ["karol", "lucas"], leituras: [leitura("joju", "lido")] }),
  livro(5, "fila", { votos: ["joju"] }),
  livro(6, "lido"),
];

describe("estante", () => {
  it("mais votado primeiro entre os não lidos; empate fica com o mais antigo", () => {
    expect(naoLidosPorVoto(estante).map((l) => l.id)).toEqual([4, 2, 5]);
  });

  it("nenhum livro sai: livro da vez, não lidos por voto e lidos (mais recente primeiro)", () => {
    expect(ordenarEstante(estante).map((l) => l.id)).toEqual([3, 4, 2, 5, 6, 1]);
  });

  it("filtra o que o grupo terminou e o que cada pessoa marcou como Já li", () => {
    const ids = (f: FiltroEstante) => filtrarEstante(estante, f).map((l) => l.id);
    expect(ids({ tipo: "todos" })).toHaveLength(6);
    expect(ids({ tipo: "grupo" })).toEqual([1, 6]);
    expect(ids({ tipo: "eu", id: "lucas" })).toEqual([3]);
    // "com o grupo" = terminados pelo grupo e o livro da vez (3)
    expect(ids({ tipo: "grupo", pessoa: "karol" })).toEqual([1]);
    expect(ids({ tipo: "grupo", pessoa: "lucas" })).toEqual([3]);
    // Joju está lendo o livro da vez e leu o 4 por conta própria
    expect(ids({ tipo: "grupo", pessoa: "joju", situacao: "lendo" })).toEqual([3]);
    expect(ids({ tipo: "grupo", pessoa: "joju", situacao: "leu" })).toEqual([]);
    expect(ids({ tipo: "grupo", pessoa: "joju", situacao: "leu", tudo: true })).toEqual([4]);
    expect(ids({ tipo: "grupo", pessoa: "joju", situacao: "ambos", tudo: true })).toEqual([3, 4]);
  });

  it("guarda o filtro na URL e lê de volta", () => {
    const filtros: FiltroEstante[] = [
      { tipo: "todos" },
      { tipo: "eu", id: "lucas" },
      { tipo: "grupo" },
      { tipo: "grupo", pessoa: "karol", tudo: false, situacao: "leu" },
      { tipo: "grupo", pessoa: "karol", tudo: true, situacao: "lendo" },
      { tipo: "grupo", pessoa: "karol", tudo: false, situacao: "ambos" },
    ];
    for (const f of filtros) {
      const url = new URL(urlDoFiltro(f), "http://x");
      expect(filtroDaUrl(url.searchParams, "lucas")).toEqual(f);
    }
    expect(filtroDaUrl(new URLSearchParams("ver=lidos"), "lucas").tipo).toBe("grupo");
  });

  it("conta só quem cadastrou o exemplar", () => {
    expect(comExemplar(estante[2])).toBe(1);
  });

  it("separa quem leu de quem está lendo", () => {
    const { leram, lendo } = leiturasDoLivro(estante[2]);
    expect(leram.map((l) => l.userId)).toEqual(["lucas"]);
    expect(lendo.map((l) => l.userId)).toEqual(["joju"]);
  });

  it("lista quem leu ou está lendo algo, em ordem alfabética", () => {
    expect(leitores(estante)).toEqual([
      { id: "joju", nome: "joju" },
      { id: "karol", nome: "karol" },
      { id: "lucas", nome: "lucas" },
    ]);
  });
});
