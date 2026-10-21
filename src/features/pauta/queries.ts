import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Tema = {
  id: number;
  tema: string;
  propostoPor: string | null;
  propostoPorNome: string;
  votos: string[];
};

/** Temas da pauta, mais votados primeiro (empate: o mais antigo). */
export async function listarTemas(clubeId: string): Promise<Tema[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("temas")
    .select("id, tema, proposto_por, perfis!temas_proposto_por_fkey(nome), votos_tema(user_id)")
    .eq("clube_id", clubeId)
    .order("criado_em");

  type Linha = {
    id: number;
    tema: string;
    proposto_por: string | null;
    perfis: { nome: string } | null;
    votos_tema: { user_id: string }[];
  };
  return ((data ?? []) as unknown as Linha[])
    .map((t) => ({
      id: t.id,
      tema: t.tema,
      propostoPor: t.proposto_por,
      propostoPorNome: t.perfis?.nome ?? "alguém que saiu",
      votos: t.votos_tema.map((v) => v.user_id),
    }))
    .sort((a, b) => b.votos.length - a.votos.length);
}
