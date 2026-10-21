"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { BotaoVoto } from "@/components/ui/BotaoVoto";
import { Button } from "@/components/ui/Button";
import { Capa } from "@/components/ui/Capa";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import type { EstadoForm } from "@/lib/resultado";
import { sugerirLivro, tirarDaFila, voltarParaFila, votarLivro } from "./actions";
import type { LivroEstante } from "./queries";

export function Fila({
  livros,
  eu,
  modera,
}: {
  livros: LivroEstante[];
  eu: string;
  modera: boolean;
}) {
  if (livros.length === 0) {
    return (
      <p className="px-2 py-4 text-center text-muted">
        A fila está vazia. Sugira o primeiro livro no formulário.
      </p>
    );
  }
  return (
    <ol className="m-0 list-none divide-y divide-line p-0">
      {livros.map((l, i) => (
        <ItemFila
          key={l.id}
          livro={l}
          primeiro={i === 0}
          eu={eu}
          podeTirar={modera || l.sugeridoPor === eu}
        />
      ))}
    </ol>
  );
}

function ItemFila({
  livro: l,
  primeiro,
  eu,
  podeTirar,
}: {
  livro: LivroEstante;
  primeiro: boolean;
  eu: string;
  podeTirar: boolean;
}) {
  const { toast } = useToast();
  const [tirando, startTransition] = useTransition();

  function tirar() {
    startTransition(async () => {
      const r = await tirarDaFila(l.id);
      if (!r.ok) return toast(r.erro);
      toast(`“${l.titulo}” saiu da fila.`, {
        desfazer: async () => {
          const volta = await voltarParaFila(r.dados);
          if (!volta.ok) throw new Error(volta.erro);
        },
      });
    });
  }

  return (
    <li id={`livro-${l.id}`} className="flex items-center gap-2.5 py-3">
      <Capa id={l.id} titulo={l.titulo} pequena />
      <div className="min-w-0 flex-1">
        <b>
          {primeiro && <span aria-label="Mais votado">🥇 </span>}
          {l.titulo}
        </b>
        <div className="text-[13.5px] text-muted">
          {l.autor} · {l.paginas} págs. · sugerido por{" "}
          {l.sugeridoPor === eu ? "você" : l.sugeridoPorNome}
        </div>
        {podeTirar && (
          <button
            type="button"
            onClick={tirar}
            disabled={tirando}
            className="min-h-11 cursor-pointer text-sm font-semibold text-accent underline disabled:opacity-40"
          >
            Tirar da fila
          </button>
        )}
      </div>
      <BotaoVoto
        rotulo={l.titulo}
        votado={l.votos.includes(eu)}
        total={l.votos.length}
        alternar={(votar) => votarLivro(l.id, votar)}
      />
    </li>
  );
}

type Campos = "titulo" | "autor" | "paginas";

export function SugerirLivroForm() {
  const { toast } = useToast();
  const [estado, acao, enviando] = useActionState<EstadoForm<Campos>, FormData>(sugerirLivro, null);
  const form = useRef<HTMLFormElement>(null);
  const erros = estado && !estado.ok ? estado.erros : {};
  const valores = estado && !estado.ok ? estado.valores : {};

  useEffect(() => {
    if (!estado) return;
    if (estado.ok) {
      const id = estado.desfazer as number;
      toast(estado.mensagem, {
        desfazer: async () => {
          const r = await tirarDaFila(id);
          if (!r.ok) throw new Error(r.erro);
        },
      });
    } else if (estado.erros.geral) toast(estado.erros.geral);
    else form.current?.querySelector<HTMLInputElement>("[aria-invalid=true]")?.focus();
  }, [estado, toast]);

  return (
    <form ref={form} action={acao} noValidate className="grid gap-3">
      <Field
        label="Título"
        name="titulo"
        autoComplete="off"
        enterKeyHint="next"
        maxLength={160}
        placeholder="Ex: A Revolução dos Bichos"
        defaultValue={valores.titulo ?? ""}
        erro={erros.titulo}
      />
      <Field
        label="Autor"
        name="autor"
        autoComplete="off"
        enterKeyHint="next"
        maxLength={120}
        placeholder="Ex: George Orwell"
        defaultValue={valores.autor ?? ""}
        erro={erros.autor}
      />
      <Field
        label="Número de páginas"
        name="paginas"
        type="number"
        inputMode="numeric"
        enterKeyHint="done"
        min={1}
        max={3000}
        placeholder="Ex: 152"
        hint="Usado para calcular o progresso de leitura."
        defaultValue={valores.paginas ?? ""}
        erro={erros.paginas}
      />
      <Button type="submit" disabled={enviando}>
        {enviando ? "Adicionando…" : "Adicionar à fila"}
      </Button>
    </form>
  );
}
