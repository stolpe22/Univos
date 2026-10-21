"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getClubeAtual } from "@/features/clube/queries";
import { DUPLICADO, ERRO_REDE, type EstadoForm, type Resultado } from "@/lib/resultado";
import { createClient } from "@/lib/supabase/server";

const temaSchema = z
  .string()
  .trim()
  .min(2, "Digite o tema que você quer debater, ex: Renda básica universal.")
  .max(120, "O tema pode ter até 120 caracteres. Tente resumir.");
const idSchema = z.number().int().positive();

async function inserir(tema: string) {
  const clube = await getClubeAtual();
  if (!clube) return { error: { code: "sem-grupo" }, data: null };
  const supabase = await createClient();
  const r = await supabase.from("temas").insert({ clube_id: clube.id, tema }).select("id").single();
  if (r.data) await supabase.from("votos_tema").insert({ tema_id: r.data.id });
  return r;
}

/** Propõe um tema (sem duplicado: o banco ignora caixa e acento) e já vota nele. */
export async function proporTema(
  _anterior: EstadoForm<"tema">,
  form: FormData,
): Promise<EstadoForm<"tema">> {
  const valores = { tema: String(form.get("tema") ?? "") };
  const lido = temaSchema.safeParse(valores.tema);
  if (!lido.success) return { ok: false, erros: { tema: lido.error.issues[0]?.message }, valores };

  const { data, error } = await inserir(lido.data);
  if (error?.code === DUPLICADO) {
    return {
      ok: false,
      erros: { tema: "Esse tema já está na pauta. Vote nele na lista." },
      valores,
    };
  }
  if (error || !data) return { ok: false, erros: { geral: ERRO_REDE }, valores };

  revalidatePath("/pauta");
  return { ok: true, mensagem: "Tema proposto.", desfazer: data.id };
}

/** Tira o tema da pauta (quem propôs ou moderador). Devolve o texto para o Desfazer. */
export async function tirarTema(id: number): Promise<Resultado<string>> {
  if (!idSchema.safeParse(id).success) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("temas")
    .delete()
    .eq("id", id)
    .select("tema")
    .single();
  if (error || !data) return { ok: false, erro: "Não deu pra tirar agora. Tente de novo." };
  revalidatePath("/pauta");
  return { ok: true, dados: data.tema as string };
}

/** Desfazer de "Tirar da pauta": propõe de novo (os votos antigos não voltam). */
export async function voltarTema(tema: string): Promise<Resultado> {
  const lido = temaSchema.safeParse(tema);
  if (!lido.success) return { ok: false, erro: ERRO_REDE };
  const { error } = await inserir(lido.data);
  if (error) return { ok: false, erro: ERRO_REDE };
  revalidatePath("/pauta");
  return { ok: true, dados: undefined };
}

export async function votarTema(id: number, votar: boolean): Promise<{ ok: boolean }> {
  if (!idSchema.safeParse(id).success) return { ok: false };
  const clube = await getClubeAtual();
  if (!clube) return { ok: false };
  const supabase = await createClient();
  const { error } = votar
    ? await supabase.from("votos_tema").insert({ tema_id: id })
    : await supabase.from("votos_tema").delete().eq("tema_id", id).eq("user_id", clube.uid);
  if (error && error.code !== DUPLICADO) return { ok: false };
  revalidatePath("/pauta");
  return { ok: true };
}
