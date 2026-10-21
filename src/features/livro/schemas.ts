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

/**
 * Meta de leitura em texto livre ("Capítulo 5", "Até o fim da parte 2") e prazo.
 * Não usa página: cada pessoa lê uma edição diferente.
 */
export function metaSchema(hoje: string) {
  return z.object({
    texto: z
      .string()
      .trim()
      .min(2, "Escreva até onde ler, ex: Capítulo 5.")
      .max(120, "A meta pode ter até 120 caracteres. Tente resumir."),
    prazo: z.iso
      .date("Escolha a data do prazo.")
      .refine((d) => d >= hoje, "Esse dia já passou. Escolha hoje ou uma data no futuro."),
  });
}
