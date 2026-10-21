"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getClubeAtual } from "@/features/clube/queries";
import { DUPLICADO, ERRO_REDE, type EstadoForm, type Resultado } from "@/lib/resultado";
import { createClient } from "@/lib/supabase/server";
import { livroSchema } from "./schemas";

type Campos = "titulo" | "autor" | "paginas";
const idSchema = z.number().int().positive();

function revalidar() {
  revalidatePath("/estante");
  revalidatePath("/livro");
}

/** Sugere um livro (sem duplicado: o banco ignora caixa e acento) e já vota nele. */
export async function sugerirLivro(
  _anterior: EstadoForm<Campos>,
  form: FormData,
): Promise<EstadoForm<Campos>> {
  const valores = {
    titulo: String(form.get("titulo") ?? ""),
    autor: String(form.get("autor") ?? ""),
    paginas: String(form.get("paginas") ?? ""),
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
    .insert({ clube_id: clube.id, ...lido.data })
    .select("id")
    .single();
  if (error?.code === DUPLICADO) {
    return {
      ok: false,
      erros: { titulo: "Esse livro já está na estante. Que tal votar nele na fila?" },
      valores,
    };
  }
  if (error || !data) return { ok: false, erros: { geral: ERRO_REDE }, valores };

  await supabase.from("votos_livro").insert({ livro_id: data.id });
  revalidar();
  return { ok: true, mensagem: `“${lido.data.titulo}” entrou na fila.`, desfazer: data.id };
}

/** Tira da fila (quem sugeriu ou moderador). Usado também pelo Desfazer da sugestão. */
export async function tirarDaFila(id: number): Promise<Resultado<z.infer<typeof livroSchema>>> {
  if (!idSchema.safeParse(id).success) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livros")
    .delete()
    .eq("id", id)
    .eq("status", "fila")
    .select("titulo, autor, paginas")
    .single();
  if (error || !data) return { ok: false, erro: "Não deu pra tirar da fila agora. Tente de novo." };
  revalidar();
  return { ok: true, dados: data as z.infer<typeof livroSchema> };
}

/** Desfazer de "Tirar da fila": sugere de novo (os votos antigos não voltam). */
export async function voltarParaFila(livro: z.infer<typeof livroSchema>): Promise<Resultado> {
  const lido = livroSchema.safeParse(livro);
  const clube = await getClubeAtual();
  if (!lido.success || !clube) return { ok: false, erro: ERRO_REDE };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livros")
    .insert({ clube_id: clube.id, ...lido.data })
    .select("id")
    .single();
  if (error || !data) return { ok: false, erro: ERRO_REDE };
  await supabase.from("votos_livro").insert({ livro_id: data.id });
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
