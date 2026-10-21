"use client";

import { useActionState, useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { Button, classesBotao } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import type { EstadoForm } from "@/lib/resultado";
import { decidirEnquete, proporEnquete, retirarEnquete, votarEnquete } from "./actions";
import {
  contar,
  cruzarVotos,
  NOME_MUDANCA,
  nomePosicao,
  POSICOES,
  type Momento,
  type Mudanca,
  type Posicao,
  type Voto,
} from "./enquete";
import type { Debate } from "./queries";

type Props = { debate: Debate; eu: string; modera: boolean };

/**
 * Enquete do debate: proposta → aprovada pelo moderador → voto antes (agendado)
 * → voto depois (encerrado) → quem mudou de ideia. Voto aberto.
 */
export function EnqueteBloco({ debate, eu, modera }: Props) {
  const e = debate.enquete;

  if (!e) {
    if (debate.status !== "agendado") return null;
    return <ProporEnquete debateId={debate.id} />;
  }

  if (e.status === "proposta") {
    return (
      <Moldura>
        <p className="m-0 text-sm">
          <b>“{e.pergunta}”</b>
          <br />
          <span className="text-muted">
            Proposta por {e.propostaPor === eu ? "você" : e.propostaPorNome}. Esperando um moderador
            aprovar pra abrir a votação.
          </span>
        </p>
        <DecisaoEnquete id={e.id} modera={modera} minha={e.propostaPor === eu} />
      </Moldura>
    );
  }

  return (
    <Moldura>
      <p className="mt-0 mb-2 font-semibold">“{e.pergunta}”</p>
      {debate.status === "agendado" && (
        <>
          <Votacao enqueteId={e.id} momento="antes" votos={e.votos} eu={eu} />
          <Placar votos={e.votos} momento="antes" titulo="Antes do debate" />
        </>
      )}
      {debate.status === "ao_vivo" && (
        <>
          <p className="mt-0 mb-2 text-sm text-muted">
            A votação de antes fechou. A de depois abre quando o debate terminar.
          </p>
          <Placar votos={e.votos} momento="antes" titulo="Antes do debate" />
        </>
      )}
      {debate.status === "encerrado" && (
        <>
          <Votacao enqueteId={e.id} momento="depois" votos={e.votos} eu={eu} />
          <Resultado votos={e.votos} />
        </>
      )}
    </Moldura>
  );
}

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-xl border border-line bg-bg p-3">
      <p className="mt-0 mb-1.5">
        <Pill>📊 Enquete</Pill>
      </p>
      {children}
    </div>
  );
}

function ProporEnquete({ debateId }: { debateId: number }) {
  const { toast } = useToast();
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState<EstadoForm<"pergunta">, FormData>(
    proporEnquete.bind(null, debateId),
    null,
  );
  const ref = useRef<HTMLInputElement>(null);
  const erro = estado && !estado.ok ? estado.erros.pergunta : undefined;

  useEffect(() => {
    if (!estado) return;
    if (estado.ok) toast(estado.mensagem);
    else if (estado.erros.pergunta) ref.current?.focus();
    else if (estado.erros.geral) toast(estado.erros.geral);
  }, [estado, toast]);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-2 min-h-11 cursor-pointer text-sm font-semibold text-accent underline"
      >
        + Propor uma enquete pra este debate
      </button>
    );
  }

  return (
    <Moldura>
      <form action={acao} noValidate className="grid gap-2">
        <Field
          ref={ref}
          autoFocus
          label="Pergunta da enquete"
          name="pergunta"
          autoComplete="off"
          enterKeyHint="send"
          maxLength={160}
          placeholder="Ex: Privatizar os Correios?"
          hint="Todo mundo vota a favor, contra ou indeciso antes e depois do debate."
          defaultValue={estado && !estado.ok ? estado.valores.pergunta : ""}
          erro={erro}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" tamanho="small" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar pra aprovação"}
          </Button>
          <Button variante="ghost" tamanho="small" onClick={() => setAberto(false)}>
            Cancelar
          </Button>
        </div>
      </form>
    </Moldura>
  );
}

