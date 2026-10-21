"use client";

import { Moldura } from "./EnqueteMoldura";
import { ConclusoesBloco } from "./ConclusoesBloco";
import { DecisaoEnquete, ProporEnquete } from "./EnqueteProposta";
import { Placar, Resultado, Votacao } from "./VotacaoEnquete";
import type { Debate, Enquete } from "./queries";

type Props = { debate: Debate; eu: string; modera: boolean };

/** Mostra a pergunta inicial e, depois do debate, uma enquete extra de posicionamento. */
export function EnqueteBloco({ debate, eu, modera }: Props) {
  const enquetes = [debate.enquete, debate.enquetePosDebate].filter(
    (enquete): enquete is Enquete => enquete !== null,
  );
  // a pergunta inicial vale também com o debate em andamento ("Já está rolando")
  const podeProporInicial = debate.status !== "encerrado" && debate.enquete === null;
  const podeProporPosDebate = debate.status === "encerrado" && debate.enquetePosDebate === null;

  if (enquetes.length === 0 && !podeProporInicial && !podeProporPosDebate) return null;

  return (
    <div className="mt-3 grid gap-3">
      {enquetes.map((enquete) => (
        <EnqueteItem key={enquete.id} enquete={enquete} debate={debate} eu={eu} modera={modera} />
      ))}
      {podeProporInicial && <ProporEnquete debateId={debate.id} tipo="inicial" />}
      {podeProporPosDebate && <ProporEnquete debateId={debate.id} tipo="pos_debate" />}
    </div>
  );
}

function EnqueteItem({
  enquete,
  debate,
  eu,
  modera,
}: {
  enquete: Enquete;
  debate: Debate;
  eu: string;
  modera: boolean;
}) {
  const titulo = enquete.tipo === "inicial" ? "Pergunta inicial" : "Enquete de posicionamento";

  if (enquete.status === "proposta") {
    return (
      <Moldura titulo={titulo}>
        <p className="m-0 text-sm">
          <b>“{enquete.pergunta}”</b>
          <br />
          <span className="text-muted">
            Proposta por {enquete.propostaPor === eu ? "você" : enquete.propostaPorNome}. Aguardando
            aprovação de quem modera.
          </span>
        </p>
        <DecisaoEnquete id={enquete.id} modera={modera} minha={enquete.propostaPor === eu} />
        <ConclusoesBloco enqueteId={enquete.id} conclusoes={enquete.conclusoes} eu={eu} />
      </Moldura>
    );
  }

  return (
    <Moldura titulo={titulo}>
      <p className="mt-0 mb-2 font-semibold">“{enquete.pergunta}”</p>
      {debate.status === "agendado" && (
        <>
          <Votacao enqueteId={enquete.id} momento="antes" votos={enquete.votos} eu={eu} />
          <Placar votos={enquete.votos} momento="antes" titulo="Antes do debate" />
        </>
      )}
      {debate.status === "ao_vivo" && (
        <>
          <p className="mt-0 mb-2 text-sm text-muted">
            O debate está rolando: marque como você pensava quando ele começou. A votação de depois
            abre quando o debate terminar.
          </p>
          <Votacao enqueteId={enquete.id} momento="antes" votos={enquete.votos} eu={eu} />
          <Placar votos={enquete.votos} momento="antes" titulo="Antes do debate" />
        </>
      )}
      {debate.status === "encerrado" && (
        <>
          <Votacao enqueteId={enquete.id} momento="antes" votos={enquete.votos} eu={eu} />
          <Placar votos={enquete.votos} momento="antes" titulo="Antes do debate" />
          <div className="mt-3 border-t border-line pt-3">
            <Votacao enqueteId={enquete.id} momento="depois" votos={enquete.votos} eu={eu} />
            <Placar votos={enquete.votos} momento="depois" titulo="Depois do debate" />
          </div>
          <div className="mt-3 border-t border-line pt-3">
            <Resultado votos={enquete.votos} />
          </div>
        </>
      )}
      <ConclusoesBloco enqueteId={enquete.id} conclusoes={enquete.conclusoes} eu={eu} />
    </Moldura>
  );
}
