"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getClubeAtual, podeModerar } from "@/features/clube/queries";
import { DUPLICADO, ERRO_REDE, type EstadoForm, type Resultado } from "@/lib/resultado";
import { hojeLocal } from "@/lib/datas";
import { createClient } from "@/lib/supabase/server";
import {
  getLivroAtual,
  listarComentarios,
  posicionarComentarios,
  type ComentarioPosicionado,
} from "./queries";
import { comentarioSchema, metaSchema, paginaSchema } from "./schemas";

function revalidar() {
  revalidatePath("/estante");
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

  const supabase = await createClient();
  const { data: antes } = await supabase
    .from("progresso_leitura")
    .select("pagina, paginas_edicao, edicao_confirmada, status, atualizado_em")
    .eq("livro_id", livro.id)
    .eq("user_id", clube.uid)
    .maybeSingle();
  // Sem exemplar cadastrado em Meus livros não há progresso: lá a pessoa informa a edição.
  if (!antes?.edicao_confirmada) {
    return {
      ok: false,
      erros: { geral: "Cadastre seu exemplar em Meus livros antes de marcar a página." },
      valores,
    };
  }
  const paginasEdicao = antes.paginas_edicao as number;
  const lido = paginaSchema(paginasEdicao).safeParse(valores.pagina === "" ? NaN : valores.pagina);
  if (!lido.success) {
    return { ok: false, erros: { pagina: lido.error.issues[0]?.message }, valores };
  }

  const { error } = await supabase.from("progresso_leitura").upsert({
    livro_id: livro.id,
    user_id: clube.uid,
    paginas_edicao: paginasEdicao,
    edicao_confirmada: true,
    pagina: lido.data,
    status: lido.data >= paginasEdicao ? "lido" : lido.data > 0 ? "lendo" : "nao_lido",
    atualizado_em: new Date().toISOString(),
  });
  if (error) return { ok: false, erros: { geral: ERRO_REDE }, valores };

  revalidar();
  return {
    ok: true,
    mensagem: `Página ${lido.data} salva.`,
    desfazer: {
      livro: livro.id,
      anterior: antes
        ? {
            pagina: antes.pagina as number,
            paginasEdicao: antes.paginas_edicao as number,
            edicaoConfirmada: antes.edicao_confirmada as boolean,
            status: antes.status as "nao_lido" | "lendo" | "lido",
            atualizadoEm: antes.atualizado_em as string,
          }
        : null,
    },
  };
}

/** Desfazer: volta a página anterior. */
export async function voltarPagina(
  livroId: number,
  anterior: {
    pagina: number;
    paginasEdicao: number;
    edicaoConfirmada: boolean;
    status: "nao_lido" | "lendo" | "lido";
    atualizadoEm: string;
  } | null,
): Promise<Resultado> {
  const ids = z.object({ livroId: z.number().int().positive() });
  if (!ids.safeParse({ livroId }).success) return { ok: false, erro: ERRO_REDE };
  const clube = await getClubeAtual();
  if (!clube) return { ok: false, erro: ERRO_REDE };

  const supabase = await createClient();
  const { error } = anterior
    ? await supabase.from("progresso_leitura").upsert({
        livro_id: livroId,
        user_id: clube.uid,
        pagina: anterior.pagina,
        paginas_edicao: anterior.paginasEdicao,
        edicao_confirmada: anterior.edicaoConfirmada,
        status: anterior.status,
        atualizado_em: anterior.atualizadoEm,
      })
    : await supabase
        .from("progresso_leitura")
        .delete()
        .eq("livro_id", livroId)
        .eq("user_id", clube.uid);
  if (error) return { ok: false, erro: ERRO_REDE };
  revalidar();
  return { ok: true, dados: undefined };
}

const idSchema = z.number().int().positive();

/** O que o Desfazer precisa para recolocar um comentário apagado do jeito que era. */
const comentarioSalvoSchema = z.object({
  livro_id: idSchema,
  pagina: z.number().int().min(0),
  texto: comentarioSchema.shape.texto,
  situacao: z.enum(["nao_lido", "lendo", "lido"]),
  paginas_edicao: z.number().int().min(1).max(30000).nullable(),
});
type ComentarioSalvo = z.infer<typeof comentarioSalvoSchema>;
const CAMPOS_COMENTARIO = "livro_id, pagina, texto, situacao, paginas_edicao";

function revalidarComentarios(livroId: number) {
  revalidatePath("/livro");
  revalidatePath(`/estante/${livroId}`);
}

