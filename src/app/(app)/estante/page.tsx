import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { getClubeAtual, podeModerar } from "@/features/clube/queries";
import { EstanteFiltrada } from "@/features/estante/EstanteFiltrada";
import { listarEstante, listarTaxonomia } from "@/features/estante/queries";
import { ordenarEstante } from "@/features/estante/regras";

export const metadata: Metadata = { title: "Estante" };

export default async function EstantePage() {
  const clube = await getClubeAtual();
  if (!clube) return null;
  const [livros, taxonomia] = await Promise.all([listarEstante(clube.id), listarTaxonomia()]);

  return (
    <>
      <PageHead
        titulo="Estante"
        descricao="Todos os livros do grupo. Votem no que querem ler e combinem o próximo livro da vez."
      />
      <EstanteFiltrada
        livros={ordenarEstante(livros)}
        eu={clube.uid}
        modera={podeModerar(clube)}
        taxonomia={taxonomia}
        admin={clube.dono}
      />
    </>
  );
}
