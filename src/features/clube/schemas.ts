import { z } from "zod";

/** Nome do link, para saber depois por onde cada pessoa entrou. */
export const rotuloConviteSchema = z.object({
  rotulo: z
    .string()
    .trim()
    .min(1, "Dê um nome pro link, ex: grupo do zap.")
    .max(60, "O nome pode ter até 60 caracteres. Tente um mais curto."),
});

const CODIGO = /^[0-9a-f]{16}$/;

/**
 * Aceita o link inteiro ("https://…/convite/abc…") ou só o código, do jeito que
 * a pessoa colar. Devolve o código ou null.
 */
export function extrairCodigo(colado: string): string | null {
  const texto = colado.trim().toLowerCase();
  const doLink = texto.match(/\/convite\/([0-9a-f]{16})(?:[/?#]|$)/)?.[1];
  const codigo = doLink ?? texto;
  return CODIGO.test(codigo) ? codigo : null;
}

/** Se o login veio de um convite ("/convite/<codigo>"), devolve o código. */
export function codigoDoDestino(destino: string): string | null {
  return destino.match(/^\/convite\/([0-9a-f]{16})$/)?.[1] ?? null;
}

export const conviteSchema = z.object({
  convite: z
    .string()
    .trim()
    .min(1, "Cole o link de convite que mandaram no grupo.")
    .transform((v, ctx) => {
      const codigo = extrairCodigo(v);
      if (!codigo) {
        ctx.addIssue({
          code: "custom",
          message: "Esse link não parece um convite do Uni-vos. Confira se colou ele inteiro.",
        });
        return z.NEVER;
      }
      return codigo;
    }),
});
