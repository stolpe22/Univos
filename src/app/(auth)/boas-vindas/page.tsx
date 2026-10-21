import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TelaEntrada } from "@/components/layout/TelaEntrada";
import { getClubeAtual } from "@/features/clube/queries";
import { BoasVindasForms } from "./BoasVindasForms";

export const metadata: Metadata = { title: "Boas-vindas" };

export default async function BoasVindasPage() {
  if (await getClubeAtual()) redirect("/inicio");

  return (
    <TelaEntrada subtitulo="Os grupos do Uni-vos são privados: só entra quem recebe um link de convite.">
      <h1 className="mt-0 mb-3 text-center text-2xl font-bold">Boas-vindas!</h1>
      <BoasVindasForms />
    </TelaEntrada>
  );
}
