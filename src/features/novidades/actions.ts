"use server";

import { z } from "zod";
import { getClubeAtual } from "@/features/clube/queries";
import { createClient } from "@/lib/supabase/server";
import { PAGINAS_NOVIDADE } from "./regras";

const paginaSchema = z.enum(PAGINAS_NOVIDADE, "Página sem indicador de novidade.");

/**
 * A pessoa abriu a página: guarda a hora só pra ela. Não mexe no "visto" de mais ninguém.
 * Sem retorno visível: se falhar, a bolinha só volta a aparecer na próxima carga.
 */
export async function marcarVisto(pagina: string): Promise<void> {
  const lido = paginaSchema.safeParse(pagina);
  const clube = await getClubeAtual();
  if (!lido.success || !clube) return;
  const supabase = await createClient();
  await supabase
    .from("vistos")
    .upsert(
      { clube_id: clube.id, pagina: lido.data, visto_em: new Date().toISOString() },
      { onConflict: "user_id,clube_id,pagina" },
    );
}
