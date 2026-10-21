import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AoVivo } from "@/components/AoVivo";
import { BotaoVoto } from "@/components/ui/BotaoVoto";
import { classesBotao } from "@/components/ui/Button";
import { Card, Pill } from "@/components/ui/Card";
import { Capa } from "@/components/ui/Capa";
import { getClubeAtual } from "@/features/clube/queries";
import { votarLivro } from "@/features/estante/actions";
import { EdicoesDoGrupo } from "@/features/estante/EdicoesDoGrupo";
import { MetadadosCatalogo } from "@/features/estante/MetadadosCatalogo";
import { getLivroEstante } from "@/features/estante/queries";
import { QuemLeu } from "@/features/estante/QuemLeu";
import { comExemplar } from "@/features/estante/regras";
import { Comentarios } from "@/features/livro/Comentarios";
import { listarComentarios, posicionarComentarios } from "@/features/livro/queries";
import { posicao } from "@/features/livro/regras";

/** Livro do grupo aberto a partir do id da URL, ou null (id inválido ou de outro grupo). */
async function livroDaUrl(params: PageProps<"/estante/[id]">["params"]) {
  const [{ id }, clube] = await Promise.all([params, getClubeAtual()]);
  const livroId = Number(id);
  if (!clube || !Number.isSafeInteger(livroId) || livroId <= 0) return null;
  const livro = await getLivroEstante(clube.id, livroId);
  return livro ? { clube, livro } : null;
}

export async function generateMetadata({ params }: PageProps<"/estante/[id]">): Promise<Metadata> {
  const achou = await livroDaUrl(params);
  return { title: achou?.livro.titulo ?? "Livro" };
}

/** Página de qualquer livro da estante: dados, exemplares do grupo e comentários. */
export default async function LivroEstantePage({ params }: PageProps<"/estante/[id]">) {
  const achou = await livroDaUrl(params);
  if (!achou) notFound();
  const { clube, livro } = achou;
  const comentarios = await listarComentarios(livro.id);
  const minha = livro.leituras.find((l) => l.userId === clube.uid);
  const temExemplar = comExemplar(livro);
  const edicoes = livro.leituras.map((l) => ({ id: l.userId, paginasEdicao: l.paginas }));

  return (
    <>
      <AoVivo canal={`livro-${livro.id}`} tabelas={["comentarios", "progresso_leitura"]} />
      <Link
        href="/estante"
        className="mb-3 inline-flex min-h-11 items-center font-semibold text-accent underline"
      >
        ← Voltar para a Estante
      </Link>

      <div className="grid items-start gap-3.5 md:grid-cols-2">
        <Card>
          <div className="flex items-start gap-3">
            <Capa id={livro.id} titulo={livro.titulo} />
            <div className="min-w-0 flex-1">
              <h1 className="mt-0 mb-1 text-[clamp(22px,4vw,30px)] font-bold">{livro.titulo}</h1>
              <p className="m-0 text-muted">
                {livro.autor} · {livro.paginas} págs. · sugerido por{" "}
                {livro.sugeridoPor === clube.uid ? "você" : livro.sugeridoPorNome}
                {temExemplar > 0 &&
                  ` · ${temExemplar} ${temExemplar === 1 ? "pessoa tem" : "pessoas têm"} o livro`}
              </p>
              {livro.status !== "fila" && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {livro.status === "atual" && <Pill>📖 livro da vez</Pill>}
                  {livro.status === "lido" && <Pill>✓ o grupo leu</Pill>}
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <QuemLeu livro={livro} eu={clube.uid} />
              {livro.status === "fila" && (
                <BotaoVoto
                  rotulo={livro.titulo}
                  votado={livro.votos.includes(clube.uid)}
                  total={livro.votos.length}
                  alternar={async (votar) => {
                    "use server";
                    return votarLivro(livro.id, votar);
                  }}
                />
              )}
            </div>
          </div>
          <MetadadosCatalogo livro={livro} completo />
          {livro.status === "atual" && (
            <Link href="/livro" className={`${classesBotao("ghost")} mt-3 w-full`}>
              Ir para o Livro da vez
            </Link>
          )}
          <EdicoesDoGrupo livro={livro} eu={clube.uid} />
        </Card>

        <Card titulo="Comentários sem spoiler" id="comentarios">
          <Comentarios
            livroId={livro.id}
            comentarios={posicionarComentarios(comentarios, edicoes, livro.paginas)}
            minha={{
              situacao: minha?.status ?? "nao_lido",
              pagina: minha?.pagina ?? 0,
              paginas: minha?.paginas ?? livro.paginas,
            }}
            minhaPosicao={minha ? posicao(minha.pagina, minha.paginas) : 0}
            eu={clube.uid}
          />
        </Card>
      </div>
    </>
  );
}
