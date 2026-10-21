import Link from "next/link";
import { AvatarStack } from "@/components/ui/AvatarStack";
import { Pill } from "@/components/ui/Card";
import { formatarDataComDia } from "@/lib/datas";
import { AcoesDebate } from "./AcoesDebate";
import { conclusaoMaisVotada, resumirViradas } from "./enquete";
import { Presenca } from "./Presenca";
import type { Debate } from "./queries";
import { COMO_FUNCIONA } from "./schemas";

/** Um debate na agenda (ou em "Já rolaram"), com o resumo da enquete e as ações. */
export function ItemDebate({
  debate: d,
  eu,
  modera,
}: {
  debate: Debate;
  eu: string;
  modera: boolean;
}) {
  const enquetes = [d.enquete, d.enquetePosDebate].filter((e) => e !== null);
  const viradas = enquetes
    .filter((e) => e.status === "aprovada")
    .map((e) => resumirViradas(e.votos))
    .find((r) => r.comparaveis > 0);
  const conclusao = conclusaoMaisVotada(enquetes.flatMap((e) => e.conclusoes));

  return (
    <li id={`debate-${d.id}`} className="scroll-mt-28 py-3.5">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/debates/${d.id}`}
          className="min-w-0 font-bold break-words text-ink underline decoration-transparent underline-offset-4 [@media(hover:hover)]:hover:decoration-current"
        >
          {d.tema}
        </Link>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {d.status === "ao_vivo" && <Pill>Em andamento</Pill>}
          {viradas && (
            <Pill className="whitespace-nowrap">
              {viradas.viradas} {viradas.viradas === 1 ? "virada" : "viradas"} de opinião
            </Pill>
          )}
          {conclusao && (
            <div className="flex flex-col items-end gap-0.5">
              <Pill className="whitespace-nowrap">{conclusao.percentual}% concordam</Pill>
              <span className="text-right text-[11px] text-muted">na conclusão mais votada</span>
            </div>
          )}
        </div>
      </div>
      <InfoDebate debate={d} />
      {d.status !== "encerrado" ? <Presenca debate={d} eu={eu} /> : <Participantes debate={d} />}
      <div className="mt-4 border-t border-line pt-3">
        <AcoesDebate debate={d} incluirAbrir permiteMudar={modera || d.criadoPor === eu} />
      </div>
    </li>
  );
}

/** Data, formato e como o formato funciona. Usado na agenda e na página do debate. */
export function InfoDebate({ debate: d }: { debate: Debate }) {
  return (
    <>
      <div className="text-[13.5px] text-muted">
        {formatarDataComDia(d.data)} · {d.formato}
      </div>
      {COMO_FUNCIONA[d.formato] && (
        <div className="text-[13px] text-muted">{COMO_FUNCIONA[d.formato]}</div>
      )}
    </>
  );
}

/** Quem participou de um debate encerrado (presença, voto, comentário ou conclusão). */
export function Participantes({ debate: d }: { debate: Debate }) {
  if (d.participantes.length === 0) return null;
  return (
    <div className="mt-2 flex items-center gap-2 text-[13px] text-muted">
      <AvatarStack pessoas={d.participantes} />
      <span>
        {d.participantes.length} {d.participantes.length === 1 ? "participante" : "participantes"}
      </span>
    </div>
  );
}
