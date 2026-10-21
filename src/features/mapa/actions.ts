"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getClubeAtual } from "@/features/clube/queries";
import { ERRO_REDE, type Resultado } from "@/lib/resultado";
import { createClient } from "@/lib/supabase/server";
import { AFIRMACOES, pontuar } from "./afirmacoes";
import { novaSemente } from "./ordem";

function revalidar() {
  revalidatePath("/mapa");
  revalidatePath("/membros");
  revalidatePath("/inicio");
}

/** Começa (ou retoma): garante a semente da ordem embaralhada e devolve ela. */
export async function comecarQuiz(): Promise<Resultado<number>> {
  const clube = await getClubeAtual();
  if (!clube) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_ordem")
    .select("semente")
    .eq("user_id", clube.uid)
    .maybeSingle();
  if (data) return { ok: true, dados: data.semente as number };

  const semente = novaSemente();
  const { error } = await supabase.from("quiz_ordem").insert({ semente });
  if (error) return { ok: false, erro: ERRO_REDE };
  return { ok: true, dados: semente };
}

const respostaSchema = z.object({
  afirmacao: z
    .number()
    .int()
    .min(0)
    .max(AFIRMACOES.length - 1),
  valor: z.number().int().min(1).max(5),
});

/**
 * Salva uma resposta. Quando as 40 estão respondidas, calcula e salva o resultado
 * (no servidor, a partir do que está no banco).
 */
export async function responder(
  afirmacao: number,
  valor: number,
): Promise<Resultado<{ concluido: boolean }>> {
  const lido = respostaSchema.safeParse({ afirmacao, valor });
  const clube = await getClubeAtual();
  if (!lido.success || !clube) return { ok: false, erro: ERRO_REDE };

  const supabase = await createClient();
  const { error } = await supabase.from("quiz_respostas").upsert({
    user_id: clube.uid,
    afirmacao: lido.data.afirmacao,
    valor: lido.data.valor,
    respondido_em: new Date().toISOString(),
  });
  if (error) return { ok: false, erro: "Não deu pra salvar a resposta. Confira sua internet." };

  const { data: todas } = await supabase
    .from("quiz_respostas")
    .select("afirmacao, valor")
    .eq("user_id", clube.uid);
  const respostas = Object.fromEntries(
    ((todas ?? []) as { afirmacao: number; valor: number }[]).map((r) => [r.afirmacao, r.valor]),
  );
  if (Object.keys(respostas).length < AFIRMACOES.length) {
    return { ok: true, dados: { concluido: false } };
  }

  const { data: ordem } = await supabase
    .from("quiz_ordem")
    .select("semente")
    .eq("user_id", clube.uid)
    .maybeSingle();
  const { error: erroResultado } = await supabase.from("quiz_resultados").upsert({
    user_id: clube.uid,
    ...pontuar(respostas),
    semente: (ordem?.semente as number | undefined) ?? 1,
    atualizado_em: new Date().toISOString(),
  });
  if (erroResultado) return { ok: false, erro: ERRO_REDE };

  revalidar();
  return { ok: true, dados: { concluido: true } };
}

/** "Apagar e refazer": some com respostas, resultado e ordem. Pede confirmação na tela. */
export async function refazerQuiz(): Promise<Resultado> {
  const clube = await getClubeAtual();
  if (!clube) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const resultados = await Promise.all([
    supabase.from("quiz_respostas").delete().eq("user_id", clube.uid),
    supabase.from("quiz_resultados").delete().eq("user_id", clube.uid),
    supabase.from("quiz_ordem").delete().eq("user_id", clube.uid),
  ]);
  if (resultados.some((r) => r.error)) return { ok: false, erro: ERRO_REDE };
  revalidar();
  return { ok: true, dados: undefined };
}
