"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getClubeAtual } from "@/features/clube/queries";
import { situacaoDaLeitura } from "@/features/livro/regras";
import { DUPLICADO, ERRO_REDE, type EstadoForm, type Resultado } from "@/lib/resultado";
import { createClient } from "@/lib/supabase/server";
import { slug } from "@/lib/texto";
import { categoriaSchema, livroSchema, progressoPessoalSchema, type Categoria } from "./schemas";

type Campos =
  | "titulo"
  | "autor"
  | "paginas"
  | "tema"
  | "tipo"
  | "nivel"
  | "anoPublicacao"
  | "editora"
  | "precoReferencia"
  | "nota";
type CamposLeitura = "livroId" | "paginasEdicao" | "pagina" | "status";
const idSchema = z.number().int().positive();

function paraLivroDb(livro: z.infer<typeof livroSchema>) {
  return {
    titulo: livro.titulo,
    autor: livro.autor,
    paginas: livro.paginas,
    tema: livro.tema ?? null,
    tipo: livro.tipo ?? null,
    nivel: livro.nivel ?? null,
    ano_publicacao: livro.anoPublicacao ?? null,
    editora: livro.editora || null,
    preco_referencia: livro.precoReferencia ?? null,
    nota: livro.nota || null,
  };
}

function paraLivroApp(livro: Record<string, unknown>): z.infer<typeof livroSchema> {
  return {
    titulo: String(livro.titulo ?? ""),
    autor: String(livro.autor ?? ""),
    paginas: Number(livro.paginas),
    tema: livro.tema == null ? undefined : String(livro.tema),
    tipo: livro.tipo == null ? undefined : String(livro.tipo),
    nivel: (livro.nivel as number | null) ?? undefined,
    anoPublicacao: (livro.ano_publicacao as number | null) ?? undefined,
    editora: (livro.editora as string | null) ?? undefined,
    precoReferencia: (livro.preco_referencia as number | null) ?? undefined,
    nota: (livro.nota as string | null) ?? undefined,
  };
}

function revalidar() {
  revalidatePath("/estante");
  revalidatePath("/meus-livros");
  revalidatePath("/livro");
}

/**
 * Sugere um livro (sem duplicado: o banco ignora caixa e acento). Só cadastra: sugerir
 * não é votar. Quem quiser ler, vota nele na estante depois, como todo mundo.
 */
export async function sugerirLivro(
  _anterior: EstadoForm<Campos>,
  form: FormData,
): Promise<EstadoForm<Campos>> {
  const valores = {
    titulo: String(form.get("titulo") ?? ""),
    autor: String(form.get("autor") ?? ""),
    paginas: String(form.get("paginas") ?? ""),
    tema: String(form.get("tema") ?? ""),
    tipo: String(form.get("tipo") ?? ""),
    nivel: String(form.get("nivel") ?? ""),
    anoPublicacao: String(form.get("anoPublicacao") ?? ""),
    editora: String(form.get("editora") ?? ""),
    precoReferencia: String(form.get("precoReferencia") ?? ""),
    nota: String(form.get("nota") ?? ""),
  };
  const lido = livroSchema.safeParse({
    ...valores,
    paginas: valores.paginas === "" ? NaN : valores.paginas,
  });
  if (!lido.success) {
    const erros: Record<string, string> = {};
    for (const i of lido.error.issues) erros[String(i.path[0])] ??= i.message;
    return { ok: false, erros, valores };
  }

  const clube = await getClubeAtual();
  if (!clube) return { ok: false, erros: { geral: ERRO_REDE }, valores };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livros")
    .insert({ clube_id: clube.id, ...paraLivroDb(lido.data) })
    .select("id")
    .single();
  if (error?.code === DUPLICADO) {
    return {
      ok: false,
      erros: { titulo: "Esse livro já está na estante. Procure ele lá e vote se quiser ler." },
      valores,
    };
  }
  if (error || !data) return { ok: false, erros: { geral: ERRO_REDE }, valores };

  revalidar();
  return { ok: true, mensagem: `“${lido.data.titulo}” entrou na estante.`, desfazer: data.id };
}

