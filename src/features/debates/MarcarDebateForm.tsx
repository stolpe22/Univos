"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, classesInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useRetornoForm } from "@/components/ui/useRetornoForm";
import { agoraLocal } from "@/lib/datas";
import type { EstadoForm } from "@/lib/resultado";
import { desmarcarDebate, marcarDebate } from "./actions";
import { COMO_FUNCIONA, FORMATOS } from "./schemas";

type Campos = "tema" | "data" | "formato";

/** Marcar debate. "Virar debate" (Pauta) chega com o tema preenchido (WCAG 3.3.7). */
export function MarcarDebateForm({ temaInicial }: { temaInicial: string }) {
  const { toast } = useToast();
  const [estado, acao, enviando] = useActionState<EstadoForm<Campos>, FormData>(marcarDebate, null);
  const form = useRef<HTMLFormElement>(null);
  useRetornoForm(estado, form, { desfazer: (id) => desmarcarDebate(id as number) });
  const erros = estado && !estado.ok ? estado.erros : {};
  const valores = estado && !estado.ok ? estado.valores : {};
  const [minimo] = useState(agoraLocal);
  const [formato, setFormato] = useState<string>(FORMATOS[0]);

  // Veio da Pauta com o tema: o próximo passo é a data.
  useEffect(() => {
    if (!temaInicial) return;
    form.current?.querySelector<HTMLInputElement>("input[name=data]")?.focus();
    toast("Tema preenchido. Agora escolha a data.");
  }, [temaInicial, toast]);

  return (
    <form ref={form} action={acao} noValidate className="grid gap-3">
      <Field
        label="Tema"
        name="tema"
        autoComplete="off"
        enterKeyHint="next"
        maxLength={120}
        placeholder="Ex: Pena de morte"
        defaultValue={valores.tema ?? temaInicial}
        erro={erros.tema}
      />
      <Field
        label="Data e hora"
        name="data"
        type="datetime-local"
        min={minimo}
        // o minuto pode virar entre o servidor e o navegador
        suppressHydrationWarning
        hint="Horário de Brasília."
        defaultValue={valores.data ?? ""}
        erro={erros.data}
      />
      <Field label="Formato" hint={COMO_FUNCIONA[formato]} erro={erros.formato}>
        {(controle) => (
          <select
            {...controle}
            name="formato"
            value={formato}
            onChange={(e) => setFormato(e.target.value)}
            className={classesInput}
          >
            {FORMATOS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        )}
      </Field>
      <Button type="submit" disabled={enviando}>
        {enviando ? "Marcando…" : "Marcar debate"}
      </Button>
    </form>
  );
}
