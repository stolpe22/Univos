import type { Metadata } from "next";
import { TelaEntrada } from "@/components/layout/TelaEntrada";
import { EsqueciSenhaForm } from "./EsqueciSenhaForm";

export const metadata: Metadata = { title: "Esqueci minha senha" };

export default function EsqueciSenhaPage() {
  return (
    <TelaEntrada subtitulo="Sem problema: a gente manda um link pro seu email pra você criar uma senha nova.">
      <h1 className="mt-0 mb-3 text-center text-2xl font-bold">Esqueci minha senha</h1>
      <EsqueciSenhaForm />
    </TelaEntrada>
  );
}
