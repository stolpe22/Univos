import "server-only";
import type { CorPerfil } from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/server";
import type { Momento, Posicao, Voto } from "./enquete";

export type FaseDebate = "agendado" | "ao_vivo" | "encerrado";

export type Enquete = {
  id: number;
  pergunta: string;
  status: "proposta" | "aprovada";
  propostaPor: string | null;
  propostaPorNome: string;
  votos: Voto[];
};

export type Debate = {
  id: number;
  tema: string;
  data: string;
  formato: string;
  status: FaseDebate;
  criadoPor: string | null;
  presencas: { id: string; nome: string; cor: CorPerfil }[];
  /** A enquete viva (proposta ou aprovada); recusadas não aparecem. */
  enquete: Enquete | null;
};

type Pessoa = { nome: string; cor: CorPerfil } | null;

/** Debates do grupo com presenças e enquete. */
export async function listarDebates(clubeId: string): Promise<Debate[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("debates")
    .select(
      `id, tema, data, formato, status, criado_por,
       presencas(user_id, perfis!presencas_user_id_fkey(nome, cor)),
       enquetes(id, pergunta, status, proposta_por, criado_em,
         autor:perfis!enquetes_proposta_por_fkey(nome),
         votos_enquete(user_id, momento, posicao, perfis!votos_enquete_user_id_fkey(nome)))`,
    )
    .eq("clube_id", clubeId)
    .order("data");

  type Linha = {
    id: number;
    tema: string;
    data: string;
    formato: string;
    status: FaseDebate;
    criado_por: string | null;
    presencas: { user_id: string; perfis: Pessoa }[];
    enquetes: {
      id: number;
      pergunta: string;
      status: "proposta" | "aprovada" | "recusada";
      proposta_por: string | null;
      criado_em: string;
      autor: { nome: string } | null;
      votos_enquete: {
        user_id: string;
        momento: Momento;
        posicao: Posicao;
        perfis: { nome: string } | null;
      }[];
    }[];
  };

  return ((data ?? []) as unknown as Linha[]).map((d) => {
    const viva = d.enquetes.find((e) => e.status !== "recusada");
    return {
      id: d.id,
      tema: d.tema,
      data: d.data,
      formato: d.formato,
      status: d.status,
      criadoPor: d.criado_por,
      presencas: d.presencas
        .map((p) => ({ id: p.user_id, nome: p.perfis?.nome ?? "?", cor: p.perfis?.cor ?? "slate" }))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
      enquete: viva
        ? {
            id: viva.id,
            pergunta: viva.pergunta,
            status: viva.status as Enquete["status"],
            propostaPor: viva.proposta_por,
            propostaPorNome: viva.autor?.nome ?? "alguém que saiu",
            votos: viva.votos_enquete.map((v) => ({
              pessoa: v.user_id,
              nome: v.perfis?.nome ?? "alguém que saiu",
              momento: v.momento,
              posicao: v.posicao,
            })),
          }
        : null,
    };
  });
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
