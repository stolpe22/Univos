"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { BotaoVoto } from "@/components/ui/BotaoVoto";
import { Button, classesBotao } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import type { EstadoForm } from "@/lib/resultado";
import { proporTema, tirarTema, voltarTema, votarTema } from "./actions";
import type { Tema } from "./queries";

export function ListaTemas({ temas, eu, modera }: { temas: Tema[]; eu: string; modera: boolean }) {
  if (temas.length === 0) {
    return (
      <p className="px-2 py-4 text-center text-muted">
        Nenhum tema ainda. Proponha o primeiro no formulário.
      </p>
    );
  }
  return (
    <ul className="m-0 list-none divide-y divide-line p-0">
      {temas.map((t) => (
        <ItemTema key={t.id} tema={t} eu={eu} podeTirar={modera || t.propostoPor === eu} />
      ))}
    </ul>
  );
}

function ItemTema({ tema: t, eu, podeTirar }: { tema: Tema; eu: string; podeTirar: boolean }) {
  const { toast } = useToast();
  const [tirando, startTransition] = useTransition();

  function tirar() {
    startTransition(async () => {
      const r = await tirarTema(t.id);
      if (!r.ok) return toast(r.erro);
      toast("Tema tirado da pauta.", {
        desfazer: async () => {
          const volta = await voltarTema(r.dados);
          if (!volta.ok) throw new Error(volta.erro);
        },
      });
    });
  }

  return (
    <li id={`tema-${t.id}`} className="scroll-mt-28 py-3">
      <b>{t.tema}</b>
      <div className="text-[13px] text-muted">
        proposto por {t.propostoPor === eu ? "você" : t.propostoPorNome}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <BotaoVoto
          rotulo={t.tema}
          votado={t.votos.includes(eu)}
          total={t.votos.length}
          alternar={(votar) => votarTema(t.id, votar)}
        />
        {/* Atalho entre módulos (heurística 7): o tema vai preenchido para Debates */}
        <Link
          href={`/debates?tema=${encodeURIComponent(t.tema)}#marcar`}
          className={classesBotao("ghost", "small")}
        >
          Virar debate →
        </Link>
        {podeTirar && (
          <button
            type="button"
            onClick={tirar}
            disabled={tirando}
            className="min-h-11 cursor-pointer px-1 text-sm font-semibold text-accent underline disabled:opacity-40"
          >
            Tirar da pauta
          </button>
        )}
      </div>
    </li>
  );
}

export function ProporTemaForm() {
  const { toast } = useToast();
  const [estado, acao, enviando] = useActionState<EstadoForm<"tema">, FormData>(proporTema, null);
  const ref = useRef<HTMLInputElement>(null);
  const erro = estado && !estado.ok ? estado.erros.tema : undefined;

  useEffect(() => {
    if (!estado) return;
    if (estado.ok) {
      const id = estado.desfazer as number;
      toast(estado.mensagem, {
        desfazer: async () => {
          const r = await tirarTema(id);
          if (!r.ok) throw new Error(r.erro);
        },
      });
    } else if (estado.erros.tema) ref.current?.focus();
    else if (estado.erros.geral) toast(estado.erros.geral);
  }, [estado, toast]);

  return (
    <form action={acao} noValidate className="grid gap-3">
      <Field
        ref={ref}
        label="Tema"
        name="tema"
        autoComplete="off"
        enterKeyHint="send"
        maxLength={120}
        placeholder="Ex: Renda básica universal"
        defaultValue={estado && !estado.ok ? estado.valores.tema : ""}
        erro={erro}
      />
      <Button type="submit" disabled={enviando}>
        {enviando ? "Propondo…" : "Propor tema"}
      </Button>
    </form>
  );
}
