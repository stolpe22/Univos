import { describe, expect, it } from "vitest";
import { descreverEvento } from "./formatos";

const base = { autor: "Karol", alvo: null, convite: "grupo do zap", detalhes: {} };

describe("auditoria em linguagem do grupo", () => {
  it("descreve cada ação", () => {
    expect(descreverEvento({ ...base, acao: "convite_criado" })).toBe(
      "Karol gerou o link “grupo do zap”",
    );
    expect(descreverEvento({ ...base, acao: "entrou_por_convite" })).toBe(
      "Karol entrou pelo link “grupo do zap”",
    );
    expect(descreverEvento({ ...base, acao: "convite_desativado" })).toBe(
      "Karol desativou o link “grupo do zap”",
    );
    expect(
      descreverEvento({
        ...base,
        acao: "grupo_criado",
        convite: null,
        detalhes: { nome: "Firma" },
      }),
    ).toBe("Karol criou o grupo “Firma”");
    expect(
      descreverEvento({
        ...base,
        acao: "papel_alterado",
        alvo: "Joju",
        detalhes: { de: "membro", para: "moderador" },
      }),
    ).toBe("Karol mudou Joju de membro para moderador");
  });

  it("usa o rótulo guardado quando o convite foi apagado", () => {
    expect(
      descreverEvento({
        ...base,
        convite: null,
        acao: "convite_criado",
        detalhes: { rotulo: "insta" },
      }),
    ).toBe("Karol gerou o link “insta”");
  });
});
