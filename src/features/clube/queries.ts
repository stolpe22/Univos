import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import type { CorPerfil } from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/server";

/** Cookie com o grupo escolhido em "Trocar de grupo". */
export const COOKIE_GRUPO = "univos_grupo";

export type Papel = "membro" | "moderador";
export type Grupo = { id: string; nome: string };

export type ClubeAtual = Grupo & {
  /** id de quem está logado. */
  uid: string;
  /** null quando o dono está vendo um grupo do qual não faz parte. */
  papel: Papel | null;
  /** Dono do sistema: vê e faz tudo em todos os grupos. */
  dono: boolean;
  /** Grupos que a pessoa pode abrir (o dono vê todos). */
  grupos: Grupo[];
};

/** Moderador do grupo ou dono: gera e desativa convites. */
export const podeModerar = (c: Pick<ClubeAtual, "papel" | "dono">) =>
  c.dono || c.papel === "moderador";

/**
 * O grupo aberto agora (o do cookie, se a pessoa ainda tiver acesso; senão o primeiro),
 * ou null se ela ainda não entrou em nenhum. Uma consulta por requisição (cache).
 */
export const getClubeAtual = cache(async (): Promise<ClubeAtual | null> => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const uid = claims?.claims.sub;
  if (!uid) return null;

  // A RLS devolve só os grupos de quem é membro (ou todos, para o dono).
  const [{ data: grupos }, { data: dono }, cookieStore] = await Promise.all([
    supabase.from("clubes").select("id, nome").order("criado_em").order("id"),
    supabase.rpc("eh_dono"),
    cookies(),
  ]);
  const lista = (grupos ?? []) as Grupo[];
  if (lista.length === 0) return null;

  const escolhido = cookieStore.get(COOKIE_GRUPO)?.value;
  const atual = lista.find((g) => g.id === escolhido) ?? lista[0];

  const { data: membro } = await supabase
    .from("membros")
    .select("papel")
    .eq("clube_id", atual.id)
    .eq("user_id", uid)
    .maybeSingle();

  return {
    ...atual,
    uid,
    papel: (membro?.papel as Papel | undefined) ?? null,
    dono: dono === true,
    grupos: lista,
  };
});

/** Nome do grupo de um convite (funciona sem login), ou null se o convite não vale. */
export async function nomeDoConvite(codigo: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("ver_convite", { codigo });
  return (data as string | null) ?? null;
}

export type Convite = {
  id: number;
  codigo: string;
  rotulo: string;
  criadoPor: string;
  criadoEm: string;
  ativo: boolean;
  /** Quem entrou por este link, do mais recente ao mais antigo. */
  entradas: { nome: string; em: string }[];
};

/** Convites de um grupo, com quem entrou por cada um. A RLS só libera para moderador e dono. */
export async function listarConvites(clubeId: string): Promise<Convite[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("convites")
    .select(
      "id, codigo, rotulo, criado_em, desativado_em, autor:perfis!convites_criado_por_fkey(nome), membros(entrou_em, perfis!membros_user_id_fkey(nome))",
    )
    .eq("clube_id", clubeId)
    .order("criado_em", { ascending: false });

  type Linha = {
    id: number;
    codigo: string;
    rotulo: string;
    criado_em: string;
    desativado_em: string | null;
    autor: { nome: string } | null;
    membros: { entrou_em: string; perfis: { nome: string } | null }[];
  };

  return ((data ?? []) as unknown as Linha[]).map((c) => ({
    id: c.id,
    codigo: c.codigo,
    rotulo: c.rotulo,
    criadoPor: c.autor?.nome ?? "alguém que saiu",
    criadoEm: c.criado_em,
    ativo: !c.desativado_em,
    entradas: c.membros
      .map((m) => ({ nome: m.perfis?.nome ?? "alguém que saiu", em: m.entrou_em }))
      .sort((a, b) => b.em.localeCompare(a.em)),
  }));
}

export type Pessoa = { id: string; nome: string; cor: CorPerfil; papel: Papel };

/** Pessoas do grupo, em ordem alfabética. */
export const listarPessoas = cache(async (clubeId: string): Promise<Pessoa[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("membros")
    .select("papel, perfis!membros_user_id_fkey(id, nome, cor)")
    .eq("clube_id", clubeId);

  type Linha = { papel: Papel; perfis: { id: string; nome: string; cor: CorPerfil } | null };
  return ((data ?? []) as unknown as Linha[])
    .flatMap((m) => (m.perfis ? [{ ...m.perfis, papel: m.papel }] : []))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
});
