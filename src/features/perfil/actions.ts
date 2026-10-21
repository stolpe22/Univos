"use server";

import { revalidatePath } from "next/cache";
import { novaSenhaSchema, errosPorCampo } from "@/features/auth/schemas";
import { createClient } from "@/lib/supabase/server";
import { avatarPerfilSchema, nomePerfilSchema } from "./schemas";
import type { EstadoForm, Resultado } from "@/lib/resultado";

export async function salvarNomePerfil(
  _anterior: EstadoForm<"nome">,
  form: FormData,
): Promise<EstadoForm<"nome">> {
  const valores = { nome: String(form.get("nome") ?? "") };
  const lido = nomePerfilSchema.safeParse(valores);
  if (!lido.success) {
    return { ok: false, erros: errosPorCampo(lido.error), valores };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims.sub;
  if (!userId) {
    return {
      ok: false,
      erros: { geral: "Sua sessão acabou. Entre de novo para salvar." },
      valores,
    };
  }

  const { error } = await supabase.from("perfis").update({ nome: lido.data.nome }).eq("id", userId);
  if (error) {
    return {
      ok: false,
      erros: { geral: "Não deu pra salvar o nome agora. Confira sua internet e tente de novo." },
      valores,
    };
  }

  // O nome aparece no cabeçalho e em listas de todas as páginas autenticadas.
  revalidatePath("/", "layout");
  return { ok: true, mensagem: "Nome atualizado." };
}

export async function salvarAvatarPerfil(cor: string, icone: string): Promise<Resultado> {
  const lido = avatarPerfilSchema.safeParse({ cor, icone });
  if (!lido.success) return { ok: false, erro: "Escolha uma cor e um ícone disponíveis." };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims.sub;
  if (!userId) return { ok: false, erro: "Sua sessão acabou. Entre de novo para salvar o avatar." };

  const { error } = await supabase
    .from("perfis")
    .update({ cor: lido.data.cor, icone_avatar: lido.data.icone })
    .eq("id", userId);
  if (error) {
    // 23514: o banco ainda não conhece esse ícone (falta a migration do avatar). Sem jargão na tela.
    return {
      ok: false,
      erro:
        error.code === "23514"
          ? "Esse ícone ainda não está disponível. Escolha outro ou avise quem administra o Uni-vos."
          : "Não deu pra salvar o avatar. Confira sua internet e tente de novo.",
    };
  }

  revalidatePath("/", "layout");
  return { ok: true, dados: undefined };
}

export async function salvarSenhaPerfil(
  _anterior: EstadoForm<"senha" | "confirmar">,
  form: FormData,
): Promise<EstadoForm<"senha" | "confirmar">> {
  const valores = {
    senha: String(form.get("senha") ?? ""),
    confirmar: String(form.get("confirmar") ?? ""),
  };
  const lido = novaSenhaSchema.safeParse(valores);
  if (!lido.success) {
    return { ok: false, erros: errosPorCampo(lido.error), valores: {} };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims.sub) {
    return {
      ok: false,
      erros: { geral: "Sua sessão acabou. Entre de novo para trocar a senha." },
      valores: {},
    };
  }

  const { error } = await supabase.auth.updateUser({ password: lido.data.senha });
  if (error) {
    const senha =
      error.code === "same_password"
        ? "Essa já é sua senha atual. Escolha uma diferente."
        : error.code === "weak_password"
          ? "Essa senha é fácil de adivinhar. Misture letras, números e símbolos."
          : undefined;
    return {
      ok: false,
      erros: senha
        ? { senha }
        : { geral: "Não deu pra trocar a senha agora. Confira sua internet e tente de novo." },
      valores: {},
    };
  }

  return { ok: true, mensagem: "Senha atualizada." };
}
