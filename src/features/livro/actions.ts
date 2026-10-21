"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getClubeAtual, podeModerar } from "@/features/clube/queries";
import { ERRO_REDE, type EstadoForm, type Resultado } from "@/lib/resultado";
import { createClient } from "@/lib/supabase/server";
import { getLivroAtual } from "./queries";
import { comentarioSchema, metaSchema, paginaSchema } from "./schemas";

function revalidar() {
  revalidatePath("/livro");
  revalidatePath("/inicio");
}

/** Salva a página. Devolve a anterior para o Desfazer. */
export async function salvarPagina(
  _anterior: EstadoForm<"pagina">,
  form: FormData,
): Promise<EstadoForm<"pagina">> {
  const valores = { pagina: String(form.get("pagina") ?? "") };
  const clube = await getClubeAtual();
  const livro = clube && (await getLivroAtual(clube.id));
  if (!clube || !livro)
    return { ok: false, erros: { geral: "Não tem livro da vez agora." }, valores };

  const lido = paginaSchema(livro.paginas).safeParse(valores.pagina === "" ? NaN : valores.pagina);
  if (!lido.success) {
    return { ok: false, erros: { pagina: lido.error.issues[0]?.message }, valores };
  }

  const supabase = await createClient();
  const { data: antes } = await supabase
    .from("progresso_leitura")
    .select("pagina")
    .eq("livro_id", livro.id)
    .eq("user_id", clube.uid)
    .maybeSingle();

  const { error } = await supabase.from("progresso_leitura").upsert({
    livro_id: livro.id,
    user_id: clube.uid,
    pagina: lido.data,
    atualizado_em: new Date().toISOString(),
  });
  if (error) return { ok: false, erros: { geral: ERRO_REDE }, valores };

  revalidar();
  const bateuMeta =
    !!livro.meta && lido.data >= livro.meta.pagina && (antes?.pagina ?? 0) < livro.meta.pagina;
  return {
    ok: true,
    mensagem: bateuMeta
      ? `Página ${lido.data} salva. Meta batida! 🎉`
      : `Página ${lido.data} salva.`,
    desfazer: { livro: livro.id, pagina: (antes?.pagina as number | undefined) ?? 0 },
  };
}

/** Desfazer: volta a página anterior. */
export async function voltarPagina(livroId: number, pagina: number): Promise<Resultado> {
  const ids = z.object({ livroId: z.number().int().positive(), pagina: z.number().int().min(0) });
  if (!ids.safeParse({ livroId, pagina }).success) return { ok: false, erro: ERRO_REDE };
  const clube = await getClubeAtual();
  if (!clube) return { ok: false, erro: ERRO_REDE };

  const supabase = await createClient();
  const { error } = await supabase.from("progresso_leitura").upsert({
    livro_id: livroId,
    user_id: clube.uid,
    pagina,
    atualizado_em: new Date().toISOString(),
  });
  if (error) return { ok: false, erro: ERRO_REDE };
  revalidar();
  return { ok: true, dados: undefined };
}

/** Comentário marcado na página atual de quem escreve (base do "sem spoiler"). */
export async function comentar(
  _anterior: EstadoForm<"texto">,
  form: FormData,
): Promise<EstadoForm<"texto">> {
  const valores = { texto: String(form.get("texto") ?? "") };
  const lido = comentarioSchema.safeParse(valores);
  if (!lido.success) return { ok: false, erros: { texto: lido.error.issues[0]?.message }, valores };

  const clube = await getClubeAtual();
  const livro = clube && (await getLivroAtual(clube.id));
  if (!clube || !livro)
    return { ok: false, erros: { geral: "Não tem livro da vez agora." }, valores };

  const supabase = await createClient();
  const { data: progresso } = await supabase
    .from("progresso_leitura")
    .select("pagina")
    .eq("livro_id", livro.id)
    .eq("user_id", clube.uid)
    .maybeSingle();

  const { data, error } = await supabase
    .from("comentarios")
    .insert({ livro_id: livro.id, pagina: progresso?.pagina ?? 0, texto: lido.data.texto })
    .select("id")
    .single();
  if (error || !data) return { ok: false, erros: { geral: ERRO_REDE }, valores };

  revalidatePath("/livro");
  return { ok: true, mensagem: "Comentário publicado.", desfazer: data.id };
}

