"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import type { EstadoForm } from "@/features/clube/actions";
import { criarGrupo } from "./actions";

export function CriarGrupoForm() {
  const { toast } = useToast();
  const [estado, acao, criando] = useActionState<EstadoForm<"nome">, FormData>(criarGrupo, null);
  const nomeRef = useRef<HTMLInputElement>(null);
  const erroNome = estado && !estado.ok ? estado.erros.nome : undefined;

  useEffect(() => {
    if (!estado) return;
    if (estado.ok) toast(estado.mensagem ?? "Grupo criado.");
    else if (estado.erros.nome) nomeRef.current?.focus();
    else if (estado.erros.geral) toast(estado.erros.geral);
  }, [estado, toast]);

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
      <form action={acao} noValidate className="grid gap-2.5">
        <Field
          ref={nomeRef}
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
