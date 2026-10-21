"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, classesInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useRetornoForm } from "@/components/ui/useRetornoForm";
import { hojeLocal } from "@/lib/datas";
import type { EstadoForm } from "@/lib/resultado";
import { desmarcarDebate, marcarDebate } from "./actions";
import { COMO_FUNCIONA, FORMATOS, QUANDO } from "./schemas";

type Campos = "tema" | "quando" | "data" | "hora" | "formato";
type Quando = (typeof QUANDO)[number]["valor"];

/**
 * Marcar debate: com data (a hora é opcional) ou "já está rolando", que abre o debate
 * em andamento com o horário de agora. "Virar debate" (Pauta) chega com o tema
 * preenchido (WCAG 3.3.7).
 */
export function MarcarDebateForm({ temaInicial }: { temaInicial: string }) {
  const { toast } = useToast();
  const [estado, acao, enviando] = useActionState<EstadoForm<Campos>, FormData>(marcarDebate, null);
  const form = useRef<HTMLFormElement>(null);
  useRetornoForm(estado, form, { desfazer: (id) => desmarcarDebate(id as number) });
  const erros = estado && !estado.ok ? estado.erros : {};
  const valores = estado && !estado.ok ? estado.valores : {};
  const [hoje] = useState(hojeLocal);
  const [formato, setFormato] = useState<string>(FORMATOS[0]);
  const [quando, setQuando] = useState<Quando>(valores.quando === "agora" ? "agora" : "data");

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

      <fieldset className="m-0 grid gap-1.5 border-0 p-0">
        <legend className="mb-1.5 p-0 text-sm font-semibold">Quando?</legend>
        <div className="flex w-full rounded-xl border-[1.5px] border-line bg-card p-1">
          {QUANDO.map((q) => (
            <label
              key={q.valor}
              className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg px-3 text-sm font-semibold text-muted has-checked:bg-accent-soft has-checked:text-accent has-focus-visible:ring-[3px] has-focus-visible:ring-accent-soft"
            >
              <input
                type="radio"
                name="quando"
                value={q.valor}
                checked={quando === q.valor}
                onChange={() => setQuando(q.valor)}
                className="sr-only"
              />
              {q.rotulo}
            </label>
          ))}
        </div>
      </fieldset>

      {quando === "data" ? (
        // items-start: a dica da Hora não estica o campo Data (senão ele desce)
        <div className="grid grid-cols-2 items-start gap-2">
          <Field
            label="Data"
            name="data"
            type="date"
            min={hoje}
            // o dia pode virar entre o servidor e o navegador
            suppressHydrationWarning
            defaultValue={valores.data ?? ""}
            erro={erros.data}
          />
          <Field
            label="Hora (opcional)"
            name="hora"
            type="time"
            hint="Horário de Brasília. Sem hora, vale o dia todo."
            defaultValue={valores.hora ?? ""}
            erro={erros.hora}
          />
        </div>
      ) : (
        <p className="m-0 rounded-xl bg-accent-soft px-3 py-2.5 text-sm">
          O debate já abre como <b>em andamento</b>, com a data e a hora de agora. Quando acabar,
          toque em Encerrar.
        </p>
      )}

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
        {enviando
          ? quando === "agora"
            ? "Abrindo…"
            : "Marcando…"
          : quando === "agora"
            ? "Abrir debate agora"
            : "Marcar debate"}
      </Button>
    </form>
  );
}
