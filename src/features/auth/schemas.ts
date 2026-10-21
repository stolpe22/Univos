import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Digite seu email.")
  .max(254, "Esse email está grande demais. Confira o que foi digitado.")
  .regex(
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    "Esse email parece incompleto. Confira, ex: nome@gmail.com",
  );

/** Senha nova: 8 a 72 caracteres (72 é o limite do Supabase). */
const senhaNova = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .max(72, "A senha pode ter até 72 caracteres.");

export const emailSchema = z.object({ email });

export const loginSchema = z.object({
  email,
  senha: z.string().min(1, "Digite sua senha."),
});

export const cadastroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Diga como o grupo vai te chamar.")
    .max(40, "O nome pode ter até 40 caracteres."),
  email,
  senha: senhaNova,
});

export const novaSenhaSchema = z
  .object({ senha: senhaNova, confirmar: z.string() })
  .refine((v) => v.senha === v.confirmar, {
    path: ["confirmar"],
    message: "As duas senhas precisam ser iguais. Digite de novo.",
  });

/**
 * Só aceita caminho interno ("/livro"), para ninguém usar o login para mandar a
 * pessoa a outro site depois de entrar.
 */
export function destinoSeguro(voltar: unknown, padrao = "/inicio") {
  return typeof voltar === "string" &&
    voltar.startsWith("/") &&
    !voltar.startsWith("//") &&
    !voltar.startsWith("/\\")
    ? voltar
    : padrao;
}

/** Primeiro erro de cada campo, no formato que as telas usam. */
export function errosPorCampo(erro: z.ZodError): Record<string, string> {
  const erros: Record<string, string> = {};
  for (const issue of erro.issues) {
    const campo = String(issue.path[0] ?? "geral");
    erros[campo] ??= issue.message;
  }
  return erros;
}