const idSchema = z.number().int().positive();

/** Apaga o próprio comentário. Devolve o conteúdo para o Desfazer recolocar. */
export async function apagarComentario(
  id: number,
): Promise<Resultado<{ livro_id: number; pagina: number; texto: string }>> {
  if (!idSchema.safeParse(id).success) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comentarios")
    .delete()
    .eq("id", id)
    .select("livro_id, pagina, texto")
    .single();
  if (error || !data) return { ok: false, erro: "Não deu pra apagar agora. Tente de novo." };
  revalidatePath("/livro");
  return { ok: true, dados: data as { livro_id: number; pagina: number; texto: string } };
}

/** Desfazer de publicar (apaga) ou de apagar (recoloca). */
export async function desfazerComentario(
  acao: { apagar: number } | { recolocar: { livro_id: number; pagina: number; texto: string } },
): Promise<Resultado> {
  const supabase = await createClient();
  if ("apagar" in acao) {
    if (!idSchema.safeParse(acao.apagar).success) return { ok: false, erro: ERRO_REDE };
    const { error } = await supabase.from("comentarios").delete().eq("id", acao.apagar);
    if (error) return { ok: false, erro: ERRO_REDE };
  } else {
    const lido = z
      .object({
        livro_id: idSchema,
        pagina: z.number().int().min(0),
        texto: comentarioSchema.shape.texto,
      })
      .safeParse(acao.recolocar);
    if (!lido.success) return { ok: false, erro: ERRO_REDE };
    const { error } = await supabase.from("comentarios").insert(lido.data);
    if (error) return { ok: false, erro: ERRO_REDE };
  }
  revalidatePath("/livro");
  return { ok: true, dados: undefined };
}

/** Meta da semana. Moderador (a RLS de clubes confere). */
export async function definirMeta(
  _anterior: EstadoForm<"pagina" | "prazo">,
  form: FormData,
): Promise<EstadoForm<"pagina" | "prazo">> {
  const valores = {
    pagina: String(form.get("pagina") ?? ""),
    prazo: String(form.get("prazo") ?? ""),
  };
  const clube = await getClubeAtual();
  const livro = clube && (await getLivroAtual(clube.id));
  if (!clube || !livro || !podeModerar(clube)) {
    return { ok: false, erros: { geral: "Só quem modera o grupo define a meta." }, valores };
  }
  const lido = metaSchema(livro.paginas).safeParse({
    pagina: valores.pagina === "" ? NaN : valores.pagina,
    prazo: valores.prazo,
  });
  if (!lido.success) {
    const erros: Record<string, string> = {};
    for (const i of lido.error.issues) erros[String(i.path[0])] ??= i.message;
    return { ok: false, erros, valores };
  }
  const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  if (lido.data.prazo < hoje) {
    return {
      ok: false,
      erros: { prazo: "Esse dia já passou. Escolha hoje ou uma data no futuro." },
      valores,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("clubes")
    .update({ meta_pagina: lido.data.pagina, meta_prazo: lido.data.prazo })
    .eq("id", clube.id);
  if (error) return { ok: false, erros: { geral: ERRO_REDE }, valores };

  revalidar();
  return { ok: true, mensagem: `Meta definida: até a pág. ${lido.data.pagina}.` };
}

/**
 * Termina o livro da vez: ele vai para "Já lidos" e o mais votado da fila assume.
 * Também serve para começar o primeiro livro. Moderador.
 */
export async function avancarLivro(): Promise<Resultado<{ proximo: string | null }>> {
  const clube = await getClubeAtual();
  if (!clube || !podeModerar(clube)) {
    return { ok: false, erro: "Só quem modera o grupo troca o livro da vez." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("avancar_livro", { clube: clube.id });
  if (error) return { ok: false, erro: ERRO_REDE };

  let proximo: string | null = null;
  if (data) {
    const { data: livro } = await supabase.from("livros").select("titulo").eq("id", data).single();
    proximo = (livro?.titulo as string | undefined) ?? null;
  }
  revalidatePath("/", "layout");
  return { ok: true, dados: { proximo } };
}
