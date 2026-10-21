import type { Metadata } from "next";
import Link from "next/link";
import { AoVivo } from "@/components/AoVivo";
import { classesBotao } from "@/components/ui/Button";
import { Capa } from "@/components/ui/Capa";
import { Card } from "@/components/ui/Card";
import { PageHead } from "@/components/ui/PageHead";
import { getClubeAtual, podeModerar } from "@/features/clube/queries";
import { getMaisVotado } from "@/features/estante/queries";
import { comExemplar } from "@/features/estante/regras";
import { Comentarios } from "@/features/livro/Comentarios";
import { EscolherLivro } from "@/features/livro/EscolherLivro";
import { MetaForm, TerminarLivro } from "@/features/livro/Moderacao";
import { PaginaForm } from "@/features/livro/PaginaForm";
import { ProgressoGrupo } from "@/features/livro/ProgressoGrupo";
import { MetaLeitura } from "@/features/livro/MetaLeitura";
import {
  getLivroAtual,
  getMetaAtual,
  listarComentarios,
  listarProgresso,
  posicionarComentarios,
} from "@/features/livro/queries";
import { formatarData } from "@/lib/datas";

export const metadata: Metadata = { title: "Livro da vez" };

export default async function LivroPage() {
  const clube = await getClubeAtual();
  if (!clube) return null;
  const modera = podeModerar(clube);
  const livro = await getLivroAtual(clube.id);

  if (!livro) {
    const proximo = await getMaisVotado(clube.id);
    return (
      <>
        <PageHead titulo="Livro da vez" descricao="O livro que o grupo está lendo agora." />
        <Card>
          <div className="px-2 py-4 text-center">
            <p className="mt-0 mb-4 text-muted">
              Nenhum livro da vez agora.{" "}
              {proximo
                ? `Na Estante, o mais votado é “${proximo.titulo}”. Combinem no grupo quem tem o livro e qual vão ler juntos.`
                : "A Estante ainda não tem livro para ler."}
              {!modera && " Depois, quem modera o grupo começa o livro escolhido."}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {modera && proximo && (
                <EscolherLivro
                  variante="primary"
                  livro={{
                    id: proximo.id,
                    titulo: proximo.titulo,
                    votos: proximo.votos.length,
                    comExemplar: comExemplar(proximo),
                  }}
                />
              )}
              <Link
                href="/estante"
                className={classesBotao(modera && proximo ? "ghost" : "primary")}
              >
                {proximo ? "Votar na Estante" : "Sugerir um livro"}
              </Link>
            </div>
          </div>
        </Card>
      </>
    );
  }

  const [progresso, comentarios, meta] = await Promise.all([
    listarProgresso(clube.id, livro.id),
    listarComentarios(livro.id),
    getMetaAtual(livro.id),
  ]);
  // Só quem cadastrou o exemplar em Meus livros tem progresso.
  const eu = progresso.find((p) => p.id === clube.uid);

  return (
    <>
      <AoVivo
        canal={`livro-${livro.id}`}
        tabelas={["progresso_leitura", "comentarios", "metas", "metas_alcancadas"]}
      />
      <PageHead titulo="Livro da vez" descricao={`${livro.titulo} · ${livro.autor}`} />
      <div className="grid gap-3.5 md:grid-cols-2">
        <div className="grid content-start gap-3.5">
          <Card>
            <div className="mb-3 flex items-start gap-3">
              <Capa id={livro.id} titulo={livro.titulo} />
              <div>
                <h2 className="mt-0 mb-1 text-xl font-bold">{livro.titulo}</h2>
                <p className="m-0 text-muted">{livro.autor}</p>
              </div>
            </div>
            {eu ? (
              <PaginaForm
                key={eu.pagina}
                total={eu.paginasEdicao}
                minhaPagina={eu.pagina}
                ultimaAtualizacao={eu.atualizadoEm ? formatarData(eu.atualizadoEm) : null}
              />
            ) : (
              <div className="rounded-xl border border-line bg-bg p-3">
                <p className="mt-0 mb-3">
                  Pra acompanhar sua leitura, cadastre o seu exemplar: cada edição tem um número de
                  páginas diferente.
                </p>
                <Link href="/meus-livros" className={`${classesBotao()} w-full`}>
                  Cadastrar meu exemplar
                </Link>
              </div>
            )}
          </Card>
          <Card titulo="Meta da semana" id="meta">
            {meta ? (
              <MetaLeitura meta={meta} eu={clube.uid} leitores={progresso.length} />
            ) : (
              <p className="m-0 text-muted">
                Sem meta esta semana.{" "}
                {modera ? "Defina uma no card Moderação." : "Quem modera o grupo define a meta."}
              </p>
            )}
          </Card>
          <Card titulo="Quem está lendo" id="progresso">
            <ProgressoGrupo pessoas={progresso} eu={clube.uid} />
          </Card>
          {modera && (
            <Card titulo="Moderação" id="moderacao-livro">
              <p className="mt-0 mb-3 text-sm text-muted">Só quem modera o grupo vê isto.</p>
              <MetaForm meta={meta} />
              <div className="mt-4 border-t border-line pt-4">
                <TerminarLivro titulo={livro.titulo} />
              </div>
            </Card>
          )}
        </div>
        <Card titulo="Comentários sem spoiler" id="comentarios">
          <Comentarios
            livroId={livro.id}
            comentarios={posicionarComentarios(comentarios, progresso, livro.paginas)}
            minha={{
              situacao: eu?.statusLeitura ?? "nao_lido",
              pagina: eu?.pagina ?? 0,
              paginas: eu?.paginasEdicao ?? livro.paginas,
            }}
            minhaPosicao={eu?.posicao ?? 0}
            eu={clube.uid}
          />
        </Card>
      </div>
    </>
  );
}
