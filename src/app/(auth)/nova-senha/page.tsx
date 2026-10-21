import type { Metadata } from "next";
import { TelaEntrada } from "@/components/layout/TelaEntrada";
import { NovaSenhaForm } from "./NovaSenhaForm";

export const metadata: Metadata = { title: "Senha nova" };

/** A pessoa chega aqui logada pelo link de "Esqueci minha senha". */
export default function NovaSenhaPage() {
  return (
    <TelaEntrada subtitulo="Escolha a senha que você vai usar pra entrar daqui pra frente.">
      <h1 className="mt-0 mb-3 text-center text-2xl font-bold">Senha nova</h1>
      <NovaSenhaForm />
    </TelaEntrada>
  );
}
