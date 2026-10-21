import { z } from "zod";

export const FORMATOS = ["Rodada com FINALIZADO!", "Clube do livro", "Livre"] as const;

/** Como cada formato funciona (aparece em cada debate e no formulário). */
export const COMO_FUNCIONA: Record<string, string> = {
  "Rodada com FINALIZADO!":
    "Uma pessoa fala por vez e termina com FINALIZADO! pra próxima começar. Réplica e tréplica valem.",
  "Clube do livro": "Conversa sobre o livro da vez, capítulo por capítulo.",
  Livre: "Conversa aberta, sem ordem de fala.",
};

/** Como o debate é marcado: com data (hora opcional) ou já começando agora. */
export const QUANDO = [
  { valor: "data", rotulo: "Marcar data" },
  { valor: "agora", rotulo: "Já está rolando" },
] as const;

/**
 * Dia ("2026-10-26") e hora opcional ("20:00") no horário de Brasília (sem horário de
 * verão desde 2019) viram um Date. Sem hora, vale 00:00 do dia. Null se não for data.
 */
export function lerDataLocal(dia: string, hora = ""): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return null;
  if (hora && !/^\d{2}:\d{2}$/.test(hora)) return null;
  const d = new Date(`${dia}T${hora || "00:00"}:00-03:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** O dia de hoje em Brasília ("2026-10-21"), para comparar com o campo de data. */
function hojeEm(agora: Date) {
  return agora.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

export function debateSchema(agora = new Date()) {
  return z
    .object({
      tema: z
        .string()
        .trim()
        .min(2, "Digite o tema do debate, ex: Pena de morte.")
        .max(120, "O tema pode ter até 120 caracteres. Tente resumir."),
      formato: z.enum(FORMATOS, "Escolha um dos formatos da lista."),
      quando: z.enum(
        QUANDO.map((q) => q.valor) as ["data", "agora"],
        "Escolha se quer marcar uma data ou se já está rolando.",
      ),
      data: z.string(),
      hora: z.string(),
    })
    .transform((v, ctx) => {
      const base = { tema: v.tema, formato: v.formato };
      // já está rolando: a data é agora e o debate nasce em andamento
      if (v.quando === "agora") return { ...base, aoVivo: true, data: agora, comHora: true };

      if (!v.data) {
        ctx.addIssue({ code: "custom", path: ["data"], message: "Escolha o dia do debate." });
        return z.NEVER;
      }
      const data = lerDataLocal(v.data, v.hora);
      if (!data) {
        const campo = lerDataLocal(v.data) ? "hora" : "data";
        ctx.addIssue({
          code: "custom",
          path: [campo],
          message: campo === "hora" ? "Digite a hora no formato 20:00." : "Escolha o dia no campo.",
        });
        return z.NEVER;
      }
      if (v.data < hojeEm(agora)) {
        ctx.addIssue({
          code: "custom",
          path: ["data"],
          message: "Esse dia já passou. Escolha hoje ou um dia no futuro.",
        });
        return z.NEVER;
      }
      if (v.hora && data <= agora) {
        ctx.addIssue({
          code: "custom",
          path: ["hora"],
          message: "Esse horário já passou. Escolha um mais tarde ou deixe a hora em branco.",
        });
        return z.NEVER;
      }
      return { ...base, aoVivo: false, data, comHora: v.hora !== "" };
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
