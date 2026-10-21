import { z } from "zod";

export function paginaSchema(total: number) {
  return z.coerce
    .number({ error: "Digite um número de página, ex: 120." })
    .int("Digite um número inteiro de página, ex: 120.")
    .min(0, `A página precisa estar entre 0 e ${total}.`)
    .max(total, `A página precisa estar entre 0 e ${total}.`);
}

export const comentarioSchema = z.object({
  texto: z
    .string()
    .trim()
    .min(1, "Escreva algo antes de publicar.")
    .max(500, "O comentário pode ter até 500 caracteres. Tente resumir."),
});

/** Meta da semana: até que página ler e até quando. */
export function metaSchema(total: number) {
  return z.object({
    pagina: paginaSchema(total).refine((p) => p > 0, "Escolha uma página maior que 0."),
    prazo: z.iso.date("Escolha a data do prazo."),
  });
}
