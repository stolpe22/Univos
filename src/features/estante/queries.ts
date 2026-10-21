import "server-only";
import type { CorPerfil, IconePerfil } from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/server";
import { naoLidosPorVoto } from "./regras";
import type { StatusLeitura, TemaLivro, TipoLivro } from "./taxonomia";

export type EdicaoLeitura = {
  userId: string;
  nome: string;
  cor: CorPerfil;
  icone: IconePerfil | "";
  paginas: number;
  pagina: number;
  status: StatusLeitura;
  temEdicao: boolean;
  atualizadoEm: string;
};

export type LivroEstante = {
  id: number;
  titulo: string;
  autor: string;
  paginas: number;
  status: "fila" | "atual" | "lido";
  sugeridoPor: string | null;
  sugeridoPorNome: string;
  votos: string[];
  tema: TemaLivro | null;
  temaNome: string | null;
  anoPublicacao: number | null;
  editora: string | null;
  precoReferencia: number | null;
  nivel: number | null;
  nivelNome: string | null;
  tipo: TipoLivro | null;
  nota: string | null;
  leituras: EdicaoLeitura[];
};

export type TaxonomiaCatalogo = {
  temas: { codigo: string; nome: string }[];
  tipos: { nome: string }[];
  niveis: { nivel: number; nome: string }[];
};

export async function listarTaxonomia(): Promise<TaxonomiaCatalogo> {
  const supabase = await createClient();
  const [{ data: temas }, { data: tipos }, { data: niveis }] = await Promise.all([
    supabase.from("catalogo_temas").select("codigo, nome").order("nome"),
    supabase.from("catalogo_tipos").select("nome").order("nome"),
    supabase.from("catalogo_niveis").select("nivel, nome").order("nivel"),
  ]);
  return {
    temas: (temas ?? []) as TaxonomiaCatalogo["temas"],
    tipos: (tipos ?? []) as TaxonomiaCatalogo["tipos"],
    niveis: (niveis ?? []) as TaxonomiaCatalogo["niveis"],
  };
}

