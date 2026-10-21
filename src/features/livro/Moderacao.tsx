"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { useRetornoForm } from "@/components/ui/useRetornoForm";
import type { EstadoForm } from "@/lib/resultado";
import { hojeLocal } from "@/lib/datas";
import { definirMeta, recolocarMeta, removerMeta, terminarLivro } from "./actions";

/**
 * Meta da semana em texto livre (só moderador vê). Mudar cria uma meta nova, e quem
 * já tinha chegado na anterior marca de novo. Tirar tem Desfazer.
 */
export function MetaForm({ meta }: { meta: { id: number; texto: string; prazo: string } | null }) {
  const { toast } = useToast();
  const [estado, acao, salvando] = useActionState<EstadoForm<"texto" | "prazo">, FormData>(
    definirMeta,
    null,
  );
  const form = useRef<HTMLFormElement>(null);
  useRetornoForm(estado, form);
  const [tirando, startTransition] = useTransition();
  const erros = estado && !estado.ok ? estado.erros : {};
  const valores = estado && !estado.ok ? estado.valores : {};
  const [hoje] = useState(hojeLocal);

  function tirar() {
    if (!meta) return;
    startTransition(async () => {
      const r = await removerMeta(meta.id);
      if (!r.ok) return toast(r.erro);
      toast("Meta tirada.", {
        desfazer: async () => {
          const volta = await recolocarMeta(r.dados);
          if (!volta.ok) throw new Error(volta.erro);
        },
      });
    });
  }

  return (
    <form ref={form} action={acao} noValidate className="grid gap-2.5">
      <Field
        label="Até onde ler"
        name="texto"
        autoComplete="off"
        enterKeyHint="next"
        maxLength={120}
        placeholder="Ex: Capítulo 5"
        hint="Use capítulo ou parte, que é igual em toda edição. Cada pessoa marca quando chegar."
        defaultValue={valores.texto ?? meta?.texto ?? ""}
        erro={erros.texto}
      />
      <Field
        label="Prazo"
        name="prazo"
        type="date"
        min={hoje}
        // o dia pode virar entre o servidor e o navegador
        suppressHydrationWarning
        defaultValue={valores.prazo ?? meta?.prazo ?? ""}
        erro={erros.prazo}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variante="ghost" disabled={salvando}>
          {salvando ? "Salvando…" : meta ? "Mudar a meta" : "Definir meta"}
        </Button>
        {meta && (
          <Button variante="ghost" disabled={tirando} onClick={tirar}>
            Tirar a meta
          </Button>
        )}
      </div>
    </form>
  );
}

/** Termina o livro da vez. Não tem Desfazer, então pede confirmação. */
export function TerminarLivro({ titulo }: { titulo: string }) {
  const { toast } = useToast();
  const [confirmando, setConfirmando] = useState(false);
  const [terminando, startTransition] = useTransition();

  function terminar() {
    setConfirmando(false);
    startTransition(async () => {
      const r = await terminarLivro();
      toast(
        r.ok ? `“${titulo}” foi para os lidos do grupo. Escolham o próximo na Estante.` : r.erro,
      );
    });
  }

  return (
    <>
      <Button variante="ghost" onClick={() => setConfirmando(true)} disabled={terminando}>
        {terminando ? "Terminando…" : "Terminamos este livro"}
      </Button>
      <Sheet aberto={confirmando} aoFechar={() => setConfirmando(false)} titulo="Terminar o livro?">
        <p className="mt-1 mb-4">
          “{titulo}” continua na Estante, marcado como lido pelo grupo, e a meta da semana sai.
          Depois vocês escolhem o próximo juntos. Isso não dá pra desfazer.
        </p>
        <div className="flex justify-end gap-2">
          <Button variante="ghost" onClick={() => setConfirmando(false)}>
            Cancelar
          </Button>
          <Button onClick={terminar}>Terminar livro</Button>
        </div>
      </Sheet>
    </>
  );
}
