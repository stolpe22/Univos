import { describe, expect, it } from "vitest";
import { classificar, conclusaoMaisVotada, contar, cruzarVotos, type Voto } from "./enquete";

describe("classificar a mudança de opinião", () => {
  it("as 4 combinações do grupo do zap", () => {
    expect(classificar("a_favor", "a_favor")).toBe("manteve");
    expect(classificar("a_favor", "contra")).toBe("mudou_de_lado");
    expect(classificar("contra", "contra")).toBe("manteve");
    expect(classificar("contra", "a_favor")).toBe("mudou_de_lado");
  });

  it("nenhum dos dois que escolhe um lado ou mantém a posição", () => {
    expect(classificar("nenhum_dos_dois", "contra")).toBe("decidiu");
    expect(classificar("a_favor", "nenhum_dos_dois")).toBe("ficou_em_duvida");
    expect(classificar("nenhum_dos_dois", "nenhum_dos_dois")).toBe("manteve");
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
    { pessoa: "3", nome: "Joju", momento: "antes", posicao: "nenhum_dos_dois" },
  ];

  it("junta antes e depois por pessoa, em ordem alfabética", () => {
    expect(cruzarVotos(votos)).toEqual([
      { pessoa: "3", nome: "Joju", antes: "nenhum_dos_dois", mudanca: "so_antes" },
      { pessoa: "2", nome: "Karol", antes: "contra", depois: "contra", mudanca: "manteve" },
      { pessoa: "1", nome: "Lucas", antes: "a_favor", depois: "contra", mudanca: "mudou_de_lado" },
    ]);
  });

  it("conta por posição com os nomes", () => {
    expect(contar(votos, "antes").map((c) => c.nomes)).toEqual([["Lucas"], ["Karol"], ["Joju"]]);
    expect(contar(votos, "depois").map((c) => c.nomes.length)).toEqual([0, 2, 0]);
  });
});

describe("conclusão mais votada", () => {
  const voto = (posicao: "concordo" | "discordo") => ({ posicao });

  it("escolhe a com mais votos e calcula a concordância", () => {
    expect(
      conclusaoMaisVotada([
        { votos: [voto("concordo")] },
        { votos: [voto("concordo"), voto("discordo"), voto("concordo"), voto("concordo")] },
      ]),
    ).toEqual({ total: 4, concordam: 3, percentual: 75 });
  });

  it("no empate de votos, ganha a com mais concordância", () => {
    expect(
      conclusaoMaisVotada([
        { votos: [voto("discordo"), voto("discordo")] },
        { votos: [voto("concordo"), voto("discordo")] },
      ])?.percentual,
    ).toBe(50);
  });

  it("sem votos devolve null", () => {
    expect(conclusaoMaisVotada([{ votos: [] }])).toBeNull();
  });
});
