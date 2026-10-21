import { describe, expect, it } from "vitest";
import {
  cadastroSchema,
  destinoSeguro,
  emailSchema,
  errosPorCampo,
  loginSchema,
  novaSenhaSchema,
} from "./schemas";

describe("email do login", () => {
  it("pede o email quando vazio", () => {
    const r = emailSchema.safeParse({ email: "  " });
    expect(r.error?.issues[0].message).toBe("Digite seu email.");
  });

  it("explica o que fazer quando está incompleto", () => {
    const r = emailSchema.safeParse({ email: "lucas@gmail" });
    expect(r.error?.issues[0].message).toMatch(/incompleto/);
  });

  it("aceita e tira espaços", () => {
    expect(emailSchema.parse({ email: " lucas@gmail.com " }).email).toBe("lucas@gmail.com");
  });
});

describe("destinoSeguro", () => {
  it("aceita caminho interno", () => {
    expect(destinoSeguro("/convite/abc")).toBe("/convite/abc");
  });

  it.each(["https://malicioso.com", "//malicioso.com", "/\\malicioso.com", undefined, ["/a"]])(
    "recusa %s",
    (v) => {
      expect(destinoSeguro(v)).toBe("/inicio");
    },
  );
});

describe("senhas", () => {
  it("login pede a senha", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", senha: "" });
    expect(errosPorCampo(r.error!)).toEqual({ senha: "Digite sua senha." });
  });

  it("cadastro exige senha de 8+ e nome", () => {
    const r = cadastroSchema.safeParse({ nome: " ", email: "a@b.com", senha: "1234567" });
    const erros = errosPorCampo(r.error!);
    expect(erros.nome).toMatch(/como o grupo vai te chamar/);
    expect(erros.senha).toMatch(/pelo menos 8/);
  });

  it("senha nova precisa bater com a confirmação", () => {
    const r = novaSenhaSchema.safeParse({ senha: "senhaboa123", confirmar: "senhaboa124" });
    expect(errosPorCampo(r.error!)).toEqual({
      confirmar: "As duas senhas precisam ser iguais. Digite de novo.",
    });
  });
});
