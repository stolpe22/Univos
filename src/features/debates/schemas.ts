import { z } from "zod";

export const FORMATOS = ["Rodada com FINALIZADO!", "Clube do livro", "Livre"] as const;

/** Como cada formato funciona (aparece em cada debate e no formulário). */
export const COMO_FUNCIONA: Record<string, string> = {
  "Rodada com FINALIZADO!":
    "Uma pessoa fala por vez e termina com FINALIZADO! pra próxima começar. Réplica e tréplica valem.",
  "Clube do livro": "Conversa sobre o livro da vez, capítulo por capítulo.",
  Livre: "Conversa aberta, sem ordem de fala.",
};

/**
 * "2026-10-26T20:00" (campo datetime-local) no horário de Brasília (sem horário de verão
 * desde 2019) vira um Date. Devolve null se o texto não for uma data.
 */
export function lerDataLocal(valor: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor)) return null;
  const d = new Date(`${valor}:00-03:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function debateSchema(agora = new Date()) {
  return z.object({
    tema: z
      .string()
      .trim()
      .min(2, "Digite o tema do debate, ex: Pena de morte.")
      .max(120, "O tema pode ter até 120 caracteres. Tente resumir."),
    data: z
      .string()
      .min(1, "Escolha a data e a hora.")
      .transform((v, ctx) => {
        const d = lerDataLocal(v);
        if (!d) {
          ctx.addIssue({ code: "custom", message: "Escolha a data e a hora no campo." });
          return z.NEVER;
        }
        if (d <= agora) {
          ctx.addIssue({
            code: "custom",
            message: "Essa data já passou. Escolha uma data no futuro.",
          });
          return z.NEVER;
        }
        return d;
      }),
    formato: z.enum(FORMATOS, "Escolha um dos formatos da lista."),
  });
}

export const perguntaSchema = z.object({
  pergunta: z
    .string()
    .trim()
    .min(5, "Escreva a pergunta da enquete, ex: Privatizar os Correios?")
    .max(160, "A pergunta pode ter até 160 caracteres. Tente resumir."),
});

export const conclusaoSchema = z.object({
  texto: z
    .string()
    .trim()
    .min(5, "Escreva uma conclusão com pelo menos 5 caracteres.")
    .max(240, "A conclusão pode ter até 240 caracteres. Tente resumir."),
});

export const comentarioDebateSchema = z.object({
  texto: z
    .string()
    .trim()
    .min(1, "Escreva um comentário.")
    .max(1000, "O comentário pode ter até 1000 caracteres. Tente resumir."),
});