/** Categorias são globais no catálogo; apenas o dono do sistema pode acrescentá-las. */
/**
 * Cria uma opção do catálogo (tema, tipo ou nível). Só o dono do sistema.
 * Devolve o valor gravado (código do tema, nome do tipo ou número do nível).
 */
async function criarCategoria(
  entrada: unknown,
): Promise<{ ok: true; valor: string; nome: string } | { ok: false; erro: string }> {
  const lido = categoriaSchema.safeParse(entrada);
  if (!lido.success) {
    return { ok: false, erro: lido.error.issues[0]?.message ?? "Digite o nome da categoria." };
  }
  const { categoria, nome } = lido.data;

  const clube = await getClubeAtual();
  if (!clube?.dono)
    return { ok: false, erro: "Só o administrador do sistema cadastra categorias." };

  const supabase = await createClient();
  let resultado: { error: { code?: string } | null };
  let valor: string;
  if (categoria === "tema") {
    valor = slug(nome);
    if (!valor) return { ok: false, erro: "Use letras ou números no nome do tema." };
    resultado = await supabase.from("catalogo_temas").insert({ codigo: valor, nome });
  } else if (categoria === "tipo") {
    valor = nome;
    resultado = await supabase.from("catalogo_tipos").insert({ nome });
  } else {
    const { data: ultimo } = await supabase
      .from("catalogo_niveis")
      .select("nivel")
      .order("nivel", { ascending: false })
      .limit(1)
      .maybeSingle();
    valor = String(Number(ultimo?.nivel ?? 0) + 1);
    resultado = await supabase.from("catalogo_niveis").insert({ nivel: Number(valor), nome });
  }
  if (resultado.error) {
    return {
      ok: false,
      erro: resultado.error.code === DUPLICADO ? "Essa categoria já existe." : ERRO_REDE,
    };
  }
  revalidatePath("/estante");
  revalidatePath("/meus-livros");
  return { ok: true, valor, nome };
}

/** Botão "+ Criar" ao lado do campo, no cadastro de livro. */
export async function adicionarCategoria(categoria: Categoria, nome: string) {
  return criarCategoria({ categoria, nome });
}

/** Tira da estante um livro que o grupo ainda não leu (quem sugeriu ou moderador). Usado também pelo Desfazer da sugestão. */
export async function tirarDaEstante(id: number): Promise<Resultado<z.infer<typeof livroSchema>>> {
  if (!idSchema.safeParse(id).success) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livros")
    .delete()
    .eq("id", id)
    .eq("status", "fila")
    .select(
      "titulo, autor, paginas, tema, tipo, nivel, ano_publicacao, editora, preco_referencia, nota",
    )
    .single();
  if (error || !data)
    return { ok: false, erro: "Não deu pra tirar da estante agora. Tente de novo." };
  revalidar();
  return { ok: true, dados: paraLivroApp(data as Record<string, unknown>) };
}

/** Desfazer de "Tirar da estante": sugere de novo (os votos antigos não voltam). */
export async function voltarParaEstante(livro: z.infer<typeof livroSchema>): Promise<Resultado> {
  const lido = livroSchema.safeParse(livro);
  const clube = await getClubeAtual();
  if (!lido.success || !clube) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livros")
    .insert({ clube_id: clube.id, ...paraLivroDb(lido.data) })
    .select("id")
    .single();
  if (error || !data) return { ok: false, erro: ERRO_REDE };
  revalidar();
  return { ok: true, dados: undefined };
}

export async function votarLivro(id: number, votar: boolean): Promise<{ ok: boolean }> {
  if (!idSchema.safeParse(id).success) return { ok: false };
  const supabase = await createClient();
  const { error } = votar
    ? await supabase.from("votos_livro").insert({ livro_id: id })
    : await supabase
        .from("votos_livro")
        .delete()
        .eq("livro_id", id)
        .eq("user_id", (await getClubeAtual())?.uid ?? "");
  // Já tinha votado (duplo toque): para quem votou, deu certo do mesmo jeito.
  if (error && error.code !== DUPLICADO) return { ok: false };
  revalidar();
  return { ok: true };
}

