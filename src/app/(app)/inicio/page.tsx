import type { Metadata } from "next";
import Link from "next/link";
import { AoVivo } from "@/components/AoVivo";
import { classesBotao } from "@/components/ui/Button";
import { Capa } from "@/components/ui/Capa";
import { Card, Pill } from "@/components/ui/Card";
import { TituloComInfo } from "@/components/ui/InfoPagina";
import { sobreDaPagina } from "@/components/ui/PageHead";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getClubeAtual, listarPessoas } from "@/features/clube/queries";
import { listarDebates, separarDebates } from "@/features/debates/queries";
import { ProgressoGrupo } from "@/features/livro/ProgressoGrupo";
import { getLivroAtual, listarProgresso } from "@/features/livro/queries";
import { porcentagem } from "@/features/livro/regras";
import { getMeuQuiz } from "@/features/mapa/queries";
import { formatarDataComDia } from "@/lib/datas";

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
  const progresso = livro ? await listarProgresso(clube.id, livro.id) : [];
  const minhaPagina = progresso.find((p) => p.id === clube.uid)?.pagina ?? 0;
  const nome = pessoas.find((p) => p.id === clube.uid)?.nome ?? "";
  const { agenda } = separarDebates(debates);
  const aoVivo = agenda.find((d) => d.status === "ao_vivo");
  const proximo = aoVivo ?? agenda[0];
  const respondidas = Object.keys(quiz.respostas).length;

  return (
    <>
      <AoVivo canal={`inicio-${clube.id}`} tabelas={["progresso_leitura", "debates"]} />
      <div className="mb-3.5 animate-rise rounded-2xl bg-grad p-5 text-white">
        <TituloComInfo titulo="Início" sobre={sobreDaPagina("Início") ?? ""} className="mt-0">
          E aí{nome ? `, ${nome}` : ""} 👋
        </TituloComInfo>
        <p className="m-0 text-white/90">
          {aoVivo ? (
            <>
              🔴 Debate acontecendo agora: <b>{aoVivo.tema}</b>
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
                <p className="mt-0 mb-2.5">
                  Você está na pág. <b>{minhaPagina}</b> ({porcentagem(minhaPagina, livro.paginas)}
                  %)
                </p>
                <Link href="/livro" className={classesBotao("primary", "small")}>
                  Atualizar página
                </Link>
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
          {livro?.meta ? (
            <>
              <h2 className="mt-2.5 mb-0.5 text-lg font-bold">
                Ler até a pág. {livro.meta.pagina}
              </h2>
              <p className="mt-0 mb-2 text-muted">
                Prazo:{" "}
                {new Date(`${livro.meta.prazo}T12:00:00`).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "short",
                })}
              </p>
              <ProgressBar
                valor={Math.min(minhaPagina, livro.meta.pagina)}
                max={livro.meta.pagina}
                rotulo="Progresso da meta"
              />
              <p className="mt-2 mb-0">
                {minhaPagina >= livro.meta.pagina ? (
                  "✅ Meta batida!"
                ) : (
                  <>
                    Faltam <b>{livro.meta.pagina - minhaPagina}</b> páginas
                  </>
                )}
              </p>
            </>
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
              <p className="mt-0 mb-2.5 text-muted">{formatarDataComDia(proximo.data)}</p>
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
        <Card titulo="Progresso do grupo" id="progresso" className="mt-3.5">
          <ProgressoGrupo pessoas={progresso} total={livro.paginas} eu={clube.uid} />
        </Card>
      )}
    </>
  );
}
