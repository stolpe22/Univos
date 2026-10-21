"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useRetornoForm } from "@/components/ui/useRetornoForm";
import type { EstadoForm } from "@/lib/resultado";
import { criarGrupo } from "./actions";

export function CriarGrupoForm() {
  const [estado, acao, criando] = useActionState<EstadoForm<"nome">, FormData>(criarGrupo, null);
  const form = useRef<HTMLFormElement>(null);
  useRetornoForm(estado, form);
  const erroNome = estado && !estado.ok ? estado.erros.nome : undefined;

  return (
    <section
      aria-labelledby="criar-grupo-titulo"
      className="animate-rise rounded-2xl border border-line bg-card p-4 md:p-[18px]"
    >
      <h2 id="criar-grupo-titulo" className="mt-0 mb-1 text-xl font-bold">
        Criar grupo
      </h2>
      <p className="mt-0 mb-3 text-muted">
        Todo grupo é privado: só entra quem recebe um convite. Você entra como moderador.
      </p>
      <form ref={form} action={acao} noValidate className="grid gap-2.5">
        <Field
          label="Nome do grupo"
          name="nome"
          autoComplete="off"
          enterKeyHint="done"
          maxLength={60}
          placeholder="Ex: Clube da Firma"
          defaultValue={estado && !estado.ok ? estado.valores.nome : ""}
          erro={erroNome}
        />
        <Button type="submit" disabled={criando} className="md:justify-self-start">
          {criando ? "Criando…" : "Criar grupo"}
        </Button>
      </form>
    </section>
  );
}
