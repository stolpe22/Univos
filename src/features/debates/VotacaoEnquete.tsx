"use client";

import { useOptimistic, useState, useTransition } from "react";
import { classesBotao } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { votarEnquete } from "./actions";
import {
  contar,
  cruzarVotos,
  NOME_MUDANCA,
  nomePosicao,
  POSICOES,
  resumirViradas,
  type Momento,
  type Mudanca,
  type Posicao,
  type Voto,
} from "./enquete";
/** Visual de cada posição: cor da caixa, do símbolo e do marcador. Cor nunca é a única pista. */
const ESTILO_POSICAO: Record<
  Posicao,
  { caixa: string; texto: string; marcador: string; borda: string; simbolo: string }
> = {
  a_favor: {
    caixa: "border-ok bg-ok/10",
    texto: "text-ok",
    marcador: "bg-ok",
    borda: "border-ok/50 bg-ok/10",
    simbolo: "✓",
  },
  contra: {
    caixa: "border-err bg-err/10",
    texto: "text-err",
    marcador: "bg-err",
    borda: "border-err/50 bg-err/10",
    simbolo: "×",
  },
  nenhum_dos_dois: {
    caixa: "border-accent bg-accent-soft",
    texto: "text-accent",
    marcador: "bg-accent",
    borda: "border-accent/50 bg-accent-soft",
    simbolo: "○",
  },
};

export function Votacao({
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
  const [salvando, startTransition] = useTransition();
  const atual = votos.find((v) => v.pessoa === eu && v.momento === momento)?.posicao ?? null;
  const [meuVoto, setMeuVoto] = useOptimistic<Posicao | null>(atual);
  const [editando, setEditando] = useState(atual === null);

  function votar(p: Posicao) {
    startTransition(async () => {
      setMeuVoto(p);
      const r = await votarEnquete(enqueteId, momento, p);
      if (!r.ok) toast(r.erro);
      else {
        setEditando(false);
        toast(`Sua posição foi salva: ${nomePosicao(p)}.`);
      }
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
      {meuVoto !== null && !editando ? (
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold text-ink ${ESTILO_POSICAO[meuVoto].caixa}`}
          >
            <span aria-hidden="true" className={ESTILO_POSICAO[meuVoto].texto}>
              {ESTILO_POSICAO[meuVoto].simbolo}
            </span>
            {momento === "antes" ? "Sua posição antes:" : "Sua posição depois:"}{" "}
            {nomePosicao(meuVoto)}
          </span>
          <button
            type="button"
            onClick={() => setEditando(true)}
            className={`${classesBotao("ghost", "small")} min-h-11`}
          >
            Mudar voto
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-3">
            {POSICOES.map(({ valor, rotulo }) => {
              const selecionada = meuVoto === valor;
              const estilo = ESTILO_POSICAO[valor];
              return (
                <button
                  key={valor}
                  type="button"
                  aria-pressed={selecionada}
                  disabled={salvando}
                  onClick={() => votar(valor)}
                  className={`${classesBotao("ghost", "small")} w-full justify-start sm:justify-center ${selecionada ? `${estilo.caixa} text-ink` : ""}`}
                >
                  <span aria-hidden="true" className={`font-bold ${estilo.texto}`}>
                    {estilo.simbolo}
                  </span>
                  {rotulo}
                  {selecionada ? " · selecionado" : ""}
                </button>
              );
            })}
          </div>
          {atual !== null && editando && !salvando && (
            <button
              type="button"
              onClick={() => setEditando(false)}
              className={`${classesBotao("ghost", "small")} mt-2 min-h-11`}
            >
              Cancelar alteração
            </button>
          )}
          <p className="mt-2 mb-0 text-xs text-muted">
            Se sua posição for outra, escreva uma conclusão alternativa na seção abaixo.
          </p>
        </>
      )}
    </div>
  );
}

export function Placar({
  votos,
  momento,
  titulo,
}: {
  votos: Voto[];
  momento: Momento;
  titulo: string;
}) {
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
            <li key={c.valor} className="flex flex-wrap items-center gap-2 py-1">
              <EtiquetaPosicao posicao={c.valor} />
              <span className="font-semibold">({c.nomes.length})</span>
              {c.nomes.length > 0 && <span className="text-muted">{c.nomes.join(", ")}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EtiquetaPosicao({ posicao }: { posicao: Posicao }) {
  const estilo = ESTILO_POSICAO[posicao];
  return (
    <span
      className={`inline-flex min-h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-bold text-ink ${estilo.borda}`}
    >
      <span aria-hidden="true" className={`size-2 rounded-full ${estilo.marcador}`} />
      {nomePosicao(posicao)}
    </span>
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

/** Quem manteve ou mudou sua posição entre os dois momentos. */
export function Resultado({ votos }: { votos: Voto[] }) {
  const cruzados = cruzarVotos(votos);
  const resumo = resumirViradas(votos);
  if (cruzados.length === 0) {
    return <p className="m-0 text-sm text-muted">Ninguém votou nesta enquete.</p>;
  }
  return (
    <div>
      <p className="mt-0 mb-1 text-sm font-bold">
        Viradas de opinião: {resumo.comparaveis ? resumo.viradas : "—"}
      </p>
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
                <li key={p.pessoa} className="flex items-start gap-2 py-1 text-muted">
                  <Avatar
                    nome={p.nome}
                    cor={p.cor}
                    icone={p.icone || null}
                    className="size-8 text-[11px]"
                  />
                  <span className="grid min-w-0 gap-1">
                    <b className="break-words text-ink">{p.nome}</b>
                    <span className="flex min-w-0 flex-nowrap items-center gap-1.5">
                      {p.antes ? (
                        <EtiquetaPosicao posicao={p.antes} />
                      ) : (
                        <span className="whitespace-nowrap">—</span>
                      )}
                      <span aria-hidden="true" className="shrink-0">
                        →
                      </span>
                      {p.depois ? (
                        <EtiquetaPosicao posicao={p.depois} />
                      ) : (
                        <span className="whitespace-nowrap">ainda não votou</span>
                      )}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
