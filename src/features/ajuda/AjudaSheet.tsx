"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { filtrarAjuda } from "./conteudo";

type Props = {
  aberto: boolean;
  aoFechar: () => void;
  /** Seção da página atual: aparece primeiro e com a primeira pergunta aberta. */
  secaoAtual?: string;
  /** Abre já buscando este texto (ex: pergunta escolhida na busca global). */
  buscaInicial?: string;
};

export function AjudaSheet({ aberto, aoFechar, secaoAtual, buscaInicial = "" }: Props) {
  const [busca, setBusca] = useState(buscaInicial);
  const secoes = filtrarAjuda(busca, secaoAtual);

  return (
    <Sheet aberto={aberto} aoFechar={aoFechar} titulo="Ajuda">
      <Field
        label="Buscar na ajuda"
        type="search"
        enterKeyHint="search"
        placeholder="Ex: spoiler, votar, meta"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />
      {secoes.length === 0 ? (
        <p className="px-2 py-4 text-center text-muted">
          Nada encontrado. Tente outra palavra, como “livro” ou “debate”.
        </p>
      ) : (
        secoes.map((s) => (
          <section key={s.chave}>
            <h3 className="mt-4 mb-0.5 flex items-center gap-2 text-lg font-bold">
              {s.titulo}
              {s.chave === secaoAtual && (
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-sans text-xs font-bold text-accent">
                  esta página
                </span>
              )}
            </h3>
            {s.perguntas.map((p, i) => (
              <details
                key={p.pergunta}
                open={!!busca || (s.chave === secaoAtual && i === 0)}
                className="border-b border-line py-2"
              >
                <summary className="flex min-h-11 cursor-pointer items-center font-semibold">
                  {p.pergunta}
                </summary>
                <p className="mt-1 mb-1.5 text-muted">{p.resposta}</p>
              </details>
            ))}
          </section>
        ))
      )}
    </Sheet>
  );
}
