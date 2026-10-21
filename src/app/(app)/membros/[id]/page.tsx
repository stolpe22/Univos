import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { classesBotao } from "@/components/ui/Button";
import { Card, Pill } from "@/components/ui/Card";
import { ListaRolavel } from "@/components/ui/ListaRolavel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { REGRA_DA_CASA } from "@/features/ajuda/conteudo";
import { getClubeAtual } from "@/features/clube/queries";
import { listarDebates } from "@/features/debates/queries";
import { listarEstante } from "@/features/estante/queries";
import { rotuloStatus } from "@/features/estante/taxonomia";
import { porcentagem } from "@/features/livro/regras";
import { rotulo } from "@/features/mapa/afirmacoes";
import { Bussola, Escala } from "@/features/mapa/Bussola";
import { listarMapaDoGrupo } from "@/features/mapa/queries";
import { formatarDataComDia } from "@/lib/datas";

async function pessoaDoGrupo(id: string) {
  const clube = await getClubeAtual();
  if (!clube) return null;
  const pessoa = (await listarMapaDoGrupo(clube.id)).find((p) => p.id === id);
  return pessoa ? { clube, pessoa } : null;
}

export async function generateMetadata({ params }: PageProps<"/membros/[id]">): Promise<Metadata> {
  const achou = await pessoaDoGrupo((await params).id);
  return { title: achou ? `Perfil de ${achou.pessoa.nome}` : "Membros" };
}

const sinal = (n: number) => (n > 0 ? `+${n}` : String(n));
/**
 * Do tablet pra cima cada card ocupa um terço exato da coluna (a linha é do tamanho do
 * maior entre o mapa e as listas), então a borda de baixo sempre bate com a do mapa.
 * A lista cresce até max-h-64 (na tela grande, até preencher o card) e rola por dentro.
 */
const CARD_LISTA = "md:flex md:min-h-0 md:flex-col";
const LISTA = "max-h-64 md:min-h-0 md:flex-auto tela-grande:max-h-none tela-grande:flex-1";
const contar = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

