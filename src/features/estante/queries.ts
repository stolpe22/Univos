import "server-only";
import { createClient } from "@/lib/supabase/server";

export type LivroEstante = {
  id: number;
  titulo: string;
  autor: string;
  paginas: number;
  status: "fila" | "atual" | "lido";
  sugeridoPor: string | null;
  sugeridoPorNome: string;
  votos: string[];
};

/** Todos os livros do grupo, do mais antigo ao mais novo. */
export async function listarEstante(clubeId: string): Promise<LivroEstante[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("livros")
    .select(
      "id, titulo, autor, paginas, status, criado_em, sugerido_por, perfis!livros_sugerido_por_fkey(nome), votos_livro(user_id)",
    )
    .eq("clube_id", clubeId)
    .order("criado_em");

  type Linha = {
    id: number;
    titulo: string;
    autor: string;
    paginas: number;
    status: LivroEstante["status"];
    sugerido_por: string | null;
    perfis: { nome: string } | null;
    votos_livro: { user_id: string }[];
  };
  return ((data ?? []) as unknown as Linha[]).map((l) => ({
    id: l.id,
    titulo: l.titulo,
    autor: l.autor,
    paginas: l.paginas,
    status: l.status,
    sugeridoPor: l.sugerido_por,
    sugeridoPorNome: l.perfis?.nome ?? "alguém que saiu",
    votos: l.votos_livro.map((v) => v.user_id),
  }));
}

/** A fila em ordem de votos; no empate, o mais antigo primeiro (sort é estável). */
export function ordenarFila(livros: LivroEstante[]) {
  return livros.filter((l) => l.status === "fila").sort((a, b) => b.votos.length - a.votos.length);
}

/** O próximo livro da vez (o mais votado da fila), ou null. */
export async function getMaisVotado(clubeId: string) {
  return ordenarFila(await listarEstante(clubeId))[0] ?? null;
}
