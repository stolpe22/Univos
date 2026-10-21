"use server";

import { revalidatePath } from "next/cache";
import { ERRO_REDE, type EstadoForm } from "@/lib/resultado";
import { createClient } from "@/lib/supabase/server";
import { nomeGrupoSchema, papelSchema } from "./schemas";

/** Cria um grupo. Só o dono (o banco confere). Quem cria entra como moderador. */
export async function criarGrupo(
  _anterior: EstadoForm<"nome">,
  form: FormData,
): Promise<EstadoForm<"nome">> {
  const nome = String(form.get("nome") ?? "");
  const lido = nomeGrupoSchema.safeParse({ nome });
  if (!lido.success) {
    return { ok: false, erros: { nome: lido.error.issues[0]?.message }, valores: { nome } };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("criar_grupo", { nome: lido.data.nome });
  if (error) {
    const geral = error.code === "42501" ? "Só o dono do sistema cria grupos." : ERRO_REDE;
    return { ok: false, erros: { geral }, valores: { nome } };
  }

  revalidatePath("/", "layout");
  return { ok: true, mensagem: `Grupo “${lido.data.nome}” criado. Gere um convite em Membros.` };
}

/** Torna alguém moderador ou membro. Só o dono (o banco confere). */
export async function definirPapel(
  clube: string,
  pessoa: string,
  papel: "membro" | "moderador",
): Promise<{ ok: boolean }> {
  const lido = papelSchema.safeParse({ clube, pessoa, papel });
  if (!lido.success) return { ok: false };

  const supabase = await createClient();
  const { error } = await supabase.rpc("definir_papel", {
    clube: lido.data.clube,
    pessoa: lido.data.pessoa,
    novo_papel: lido.data.papel,
  });
  if (error) return { ok: false };

  revalidatePath("/admin");
  return { ok: true };
}
