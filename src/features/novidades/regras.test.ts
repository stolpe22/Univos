import { describe, expect, it } from "vitest";
import { paginaDaRota, paginasComNovidade, type Novidades } from "./regras";

const n = (parcial: Partial<Novidades>): Novidades => ({
  ultimas: {},
  vistos: {},
  desde: null,
  ...parcial,
});

describe("novidades no menu", () => {
  it("acende quando há algo depois da última visita da pessoa", () => {
    const novas = paginasComNovidade(
      n({
        ultimas: { estante: "2026-10-21T12:00:00Z", membros: "2026-10-20T12:00:00Z" },
        vistos: { estante: "2026-10-21T10:00:00Z", membros: "2026-10-21T10:00:00Z" },
      }),
    );
    expect([...novas]).toEqual(["estante"]);
  });

  it("sem visita ainda, vale desde quando a pessoa entrou no grupo", () => {
    const base = { ultimas: { mapa: "2026-10-10T12:00:00Z" } };
    expect(paginasComNovidade(n({ ...base, desde: "2026-10-01T00:00:00Z" })).has("mapa")).toBe(
      true,
    );
    expect(paginasComNovidade(n({ ...base, desde: "2026-10-15T00:00:00Z" })).has("mapa")).toBe(
      false,
    );
  });

  it("some na hora ao abrir a página, e volta se chegar coisa mais nova depois", () => {
    const base = n({ ultimas: { debates: "2026-10-21T12:00:00Z" }, desde: "2026-10-01T00:00:00Z" });
    // viu a novidade das 12:00 na tela
    expect(paginasComNovidade(base, { debates: "2026-10-21T12:00:00Z" }).size).toBe(0);
    const depois = { ...base, ultimas: { debates: "2026-10-21T12:10:00Z" } };
    expect(paginasComNovidade(depois, { debates: "2026-10-21T12:00:00Z" }).size).toBe(1);
  });

  it("página sem novidade nenhuma não acende", () => {
    expect(paginasComNovidade(n({ ultimas: { livro: null } })).size).toBe(0);
  });

  it("acha a página pela rota, inclusive as de detalhe", () => {
    expect(paginaDaRota("/estante/12")).toBe("estante");
    expect(paginaDaRota("/debates")).toBe("debates");
    expect(paginaDaRota("/pauta")).toBeNull();
    expect(paginaDaRota("/")).toBeNull();
  });
});