export type ProgressoAnterior = {
  paginas_edicao: number;
  edicao_confirmada: boolean;
  pagina: number;
  status: "nao_lido" | "lendo" | "lido";
} | null;

function revalidarLeituraPessoal() {
  revalidatePath("/estante");
  revalidatePath("/meus-livros");
  revalidatePath("/livro");
  revalidatePath("/inicio");
  revalidatePath(`/membros`);
}

/** Liga a sugestão compartilhada à edição real da pessoa e publica seu progresso no grupo. */
export async function salvarProgressoPessoal(
  _anterior: EstadoForm<CamposLeitura>,
  form: FormData,
): Promise<EstadoForm<CamposLeitura>> {
  const valores = {
    livroId: String(form.get("livroId") ?? ""),
    paginasEdicao: String(form.get("paginasEdicao") ?? ""),
    pagina: String(form.get("pagina") ?? ""),
    status: String(form.get("status") ?? "nao_lido"),
  };
  const lido = progressoPessoalSchema.safeParse(valores);
  if (!lido.success) {
    const erros: Record<string, string> = {};
    for (const item of lido.error.issues) erros[String(item.path[0])] ??= item.message;
    return { ok: false, erros, valores };
  }

  const clube = await getClubeAtual();
  if (!clube) return { ok: false, erros: { geral: ERRO_REDE }, valores };
  const supabase = await createClient();
  const [{ data: livro }, { data: antes }] = await Promise.all([
    supabase
      .from("livros")
      .select("id")
      .eq("id", lido.data.livroId)
      .eq("clube_id", clube.id)
      .maybeSingle(),
    supabase
      .from("progresso_leitura")
      .select("paginas_edicao, edicao_confirmada, pagina, status")
      .eq("livro_id", lido.data.livroId)
      .eq("user_id", clube.uid)
      .maybeSingle(),
  ]);
  if (!livro)
    return { ok: false, erros: { geral: "Esse livro não está na estante deste grupo." }, valores };

  // a situação acompanha a página: chegou ao fim é "Já li", mesmo sem trocar no campo
  const status = situacaoDaLeitura(
    lido.data.status,
    Math.min(lido.data.pagina, lido.data.paginasEdicao),
    lido.data.paginasEdicao,
  );
  const pagina =
    status === "lido" ? lido.data.paginasEdicao : status === "nao_lido" ? 0 : lido.data.pagina;
  const { error } = await supabase.from("progresso_leitura").upsert({
    livro_id: lido.data.livroId,
    user_id: clube.uid,
    paginas_edicao: lido.data.paginasEdicao,
    edicao_confirmada: true,
    pagina,
    status,
    atualizado_em: new Date().toISOString(),
  });
  if (error) return { ok: false, erros: { geral: ERRO_REDE }, valores };

  revalidarLeituraPessoal();
  return {
    ok: true,
    mensagem: "Sua edição e seu progresso foram salvos para o grupo.",
    desfazer: {
      livroId: lido.data.livroId,
      anterior: antes as ProgressoAnterior,
    },
  };
}

/** Desfaz o cadastro ou restaura a edição e o progresso anteriores. */
export async function desfazerProgressoPessoal(
  livroId: number,
  anterior: ProgressoAnterior,
): Promise<Resultado> {
  if (!idSchema.safeParse(livroId).success) return { ok: false, erro: ERRO_REDE };
  const clube = await getClubeAtual();
  if (!clube) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { data: livro } = await supabase
    .from("livros")
    .select("id")
    .eq("id", livroId)
    .eq("clube_id", clube.id)
    .maybeSingle();
  if (!livro) return { ok: false, erro: ERRO_REDE };

  const resultado = anterior
    ? await supabase.from("progresso_leitura").upsert({
        livro_id: livroId,
        user_id: clube.uid,
        ...anterior,
        atualizado_em: new Date().toISOString(),
      })
    : await supabase
        .from("progresso_leitura")
        .delete()
        .eq("livro_id", livroId)
        .eq("user_id", clube.uid);
  if (resultado.error) return { ok: false, erro: ERRO_REDE };
  revalidarLeituraPessoal();
  return { ok: true, dados: undefined };
}
