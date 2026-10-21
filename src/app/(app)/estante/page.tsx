import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PageHead } from "@/components/ui/PageHead";
import { getClubeAtual, podeModerar } from "@/features/clube/queries";
import { listarEstante, ordenarFila } from "@/features/estante/queries";
import { Fila, SugerirLivroForm } from "@/features/estante/EstanteUI";

export const metadata: Metadata = { title: "Estante" };

export default async function EstantePage() {
  const clube = await getClubeAtual();
  if (!clube) return null;
  const livros = await listarEstante(clube.id);
  const atual = livros.find((l) => l.status === "atual");
  const fila = ordenarFila(livros);
  const lidos = livros.filter((l) => l.status === "lido").reverse();

  return (
    <>
      <PageHead
        titulo="Estante"
        descricao="Sugira livros e vote. O mais votado vira o próximo livro da vez."
      />
      <div className="grid gap-3.5 md:grid-cols-2">
        <Card titulo="Fila de leitura" id="fila">
          {atual && (
            <p className="mt-0 mb-2 text-sm text-muted">
              Lendo agora:{" "}
              <Link href="/livro" className="font-semibold text-accent underline">
                {atual.titulo}
              </Link>
            </p>
          )}
          <Fila livros={fila} eu={clube.uid} modera={podeModerar(clube)} />

          <h3 className="mt-5 mb-1 text-lg font-bold">Já lidos</h3>
          {lidos.length === 0 ? (
            <p className="px-2 py-3 text-center text-muted">
              Nenhum livro terminado ainda. Quando o grupo terminar o livro da vez, ele aparece
              aqui.
            </p>
          ) : (
            <ul className="m-0 list-none divide-y divide-line p-0">
              {lidos.map((l) => (
                <li key={l.id} id={`livro-${l.id}`} className="py-2.5">
                  <b>{l.titulo}</b> <span className="text-muted">— {l.autor}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card titulo="Sugerir livro" id="sugerir">
          <SugerirLivroForm />
        </Card>
      </div>
    </>
  );
}
