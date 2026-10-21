import "server-only";
import { createClient } from "@/lib/supabase/server";
import { PAGINAS_NOVIDADE, type Novidades, type PaginaNovidade } from "./regras";

/**
 * O que é novo no grupo pra esta pessoa: a última novidade de cada página (sem contar o
 * que ela mesma fez), quando ela abriu cada página e quando entrou no grupo.
 * Se o banco ainda não tiver a função (migration não rodada), o menu só fica sem bolinha.
 */
export async function getNovidades(clubeId: string, uid: string): Promise<Novidades> {
  const supabase = await createClient();
  const [ultimas, vistos, membro] = await Promise.all([
    supabase.rpc("novidades", { clube: clubeId }),
    supabase.from("vistos").select("pagina, visto_em").eq("clube_id", clubeId),
    supabase
      .from("membros")
      .select("entrou_em")
      .eq("clube_id", clubeId)
      .eq("user_id", uid)
      .maybeSingle(),
  ]);

  const valida = (p: string): p is PaginaNovidade =>
    (PAGINAS_NOVIDADE as readonly string[]).includes(p);
  const n: Novidades = { ultimas: {}, vistos: {}, desde: membro.data?.entrou_em ?? null };
  for (const linha of (ultimas.data ?? []) as { pagina: string; ultima: string | null }[]) {
    if (valida(linha.pagina)) n.ultimas[linha.pagina] = linha.ultima;
  }
  for (const linha of (vistos.data ?? []) as { pagina: string; visto_em: string }[]) {
    if (valida(linha.pagina)) n.vistos[linha.pagina] = linha.visto_em;
  }
  return n;
}
