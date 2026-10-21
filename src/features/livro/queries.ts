import "server-only";
import { listarPessoas, type Pessoa } from "@/features/clube/queries";
import { createClient } from "@/lib/supabase/server";

export type LivroAtual = {
  id: number;
  titulo: string;
  autor: string;
  paginas: number;
  meta: { pagina: number; prazo: string } | null;
};

/** O livro da vez do grupo, com a meta da semana, ou null. */
export async function getLivroAtual(clubeId: string): Promise<LivroAtual | null> {
  const supabase = await createClient();
  const [{ data: livro }, { data: clube }] = await Promise.all([
    supabase
      .from("livros")
      .select("id, titulo, autor, paginas")
      .eq("clube_id", clubeId)
      .eq("status", "atual")
      .maybeSingle(),
    supabase.from("clubes").select("meta_pagina, meta_prazo").eq("id", clubeId).maybeSingle(),
  ]);
  if (!livro) return null;
  return {
    ...(livro as Omit<LivroAtual, "meta">),
    meta:
      clube?.meta_pagina && clube?.meta_prazo
        ? { pagina: clube.meta_pagina as number, prazo: clube.meta_prazo as string }
        : null,
  };
}

export type ProgressoPessoa = Pessoa & { pagina: number; atualizadoEm: string | null };

/** Página de cada pessoa do grupo (quem não atualizou aparece na 0). */
export async function listarProgresso(
  clubeId: string,
  livroId: number,
): Promise<ProgressoPessoa[]> {
  const supabase = await createClient();
  const [pessoas, { data }] = await Promise.all([
    listarPessoas(clubeId),
    supabase
      .from("progresso_leitura")
      .select("user_id, pagina, atualizado_em")
      .eq("livro_id", livroId),
  ]);
  const porPessoa = new Map(
    ((data ?? []) as { user_id: string; pagina: number; atualizado_em: string }[]).map((p) => [
      p.user_id,
      p,
    ]),
  );
  return pessoas
    .map((p) => ({
      ...p,
      pagina: porPessoa.get(p.id)?.pagina ?? 0,
      atualizadoEm: porPessoa.get(p.id)?.atualizado_em ?? null,
    }))
    .sort((a, b) => b.pagina - a.pagina);
}

export type Comentario = {
  id: number;
  pagina: number;
  texto: string;
  autor: string;
  autorNome: string;
  autorCor: Pessoa["cor"];
  criadoEm: string;
};

/** Comentários do livro, em ordem de página. */
export async function listarComentarios(livroId: number): Promise<Comentario[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comentarios")
    .select("id, pagina, texto, criado_em, user_id, perfis!comentarios_user_id_fkey(nome, cor)")
    .eq("livro_id", livroId)
    .order("pagina")
    .order("criado_em");

  type Linha = {
    id: number;
    pagina: number;
    texto: string;
    criado_em: string;
    user_id: string;
    perfis: { nome: string; cor: Pessoa["cor"] } | null;
  };
  return ((data ?? []) as unknown as Linha[]).map((c) => ({
    id: c.id,
    pagina: c.pagina,
    texto: c.texto,
    autor: c.user_id,
    autorNome: c.perfis?.nome ?? "alguém que saiu",
    autorCor: c.perfis?.cor ?? "slate",
    criadoEm: c.criado_em,
  }));
}
