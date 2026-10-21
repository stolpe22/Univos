import { describe, expect, it } from "vitest";
import { ROTA_ADMIN, ROTAS, SECAO_ADMIN, SECOES, secaoDe } from "./rotas";

describe("menu", () => {
  it("toda página está em exatamente uma seção", () => {
    for (const r of ROTAS) {
      expect(SECOES.filter((s) => s.paginas.includes(r))).toHaveLength(1);
    }
  });

  it("acha a seção da página (Estante fica em Livros, Pauta em Debates)", () => {
    const rota = (href: string) => ROTAS.find((r) => r.href === href);
    expect(secaoDe(rota("/estante"))?.nome).toBe("Livros");
    expect(secaoDe(rota("/pauta"))?.nome).toBe("Debates");
    expect(secaoDe(ROTA_ADMIN)).toBe(SECAO_ADMIN);
    expect(secaoDe(undefined)).toBeUndefined();
  });
});
