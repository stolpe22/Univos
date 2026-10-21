"use server";

import { z } from "zod";
import { getClubeAtual } from "@/features/clube/queries";
import { createClient } from "@/lib/supabase/server";
import type { GrupoResultado, Resultado } from "./tipos";

const termoSchema = z.string().trim().min(2).max(60);

type Linha = { tipo: string; id: string; titulo: string; detalhe: string | null };

const DESTINO: Record<string, (l: Linha) => { grupo: GrupoResultado; href: string }> = {
  livro: (l) => ({
    grupo: "Livros",
    href: l.detalhe?.endsWith("livro da vez") ? "/livro" : `/estante#livro-${l.id}`,
  }),
  debate: (l) => ({ grupo: "Debates", href: `/debates#debate-${l.id}` }),
  tema: (l) => ({ grupo: "Pautas", href: `/pauta#tema-${l.id}` }),
  pessoa: (l) => ({ grupo: "Pessoas", href: `/membros/${l.id}` }),
};

/**
 * Busca no banco, dentro do grupo aberto: livros, debates, temas da pauta e pessoas.
 * A função SQL roda com as permissões de quem busca, então a RLS vale.
 */
export async function buscarNoGrupo(termo: string): Promise<{ ok: boolean; itens: Resultado[] }> {
  const lido = termoSchema.safeParse(termo);
  if (!lido.success) return { ok: true, itens: [] };

  const clube = await getClubeAtual();
  if (!clube) return { ok: true, itens: [] };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("buscar", { clube: clube.id, termo: lido.data });
  if (error) return { ok: false, itens: [] };

  return {
    ok: true,
    itens: ((data ?? []) as Linha[]).flatMap((l) => {
      const destino = DESTINO[l.tipo];
      if (!destino) return [];
      return [{ id: `${l.tipo}-${l.id}`, titulo: l.titulo, detalhe: l.detalhe, ...destino(l) }];
    }),
  };
}
