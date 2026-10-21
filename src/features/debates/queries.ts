import "server-only";
import { cache } from "react";
import type { CorPerfil, IconePerfil } from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/server";
import type { Momento, Posicao, TipoEnquete, Voto } from "./enquete";

export type FaseDebate = "agendado" | "ao_vivo" | "encerrado";

export type Enquete = {
  id: number;
  tipo: TipoEnquete;
  pergunta: string;
  status: "proposta" | "aprovada";
  propostaPor: string | null;
  propostaPorNome: string;
  votos: Voto[];
  conclusoes: ConclusaoDebate[];
};

export type ConclusaoDebate = {
  id: number;
  texto: string;
  propostaPor: string | null;
  propostaPorNome: string;
  votos: { pessoa: string; nome: string; posicao: "concordo" | "discordo" }[];
};

export type Debate = {
  id: number;
  tema: string;
  data: string;
  /** false quando foi marcado só com o dia (sem hora). */
  comHora: boolean;
  formato: string;
  status: FaseDebate;
  criadoPor: string | null;
  presencas: { id: string; nome: string; cor: CorPerfil; icone: IconePerfil | "" }[];
  participantes: { id: string; nome: string; cor: CorPerfil; icone: IconePerfil | "" }[];
  /** Enquete inicial ativa; recusadas não aparecem. */
  enquete: Enquete | null;
  /** Enquete de posicionamento proposta depois do debate, se houver. */
  enquetePosDebate: Enquete | null;
};

export type ComentarioDebate = {
  id: number;
  texto: string;
  autor: string;
  autorNome: string;
  autorCor: CorPerfil;
  autorIcone: IconePerfil | "";
  criadoEm: string;
};

type Pessoa = { nome: string; cor: CorPerfil; icone_avatar: IconePerfil | "" } | null;

/** O que cada debate traz junto: presenças, comentaristas, enquetes, votos e conclusões. */
const CAMPOS_DEBATE = `id, tema, data, com_hora, formato, status, criado_por,
       presencas(user_id, perfis!presencas_user_id_fkey(nome, cor, icone_avatar)),
       comentarios_debate(user_id, perfis!comentarios_debate_user_id_fkey(nome, cor, icone_avatar)),
       enquetes(id, tipo, pergunta, status, proposta_por, criado_em,
         autor:perfis!enquetes_proposta_por_fkey(nome, cor, icone_avatar),
         votos_enquete(user_id, momento, posicao, perfis!votos_enquete_user_id_fkey(nome, cor, icone_avatar)),
         conclusoes_debate(id, texto, proposta_por, criado_em,
           autor:perfis!conclusoes_debate_proposta_por_fkey(nome, cor, icone_avatar),
           votos_conclusao(user_id, posicao, perfis!votos_conclusao_user_id_fkey(nome, cor, icone_avatar))))`;

type Linha = {
  id: number;
  tema: string;
  data: string;
  com_hora: boolean;
  formato: string;
  status: FaseDebate;
  criado_por: string | null;
  presencas: { user_id: string; perfis: Pessoa }[];
  comentarios_debate: { user_id: string; perfis: Pessoa }[];
  enquetes: {
    id: number;
    tipo: TipoEnquete;
    pergunta: string;
    status: "proposta" | "aprovada" | "recusada";
    proposta_por: string | null;
    criado_em: string;
    autor: Pessoa;
    votos_enquete: {
      user_id: string;
      momento: Momento;
      posicao: Posicao;
      perfis: Pessoa;
    }[];
    conclusoes_debate: {
      id: number;
      texto: string;
      proposta_por: string | null;
      criado_em: string;
      autor: Pessoa;
      votos_conclusao: {
        user_id: string;
        posicao: "concordo" | "discordo";
        perfis: Pessoa;
      }[];
    }[];
  }[];
};

