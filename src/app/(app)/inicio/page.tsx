import type { Metadata } from "next";
import Link from "next/link";
import { AoVivo } from "@/components/AoVivo";
import { classesBotao } from "@/components/ui/Button";
import { Capa } from "@/components/ui/Capa";
import { Card, Pill } from "@/components/ui/Card";
import { TituloComInfo } from "@/components/ui/InfoPagina";
import { sobreDaPagina } from "@/components/ui/PageHead";
import { getClubeAtual, listarPessoas } from "@/features/clube/queries";
import { listarDebates, separarDebates } from "@/features/debates/queries";
import { ProgressoGrupo } from "@/features/livro/ProgressoGrupo";
import { MetaLeitura } from "@/features/livro/MetaLeitura";
import { getLivroAtual, getMetaAtual, listarProgresso } from "@/features/livro/queries";
import { porcentagem } from "@/features/livro/regras";
import { getMeuQuiz } from "@/features/mapa/queries";
import { formatarQuando } from "@/lib/datas";

export const metadata: Metadata = { title: "Início" };

export default async function InicioPage() {
  const clube = await getClubeAtual();
  if (!clube) return null;
  const [pessoas, livro, debates, quiz] = await Promise.all([
    listarPessoas(clube.id),
    getLivroAtual(clube.id),
    listarDebates(clube.id),
    getMeuQuiz(clube.uid),
  ]);
  const [progresso, meta] = livro
    ? await Promise.all([listarProgresso(clube.id, livro.id), getMetaAtual(livro.id)])
    : [[], null];
  // Só quem cadastrou o exemplar em Meus livros tem progresso (na própria edição).
  const eu = progresso.find((p) => p.id === clube.uid);
  const nome = pessoas.find((p) => p.id === clube.uid)?.nome ?? "";
  const { agenda } = separarDebates(debates);
  const aoVivo = agenda.find((d) => d.status === "ao_vivo");
  const proximo = aoVivo ?? agenda[0];
  const respondidas = Object.keys(quiz.respostas).length;

  return (
    <>
      <AoVivo
        canal={`inicio-${clube.id}`}
        tabelas={["progresso_leitura", "debates", "metas", "metas_alcancadas"]}
      />
      <div className="mb-3.5 animate-rise rounded-2xl bg-grad p-5 text-white">
        <TituloComInfo titulo="Início" sobre={sobreDaPagina("Início") ?? ""} className="mt-0">
          E aí{nome ? `, ${nome}` : ""} 👋
        </TituloComInfo>
        <p className="m-0 text-white/90">
          {aoVivo ? (
            <>
              Debate em andamento: <b>{aoVivo.tema}</b>
            </>
          ) : (
            `Este é o resumo do grupo ${clube.nome} nesta semana.`
          )}
        </p>
      </div>

      <div className="grid gap-3.5 md:grid-cols-3">
        <Card>
          <Pill>Livro da vez</Pill>
          {livro ? (
            <div className="mt-2.5 flex items-start gap-3">
              <Capa id={livro.id} titulo={livro.titulo} />
              <div>
                <h2 className="mt-0 mb-0.5 text-lg font-bold">{livro.titulo}</h2>
                <p className="mt-0 mb-1.5 text-muted">{livro.autor}</p>
                {eu ? (
                  <>
                    <p className="mt-0 mb-2.5">
                      Você está na pág. <b>{eu.pagina}</b> de {eu.paginasEdicao} (
                      {porcentagem(eu.pagina, eu.paginasEdicao)}%)
                    </p>
                    <Link href="/livro" className={classesBotao("primary", "small")}>
                      Atualizar página
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="mt-0 mb-2.5 text-muted">Cadastre seu exemplar pra acompanhar.</p>
                    <Link href="/meus-livros" className={classesBotao("primary", "small")}>
                      Cadastrar exemplar
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-2.5">
              <p className="mt-0 mb-2.5 text-muted">Nenhum livro da vez ainda.</p>
              <Link href="/estante" className={classesBotao("ghost", "small")}>
                Votar na Estante
              </Link>
            </div>
          )}
        </Card>

        <Card>
          <Pill>Meta da semana</Pill>
          {meta ? (
            <div className="mt-2.5">
              <MetaLeitura meta={meta} eu={clube.uid} leitores={progresso.length} />
            </div>
          ) : (
            <p className="mt-2.5 mb-0 text-muted">
              Sem meta esta semana. Quem modera o grupo define a meta em Livro da vez.
            </p>
          )}
        </Card>

        <Card>
          <Pill className={aoVivo ? "animate-pulse" : ""}>
            {aoVivo ? "🔴 Ao vivo" : "Próximo debate"}
          </Pill>
          {proximo ? (
            <>
              <h2 className="mt-2.5 mb-0.5 text-lg font-bold">{proximo.tema}</h2>
              <p className="mt-0 mb-2.5 text-muted">
                {formatarQuando(proximo.data, proximo.comHora)}
              </p>
              <Link
                href={`/debates#debate-${proximo.id}`}
                className={classesBotao("ghost", "small")}
              >
                Ver debates
              </Link>
            </>
          ) : (
            <>
              <p className="mt-2.5 mb-2.5 text-muted">Nenhum debate marcado.</p>
              <Link href="/debates#marcar" className={classesBotao("ghost", "small")}>
                Marcar debate
              </Link>
            </>
          )}
        </Card>
      </div>

      {!quiz.resultado && (
        <Card className="mt-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="mt-0 mb-0.5 text-lg font-bold">🧭 Onde você está no mapa político?</h2>
              <p className="m-0 text-muted">
                {respondidas
                  ? `Você respondeu ${respondidas} de 40. Falta pouco.`
                  : "40 afirmações, cerca de 5 minutos."}
              </p>
            </div>
            <Link href="/mapa" className={classesBotao()}>
              {respondidas ? "Continuar" : "Começar"}
            </Link>
          </div>
        </Card>
      )}

      {livro && (
        <Card titulo="Quem está lendo" id="progresso" className="mt-3.5">
          <ProgressoGrupo pessoas={progresso} eu={clube.uid} />
        </Card>
      )}
    </>
  );
}
