import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AoVivo } from "@/components/AoVivo";
import { Card, Pill } from "@/components/ui/Card";
import { getClubeAtual, podeModerar } from "@/features/clube/queries";
import { AcoesDebate } from "@/features/debates/AcoesDebate";
import { ComentariosDebate } from "@/features/debates/ComentariosDebate";
import { EnqueteBloco } from "@/features/debates/EnqueteBloco";
import { InfoDebate, Participantes } from "@/features/debates/ItemDebate";
import { Presenca } from "@/features/debates/Presenca";
import { getDebate, listarComentariosDebate } from "@/features/debates/queries";

/** Debate do grupo aberto a partir do id da URL, ou null (id inválido ou de outro grupo). */
async function debateDaUrl(params: PageProps<"/debates/[id]">["params"]) {
  const [{ id }, clube] = await Promise.all([params, getClubeAtual()]);
  const debateId = Number(id);
  if (!clube || !Number.isSafeInteger(debateId) || debateId <= 0) return null;
  const debate = await getDebate(clube.id, debateId);
  return debate ? { clube, debate } : null;
}

// O link do debate é compartilhado no WhatsApp: a aba e a prévia mostram o tema.
export async function generateMetadata({ params }: PageProps<"/debates/[id]">): Promise<Metadata> {
  const achou = await debateDaUrl(params);
  if (!achou) return { title: "Debate" };
  return {
    title: achou.debate.tema,
    openGraph: {
      title: `Debate: ${achou.debate.tema}`,
      description: "Vote na enquete, deixe sua conclusão e comente no Uni-vos.",
    },
  };
}

export default async function DebatePage({ params }: PageProps<"/debates/[id]">) {
  const achou = await debateDaUrl(params);
  if (!achou) notFound();
  const { clube, debate } = achou;
  const comentarios = await listarComentariosDebate(debate.id);
  const modera = podeModerar(clube);

  return (
    <>
      <AoVivo
        canal={`debate-${clube.id}-${debate.id}`}
        tabelas={[
          "debates",
          "presencas",
          "enquetes",
          "votos_enquete",
          "conclusoes_debate",
          "votos_conclusao",
          "comentarios_debate",
        ]}
      />
      <Link
        href="/debates"
        className="mb-3 inline-flex min-h-11 items-center font-semibold text-accent underline"
      >
        ← Voltar para Debates
      </Link>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h1 className="m-0 text-[clamp(24px,4vw,32px)] font-bold">{debate.tema}</h1>
          {debate.status === "ao_vivo" && <Pill>Em andamento</Pill>}
          {debate.status === "encerrado" && <Pill>Encerrado</Pill>}
        </div>
        <div className="mt-1">
          <InfoDebate debate={debate} />
        </div>
        {debate.status !== "encerrado" ? (
          <Presenca debate={debate} eu={clube.uid} />
        ) : (
          <Participantes debate={debate} />
        )}
        <div className="mt-3">
          <AcoesDebate debate={debate} permiteMudar={modera || debate.criadoPor === clube.uid} />
        </div>
      </Card>

      <div className="mt-3.5 grid gap-3.5 md:grid-cols-2">
        <Card titulo="Enquete e conclusões" id="enquete">
          <EnqueteBloco debate={debate} eu={clube.uid} modera={modera} />
        </Card>
        <Card titulo="Comentários" id="comentarios">
          <ComentariosDebate debateId={debate.id} comentarios={comentarios} eu={clube.uid} />
        </Card>
      </div>
    </>
  );
}
