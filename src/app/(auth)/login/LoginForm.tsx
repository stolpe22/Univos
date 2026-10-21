"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { Aviso } from "@/components/layout/TelaEntrada";
import { Button } from "@/components/ui/Button";
import { CampoSenha } from "@/components/ui/CampoSenha";
import { Field } from "@/components/ui/Field";
import { entrar, type EstadoAuth } from "@/features/auth/actions";

export function LoginForm({ voltar }: { voltar: string }) {
  const [estado, acao, entrando] = useActionState<EstadoAuth, FormData>(entrar, {
    status: "inicial",
  });
  const emailRef = useRef<HTMLInputElement>(null);
  const senhaRef = useRef<HTMLInputElement>(null);
  const erros = estado.status === "erro" ? estado.erros : {};

  // Foco no primeiro campo com erro (heurística 9)
  useEffect(() => {
    if (erros.email) emailRef.current?.focus();
    else if (erros.senha) senhaRef.current?.focus();
  }, [estado, erros.email, erros.senha]);

  return (
    <div className="grid gap-2.5">
      <form action={acao} noValidate className="grid gap-2.5">
        <input type="hidden" name="voltar" value={voltar} />
        <Field
          ref={emailRef}
          label="Seu email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          enterKeyHint="next"
          placeholder="nome@gmail.com"
          defaultValue={estado.status === "erro" ? estado.valores.email : ""}
          erro={erros.email}
        />
        <CampoSenha
          ref={senhaRef}
          label="Senha"
          name="senha"
          autoComplete="current-password"
          enterKeyHint="go"
          erro={erros.senha}
        />
        {erros.geral && <Aviso tipo="alerta">{erros.geral}</Aviso>}
        <Button type="submit" disabled={entrando}>
          {entrando ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <Link
        href="/esqueci-senha"
        className="mx-auto flex min-h-11 items-center px-2 text-sm font-semibold text-accent underline"
      >
        Esqueci minha senha
      </Link>

      <p className="mt-1 mb-0 text-center text-[13px] text-muted">
        Os grupos são privados. Pra participar, peça um convite pra quem modera um grupo.
      </p>
    </div>
  );
}
