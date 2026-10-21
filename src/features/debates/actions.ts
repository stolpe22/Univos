"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getClubeAtual } from "@/features/clube/queries";
import { ERRO_REDE, type EstadoForm, type Resultado } from "@/lib/resultado";
import { createClient } from "@/lib/supabase/server";
import { conclusaoSchema, debateSchema, perguntaSchema, comentarioDebateSchema } from "./schemas";
import type { TipoEnquete } from "./enquete";

const idSchema = z.number().int().positive();

function revalidar() {
  revalidatePath("/debates");
  revalidatePath("/inicio");
}

function revalidarDebate(id: number) {
  revalidatePath("/debates");
  revalidatePath(`/debates/${id}`);
}

type CamposDebate = "tema" | "data" | "formato";

/** Marca um debate (data no futuro) e já confirma a presença de quem marcou. */
export async function marcarDebate(
  _anterior: EstadoForm<CamposDebate>,
  form: FormData,
): Promise<EstadoForm<CamposDebate>> {
  const valores = {
    tema: String(form.get("tema") ?? ""),
    data: String(form.get("data") ?? ""),
    formato: String(form.get("formato") ?? ""),
  };
  const lido = debateSchema().safeParse(valores);
  if (!lido.success) {
    const erros: Record<string, string> = {};
    for (const i of lido.error.issues) erros[String(i.path[0])] ??= i.message;
    return { ok: false, erros, valores };
  }

  const clube = await getClubeAtual();
  if (!clube) return { ok: false, erros: { geral: ERRO_REDE }, valores };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("debates")
    .insert({
      clube_id: clube.id,
      tema: lido.data.tema,
      data: lido.data.data.toISOString(),
      formato: lido.data.formato,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, erros: { geral: ERRO_REDE }, valores };

  await supabase.from("presencas").insert({ debate_id: data.id });
  revalidar();
  return { ok: true, mensagem: "Debate marcado.", desfazer: data.id };
}

/** Desfazer de "Marcar debate". */
export async function desmarcarDebate(id: number): Promise<Resultado> {
  if (!idSchema.safeParse(id).success) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { error } = await supabase.from("debates").delete().eq("id", id);
  if (error) return { ok: false, erro: ERRO_REDE };
  revalidar();
  return { ok: true, dados: undefined };
}

/** "Vou participar" (ou cancelar). */
export async function presenca(debateId: number, vou: boolean): Promise<Resultado> {
  if (!idSchema.safeParse(debateId).success) return { ok: false, erro: ERRO_REDE };
  const clube = await getClubeAtual();
  if (!clube) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { error } = vou
    ? await supabase.from("presencas").upsert({ debate_id: debateId, user_id: clube.uid })
    : await supabase.from("presencas").delete().eq("debate_id", debateId).eq("user_id", clube.uid);
  if (error) return { ok: false, erro: "Não deu pra salvar sua presença agora. Tente de novo." };
  revalidar();
  return { ok: true, dados: undefined };
}

/** Marca como em andamento ou encerra. Quem marcou ou moderador (a RLS confere). */
export async function mudarFase(
  debateId: number,
  fase: "ao_vivo" | "encerrado",
): Promise<Resultado> {
  const lido = z
    .object({ id: idSchema, fase: z.enum(["ao_vivo", "encerrado"]) })
    .safeParse({ id: debateId, fase });
  if (!lido.success) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("debates")
    .update({ status: lido.data.fase })
    .eq("id", lido.data.id)
    .select("id");
  if (error || !data?.length) {
    return { ok: false, erro: "Só quem marcou o debate ou quem modera pode fazer isso." };
  }
  revalidar();
  return { ok: true, dados: undefined };
}

/** Qualquer membro propõe a pergunta; fica esperando um moderador aprovar. */
export async function proporEnquete(
  debateId: number,
  tipo: TipoEnquete,
  _anterior: EstadoForm<"pergunta">,
  form: FormData,
): Promise<EstadoForm<"pergunta">> {
  const valores = { pergunta: String(form.get("pergunta") ?? "") };
  const lido = perguntaSchema.safeParse(valores);
  if (
    !lido.success ||
    !idSchema.safeParse(debateId).success ||
    !z.enum(["inicial", "pos_debate"]).safeParse(tipo).success
  ) {
    return {
      ok: false,
      erros: { pergunta: lido.error?.issues[0]?.message ?? ERRO_REDE },
      valores,
    };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("enquetes")
    .insert({ debate_id: debateId, pergunta: lido.data.pergunta, tipo });
  if (error) {
    const msg =
      error.code === "23505" ? "Já existe uma enquete deste tipo para esse debate." : ERRO_REDE;
    return { ok: false, erros: { geral: msg }, valores };
  }
  revalidatePath("/debates");
  revalidatePath("/debates/[id]", "page");
  return {
    ok: true,
    mensagem:
      tipo === "inicial"
        ? "Pergunta inicial enviada. Um moderador precisa aprovar."
        : "Enquete de posicionamento enviada. Um moderador precisa aprovar.",
  };
}

/** Quem propôs retira (enquanto ninguém decidiu) ou moderador apaga. */
export async function retirarEnquete(id: number): Promise<Resultado> {
  if (!idSchema.safeParse(id).success) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { data, error } = await supabase.from("enquetes").delete().eq("id", id).select("id");
  if (error || !data?.length)
    return { ok: false, erro: "Não deu pra retirar agora. Tente de novo." };
  revalidatePath("/debates");
  revalidatePath("/debates/[id]", "page");
  return { ok: true, dados: undefined };
}

export async function decidirEnquete(id: number, aprovar: boolean): Promise<Resultado> {
  if (!idSchema.safeParse(id).success) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { error } = await supabase.rpc("decidir_enquete", { enquete: id, aprovar });
  if (error) {
    return {
      ok: false,
      erro:
        error.code === "42501"
          ? "Só quem modera o grupo aprova enquetes."
          : "Essa enquete já foi decidida. Recarregue a página.",
    };
  }
  revalidatePath("/debates");
  revalidatePath("/debates/[id]", "page");
  return { ok: true, dados: undefined };
}

/** Vota (ou tira o voto, com posicao = null). O banco confere a fase do debate. */
export async function votarEnquete(
  enqueteId: number,
  momento: "antes" | "depois",
  posicao: "a_favor" | "contra" | "nenhum_dos_dois" | null,
): Promise<Resultado> {
  const lido = z
    .object({
      id: idSchema,
      momento: z.enum(["antes", "depois"]),
      posicao: z.enum(["a_favor", "contra", "nenhum_dos_dois"]).nullable(),
    })
    .safeParse({ id: enqueteId, momento, posicao });
  const clube = await getClubeAtual();
  if (!lido.success || !clube) return { ok: false, erro: ERRO_REDE };

  const supabase = await createClient();
  const { error } = lido.data.posicao
    ? await supabase.from("votos_enquete").upsert({
        enquete_id: lido.data.id,
        user_id: clube.uid,
        momento: lido.data.momento,
        posicao: lido.data.posicao,
        votado_em: new Date().toISOString(),
      })
    : await supabase
        .from("votos_enquete")
        .delete()
        .eq("enquete_id", lido.data.id)
        .eq("user_id", clube.uid)
        .eq("momento", lido.data.momento);
  if (error) {
    return {
      ok: false,
      erro: "Essa votação já fechou ou não deu pra salvar. Recarregue a página.",
    };
  }
  revalidatePath("/debates");
  revalidatePath("/debates/[id]", "page");
  return { ok: true, dados: undefined };
}

/** Propõe uma conclusão alternativa; qualquer membro pode enviar antes ou depois. */
export async function proporConclusao(
  enqueteId: number,
  _anterior: EstadoForm<"texto">,
  form: FormData,
): Promise<EstadoForm<"texto">> {
  const valores = { texto: String(form.get("texto") ?? "") };
  const lido = conclusaoSchema.safeParse(valores);
  if (!lido.success || !idSchema.safeParse(enqueteId).success) {
    return {
      ok: false,
      erros: { texto: lido.error?.issues[0]?.message ?? ERRO_REDE },
      valores,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("conclusoes_debate")
    .insert({ enquete_id: enqueteId, texto: lido.data.texto });
  if (error) return { ok: false, erros: { geral: ERRO_REDE }, valores };
  revalidatePath("/debates");
  revalidatePath("/debates/[id]", "page");
  return { ok: true, mensagem: "Conclusão proposta. O grupo já pode votar nela." };
}

/** Vota ou troca o voto em uma conclusão; null remove o voto. */
export async function votarConclusao(
  conclusaoId: number,
  posicao: "concordo" | "discordo" | null,
): Promise<Resultado> {
  const lido = z
    .object({ id: idSchema, posicao: z.enum(["concordo", "discordo"]).nullable() })
    .safeParse({ id: conclusaoId, posicao });
  const clube = await getClubeAtual();
  if (!lido.success || !clube) return { ok: false, erro: ERRO_REDE };

  const supabase = await createClient();
  const { error } = lido.data.posicao
    ? await supabase.from("votos_conclusao").upsert({
        conclusao_id: lido.data.id,
        user_id: clube.uid,
        posicao: lido.data.posicao,
        votado_em: new Date().toISOString(),
      })
    : await supabase
        .from("votos_conclusao")
        .delete()
        .eq("conclusao_id", lido.data.id)
        .eq("user_id", clube.uid);
  if (error) return { ok: false, erro: "Não deu pra salvar seu voto. Tente de novo." };
  revalidatePath("/debates");
  revalidatePath("/debates/[id]", "page");
  return { ok: true, dados: undefined };
}

/** Publica um comentário na página específica do debate. */
export async function comentarDebate(
  debateId: number,
  _anterior: EstadoForm<"texto">,
  form: FormData,
): Promise<EstadoForm<"texto">> {
  const valores = { texto: String(form.get("texto") ?? "") };
  const lido = comentarioDebateSchema.safeParse(valores);
  if (!lido.success || !idSchema.safeParse(debateId).success) {
    return { ok: false, erros: { texto: lido.error?.issues[0]?.message ?? ERRO_REDE }, valores };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comentarios_debate")
    .insert({ debate_id: debateId, texto: lido.data.texto })
    .select("id")
    .single();
  if (error || !data) return { ok: false, erros: { geral: ERRO_REDE }, valores };
  revalidarDebate(debateId);
  return { ok: true, mensagem: "Comentário publicado.", desfazer: data.id };
}

/** Apaga o próprio comentário (ou moderador). Devolve o texto para o Desfazer recolocar. */
export async function apagarComentarioDebate(
  id: number,
  debateId: number,
): Promise<Resultado<{ texto: string }>> {
  if (!idSchema.safeParse(id).success || !idSchema.safeParse(debateId).success) {
    return { ok: false, erro: ERRO_REDE };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comentarios_debate")
    .delete()
    .eq("id", id)
    .eq("debate_id", debateId)
    .select("texto")
    .single();
  if (error || !data) return { ok: false, erro: "Não deu pra apagar o comentário agora." };
  revalidarDebate(debateId);
  return { ok: true, dados: { texto: data.texto as string } };
}

/** Desfazer de "Apagar": publica o mesmo texto de novo. */
export async function recolocarComentarioDebate(
  debateId: number,
  texto: string,
): Promise<Resultado> {
  const lido = comentarioDebateSchema.safeParse({ texto });
  if (!lido.success || !idSchema.safeParse(debateId).success) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { error } = await supabase
    .from("comentarios_debate")
    .insert({ debate_id: debateId, texto: lido.data.texto });
  if (error) return { ok: false, erro: ERRO_REDE };
  revalidarDebate(debateId);
  return { ok: true, dados: undefined };
}
