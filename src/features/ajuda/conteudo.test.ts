import { describe, expect, it } from "vitest";
import { ROTAS } from "@/lib/rotas";
import { AJUDA, filtrarAjuda } from "./conteudo";

describe("ajuda", () => {
  it("tem perguntas para todas as rotas", () => {
    for (const r of ROTAS) expect(AJUDA[r.ajuda]?.perguntas.length).toBeGreaterThan(0);
  });

  it("abre na seção da página atual", () => {
    expect(filtrarAjuda("", "debates")[0].chave).toBe("debates");
  });

  it("busca ignora acento e caixa", () => {
    const achou = filtrarAjuda("POLITICO").map((s) => s.chave);
    expect(achou).toContain("mapa");
  });

  it("busca sem resultado devolve lista vazia", () => {
    expect(filtrarAjuda("xyzabc")).toEqual([]);
  });
});
