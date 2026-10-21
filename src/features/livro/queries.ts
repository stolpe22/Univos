import "server-only";
import type { CorPerfil, IconePerfil } from "@/components/ui/Avatar";
import { listarPessoas, type Pessoa } from "@/features/clube/queries";
import { createClient } from "@/lib/supabase/server";
import { posicao } from "./regras";

export type LivroAtual = {
  id: number;
  titulo: string;
  autor: string;
  /** Páginas da edição de referência (cada pessoa cadastra a própria em Meus livros). */
  paginas: number;
};

/** O livro da vez do grupo, ou null. */
export async function getLivroAtual(clubeId: string): Promise<LivroAtual | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("livros")
    .select("id, titulo, autor, paginas")
    .eq("clube_id", clubeId)
    .eq("status", "atual")
    .maybeSingle();
  return (data as LivroAtual | null) ?? null;
}

export type ProgressoPessoa = Pessoa & {
  pagina: number;
  paginasEdicao: number;
  /** Quanto já leu, de 0 a 1, na própria edição (é o que se compara entre pessoas). */
  posicao: number;
  statusLeitura: "nao_lido" | "lendo" | "lido";
  atualizadoEm: string | null;
};

/**
 * Quem está lendo: só as pessoas do grupo que cadastraram o próprio exemplar em
 * Meus livros (sem edição não há progresso de verdade). Ordem: quem leu mais primeiro.
 */
export async function listarProgresso(
  clubeId: string,
  livroId: number,
): Promise<ProgressoPessoa[]> {
  const supabase = await createClient();
  const [pessoas, { data }] = await Promise.all([
    listarPessoas(clubeId),
    supabase
      .from("progresso_leitura")
      .select("user_id, pagina, paginas_edicao, status, atualizado_em")
      .eq("livro_id", livroId)
      .eq("edicao_confirmada", true),
  ]);
  type Linha = {
    user_id: string;
    pagina: number;
    paginas_edicao: number;
    status: "nao_lido" | "lendo" | "lido";
    atualizado_em: string;
  };
  const porPessoa = new Map(((data ?? []) as Linha[]).map((p) => [p.user_id, p]));
  return pessoas
    .flatMap((p) => {
      const linha = porPessoa.get(p.id);
      if (!linha) return [];
      return [
        {
          ...p,
          pagina: linha.pagina,
          paginasEdicao: linha.paginas_edicao,
          posicao: posicao(linha.pagina, linha.paginas_edicao),
          statusLeitura: linha.status,
          atualizadoEm: linha.atualizado_em,
        },
      ];
    })
    .sort((a, b) => b.posicao - a.posicao);
}

export type MetaLeitura = {
  id: number;
  texto: string;
  /** "2026-10-26" */
  prazo: string;
  /** Quem já marcou "Cheguei!", na ordem em que chegou. */
  alcancaram: { id: string; nome: string; cor: CorPerfil; icone: IconePerfil | "" }[];
};

/** A meta valendo para o livro (a mais recente), ou null. */
export async function getMetaAtual(livroId: number): Promise<MetaLeitura | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("metas")
    .select(
      "id, texto, prazo, metas_alcancadas(user_id, alcancada_em, perfis!metas_alcancadas_user_id_fkey(nome, cor, icone_avatar))",
    )
    .eq("livro_id", livroId)
    .order("criada_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;

  type Linha = {
    id: number;
    texto: string;
    prazo: string;
    metas_alcancadas: {
      user_id: string;
      alcancada_em: string;
      perfis: { nome: string; cor: CorPerfil; icone_avatar: IconePerfil | "" } | null;
    }[];
  };
  const meta = data as unknown as Linha;
  return {
    id: meta.id,
    texto: meta.texto,
    prazo: meta.prazo,
    alcancaram: [...meta.metas_alcancadas]
      .sort((a, b) => a.alcancada_em.localeCompare(b.alcancada_em))
      .map((a) => ({
        id: a.user_id,
        nome: a.perfis?.nome ?? "alguém que saiu",
        cor: a.perfis?.cor ?? "slate",
        icone: a.perfis?.icone_avatar ?? "",
      })),
  };
}

export type Comentario = {
  id: number;
  /** Página na edição de quem escreveu (era a página dela ao comentar). */
  pagina: number;
  texto: string;
  autor: string;
  autorNome: string;
  autorCor: Pessoa["cor"];
  autorIcone: IconePerfil | "";
  criadoEm: string;
};

/** Comentários do livro, em ordem de página. */
export async function listarComentarios(livroId: number): Promise<Comentario[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comentarios")
    .select(
      "id, pagina, texto, criado_em, user_id, perfis!comentarios_user_id_fkey(nome, cor, icone_avatar)",
    )
    .eq("livro_id", livroId)
    .order("pagina")
    .order("criado_em");

  type Linha = {
    id: number;
    pagina: number;
    texto: string;
    criado_em: string;
    user_id: string;
    perfis: { nome: string; cor: Pessoa["cor"]; icone_avatar: IconePerfil | "" } | null;
  };
  return ((data ?? []) as unknown as Linha[]).map((c) => ({
    id: c.id,
    pagina: c.pagina,
    texto: c.texto,
    autor: c.user_id,
    autorNome: c.perfis?.nome ?? "alguém que saiu",
    autorCor: c.perfis?.cor ?? "slate",
    autorIcone: c.perfis?.icone_avatar ?? "",
    criadoEm: c.criado_em,
  }));
}

export type ComentarioPosicionado = Comentario & {
  /** Ponto do livro (0 a 1) em que o comentário foi escrito, pela edição de quem escreveu. */
  posicao: number;
  /** Total de páginas da edição de quem escreveu. */
  paginasEdicaoAutor: number;
};

/**
 * Situa cada comentário no livro usando a edição de quem escreveu, para comparar com a
 * posição de quem lê (spoiler) mesmo com edições diferentes. Se a pessoa saiu do grupo
 * ou não cadastrou edição, vale a edição de referência.
 */
export function posicionarComentarios(
  comentarios: Comentario[],
  progresso: ProgressoPessoa[],
  paginasReferencia: number,
): ComentarioPosicionado[] {
  const edicao = new Map(progresso.map((p) => [p.id, p.paginasEdicao]));
  return comentarios.map((c) => {
    const total = edicao.get(c.autor) ?? paginasReferencia;
    return { ...c, posicao: posicao(c.pagina, total), paginasEdicaoAutor: total };
  });
}