/**
 * Comenta em qualquer livro do grupo. Guarda como está a leitura de quem escreve agora
 * (antes de ler, lendo na pág. X, depois de ler): é a base do "sem spoiler" e do selo
 * que aparece no comentário.
 */
export async function comentar(
  _anterior: EstadoForm<"texto">,
  form: FormData,
): Promise<EstadoForm<"texto">> {
  const valores = { texto: String(form.get("texto") ?? "") };
  const lido = comentarioSchema.safeParse(valores);
  if (!lido.success) return { ok: false, erros: { texto: lido.error.issues[0]?.message }, valores };
  const livroId = idSchema.safeParse(Number(form.get("livroId")));
  const clube = await getClubeAtual();
  if (!livroId.success || !clube) return { ok: false, erros: { geral: ERRO_REDE }, valores };

  const supabase = await createClient();
  const { data: progresso } = await supabase
    .from("progresso_leitura")
    .select("pagina, paginas_edicao, status, edicao_confirmada")
    .eq("livro_id", livroId.data)
    .eq("user_id", clube.uid)
    .maybeSingle();
  // sem exemplar cadastrado, o comentário é de quem ainda não leu
  const comExemplar = progresso?.edicao_confirmada === true;

  // a RLS só deixa comentar em livro do grupo de quem está logado
  const { data, error } = await supabase
    .from("comentarios")
    .insert({
      livro_id: livroId.data,
      pagina: comExemplar ? progresso.pagina : 0,
      paginas_edicao: comExemplar ? progresso.paginas_edicao : null,
      situacao: comExemplar ? progresso.status : "nao_lido",
      texto: lido.data.texto,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, erros: { geral: ERRO_REDE }, valores };

  revalidarComentarios(livroId.data);
  return { ok: true, mensagem: "Comentário publicado.", desfazer: data.id };
}

/** Apaga o próprio comentário. Devolve o conteúdo para o Desfazer recolocar. */
export async function apagarComentario(id: number): Promise<Resultado<ComentarioSalvo>> {
  if (!idSchema.safeParse(id).success) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comentarios")
    .delete()
    .eq("id", id)
    .select(CAMPOS_COMENTARIO)
    .single();
  if (error || !data) return { ok: false, erro: "Não deu pra apagar agora. Tente de novo." };
  const salvo = data as ComentarioSalvo;
  revalidarComentarios(salvo.livro_id);
  return { ok: true, dados: salvo };
}

/**
 * Comentários de um livro para a prévia (só leitura) que abre no card da Estante.
 * Carrega só quando a pessoa abre a prévia; a RLS limita aos livros do grupo dela.
 */
export async function verComentarios(livroId: number): Promise<Resultado<ComentarioPosicionado[]>> {
  if (!idSchema.safeParse(livroId).success) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const [comentarios, { data: livro }, { data: edicoes }] = await Promise.all([
    listarComentarios(livroId),
    supabase.from("livros").select("paginas").eq("id", livroId).maybeSingle(),
    supabase
      .from("progresso_leitura")
      .select("user_id, paginas_edicao")
      .eq("livro_id", livroId)
      .eq("edicao_confirmada", true),
  ]);
  if (!livro) return { ok: false, erro: "Não deu pra abrir os comentários agora." };
  const porPessoa = (edicoes ?? []).map((e) => ({
    id: e.user_id as string,
    paginasEdicao: e.paginas_edicao as number,
  }));
  return { ok: true, dados: posicionarComentarios(comentarios, porPessoa, livro.paginas) };
}

/** Desfazer de publicar (apaga) ou de apagar (recoloca). */
export async function desfazerComentario(
  acao: { apagar: number } | { recolocar: ComentarioSalvo },
): Promise<Resultado> {
  const supabase = await createClient();
  if ("apagar" in acao) {
    if (!idSchema.safeParse(acao.apagar).success) return { ok: false, erro: ERRO_REDE };
    const { data, error } = await supabase
      .from("comentarios")
      .delete()
      .eq("id", acao.apagar)
      .select("livro_id")
      .single();
    if (error || !data) return { ok: false, erro: ERRO_REDE };
    revalidarComentarios(data.livro_id as number);
  } else {
    const lido = comentarioSalvoSchema.safeParse(acao.recolocar);
    if (!lido.success) return { ok: false, erro: ERRO_REDE };
    const { error } = await supabase.from("comentarios").insert(lido.data);
    if (error) return { ok: false, erro: ERRO_REDE };
    revalidarComentarios(lido.data.livro_id);
  }
  return { ok: true, dados: undefined };
}

/** Define a meta (texto + prazo) do livro da vez. Moderador; a anterior fica no histórico. */
export async function definirMeta(
  _anterior: EstadoForm<"texto" | "prazo">,
  form: FormData,
): Promise<EstadoForm<"texto" | "prazo">> {
  const valores = {
    texto: String(form.get("texto") ?? ""),
    prazo: String(form.get("prazo") ?? ""),
  };
  const clube = await getClubeAtual();
  const livro = clube && (await getLivroAtual(clube.id));
  if (!clube || !livro || !podeModerar(clube)) {
    return { ok: false, erros: { geral: "Só quem modera o grupo define a meta." }, valores };
  }
  const lido = metaSchema(hojeLocal()).safeParse(valores);
  if (!lido.success) {
    const erros: Record<string, string> = {};
    for (const i of lido.error.issues) erros[String(i.path[0])] ??= i.message;
    return { ok: false, erros, valores };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("metas")
    .insert({ livro_id: livro.id, texto: lido.data.texto, prazo: lido.data.prazo });
  if (error) return { ok: false, erros: { geral: ERRO_REDE }, valores };

  revalidar();
  return { ok: true, mensagem: `Meta definida: ${lido.data.texto}.` };
}

/** Tira a meta valendo. Devolve texto e prazo para o Desfazer recriar. */
export async function removerMeta(
  id: number,
): Promise<Resultado<{ texto: string; prazo: string }>> {
  const clube = await getClubeAtual();
  if (!idSchema.safeParse(id).success || !clube || !podeModerar(clube)) {
    return { ok: false, erro: "Só quem modera o grupo tira a meta." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("metas")
    .delete()
    .eq("id", id)
    .select("texto, prazo")
    .single();
  if (error || !data) return { ok: false, erro: ERRO_REDE };
  revalidar();
  return { ok: true, dados: data as { texto: string; prazo: string } };
}

/** Desfazer de "Tirar a meta" (quem já tinha chegado precisa marcar de novo). */
export async function recolocarMeta(meta: { texto: string; prazo: string }): Promise<Resultado> {
  const clube = await getClubeAtual();
  const livro = clube && (await getLivroAtual(clube.id));
  // O prazo pode ter passado entre tirar e desfazer: aceita o que já existia.
  const lido = metaSchema("0000-01-01").safeParse(meta);
  if (!clube || !livro || !lido.success) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { error } = await supabase.from("metas").insert({ livro_id: livro.id, ...lido.data });
  if (error) return { ok: false, erro: ERRO_REDE };
  revalidar();
  return { ok: true, dados: undefined };
}

/** "Cheguei!" (ou desmarcar). */
export async function marcarMeta(metaId: number, cheguei: boolean): Promise<Resultado> {
  const clube = await getClubeAtual();
  if (!idSchema.safeParse(metaId).success || !clube) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { error } = cheguei
    ? await supabase.from("metas_alcancadas").upsert({ meta_id: metaId, user_id: clube.uid })
    : await supabase
        .from("metas_alcancadas")
        .delete()
        .eq("meta_id", metaId)
        .eq("user_id", clube.uid);
  if (error) return { ok: false, erro: "Não deu pra marcar agora. Tente de novo." };
  revalidar();
  return { ok: true, dados: undefined };
}

/** Termina o livro da vez: ele fica marcado como lido pelo grupo e não sai da Estante. Moderador. */
export async function terminarLivro(): Promise<Resultado> {
  const clube = await getClubeAtual();
  if (!clube || !podeModerar(clube)) {
    return { ok: false, erro: "Só quem modera o grupo termina o livro da vez." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("terminar_livro", { clube: clube.id });
  if (error) return { ok: false, erro: ERRO_REDE };
  revalidatePath("/", "layout");
  return { ok: true, dados: undefined };
}

/** Começa um livro da Estante como livro da vez, depois que o grupo combinou. Moderador. */
export async function escolherLivro(id: number): Promise<Resultado> {
  const clube = await getClubeAtual();
  if (!z.number().int().positive().safeParse(id).success || !clube) {
    return { ok: false, erro: ERRO_REDE };
  }
  if (!podeModerar(clube)) {
    return { ok: false, erro: "Só quem modera o grupo escolhe o livro da vez." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("escolher_livro", { livro: id });
  if (error?.code === DUPLICADO) {
    return { ok: false, erro: "O grupo já tem livro da vez. Termine ele no Livro da vez antes." };
  }
  if (error) return { ok: false, erro: ERRO_REDE };
  revalidatePath("/", "layout");
  return { ok: true, dados: undefined };
}
