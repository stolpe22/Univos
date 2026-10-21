"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useRetornoForm } from "@/components/ui/useRetornoForm";
import type { EstadoForm } from "@/lib/resultado";
import { decidirEnquete, proporEnquete, retirarEnquete } from "./actions";
import { Moldura } from "./EnqueteMoldura";
import type { TipoEnquete } from "./enquete";

export function ProporEnquete({ debateId, tipo }: { debateId: number; tipo: TipoEnquete }) {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState<EstadoForm<"pergunta">, FormData>(
    proporEnquete.bind(null, debateId, tipo),
    null,
  );
  const form = useRef<HTMLFormElement>(null);
  useRetornoForm(estado, form);
  const erro = estado && !estado.ok ? estado.erros.pergunta : undefined;

  if (!aberto) {
    return (
      <Moldura titulo={tipo === "inicial" ? "Pergunta inicial" : "Enquete de posicionamento"}>
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="min-h-11 cursor-pointer text-left text-sm font-semibold text-accent underline"
        >
          {tipo === "inicial" ? "+ Propor pergunta inicial" : "+ Propor enquete de posicionamento"}
        </button>
      </Moldura>
    );
  }

  return (
    <Moldura titulo={tipo === "inicial" ? "Pergunta inicial" : "Enquete de posicionamento"}>
      <form ref={form} action={acao} noValidate className="grid gap-2">
        <Field
          autoFocus
          label={tipo === "inicial" ? "Pergunta inicial" : "Pergunta da enquete"}
          name="pergunta"
          autoComplete="off"
          enterKeyHint="send"
          maxLength={160}
          placeholder="Ex: Privatizar os Correios?"
          hint={
            tipo === "inicial"
              ? "O grupo pode escolher a favor, contra ou nenhum dos dois antes e depois do debate."
              : "Mesmo criada depois, ela registra como cada pessoa pensava antes e como pensa depois."
          }
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

export function DecisaoEnquete({
  id,
  modera,
  minha,
}: {
  id: number;
  modera: boolean;
  minha: boolean;
}) {
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