/** Todos os livros do grupo, do mais antigo ao mais novo. */
export async function listarEstante(clubeId: string): Promise<LivroEstante[]> {
  const supabase = await createClient();
  const [{ data, error }, taxonomia] = await Promise.all([
    supabase
      .from("livros")
      .select(
        "id, titulo, autor, paginas, status, sugerido_por, tema, ano_publicacao, editora, preco_referencia, nivel, tipo, nota",
      )
      .eq("clube_id", clubeId)
      .order("criado_em"),
    listarTaxonomia(),
  ]);

  if (error) {
    console.error(
      "[estante] Erro ao carregar livros:",
      JSON.stringify({
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }),
    );
    throw new Error("Não foi possível carregar os livros da estante.");
  }

  type Linha = NonNullable<typeof data>[number];
  type Voto = { livro_id: number; user_id: string };
  type Progresso = {
    livro_id: number;
    user_id: string;
    pagina: number;
    paginas_edicao: number;
    edicao_confirmada: boolean;
    status: StatusLeitura;
    atualizado_em: string;
  };

  const linhas = (data ?? []) as Linha[];
  const ids = linhas.map((livro) => livro.id);
  let votos: Voto[] = [];
  let progressos: Progresso[] = [];

  if (ids.length > 0) {
    const [resultadoVotos, resultadoProgressos] = await Promise.all([
      supabase.from("votos_livro").select("livro_id, user_id").in("livro_id", ids),
      supabase
        .from("progresso_leitura")
        .select(
          "livro_id, user_id, pagina, paginas_edicao, edicao_confirmada, status, atualizado_em",
        )
        .in("livro_id", ids),
    ]);

    if (resultadoVotos.error) {
      console.error(
        "[estante] Erro ao carregar votos:",
        JSON.stringify({
          message: resultadoVotos.error.message,
          code: resultadoVotos.error.code,
          details: resultadoVotos.error.details,
          hint: resultadoVotos.error.hint,
        }),
      );
      throw new Error("Não foi possível carregar os votos dos livros da estante.");
    }

    votos = (resultadoVotos.data ?? []) as Voto[];

    if (!resultadoProgressos.error) {
      progressos = (resultadoProgressos.data ?? []) as Progresso[];
    } else if (resultadoProgressos.error.code === "42703") {
      // Compatibilidade temporária com bancos que ainda não receberam a migration 24.
      console.warn(
        "[estante] Colunas de edição pessoal ausentes; carregando o progresso no formato antigo.",
      );
      const legado = await supabase
        .from("progresso_leitura")
        .select("livro_id, user_id, pagina, atualizado_em")
        .in("livro_id", ids);

      if (legado.error) {
        console.error(
          "[estante] Erro ao carregar progresso legado:",
          JSON.stringify({
            message: legado.error.message,
            code: legado.error.code,
            details: legado.error.details,
            hint: legado.error.hint,
          }),
        );
        throw new Error("Não foi possível carregar o progresso de leitura.");
      }

      const paginasPorLivro = new Map(linhas.map((livro) => [livro.id, livro.paginas]));
      progressos = (legado.data ?? []).map((progresso): Progresso => {
        const paginasEdicao = Math.max(
          paginasPorLivro.get(progresso.livro_id) ?? progresso.pagina,
          progresso.pagina,
        );
        const status: StatusLeitura =
          progresso.pagina >= paginasEdicao ? "lido" : progresso.pagina > 0 ? "lendo" : "nao_lido";
        return {
          ...progresso,
          paginas_edicao: paginasEdicao,
          edicao_confirmada: false,
          status,
        };
      });
    } else {
      console.error(
        "[estante] Erro ao carregar progresso:",
        JSON.stringify({
          message: resultadoProgressos.error.message,
          code: resultadoProgressos.error.code,
          details: resultadoProgressos.error.details,
          hint: resultadoProgressos.error.hint,
        }),
      );
      throw new Error("Não foi possível carregar o progresso dos livros da estante.");
    }
  }

  const idsPerfis = [
    ...new Set([
      ...linhas.flatMap((livro) => (livro.sugerido_por ? [livro.sugerido_por] : [])),
      ...progressos.map((progresso) => progresso.user_id),
    ]),
  ];
  let perfis: { id: string; nome: string; cor: CorPerfil; icone_avatar: IconePerfil | "" }[] = [];

  if (idsPerfis.length > 0) {
    const resultadoPerfis = await supabase
      .from("perfis")
      .select("id, nome, cor, icone_avatar")
      .in("id", idsPerfis);

    if (resultadoPerfis.error) {
      console.error(
        "[estante] Erro ao carregar perfis:",
        JSON.stringify({
          message: resultadoPerfis.error.message,
          code: resultadoPerfis.error.code,
          details: resultadoPerfis.error.details,
          hint: resultadoPerfis.error.hint,
        }),
      );
      throw new Error("Não foi possível carregar os perfis da estante.");
    }

    perfis = (resultadoPerfis.data ?? []) as typeof perfis;
  }

  const temas = new Map(taxonomia.temas.map((item) => [item.codigo, item.nome]));
  const niveis = new Map(taxonomia.niveis.map((item) => [item.nivel, item.nome]));
  const nomesPerfis = new Map(perfis.map((perfil) => [perfil.id, perfil]));
  const votosPorLivro = new Map<number, string[]>();
  const progressoPorLivro = new Map<number, Progresso[]>();

  for (const voto of votos) {
    votosPorLivro.set(voto.livro_id, [...(votosPorLivro.get(voto.livro_id) ?? []), voto.user_id]);
  }
  for (const progresso of progressos) {
    progressoPorLivro.set(progresso.livro_id, [
      ...(progressoPorLivro.get(progresso.livro_id) ?? []),
      progresso,
    ]);
  }

  return linhas.map((l) => ({
    id: l.id,
    titulo: l.titulo,
    autor: l.autor,
    paginas: l.paginas,
    status: l.status,
    sugeridoPor: l.sugerido_por,
    sugeridoPorNome: (l.sugerido_por && nomesPerfis.get(l.sugerido_por)?.nome) ?? "alguém que saiu",
    votos: votosPorLivro.get(l.id) ?? [],
    tema: l.tema,
    temaNome: l.tema ? (temas.get(l.tema) ?? null) : null,
    anoPublicacao: l.ano_publicacao,
    editora: l.editora,
    precoReferencia: l.preco_referencia,
    nivel: l.nivel,
    nivelNome: l.nivel === null ? null : (niveis.get(l.nivel) ?? null),
    tipo: l.tipo,
    nota: l.nota,
    // só quem cadastrou o exemplar em Meus livros; progresso antigo sem exemplar não conta
    leituras: (progressoPorLivro.get(l.id) ?? [])
      .filter((p) => p.edicao_confirmada)
      .map((p) => ({
        userId: p.user_id,
        nome: nomesPerfis.get(p.user_id)?.nome ?? "alguém que saiu",
        cor: nomesPerfis.get(p.user_id)?.cor ?? "slate",
        icone: nomesPerfis.get(p.user_id)?.icone_avatar ?? "",
        paginas: p.paginas_edicao,
        pagina: p.pagina,
        status: p.status,
        temEdicao: p.edicao_confirmada,
        atualizadoEm: p.atualizado_em,
      })),
  }));
}

/** O mais votado entre os livros que o grupo ainda não leu, ou null. */
export async function getMaisVotado(clubeId: string) {
  return naoLidosPorVoto(await listarEstante(clubeId))[0] ?? null;
}
