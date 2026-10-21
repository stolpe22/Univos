"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { Aviso } from "@/components/layout/TelaEntrada";
import { Button, classesBotao } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { pedirNovaSenha, type EstadoAuth } from "@/features/auth/actions";

export function EsqueciSenhaForm() {
  const [estado, acao, enviando] = useActionState<EstadoAuth, FormData>(pedirNovaSenha, {
    status: "inicial",
  });
  const emailRef = useRef<HTMLInputElement>(null);
  const erros = estado.status === "erro" ? estado.erros : {};

  useEffect(() => {
    if (erros.email) emailRef.current?.focus();
  }, [estado, erros.email]);

  if (estado.status === "ok") {
    return (
      <div className="grid gap-3">
        <Aviso tipo="ok">
          Se <b>{estado.email}</b> tiver conta no Uni-vos, chega em instantes um email com o link
          pra criar a senha nova. Abra neste aparelho.
        </Aviso>
        <Link href="/login" className={`${classesBotao("ghost")} w-full`}>
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-2.5">
      <form action={acao} noValidate className="grid gap-2.5">
        <Field
          ref={emailRef}
          label="Seu email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          enterKeyHint="send"
          placeholder="nome@gmail.com"
          defaultValue={estado.status === "erro" ? estado.valores.email : ""}
          erro={erros.email}
        />
        {erros.geral && <Aviso tipo="alerta">{erros.geral}</Aviso>}
        <Button type="submit" disabled={enviando}>
          {enviando ? "Enviando…" : "Mandar link pra senha nova"}
        </Button>
      </form>
      <Link
        href="/login"
        className="mx-auto flex min-h-11 items-center px-2 text-sm font-semibold text-accent underline"
      >
        Lembrei a senha, voltar ao login
      </Link>
    </div>
  );
}
