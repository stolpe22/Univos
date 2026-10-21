"use client";

import { useTransition, type ReactNode } from "react";
import { BotaoVoto } from "@/components/ui/BotaoVoto";
import { Pill } from "@/components/ui/Card";
import { Capa } from "@/components/ui/Capa";
import { useToast } from "@/components/ui/Toast";
import { EscolherLivro } from "@/features/livro/EscolherLivro";
import { tirarDaEstante, voltarParaEstante, votarLivro } from "./actions";
import { EdicoesDoGrupo } from "./EdicoesDoGrupo";
import { MetadadosCatalogo } from "./MetadadosCatalogo";
import type { LivroEstante } from "./queries";
import { QuemLeu } from "./QuemLeu";
import { comExemplar, leuOLivro } from "./regras";

/**
 * A estante do grupo: nenhum livro sai dela. Vota-se nos que o grupo ainda não leu;
 * o livro da vez e os já lidos pelo grupo ficam marcados.
 */
export function ListaEstante({
  livros,
  eu,
  modera,
  maisVotado,
  temLivroDaVez,
  vazio,
}: {
  livros: LivroEstante[];
  eu: string;
  modera: boolean;
  maisVotado: number | null;
  temLivroDaVez: boolean;
  vazio: ReactNode;
}) {
  if (livros.length === 0) return <div className="px-2 py-4 text-center text-muted">{vazio}</div>;
  return (
    <ol className="m-0 list-none divide-y divide-line p-0">
      {livros.map((l) => (
        <ItemEstante
          key={l.id}
          livro={l}
          eu={eu}
          maisVotado={l.id === maisVotado}
          podeTirar={l.status === "fila" && (modera || l.sugeridoPor === eu)}
          podeEscolher={l.status === "fila" && modera && !temLivroDaVez}
        />
      ))}
    </ol>
  );
}

function ItemEstante({
  livro: l,
  eu,
  maisVotado,
  podeTirar,
  podeEscolher,
}: {
  livro: LivroEstante;
  eu: string;
  maisVotado: boolean;
  podeTirar: boolean;
  podeEscolher: boolean;
}) {
  const { toast } = useToast();
  const [tirando, startTransition] = useTransition();
  const temExemplar = comExemplar(l);

  function tirar() {
    startTransition(async () => {
      const r = await tirarDaEstante(l.id);
      if (!r.ok) return toast(r.erro);
      toast(`“${l.titulo}” saiu da estante.`, {
        desfazer: async () => {
          const volta = await voltarParaEstante(r.dados);
          if (!volta.ok) throw new Error(volta.erro);
        },
      });
    });
  }

  return (
    <li id={`livro-${l.id}`} className="scroll-mt-28 py-3">
      {/* em cima: capa, título e o que se vê de relance; embaixo, na largura toda, os detalhes */}
      <div className="flex items-start gap-2.5">
        <Capa id={l.id} titulo={l.titulo} pequena />
        <div className="min-w-0 flex-1">
          <b>
            {maisVotado && <span aria-label="Mais votado">🥇 </span>}
            {l.titulo}
          </b>
          <div className="text-[13.5px] text-muted">
            {l.autor} · {l.paginas} págs. · sugerido por{" "}
            {l.sugeridoPor === eu ? "você" : l.sugeridoPorNome}
            {temExemplar > 0 &&
              ` · ${temExemplar} ${temExemplar === 1 ? "pessoa tem" : "pessoas têm"} o livro`}
          </div>
          {(l.status !== "fila" || leuOLivro(l, eu)) && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {l.status === "atual" && <Pill>📖 livro da vez</Pill>}
              {l.status === "lido" && <Pill>✓ o grupo leu</Pill>}
              {leuOLivro(l, eu) && <Pill>você leu</Pill>}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <QuemLeu livro={l} eu={eu} />
          {l.status === "fila" && (
            <BotaoVoto
              rotulo={l.titulo}
              votado={l.votos.includes(eu)}
              total={l.votos.length}
              alternar={(votar) => votarLivro(l.id, votar)}
            />
          )}
        </div>
      </div>
      <MetadadosCatalogo livro={l} />
      <EdicoesDoGrupo livro={l} eu={eu} />
      {(podeEscolher || podeTirar) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {podeEscolher && (
            <EscolherLivro
              livro={{
                id: l.id,
                titulo: l.titulo,
                votos: l.votos.length,
                comExemplar: temExemplar,
              }}
            />
          )}
          {podeTirar && (
            <button
              type="button"
              onClick={tirar}
              disabled={tirando}
              className="min-h-11 cursor-pointer px-1 text-sm font-semibold text-accent underline disabled:opacity-40"
            >
              Tirar da estante
            </button>
          )}
        </div>
      )}
    </li>
  );
}
