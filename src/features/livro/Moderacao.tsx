"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import type { EstadoForm } from "@/lib/resultado";
import { avancarLivro, definirMeta } from "./actions";

/** Meta da semana (só moderador vê). */
export function MetaForm({
  total,
  meta,
}: {
  total: number;
  meta: { pagina: number; prazo: string } | null;
}) {
  const { toast } = useToast();
  const [estado, acao, salvando] = useActionState<EstadoForm<"pagina" | "prazo">, FormData>(
    definirMeta,
    null,
  );
  const form = useRef<HTMLFormElement>(null);
  const erros = estado && !estado.ok ? estado.erros : {};
  const valores = estado && !estado.ok ? estado.valores : {};
  const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });

  useEffect(() => {
    if (!estado) return;
    if (estado.ok) toast(estado.mensagem);
    else if (estado.erros.geral) toast(estado.erros.geral);
    else form.current?.querySelector<HTMLInputElement>("[aria-invalid=true]")?.focus();
  }, [estado, toast]);

  return (
    <form ref={form} action={acao} noValidate className="grid gap-2.5">
      <div className="grid grid-cols-2 gap-2.5">
        <Field
          label="Ler até a página"
          name="pagina"
          type="number"
          inputMode="numeric"
          min={1}
          max={total}
          defaultValue={valores.pagina ?? meta?.pagina ?? ""}
          erro={erros.pagina}
        />
        <Field
          label="Prazo"
          name="prazo"
          type="date"
          min={hoje}
          defaultValue={valores.prazo ?? meta?.prazo ?? ""}
          erro={erros.prazo}
        />
      </div>
      <Button type="submit" variante="ghost" disabled={salvando}>
        {salvando ? "Salvando…" : meta ? "Mudar a meta" : "Definir meta"}
      </Button>
    </form>
  );
}

/**
 * Termina o livro da vez (ou começa o primeiro). Não tem Desfazer, então pede confirmação.
 */
export function TrocarLivro({ temAtual, proximo }: { temAtual: boolean; proximo: string | null }) {
  const { toast } = useToast();
  const [confirmando, setConfirmando] = useState(false);
  const [trocando, startTransition] = useTransition();

  function trocar() {
    setConfirmando(false);
    startTransition(async () => {
      const r = await avancarLivro();
      if (!r.ok) return toast(r.erro);
      toast(
        r.dados.proximo
          ? `“${r.dados.proximo}” é o novo livro da vez.`
          : "Livro terminado. A fila está vazia: sugira o próximo na Estante.",
      );
    });
  }

  return (
    <>
      <Button
        variante={temAtual ? "ghost" : "primary"}
        onClick={() => setConfirmando(true)}
        disabled={trocando || (!temAtual && !proximo)}
      >
        {trocando ? "Trocando…" : temAtual ? "Terminamos este livro" : "Começar o mais votado"}
      </Button>
      <Sheet
        aberto={confirmando}
        aoFechar={() => setConfirmando(false)}
        titulo={temAtual ? "Terminar o livro?" : "Começar o próximo livro?"}
      >
        <p className="mt-1 mb-4">
          {temAtual && "O livro da vez vai para Já lidos, e a meta da semana é apagada. "}
          {proximo
            ? `“${proximo}”, o mais votado da fila, vira o livro da vez.`
            : "A fila está vazia, então fica sem livro da vez até alguém sugerir um."}{" "}
          Isso não dá pra desfazer.
        </p>
        <div className="flex justify-end gap-2">
          <Button variante="ghost" onClick={() => setConfirmando(false)}>
            Cancelar
          </Button>
          <Button onClick={trocar}>{temAtual ? "Terminar livro" : "Começar"}</Button>
        </div>
      </Sheet>
    </>
  );
}
