import "server-only";
import { listarPessoas, type Pessoa } from "@/features/clube/queries";
import { createClient } from "@/lib/supabase/server";

export type ResultadoMapa = { economia: number; costumes: number };

export type MeuQuiz = {
  semente: number | null;
  /** afirmação → valor 1..5 */
  respostas: Record<number, number>;
  resultado: ResultadoMapa | null;
};

/** O questionário de quem está logado (respostas são privadas). */
export async function getMeuQuiz(uid: string): Promise<MeuQuiz> {
  const supabase = await createClient();
  const [{ data: ordem }, { data: respostas }, { data: resultado }] = await Promise.all([
    supabase.from("quiz_ordem").select("semente").eq("user_id", uid).maybeSingle(),
    supabase.from("quiz_respostas").select("afirmacao, valor").eq("user_id", uid),
    supabase.from("quiz_resultados").select("economia, costumes").eq("user_id", uid).maybeSingle(),
  ]);
  return {
    semente: (ordem?.semente as number | undefined) ?? null,
    respostas: Object.fromEntries(
      ((respostas ?? []) as { afirmacao: number; valor: number }[]).map((r) => [
        r.afirmacao,
        r.valor,
      ]),
    ),
    resultado: (resultado as ResultadoMapa | null) ?? null,
  };
}

export type PessoaNoMapa = Pessoa & { resultado: ResultadoMapa | null };

/** Resultado de cada pessoa do grupo (null = ainda não fez). */
export async function listarMapaDoGrupo(clubeId: string): Promise<PessoaNoMapa[]> {
  const supabase = await createClient();
  const pessoas = await listarPessoas(clubeId);
  const { data } = await supabase
    .from("quiz_resultados")
    .select("user_id, economia, costumes")
    .in(
      "user_id",
      pessoas.map((p) => p.id),
    );
  const porPessoa = new Map(
    ((data ?? []) as ({ user_id: string } & ResultadoMapa)[]).map((r) => [r.user_id, r]),
  );
  return pessoas.map((p) => {
    const r = porPessoa.get(p.id);
    return { ...p, resultado: r ? { economia: r.economia, costumes: r.costumes } : null };
  });
}