function mapearDebate(d: Linha): Debate {
  const enquetesAtivas = d.enquetes.filter((e) => e.status !== "recusada");
  const pessoas = new Map<
    string,
    { id: string; nome: string; cor: CorPerfil; icone: IconePerfil | "" }
  >();
  const incluirPessoa = (id: string | null, perfil: Pessoa) => {
    if (!id) return;
    pessoas.set(id, {
      id,
      nome: perfil?.nome ?? "alguém que saiu",
      cor: perfil?.cor ?? "slate",
      icone: perfil?.icone_avatar ?? "",
    });
  };
  for (const presenca of d.presencas) incluirPessoa(presenca.user_id, presenca.perfis);
  for (const comentario of d.comentarios_debate)
    incluirPessoa(comentario.user_id, comentario.perfis);
  for (const enquete of d.enquetes) {
    incluirPessoa(enquete.proposta_por, enquete.autor);
    for (const voto of enquete.votos_enquete) incluirPessoa(voto.user_id, voto.perfis);
    for (const conclusao of enquete.conclusoes_debate) {
      incluirPessoa(conclusao.proposta_por, conclusao.autor);
      for (const voto of conclusao.votos_conclusao) incluirPessoa(voto.user_id, voto.perfis);
    }
  }
  const mapearEnquete = (e: (typeof enquetesAtivas)[number] | undefined): Enquete | null =>
    e
      ? {
          id: e.id,
          tipo: e.tipo,
          pergunta: e.pergunta,
          status: e.status as Enquete["status"],
          propostaPor: e.proposta_por,
          propostaPorNome: e.autor?.nome ?? "alguém que saiu",
          votos: e.votos_enquete.map((v) => ({
            pessoa: v.user_id,
            nome: v.perfis?.nome ?? "alguém que saiu",
            momento: v.momento,
            posicao: v.posicao,
            cor: v.perfis?.cor ?? "slate",
            icone: v.perfis?.icone_avatar ?? "",
          })),
          conclusoes: e.conclusoes_debate
            .map((c) => ({
              id: c.id,
              texto: c.texto,
              propostaPor: c.proposta_por,
              propostaPorNome: c.autor?.nome ?? "alguém que saiu",
              votos: c.votos_conclusao.map((v) => ({
                pessoa: v.user_id,
                nome: v.perfis?.nome ?? "alguém que saiu",
                posicao: v.posicao,
              })),
            }))
            .sort((a, b) => a.propostaPorNome.localeCompare(b.propostaPorNome, "pt-BR")),
        }
      : null;
  return {
    id: d.id,
    tema: d.tema,
    data: d.data,
    comHora: d.com_hora,
    formato: d.formato,
    status: d.status,
    criadoPor: d.criado_por,
    presencas: d.presencas
      .map((p) => ({
        id: p.user_id,
        nome: p.perfis?.nome ?? "?",
        cor: p.perfis?.cor ?? "slate",
        icone: p.perfis?.icone_avatar ?? "",
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    participantes: [...pessoas.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    enquete: mapearEnquete(enquetesAtivas.find((e) => e.tipo === "inicial")),
    enquetePosDebate: mapearEnquete(enquetesAtivas.find((e) => e.tipo === "pos_debate")),
  };
}

/** Debates do grupo com presenças e enquete. */
export async function listarDebates(clubeId: string): Promise<Debate[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("debates")
    .select(CAMPOS_DEBATE)
    .eq("clube_id", clubeId)
    .order("data");
  return ((data ?? []) as unknown as Linha[]).map(mapearDebate);
}

/** Um debate do grupo (página do debate), ou null. Uma consulta por requisição (cache). */
export const getDebate = cache(async (clubeId: string, id: number): Promise<Debate | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("debates")
    .select(CAMPOS_DEBATE)
    .eq("clube_id", clubeId)
    .eq("id", id)
    .maybeSingle();
  return data ? mapearDebate(data as unknown as Linha) : null;
});

/** Comentários em ordem cronológica para a página do debate. */
export async function listarComentariosDebate(debateId: number): Promise<ComentarioDebate[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comentarios_debate")
    .select(
      "id, texto, user_id, criado_em, perfis!comentarios_debate_user_id_fkey(nome, cor, icone_avatar)",
    )
    .eq("debate_id", debateId)
    .order("criado_em");

  type Linha = {
    id: number;
    texto: string;
    user_id: string;
    criado_em: string;
    perfis: Pessoa;
  };
  return ((data ?? []) as unknown as Linha[]).map((c) => ({
    id: c.id,
    texto: c.texto,
    autor: c.user_id,
    autorNome: c.perfis?.nome ?? "alguém que saiu",
    autorCor: c.perfis?.cor ?? "slate",
    autorIcone: c.perfis?.icone_avatar ?? "",
    criadoEm: c.criado_em,
  }));
}

/** Ao vivo primeiro, depois os agendados pela data; encerrados à parte, do mais recente. */
export function separarDebates(debates: Debate[]) {
  const aoVivo = debates.filter((d) => d.status === "ao_vivo");
  const agendados = debates.filter((d) => d.status === "agendado");
  const encerrados = debates
    .filter((d) => d.status === "encerrado")
    .sort((a, b) => b.data.localeCompare(a.data));
  return { agenda: [...aoVivo, ...agendados], encerrados };
}
