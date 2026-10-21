import type { Metadata } from "next";
import { Aviso, TelaEntrada } from "@/components/layout/TelaEntrada";
import { destinoSeguro } from "@/features/auth/schemas";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar" };

const AVISOS: Record<string, { tipo: "ok" | "alerta"; texto: string }> = {
  saiu: { tipo: "ok", texto: "Você saiu da conta. Até a próxima!" },
  link: {
    tipo: "alerta",
    texto:
      "Esse link do email expirou ou já foi usado. Entre com sua senha ou toque em Esqueci minha senha.",
  },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const voltar = destinoSeguro(params.voltar);
  const chaveAviso = params.saiu ? "saiu" : typeof params.erro === "string" ? params.erro : null;
  const aviso = chaveAviso ? AVISOS[chaveAviso] : null;

  return (
    <TelaEntrada>
      <h1 className="sr-only">Entrar no Uni-vos</h1>
      {aviso && (
        <div className="mb-3">
          <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
        </div>
      )}
      <LoginForm voltar={voltar} />
    </TelaEntrada>
  );
}
