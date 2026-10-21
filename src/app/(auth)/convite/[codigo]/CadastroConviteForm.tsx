"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { Aviso } from "@/components/layout/TelaEntrada";
import { Button } from "@/components/ui/Button";
import { CampoSenha } from "@/components/ui/CampoSenha";
import { Field } from "@/components/ui/Field";
import { cadastrarComConvite, type EstadoAuth } from "@/features/auth/actions";

/** Conta nova só nasce aqui, a partir de um convite de moderador. */
export function CadastroConviteForm({ codigo }: { codigo: string }) {
  const [estado, acao, criando] = useActionState<EstadoAuth, FormData>(
    cadastrarComConvite.bind(null, codigo),
    { status: "inicial" },
  );
  const formRef = useRef<HTMLFormElement>(null);
  const erros = estado.status === "erro" ? estado.erros : {};
  const valores = estado.status === "erro" ? estado.valores : {};

  // Foco no primeiro campo com erro (heurística 9)
  useEffect(() => {
    formRef.current?.querySelector<HTMLInputElement>("[aria-invalid=true]")?.focus();
  }, [estado]);

  if (estado.status === "ok") {
    return (
      <Aviso tipo="ok">
        Conta criada! Mandamos um email pra <b>{estado.email}</b>. Toque no link dele pra confirmar
        e você já entra no grupo.
      </Aviso>
    );
  }

  return (
    <div className="grid gap-2.5">
      <form ref={formRef} action={acao} noValidate className="grid gap-2.5">
        <Field
          label="Seu nome"
          name="nome"
          autoComplete="given-name"
          enterKeyHint="next"
          maxLength={40}
          placeholder="Como o grupo te chama"
          defaultValue={valores.nome ?? ""}
          erro={erros.nome}
        />
        <Field
          label="Seu email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          enterKeyHint="next"
          placeholder="nome@gmail.com"
          defaultValue={valores.email ?? ""}
          erro={erros.email}
        />
        <CampoSenha
          label="Crie uma senha"
          name="senha"
          autoComplete="new-password"
          enterKeyHint="go"
          maxLength={72}
          hint="Pelo menos 8 caracteres."
          erro={erros.senha}
        />
        {erros.geral && <Aviso tipo="alerta">{erros.geral}</Aviso>}
        <Button type="submit" disabled={criando}>
          {criando ? "Criando conta…" : "Criar conta e entrar no grupo"}
        </Button>
      </form>
      <Link
        href={`/login?voltar=${encodeURIComponent(`/convite/${codigo}`)}`}
        className="mx-auto flex min-h-11 items-center px-2 text-sm font-semibold text-accent underline"
      >
        Já tenho conta, quero entrar
      </Link>
    </div>
  );
}
