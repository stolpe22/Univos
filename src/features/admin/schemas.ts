import { z } from "zod";

export const nomeGrupoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Dê um nome com pelo menos 2 letras, ex: Clube da Firma.")
    .max(60, "O nome pode ter até 60 caracteres. Tente um mais curto."),
});

export const papelSchema = z.object({
  clube: z.uuid(),
  pessoa: z.uuid(),
  papel: z.enum(["membro", "moderador"]),
});
