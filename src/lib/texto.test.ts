import { describe, expect, it } from "vitest";
import { limparEspacos, normalizar, slug } from "./texto";

describe("texto", () => {
  it("normalizar tira acento e caixa", () => {
    expect(normalizar("Político ÁÇÃO")).toBe("politico acao");
  });

  it("slug vira código de URL", () => {
    expect(slug("  História do Trabalho! ")).toBe("historia-do-trabalho");
    expect(slug("!!!")).toBe("");
  });

  it("limparEspacos junta espaços", () => {
    expect(limparEspacos("  a   b ")).toBe("a b");
  });
});
