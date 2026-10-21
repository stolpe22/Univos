import { describe, expect, it } from "vitest";
import { AFIRMACOES, pontuar, rotulo } from "./afirmacoes";

describe("afirmações do mapa político", () => {
  it("são 40, equilibradas por eixo e direção", () => {
    expect(AFIRMACOES).toHaveLength(40);
    for (const eixo of ["economia", "costumes"] as const) {
      for (const direcao of [-1, 1] as const) {
        const n = AFIRMACOES.filter((a) => a.eixo === eixo && a.direcao === direcao).length;
        expect(n, `${eixo} ${direcao}`).toBe(10);
      }
    }
  });

  it("sem resposta dá neutro (centro)", () => {
    expect(pontuar({})).toEqual({ economia: 0, costumes: 0 });
    expect(rotulo({ economia: 0, costumes: 0 })).toBe("Centro");
  });

  it("concordar com tudo da direita econômica dá +100 em economia", () => {
    const respostas: Record<number, number> = {};
    AFIRMACOES.forEach((a, i) => {
      if (a.eixo === "economia") respostas[i] = a.direcao === 1 ? 5 : 1;
    });
    expect(pontuar(respostas).economia).toBe(100);
  });

  it("|valor| < 20 é centro/moderado", () => {
    expect(rotulo({ economia: 19, costumes: -19 })).toBe("Centro");
    expect(rotulo({ economia: -20, costumes: 0 })).toBe("Esquerda moderada nos costumes");
  });
});
