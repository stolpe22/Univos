import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { PageHead } from "@/components/ui/PageHead";
import { getClubeAtual, podeModerar } from "@/features/clube/queries";
import { ListaTemas, ProporTemaForm } from "@/features/pauta/PautaUI";
import { listarTemas } from "@/features/pauta/queries";

export const metadata: Metadata = { title: "Pautas" };

export default async function PautaPage() {
  const clube = await getClubeAtual();
  if (!clube) return null;
  const temas = await listarTemas(clube.id);

  return (
    <>
      <PageHead
        titulo="Pautas"
        descricao="Temas sugeridos para os próximos debates. Vote nos que você quer discutir."
      />
      <div className="grid gap-3.5 md:grid-cols-2">
        <Card titulo="Temas" id="temas">
          <ListaTemas temas={temas} eu={clube.uid} modera={podeModerar(clube)} />
        </Card>
        <Card titulo="Propor tema" id="propor">
          <ProporTemaForm />
        </Card>
      </div>
    </>
  );
}
