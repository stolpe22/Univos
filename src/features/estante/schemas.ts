import { z } from "zod";

export const livroSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "Digite o título do livro.")
    .max(160, "O título pode ter até 160 caracteres."),
  autor: z
    .string()
    .trim()
    .min(1, "Digite o nome de quem escreveu.")
    .max(120, "O nome pode ter até 120 caracteres."),
  paginas: z.coerce
    .number({ error: "Digite um número inteiro entre 1 e 3000." })
    .int("Digite um número inteiro entre 1 e 3000.")
    .min(1, "Digite um número inteiro entre 1 e 3000.")
    .max(3000, "Digite um número inteiro entre 1 e 3000."),
});
