"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { CampoSenha } from "@/components/ui/CampoSenha";
import { Field } from "@/components/ui/Field";
import { useRetornoForm } from "@/components/ui/useRetornoForm";
import type { EstadoForm } from "@/lib/resultado";
import { salvarNomePerfil, salvarSenhaPerfil } from "./actions";

export { AvatarPerfilForm } from "./AvatarPerfilForm";

export function NomePerfilForm({ nome }: { nome: string }) {
  const [estado, acao, salvando] = useActionState<EstadoForm<"nome">, FormData>(
    salvarNomePerfil,
    null,
  );
  const form = useRef<HTMLFormElement>(null);
  useRetornoForm(estado, form);
  const erros = estado && !estado.ok ? estado.erros : {};
  const valores = estado && !estado.ok ? estado.valores : {};

  return (
    <form ref={form} action={acao} noValidate className="grid gap-3">
      <Field
        label="Nome que aparece para o grupo"
        name="nome"
        autoComplete="name"
        maxLength={40}
        defaultValue={valores.nome ?? nome}
        erro={erros.nome}
      />
      <Button type="submit" disabled={salvando}>
        {salvando ? "Salvando…" : "Salvar nome"}
      </Button>
    </form>
  );
}

export function SenhaPerfilForm() {
  const [estado, acao, salvando] = useActionState<EstadoForm<"senha" | "confirmar">, FormData>(
    salvarSenhaPerfil,
    null,
  );
  const form = useRef<HTMLFormElement>(null);
  useRetornoForm(estado, form, { limpar: true });
  const erros = estado && !estado.ok ? estado.erros : {};

  return (
    <form ref={form} action={acao} noValidate className="grid gap-3">
      <CampoSenha
        label="Senha nova"
        name="senha"
        autoComplete="new-password"
        enterKeyHint="next"
        maxLength={72}
        hint="Use pelo menos 8 caracteres."
        erro={erros.senha}
      />
      <CampoSenha
        label="Repita a senha nova"
        name="confirmar"
        autoComplete="new-password"
        enterKeyHint="done"
        maxLength={72}
        erro={erros.confirmar}
      />
      <Button type="submit" disabled={salvando}>
        {salvando ? "Salvando…" : "Trocar senha"}
      </Button>
    </form>
  );
}
