import type { Metadata } from "next";
import Link from "next/link";
import { AoVivo } from "@/components/AoVivo";
import { classesBotao } from "@/components/ui/Button";
import { Capa } from "@/components/ui/Capa";
import { Card } from "@/components/ui/Card";
import { PageHead } from "@/components/ui/PageHead";
import { getClubeAtual, podeModerar } from "@/features/clube/queries";
import { getMaisVotado } from "@/features/estante/queries";
import { Comentarios } from "@/features/livro/Comentarios";
import { MetaForm, TrocarLivro } from "@/features/livro/Moderacao";
import { PaginaForm } from "@/features/livro/PaginaForm";
import { ProgressoGrupo } from "@/features/livro/ProgressoGrupo";
import { getLivroAtual, listarComentarios, listarProgresso } from "@/features/livro/queries";
import { formatarData } from "@/lib/datas";

export const metadata: Metadata = { title: "Livro da vez" };

export default async function LivroPage() {
  const clube = await getClubeAtual();
  if (!clube) return null;
  const modera = podeModerar(clube);
  const [livro, proximo] = await Promise.all([getLivroAtual(clube.id), getMaisVotado(clube.id)]);

  if (!livro) {
    return (
      <>
        <PageHead titulo="Livro da vez" descricao="O livro que o grupo está lendo agora." />
        <Card>
          <div className="px-2 py-4 text-center">
            <p className="mt-0 mb-4 text-muted">
              Nenhum livro da vez ainda.{" "}
              {proximo
                ? `O mais votado da fila é “${proximo.titulo}”.`
                : "A fila da Estante está vazia."}
              {!modera && " Quem modera o grupo começa o próximo livro."}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {modera && <TrocarLivro temAtual={false} proximo={proximo?.titulo ?? null} />}
              <Link href="/estante" className={classesBotao(modera ? "ghost" : "primary")}>
                {proximo ? "Votar na Estante" : "Sugerir um livro"}
              </Link>
            </div>
          </div>
        </Card>
      </>
    );
  }

  const [progresso, comentarios] = await Promise.all([
    listarProgresso(clube.id, livro.id),
    listarComentarios(livro.id),
  ]);
  const eu = progresso.find((p) => p.id === clube.uid);
  const minhaPagina = eu?.pagina ?? 0;

  return (
    <>
      <AoVivo canal={`livro-${livro.id}`} tabelas={["progresso_leitura", "comentarios"]} />
      <PageHead
        titulo="Livro da vez"
        descricao={`${livro.titulo} · ${livro.autor} · ${livro.paginas} páginas`}
      />
      <div className="grid gap-3.5 md:grid-cols-2">
        <div className="grid content-start gap-3.5">
          <Card>
            <div className="mb-3 flex items-start gap-3">
              <Capa id={livro.id} titulo={livro.titulo} />
              <div>
                <h2 className="mt-0 mb-1 text-xl font-bold">{livro.titulo}</h2>
                <p className="m-0 text-muted">{livro.autor}</p>
                {livro.meta && (
                  <p className="mt-2 mb-0 text-sm">
                    Meta: até a pág. <b>{livro.meta.pagina}</b> ·{" "}
                    {new Date(`${livro.meta.prazo}T12:00:00`).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                )}
              </div>
            </div>
            <PaginaForm
              key={minhaPagina}
              total={livro.paginas}
              minhaPagina={minhaPagina}
              ultimaAtualizacao={eu?.atualizadoEm ? formatarData(eu.atualizadoEm) : null}
            />
          </Card>
          <Card titulo="Progresso do grupo" id="progresso">
            <ProgressoGrupo pessoas={progresso} total={livro.paginas} eu={clube.uid} />
          </Card>
          {modera && (
            <Card titulo="Moderação" id="moderacao-livro">
              <p className="mt-0 mb-3 text-sm text-muted">Só quem modera o grupo vê isto.</p>
              <MetaForm total={livro.paginas} meta={livro.meta} />
              <div className="mt-4 border-t border-line pt-4">
                <TrocarLivro temAtual proximo={proximo?.titulo ?? null} />
              </div>
            </Card>
          )}
        </div>
        <Card titulo="Comentários sem spoiler" id="comentarios">
          <Comentarios comentarios={comentarios} minhaPagina={minhaPagina} eu={clube.uid} />
        </Card>
      </div>
    </>
  );
}
