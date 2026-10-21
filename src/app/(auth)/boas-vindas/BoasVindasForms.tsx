"use client";

import { useActionState, useEffect, useRef } from "react";
import { Aviso } from "@/components/layout/TelaEntrada";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { sair } from "@/features/auth/actions";
import { entrarComConvite } from "@/features/clube/actions";
import type { EstadoForm } from "@/lib/resultado";

export function BoasVindasForms() {
  const [convite, acaoConvite, entrando] = useActionState<EstadoForm<"convite">, FormData>(
    entrarComConvite,
    null,
  );
  const conviteRef = useRef<HTMLInputElement>(null);
  const erroConvite = convite && !convite.ok ? convite.erros.convite : undefined;

  useEffect(() => {
    if (erroConvite) conviteRef.current?.focus();
  }, [convite, erroConvite]);

  return (
    <div className="grid gap-4">
      <form action={acaoConvite} noValidate className="grid gap-2.5">
        <Field
          ref={conviteRef}
          label="Link de convite"
          name="convite"
          type="url"
          inputMode="url"
          autoComplete="off"
          enterKeyHint="go"
          placeholder="Cole aqui o link que te mandaram"
          defaultValue={convite && !convite.ok ? convite.valores.convite : ""}
          hint="Quem modera o grupo gera o link e te manda."
          erro={erroConvite}
        />
        {convite && !convite.ok && convite.erros.geral && (
          <Aviso tipo="alerta">{convite.erros.geral}</Aviso>
        )}
        <Button type="submit" disabled={entrando}>
          {entrando ? "Entrando…" : "Entrar no grupo"}
        </Button>
      </form>

      <form action={sair} className="text-center">
        <button type="submit" className="min-h-11 cursor-pointer px-2 text-sm text-muted underline">
          Entrei com o email errado. Sair.
        </button>
      </form>
    </div>
  );
}
