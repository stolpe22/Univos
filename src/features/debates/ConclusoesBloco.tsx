"use client";

import { useActionState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field, classesInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useRetornoForm } from "@/components/ui/useRetornoForm";
import type { EstadoForm } from "@/lib/resultado";
import { proporConclusao, votarConclusao } from "./actions";
import type { ConclusaoDebate } from "./queries";
export function ConclusoesBloco({
  enqueteId,
  conclusoes,
  eu,
}: {
  enqueteId: number;
  conclusoes: ConclusaoDebate[];
  eu: string;
}) {
  return (
    <div className="mt-3 border-t border-line pt-3">
      <p className="mt-0 mb-1 font-semibold">Outra conclusão</p>
      <p className="mt-0 mb-3 text-sm text-muted">
        Sugira outra conclusão a qualquer momento. Cada pessoa pode concordar ou discordar uma vez.
      </p>
      {conclusoes.length > 0 ? (
        <ul className="m-0 mb-3 list-none p-0">
          {conclusoes.map((conclusao) => (
            <ConclusaoItem key={conclusao.id} conclusao={conclusao} eu={eu} />
          ))}
        </ul>
      ) : (
        <p className="mt-0 mb-3 text-sm text-muted">
          Ninguém sugeriu outra conclusão ainda. Você pode escrever a primeira.
        </p>
      )}
      <FormConclusao enqueteId={enqueteId} />
    </div>
  );
}

function FormConclusao({ enqueteId }: { enqueteId: number }) {
  const form = useRef<HTMLFormElement>(null);
  const [estado, acao, enviando] = useActionState<EstadoForm<"texto">, FormData>(
    proporConclusao.bind(null, enqueteId),
    null,
  );
  useRetornoForm(estado, form, { limpar: true });
  const erro = estado && !estado.ok ? estado.erros.texto : undefined;

  return (
    <form ref={form} action={acao} noValidate className="grid gap-2">
      <Field
        label="Outra conclusão"
        name="texto"
        maxLength={240}
        autoComplete="off"
        enterKeyHint="send"
        hint="Escreva uma ideia diferente da pergunta principal."
        erro={erro}
      >
        {(controle) => (
          <textarea
            {...controle}
            name="texto"
            maxLength={240}
            rows={3}
            className={`${classesInput} min-h-24 resize-y`}
            defaultValue={estado && !estado.ok ? estado.valores.texto : ""}
          />
        )}
      </Field>
      <Button type="submit" tamanho="small" disabled={enviando} className="justify-self-start">
        {enviando ? "Enviando…" : "Propor conclusão"}
      </Button>
    </form>
  );
}

function ConclusaoItem({ conclusao, eu }: { conclusao: ConclusaoDebate; eu: string }) {
  const { toast } = useToast();
  const [ocupado, startTransition] = useTransition();
  const meuVoto = conclusao.votos.find((v) => v.pessoa === eu)?.posicao;
  const concordam = conclusao.votos.filter((v) => v.posicao === "concordo");
  const discordam = conclusao.votos.filter((v) => v.posicao === "discordo");

  function votar(posicao: "concordo" | "discordo") {
    const novo = meuVoto === posicao ? null : posicao;
    startTransition(async () => {
      const r = await votarConclusao(conclusao.id, novo);
      toast(
        r.ok
          ? novo
            ? `Voto “${novo === "concordo" ? "Concordo" : "Discordo"}” registrado.`
            : "Voto removido."
          : r.erro,
      );
    });
  }

  function lista(nomes: typeof concordam, titulo: string) {
    if (nomes.length === 0) return null;
    return (
      <p className="m-0 text-xs text-muted">
        <b>
          {titulo} ({nomes.length}):
        </b>{" "}
        {nomes.map((v) => (v.pessoa === eu ? `${v.nome} (você)` : v.nome)).join(", ")}
      </p>
    );
  }

  return (
    <li className="border-t border-line py-3 first:border-t-0 first:pt-0">
      <p className="mt-0 mb-1 text-sm">
        <b>{conclusao.propostaPor === eu ? "Você" : conclusao.propostaPorNome}</b> escreveu:
      </p>
      <p className="mt-0 mb-2 font-semibold">“{conclusao.texto}”</p>
      <IndicadorConcordancia concordam={concordam.length} discordam={discordam.length} />
      <div className="mb-2 flex flex-wrap gap-2">
        <Button
          tamanho="small"
          variante={meuVoto === "concordo" ? "primary" : "ghost"}
          aria-pressed={meuVoto === "concordo"}
          disabled={ocupado}
          onClick={() => votar("concordo")}
        >
          Concordo ({concordam.length})
        </Button>
        <Button
          tamanho="small"
          variante={meuVoto === "discordo" ? "primary" : "ghost"}
          aria-pressed={meuVoto === "discordo"}
          disabled={ocupado}
          onClick={() => votar("discordo")}
        >
          Discordo ({discordam.length})
        </Button>
      </div>
      <div className="grid gap-1">
        {lista(concordam, "Concordam")}
        {lista(discordam, "Discordam")}
      </div>
    </li>
  );
}

function IndicadorConcordancia({ concordam, discordam }: { concordam: number; discordam: number }) {
  const total = concordam + discordam;
  const percentual = total === 0 ? 0 : Math.round((concordam / total) * 100);

  return (
    <div
      className="mb-3"
      role="img"
      aria-label={
        total === 0
          ? "Ainda não há votos nesta conclusão."
          : `${percentual}% concordam: ${concordam} de ${total} votos.`
      }
    >
      <div className="mb-1 flex flex-wrap items-center justify-between gap-x-3 text-xs">
        <b>{total === 0 ? "Ainda sem votos" : `${percentual}% concordam`}</b>
        <span className="text-muted">
          {concordam} concordam · {discordam} discordam
        </span>
      </div>
      <div aria-hidden="true" className="flex h-2.5 overflow-hidden rounded-full bg-line">
        {total > 0 && (
          <>
            <span className="h-full bg-ok" style={{ width: `${percentual}%` }} />
            <span className="h-full flex-1 bg-err" />
          </>
        )}
      </div>
    </div>
  );
}
