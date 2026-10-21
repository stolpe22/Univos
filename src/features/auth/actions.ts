"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { nomeDoConvite } from "@/features/clube/queries";
import { createClient } from "@/lib/supabase/server";
import {
  cadastroSchema,
  destinoSeguro,
  emailSchema,
  errosPorCampo,
  loginSchema,
  novaSenhaSchema,
} from "./schemas";

/** Estado dos formulários de entrada. A senha nunca volta para a tela. */
export type EstadoAuth =
  | { status: "inicial" }
  | { status: "ok"; email?: string }
  | { status: "erro"; erros: Record<string, string>; valores: Record<string, string> };

const ERRO_REDE = "Não deu pra conectar agora. Confira sua internet e tente de novo.";
const MUITAS_TENTATIVAS =
  "Muitas tentativas em pouco tempo. Espere alguns minutos e tente de novo.";
const LIMITE_DE_EMAIL =
  "O Uni-vos mandou emails demais na última hora e o envio está pausado. Seus dados não foram perdidos: tente de novo daqui a uma hora ou avise quem modera o grupo.";

/** 429 do Supabase: limite de envio de email ou de tentativas. */
function msgLimite(error: { code?: string }) {
  return error.code === "over_email_send_rate_limit" ? LIMITE_DE_EMAIL : MUITAS_TENTATIVAS;
}

async function origem() {
  const h = await headers();
  return h.get("origin") ?? `https://${h.get("host")}`;
}

/** Login por email e senha. */
export async function entrar(_anterior: EstadoAuth, form: FormData): Promise<EstadoAuth> {
  const valores = { email: String(form.get("email") ?? "") };
  const lido = loginSchema.safeParse({ email: valores.email, senha: form.get("senha") ?? "" });
  if (!lido.success) return { status: "erro", erros: errosPorCampo(lido.error), valores };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: lido.data.email,
    password: lido.data.senha,
  });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        status: "erro",
        erros: {
          geral: "Falta confirmar seu email. Abra o email que mandamos quando você criou a conta.",
        },
        valores,
      };
    }
    if (error.code === "invalid_credentials") {
      return {
        status: "erro",
        erros: {
          senha:
            "Email ou senha não conferem. Confira e tente de novo, ou toque em Esqueci minha senha.",
        },
        valores,
      };
    }
    return {
      status: "erro",
      erros: { geral: error.status === 429 ? msgLimite(error) : ERRO_REDE },
      valores,
    };
  }

  redirect(destinoSeguro(form.get("voltar")));
}

/**
 * Cria a conta a partir de um convite e já entra no grupo.
 * Sem convite válido, não cria nada: só moderador chama gente nova.
 */
export async function cadastrarComConvite(
  codigo: string,
  _anterior: EstadoAuth,
  form: FormData,
): Promise<EstadoAuth> {
  const valores = {
    nome: String(form.get("nome") ?? ""),
    email: String(form.get("email") ?? ""),
  };
  const lido = cadastroSchema.safeParse({ ...valores, senha: form.get("senha") ?? "" });
  if (!lido.success) return { status: "erro", erros: errosPorCampo(lido.error), valores };

  if (!(await nomeDoConvite(codigo))) {
    return {
      status: "erro",
      erros: { geral: "Esse convite não vale mais. Peça um link novo pra quem modera o grupo." },
      valores,
    };
  }

  const supabase = await createClient();
  const voltar = `/convite/${codigo}`;
  const { data, error } = await supabase.auth.signUp({
    email: lido.data.email,
    password: lido.data.senha,
    options: {
      data: { name: lido.data.nome },
      emailRedirectTo: `${await origem()}/auth/callback?voltar=${encodeURIComponent(voltar)}`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return {
        status: "erro",
        erros: { email: "Esse email já tem conta. Toque em Já tenho conta e entre com sua senha." },
        valores,
      };
    }
    if (error.code === "weak_password") {
      return {
        status: "erro",
        erros: { senha: "Essa senha é fácil de adivinhar. Misture letras, números e símbolos." },
        valores,
      };
    }
    return {
      status: "erro",
      erros: { geral: error.status === 429 ? msgLimite(error) : ERRO_REDE },
      valores,
    };
  }

  // Com confirmação de email ligada no Supabase, a sessão só vem depois do clique no email.
  if (!data.session) return { status: "ok", email: lido.data.email };

  // Sem confirmação: já está logado, entra no grupo direto.
  await supabase.rpc("entrar_no_clube", { codigo });
  redirect("/inicio");
}

/** "Esqueci minha senha": manda o link para criar uma senha nova. */
export async function pedirNovaSenha(_anterior: EstadoAuth, form: FormData): Promise<EstadoAuth> {
  const valores = { email: String(form.get("email") ?? "") };
  const lido = emailSchema.safeParse(valores);
  if (!lido.success) return { status: "erro", erros: errosPorCampo(lido.error), valores };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(lido.data.email, {
    redirectTo: `${await origem()}/auth/callback?voltar=${encodeURIComponent("/nova-senha")}`,
  });

  if (error && error.status === 429) {
    return { status: "erro", erros: { geral: msgLimite(error) }, valores };
  }
  // Mesmo resultado tendo conta ou não, para não revelar quem está cadastrado.
  return { status: "ok", email: lido.data.email };
}

/** Grava a senha nova (a pessoa chega aqui logada pelo link do email). */
export async function definirNovaSenha(_anterior: EstadoAuth, form: FormData): Promise<EstadoAuth> {
  const lido = novaSenhaSchema.safeParse({
    senha: form.get("senha") ?? "",
    confirmar: form.get("confirmar") ?? "",
  });
  if (!lido.success) return { status: "erro", erros: errosPorCampo(lido.error), valores: {} };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: lido.data.senha });
  if (error) {
    const erros: Record<string, string> =
      error.code === "same_password"
        ? { senha: "Essa já é a sua senha atual. Escolha uma diferente." }
        : error.code === "weak_password"
          ? { senha: "Essa senha é fácil de adivinhar. Misture letras, números e símbolos." }
          : { geral: ERRO_REDE };
    return { status: "erro", erros, valores: {} };
  }

  redirect("/inicio");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?saiu=1");
}
