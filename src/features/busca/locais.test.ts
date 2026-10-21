import { describe, expect, it } from "vitest";
import { buscarLocal } from "./locais";

const titulos = (termo: string, dono = false) => buscarLocal(termo, dono).map((r) => r.titulo);

describe("busca local (páginas e ajuda)", () => {
  it("sem termo mostra as páginas, e Admin só para o dono", () => {
    expect(titulos("")).toContain("Livro da vez");
    expect(titulos("")).not.toContain("Admin");
    expect(titulos("", true)).toContain("Admin");
  });

  it("ignora acento e acha por apelido", () => {
    expect(titulos("politico")).toContain("Mapa político");
    expect(titulos("agenda")).toContain("Debates");
  });

  it("acha perguntas da ajuda, que abrem a Ajuda", () => {
    const r = buscarLocal("spoiler", false).find((x) => x.grupo === "Ajuda");
    expect(r?.pergunta).toMatch(/escondidos/);
  });

  it("não mostra ajuda do Admin para quem não é dono", () => {
    expect(buscarLocal("auditoria", false).some((r) => r.detalhe === "Admin")).toBe(false);
    expect(buscarLocal("auditoria", true).some((r) => r.detalhe === "Admin")).toBe(true);
  });
});
