import { VALORES_COR, VALORES_ICONE } from "@/components/ui/avatar/opcoes";
import { z } from "zod";

export const nomePerfilSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Digite o nome que as pessoas do grupo vão ver.")
    .max(40, "O nome pode ter até 40 caracteres."),
});

// Os valores aceitos vêm da mesma lista que o componente usa (avatar/opcoes.ts).
export const avatarPerfilSchema = z.object({
  cor: z.enum(VALORES_COR, "Escolha uma das cores da lista."),
  icone: z.enum(VALORES_ICONE, "Escolha um dos ícones da lista."),
});
