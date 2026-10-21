import { describe, expect, it } from "vitest";
import { conviteSchema, extrairCodigo, rotuloConviteSchema } from "./schemas";

const CODIGO = "0123456789abcdef";

describe("extrairCodigo", () => {
  it.each([
    [CODIGO, CODIGO],
    [`https://univos.vercel.app/convite/${CODIGO}`, CODIGO],
    [`  http://localhost:3000/convite/${CODIGO}?x=1 `, CODIGO],
    [CODIGO.toUpperCase(), CODIGO],
  ])("lê %s", (colado, esperado) => {
    expect(extrairCodigo(colado)).toBe(esperado);
  });

  it.each(["abc", "https://outro.com/qualquer", `${CODIGO}00`])("recusa %s", (colado) => {
    expect(extrairCodigo(colado)).toBeNull();
  });
});

describe("conviteSchema", () => {
  it("pede o link quando vazio", () => {
    expect(conviteSchema.safeParse({ convite: "" }).error?.issues[0].message).toMatch(
      /Cole o link/,
    );
  });

  it("diz o que fazer com link errado", () => {
    expect(conviteSchema.safeParse({ convite: "oi" }).error?.issues[0].message).toMatch(
      /Confira se colou ele inteiro/,
    );
  });
});

describe("rotuloConviteSchema", () => {
  it("exige 1 a 60 caracteres e diz o que fazer", () => {
    expect(rotuloConviteSchema.safeParse({ rotulo: "  " }).error?.issues[0].message).toMatch(
      /Dê um nome pro link/,
    );
    expect(rotuloConviteSchema.safeParse({ rotulo: "x".repeat(61) }).success).toBe(false);
    expect(rotuloConviteSchema.parse({ rotulo: " grupo do zap " }).rotulo).toBe("grupo do zap");
  });
});
