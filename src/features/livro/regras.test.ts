import { describe, expect, it } from "vitest";
import { ehSpoiler, passo, porcentagem } from "./regras";

describe("spoiler", () => {
  it("esconde comentário de página depois da minha", () => {
    expect(ehSpoiler({ pagina: 150, autor: "karol" }, 140, "lucas")).toBe(true);
  });
  it("mostra comentário da mesma página ou antes", () => {
    expect(ehSpoiler({ pagina: 140, autor: "karol" }, 140, "lucas")).toBe(false);
    expect(ehSpoiler({ pagina: 60, autor: "karol" }, 140, "lucas")).toBe(false);
  });
  it("nunca esconde o meu próprio comentário", () => {
    expect(ehSpoiler({ pagina: 300, autor: "lucas" }, 10, "lucas")).toBe(false);
  });
});

describe("página", () => {
  it("passo de ±10 fica entre 0 e o total", () => {
    expect(passo(5, -10, 320)).toBe(0);
    expect(passo(315, 10, 320)).toBe(320);
    expect(passo(100, 10, 320)).toBe(110);
  });
  it("porcentagem arredonda e limita", () => {
    expect(porcentagem(160, 320)).toBe(50);
    expect(porcentagem(999, 320)).toBe(100);
    expect(porcentagem(10, 0)).toBe(0);
  });
});
