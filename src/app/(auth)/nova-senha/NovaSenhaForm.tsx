"use client";

import { useActionState, useEffect, useRef } from "react";
import { Aviso } from "@/components/layout/TelaEntrada";
import { Button } from "@/components/ui/Button";
import { CampoSenha } from "@/components/ui/CampoSenha";
import { definirNovaSenha, type EstadoAuth } from "@/features/auth/actions";

export function NovaSenhaForm() {
  const [estado, acao, salvando] = useActionState<EstadoAuth, FormData>(definirNovaSenha, {
    status: "inicial",
  });
  const senhaRef = useRef<HTMLInputElement>(null);
  const confirmarRef = useRef<HTMLInputElement>(null);
  const erros = estado.status === "erro" ? estado.erros : {};

  useEffect(() => {
    if (erros.senha) senhaRef.current?.focus();
    else if (erros.confirmar) confirmarRef.current?.focus();
  }, [estado, erros.senha, erros.confirmar]);

  return (
    <form action={acao} noValidate className="grid gap-2.5">
      <CampoSenha
        ref={senhaRef}
        label="Senha nova"
        name="senha"
        autoComplete="new-password"
        enterKeyHint="next"
        maxLength={72}
        hint="Pelo menos 8 caracteres."
        erro={erros.senha}
      />
      <CampoSenha
        ref={confirmarRef}
        label="Repita a senha nova"
        name="confirmar"
        autoComplete="new-password"
        enterKeyHint="done"
        maxLength={72}
        erro={erros.confirmar}
      />
      {erros.geral && <Aviso tipo="alerta">{erros.geral}</Aviso>}
      <Button type="submit" disabled={salvando}>
        {salvando ? "Salvando…" : "Salvar senha e entrar"}
      </Button>
    </form>
  );
}
