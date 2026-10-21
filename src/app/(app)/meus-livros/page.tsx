import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { getClubeAtual } from "@/features/clube/queries";
import { MeusLivrosUI } from "@/features/estante/MeusLivrosUI";
import { listarEstante, listarTaxonomia } from "@/features/estante/queries";

export const metadata: Metadata = { title: "Meus livros" };

export default async function MeusLivrosPage() {
  const clube = await getClubeAtual();
  if (!clube) return null;
  const [livros, taxonomia] = await Promise.all([listarEstante(clube.id), listarTaxonomia()]);

  return (
    <>
      <PageHead
        titulo="Meus livros"
        descricao="Escolha um título da estante do grupo e registre seu exemplar e seu progresso."
      />
      <MeusLivrosUI livros={livros} taxonomia={taxonomia} eu={clube.uid} admin={clube.dono} />
    </>
  );
}
