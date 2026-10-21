import "server-only";
import type { Papel } from "@/features/clube/queries";
import type { CorPerfil, IconePerfil } from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/server";

export type PessoaDoGrupo = {
  id: string;
  nome: string;
  cor: CorPerfil;
  icone: IconePerfil | "";
  papel: Papel;
  entrouEm: string;
};
export type GrupoAdmin = { id: string; nome: string; pessoas: PessoaDoGrupo[] };

/** Todos os grupos com as pessoas de cada um. Só o dono enxerga todos (RLS). */
export async function listarGruposAdmin(): Promise<GrupoAdmin[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clubes")
    .select(
      "id, nome, membros(user_id, papel, entrou_em, perfis!membros_user_id_fkey(nome, cor, icone_avatar))",
    )
    .order("criado_em");

  type Linha = {
    id: string;
    nome: string;
    membros: {
      user_id: string;
      papel: Papel;
      entrou_em: string;
      perfis: { nome: string; cor: CorPerfil; icone_avatar: IconePerfil | "" } | null;
    }[];
  };

  return ((data ?? []) as unknown as Linha[]).map((g) => ({
    id: g.id,
    nome: g.nome,
    pessoas: g.membros
      .map((m) => ({
        id: m.user_id,
        nome: m.perfis?.nome ?? "sem nome",
        cor: m.perfis?.cor ?? "slate",
        icone: m.perfis?.icone_avatar ?? "",
        papel: m.papel,
        entrouEm: m.entrou_em,
      }))
      // moderadores primeiro, depois por nome
      .sort((a, b) =>
        a.papel === b.papel
          ? a.nome.localeCompare(b.nome, "pt-BR")
          : a.papel === "moderador"
            ? -1
            : 1,
      ),
  }));
}

export type EventoAuditoria = {
  id: number;
  acao: string;
  grupo: string | null;
  autor: string;
  alvo: string | null;
  convite: string | null;
  detalhes: Record<string, string>;
  em: string;
};

/** Últimos eventos da auditoria, de todos os grupos. A RLS só devolve linhas para o dono. */
export async function listarAuditoria(limite = 100): Promise<EventoAuditoria[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("auditoria")
    .select(
      "id, acao, detalhes, criado_em, clubes(nome), autor:perfis!auditoria_autor_fkey(nome), alvo:perfis!auditoria_alvo_fkey(nome), convites(rotulo)",
    )
    .order("criado_em", { ascending: false })
    .limit(limite);

  type Linha = {
    id: number;
    acao: string;
    detalhes: Record<string, string>;
    criado_em: string;
    clubes: { nome: string } | null;
    autor: { nome: string } | null;
    alvo: { nome: string } | null;
    convites: { rotulo: string } | null;
  };

  return ((data ?? []) as unknown as Linha[]).map((e) => ({
    id: e.id,
    acao: e.acao,
    grupo: e.clubes?.nome ?? null,
    autor: e.autor?.nome ?? "alguém que saiu",
    alvo: e.alvo?.nome ?? null,
    convite: e.convites?.rotulo ?? null,
    detalhes: e.detalhes ?? {},
    em: e.criado_em,
  }));
}
