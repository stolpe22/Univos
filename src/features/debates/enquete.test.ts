import { describe, expect, it } from "vitest";
import { classificar, contar, cruzarVotos, type Voto } from "./enquete";

describe("classificar a mudança de opinião", () => {
  it("as 4 combinações do grupo do zap", () => {
    expect(classificar("a_favor", "a_favor")).toBe("manteve");
    expect(classificar("a_favor", "contra")).toBe("mudou_de_lado");
    expect(classificar("contra", "contra")).toBe("manteve");
    expect(classificar("contra", "a_favor")).toBe("mudou_de_lado");
  });

  it("indeciso que se decidiu e quem ficou em dúvida", () => {
    expect(classificar("indeciso", "contra")).toBe("decidiu");
    expect(classificar("a_favor", "indeciso")).toBe("ficou_em_duvida");
    expect(classificar("indeciso", "indeciso")).toBe("manteve");
  });

  it("quem só votou numa das vezes", () => {
    expect(classificar("a_favor", undefined)).toBe("so_antes");
    expect(classificar(undefined, "contra")).toBe("so_depois");
  });
});

describe("cruzar e contar votos", () => {
  const votos: Voto[] = [
    { pessoa: "1", nome: "Lucas", momento: "antes", posicao: "a_favor" },
    { pessoa: "1", nome: "Lucas", momento: "depois", posicao: "contra" },
    { pessoa: "2", nome: "Karol", momento: "antes", posicao: "contra" },
    { pessoa: "2", nome: "Karol", momento: "depois", posicao: "contra" },
    { pessoa: "3", nome: "Joju", momento: "antes", posicao: "indeciso" },
  ];

  it("junta antes e depois por pessoa, em ordem alfabética", () => {
    expect(cruzarVotos(votos)).toEqual([
      { pessoa: "3", nome: "Joju", antes: "indeciso", mudanca: "so_antes" },
      { pessoa: "2", nome: "Karol", antes: "contra", depois: "contra", mudanca: "manteve" },
      { pessoa: "1", nome: "Lucas", antes: "a_favor", depois: "contra", mudanca: "mudou_de_lado" },
    ]);
  });

  it("conta por posição com os nomes", () => {
    expect(contar(votos, "antes").map((c) => c.nomes)).toEqual([["Lucas"], ["Karol"], ["Joju"]]);
    expect(contar(votos, "depois").map((c) => c.nomes.length)).toEqual([0, 2, 0]);
  });
});