function DecisaoEnquete({ id, modera, minha }: { id: number; modera: boolean; minha: boolean }) {
  const { toast } = useToast();
  const [ocupado, startTransition] = useTransition();

  function rodar(fn: () => Promise<{ ok: boolean; erro?: string }>, sucesso: string) {
    startTransition(async () => {
      const r = await fn();
      toast(r.ok ? sucesso : (r.erro ?? "Não deu agora. Tente de novo."));
    });
  }

  if (!modera && !minha) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {modera && (
        <>
          <Button
            tamanho="small"
            disabled={ocupado}
            onClick={() =>
              rodar(() => decidirEnquete(id, true), "Enquete aprovada. A votação abriu.")
            }
          >
            Aprovar
          </Button>
          <Button
            variante="ghost"
            tamanho="small"
            disabled={ocupado}
            onClick={() => rodar(() => decidirEnquete(id, false), "Enquete recusada.")}
          >
            Recusar
          </Button>
        </>
      )}
      {minha && !modera && (
        <Button
          variante="ghost"
          tamanho="small"
          disabled={ocupado}
          onClick={() => rodar(() => retirarEnquete(id), "Pergunta retirada.")}
        >
          Retirar pergunta
        </Button>
      )}
    </div>
  );
}

function Votacao({
  enqueteId,
  momento,
  votos,
  eu,
}: {
  enqueteId: number;
  momento: Momento;
  votos: Voto[];
  eu: string;
}) {
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const atual = votos.find((v) => v.pessoa === eu && v.momento === momento)?.posicao ?? null;
  const [meuVoto, setMeuVoto] = useOptimistic<Posicao | null>(atual);

  function votar(p: Posicao) {
    const novo = meuVoto === p ? null : p;
    startTransition(async () => {
      setMeuVoto(novo);
      const r = await votarEnquete(enqueteId, momento, novo);
      if (!r.ok) toast(r.erro);
      else toast(novo ? `Voto “${nomePosicao(novo)}” registrado.` : "Voto removido.");
    });
  }

  return (
    <div
      role="group"
      aria-label={
        momento === "antes" ? "Sua posição antes do debate" : "Sua posição depois do debate"
      }
      className="mb-3"
    >
      <p className="mt-0 mb-1.5 text-sm font-semibold">
        {momento === "antes" ? "Antes do debate, você é:" : "E agora, depois do debate?"}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {POSICOES.map(({ valor, rotulo }) => (
          <button
            key={valor}
            type="button"
            aria-pressed={meuVoto === valor}
            onClick={() => votar(valor)}
            className={`${classesBotao(meuVoto === valor ? "primary" : "ghost", "small")} w-full`}
          >
            {meuVoto === valor && "✓ "}
            {rotulo}
          </button>
        ))}
      </div>
    </div>
  );
}

function Placar({ votos, momento, titulo }: { votos: Voto[]; momento: Momento; titulo: string }) {
  const contagem = contar(votos, momento);
  const total = contagem.reduce((n, c) => n + c.nomes.length, 0);
  return (
    <div>
      <p className="mt-0 mb-1 text-xs font-bold tracking-wide text-muted uppercase">
        {titulo} · {total} {total === 1 ? "voto" : "votos"}
      </p>
      {total === 0 ? (
        <p className="m-0 text-sm text-muted">Ninguém votou ainda. Vote acima.</p>
      ) : (
        <ul className="m-0 list-none p-0 text-sm">
          {contagem.map((c) => (
            <li key={c.valor} className="py-0.5">
              <b>
                {c.rotulo} ({c.nomes.length})
              </b>
              {c.nomes.length > 0 && <span className="text-muted">: {c.nomes.join(", ")}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const ORDEM_MUDANCA: Mudanca[] = [
  "mudou_de_lado",
  "decidiu",
  "ficou_em_duvida",
  "manteve",
  "so_antes",
  "so_depois",
];

/** Quem manteve, quem mudou de lado, quem saiu do indeciso. */
function Resultado({ votos }: { votos: Voto[] }) {
  const cruzados = cruzarVotos(votos);
  if (cruzados.length === 0) {
    return <p className="m-0 text-sm text-muted">Ninguém votou nesta enquete.</p>;
  }
  return (
    <div>
      <p className="mt-0 mb-1 text-xs font-bold tracking-wide text-muted uppercase">
        Quem mudou de ideia
      </p>
      {ORDEM_MUDANCA.map((m) => {
        const pessoas = cruzados.filter((c) => c.mudanca === m);
        if (pessoas.length === 0) return null;
        return (
          <div key={m} className="py-1 text-sm">
            <b>
              {NOME_MUDANCA[m]} ({pessoas.length})
            </b>
            <ul className="m-0 list-none p-0">
              {pessoas.map((p) => (
                <li key={p.pessoa} className="text-muted">
                  {p.nome}: {p.antes ? nomePosicao(p.antes) : "—"} →{" "}
                  {p.depois ? nomePosicao(p.depois) : "ainda não votou"}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
