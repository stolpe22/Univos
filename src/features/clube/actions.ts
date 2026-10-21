"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { COOKIE_GRUPO, getClubeAtual, podeModerar } from "./queries";
import { ERRO_REDE, type EstadoForm } from "@/lib/resultado";
import { conviteSchema, rotuloConviteSchema } from "./schemas";

// Reexportado para quem já importava daqui; a definição é a de lib/resultado.ts.
export type { EstadoForm } from "@/lib/resultado";

/** Entra pelo link colado na tela de boas-vindas. */
export async function entrarComConvite(
  _anterior: EstadoForm<"convite">,
  form: FormData,
): Promise<EstadoForm<"convite">> {
  const convite = String(form.get("convite") ?? "");
  const lido = conviteSchema.safeParse({ convite });
  if (!lido.success) {
    return { ok: false, erros: { convite: lido.error.issues[0]?.message }, valores: { convite } };
  }
  return entrar(lido.data.convite, { convite });
}

/** Botão "Entrar no grupo" da página /convite/<codigo>. */
export async function aceitarConvite(codigo: string) {
  const resultado = await entrar(codigo, {});
  if (resultado && !resultado.ok) redirect(`/convite/${codigo}?erro=1`);
}

async function entrar(codigo: string, valores: { convite?: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("entrar_no_clube", { codigo });
  if (error) return { ok: false as const, erros: { geral: ERRO_REDE }, valores };
  if (!data) {
    return {
      ok: false as const,
      erros: {
        convite: "Esse convite não vale mais. Peça um link novo pra quem modera o grupo.",
      },
      valores,
    };
  }
  // Abre direto o grupo em que acabou de entrar.
  (await cookies()).set(COOKIE_GRUPO, data as string, { path: "/", sameSite: "lax" });
  revalidatePath("/", "layout");
  redirect("/inicio");
}

const uuidSchema = z.uuid();

/** "Trocar de grupo": guarda a escolha num cookie. A RLS garante que só abre grupo permitido. */
export async function trocarGrupo(id: string) {
  const lido = uuidSchema.safeParse(id);
  if (lido.success) {
    (await cookies()).set(COOKIE_GRUPO, lido.data, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  revalidatePath("/", "layout");
  redirect("/inicio");
}

/** Gera um link de convite para o grupo aberto agora. O banco confere se é moderador ou dono. */
export async function criarConvite(
  _anterior: EstadoForm<"rotulo">,
  form: FormData,
): Promise<EstadoForm<"rotulo">> {
  const rotulo = String(form.get("rotulo") ?? "");
  const lido = rotuloConviteSchema.safeParse({ rotulo });
  if (!lido.success) {
    return { ok: false, erros: { rotulo: lido.error.issues[0]?.message }, valores: { rotulo } };
  }

  const clube = await getClubeAtual();
  if (!clube || !podeModerar(clube)) {
    return {
      ok: false,
      erros: { geral: "Só quem modera o grupo pode gerar convites." },
      valores: { rotulo },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("criar_convite", {
    clube: clube.id,
    rotulo: lido.data.rotulo,
  });
  if (error) {
    const geral =
      error.code === "42501" ? "Só quem modera o grupo pode gerar convites." : ERRO_REDE;
    return { ok: false, erros: { geral }, valores: { rotulo } };
  }

  revalidatePath("/membros");
  return { ok: true, mensagem: `Link “${lido.data.rotulo}” gerado. Toque em Copiar.` };
}

const idSchema = z.number().int().positive();

/** Desativa (ou reativa, no Desfazer) um link. Quem já entrou continua no grupo. */
export async function desativarConvite(id: number, desativar = true): Promise<{ ok: boolean }> {
  const lido = idSchema.safeParse(id);
  if (!lido.success) return { ok: false };

  const supabase = await createClient();
  const { error } = await supabase.rpc("desativar_convite", {
    convite: lido.data,
    desativar,
  });
  if (error) return { ok: false };

  revalidatePath("/membros");
  return { ok: true };
}