export default async function PerfilPage({ params }: PageProps<"/membros/[id]">) {
  const achou = await pessoaDoGrupo((await params).id);
  if (!achou) notFound(); // não é do grupo aberto (ou não existe)
  const { clube, pessoa: p } = achou;
  const souEu = p.id === clube.uid;

  const [livros, debates] = await Promise.all([listarEstante(clube.id), listarDebates(clube.id)]);
  const sugeridos = livros.filter((l) => l.sugeridoPor === p.id);
  // Adquiridos: exemplares que a pessoa cadastrou em Meus livros.
  const adquiridos = livros.flatMap((l) => {
    const leitura = l.leituras.find((x) => x.userId === p.id && x.temEdicao);
    return leitura ? [{ livro: l, leitura }] : [];
  });
  const participou = debates
    .filter((d) => d.presencas.some((x) => x.id === p.id))
    .sort((a, b) => b.data.localeCompare(a.data));
  const r = p.resultado;

  return (
    // Tela grande (largura e altura): o perfil cabe inteiro e só as listas rolam.
    // Telas médias ou baixas: a página rola normalmente. 78px = respiro do <main>.
    <div className="tela-grande:flex tela-grande:h-[calc(100dvh-var(--toph)-78px)] tela-grande:flex-col">
      {/* Voltar e nome na mesma linha: sobra mais altura para o conteúdo */}
      <div className="mb-3.5 flex flex-wrap items-center gap-x-4 gap-y-1">
        <Link
          href="/membros"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline"
        >
          ← Membros
        </Link>
        <div className="flex flex-wrap items-center gap-2.5">
          <Avatar nome={p.nome} cor={p.cor} icone={p.icone} className="size-11 text-base" />
          <h1 className="m-0 text-[clamp(24px,4vw,30px)] font-bold">{p.nome}</h1>
          {souEu && <Pill>você</Pill>}
          {p.papel === "moderador" && <Pill>moderador</Pill>}
        </div>
      </div>

      <div className="grid items-start gap-3.5 md:grid-cols-2 md:items-stretch tela-grande:min-h-0 tela-grande:flex-1 tela-grande:grid-rows-1">
        <Card
          titulo="🧭 Mapa político"
          id="mapa"
          className="md:flex md:flex-col tela-grande:min-h-0 tela-grande:overflow-y-auto"
        >
          {r ? (
            <>
              <p className="mt-0 mb-1 font-serif text-[clamp(22px,3.5vw,30px)] font-bold">
                {rotulo(r)}
              </p>
              <p className="mt-0 mb-1 text-muted">
                Economia {sinal(r.economia)} · Costumes {sinal(r.costumes)} (de −100 a +100)
              </p>
              <div className="sm:grid sm:grid-cols-2 sm:gap-5">
                <Escala
                  tipo="economia"
                  rotulo="💰 Economia"
                  valor={r.economia}
                  esquerda="Esquerda"
                  direita="Direita"
                />
                <Escala
                  tipo="costumes"
                  rotulo="🏛️ Costumes"
                  valor={r.costumes}
                  esquerda="Progressista"
                  direita="Conservador"
                />
              </div>
              {/* Do tablet pra cima a bússola cresce até preencher a altura que sobra no card */}
              <div className="mt-4 flex justify-center md:min-h-[260px] md:flex-1 tela-grande:min-h-[200px]">
                <Bussola
                  pessoas={[p]}
                  eu={clube.uid}
                  className="max-w-[340px] md:h-full md:w-auto md:max-w-full"
                />
              </div>
            </>
          ) : (
            <div className="px-2 py-3 text-center tela-grande:my-auto">
              <p className="mt-0 mb-3 text-muted">
                {souEu
                  ? "Você ainda não fez o mapa político."
                  : `${p.nome} ainda não fez o mapa político.`}
              </p>
              {souEu && (
                <Link href="/mapa" className={classesBotao()}>
                  Fazer agora
                </Link>
              )}
            </div>
          )}
          <p className="mt-3 mb-0 rounded-xl bg-accent-soft px-3 py-2.5 text-[13.5px] text-accent">
            {REGRA_DA_CASA}
          </p>
        </Card>

        {/* Tela grande: três caixas de altura igual, cada lista rola dentro da sua */}
        <div className="grid content-start gap-3.5 md:grid-rows-3 md:content-stretch tela-grande:min-h-0">
          <Card
            titulo={`💡 Sugeriu ${contar(sugeridos.length, "livro", "livros")}`}
            id="sugestoes"
            className={CARD_LISTA}
          >
            {sugeridos.length === 0 ? (
              <p className="m-0 text-muted">Nenhuma sugestão ainda.</p>
            ) : (
              <ListaRolavel rotulo={`Livros que ${p.nome} sugeriu`} className={LISTA}>
                {sugeridos.map((l) => (
                  <li key={l.id} className="py-2">
                    <b>{l.titulo}</b> <span className="text-muted">— {l.autor}</span>
                    {l.status === "atual" && <Pill className="ml-1.5">livro da vez</Pill>}
                    {l.status === "lido" && (
                      <span className="ml-1.5 text-[13px] text-muted">· já lido</span>
                    )}
                  </li>
                ))}
              </ListaRolavel>
            )}
          </Card>

          <Card
            titulo={`📚 Adquiriu ${contar(adquiridos.length, "livro", "livros")}`}
            id="adquiridos"
            className={CARD_LISTA}
          >
            {adquiridos.length === 0 ? (
              <p className="m-0 text-muted">
                {souEu ? (
                  <>
                    Você ainda não cadastrou nenhum exemplar.{" "}
                    <Link href="/meus-livros" className="font-semibold text-accent underline">
                      Cadastrar em Meus livros
                    </Link>
                  </>
                ) : (
                  `${p.nome} ainda não cadastrou nenhum exemplar.`
                )}
              </p>
            ) : (
              <ListaRolavel rotulo={`Livros que ${p.nome} adquiriu`} className={LISTA}>
                {adquiridos.map(({ livro: l, leitura }) => (
                  <li key={l.id} className="grid gap-1 py-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-x-2">
                      <span>
                        <b>{l.titulo}</b> <span className="text-muted">— {l.autor}</span>
                      </span>
                      <Pill>{rotuloStatus(leitura.status)}</Pill>
                    </div>
                    <span className="text-[13px] text-muted">
                      pág. {leitura.pagina} de {leitura.paginas} ·{" "}
                      {porcentagem(leitura.pagina, leitura.paginas)}%
                    </span>
                    <ProgressBar
                      valor={leitura.pagina}
                      max={leitura.paginas}
                      rotulo={`Progresso de ${p.nome} em ${l.titulo}`}
                    />
                  </li>
                ))}
              </ListaRolavel>
            )}
          </Card>

          <Card
            titulo={`🎤 ${contar(participou.length, "debate", "debates")}`}
            id="debates"
            className={CARD_LISTA}
          >
            {participou.length === 0 ? (
              <p className="m-0 text-muted">Ainda não confirmou presença em nenhum debate.</p>
            ) : (
              <ListaRolavel rotulo={`Debates de que ${p.nome} participou`} className={LISTA}>
                {participou.map((d) => (
                  <li key={d.id} className="py-2">
                    <Link href={`/debates/${d.id}`} className="font-semibold text-accent underline">
                      {d.tema}
                    </Link>
                    <div className="text-[13px] text-muted">{formatarDataComDia(d.data)}</div>
                  </li>
                ))}
              </ListaRolavel>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
