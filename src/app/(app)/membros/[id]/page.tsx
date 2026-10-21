import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { classesBotao } from "@/components/ui/Button";
import { Card, Pill } from "@/components/ui/Card";
import { REGRA_DA_CASA } from "@/features/ajuda/conteudo";
import { getClubeAtual } from "@/features/clube/queries";
import { listarDebates } from "@/features/debates/queries";
import { listarEstante } from "@/features/estante/queries";
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

export default async function PerfilPage({ params }: PageProps<"/membros/[id]">) {
  const achou = await pessoaDoGrupo((await params).id);
  if (!achou) notFound(); // não é do grupo aberto (ou não existe)
  const { clube, pessoa: p } = achou;
  const souEu = p.id === clube.uid;

  const [livros, debates] = await Promise.all([listarEstante(clube.id), listarDebates(clube.id)]);
  const sugeridos = livros.filter((l) => l.sugeridoPor === p.id);
  const participou = debates
    .filter((d) => d.presencas.some((x) => x.id === p.id))
    .sort((a, b) => b.data.localeCompare(a.data));
  const r = p.resultado;

  return (
    <>
      <Link
        href="/membros"
        className="mb-2 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline"
      >
        ← Voltar para Membros
      </Link>
      <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <Avatar nome={p.nome} cor={p.cor} className="size-12 text-lg" />
        <h1 className="m-0 text-[clamp(24px,4vw,32px)] font-bold">{p.nome}</h1>
        {souEu && <Pill>você</Pill>}
        {p.papel === "moderador" && <Pill>moderador</Pill>}
      </div>

      <div className="grid items-start gap-3.5 md:grid-cols-2">
        <Card titulo="🧭 Mapa político" id="mapa">
          {r ? (
            <>
              <p className="mt-0 mb-1 font-serif text-[clamp(22px,3.5vw,30px)] font-bold">
                {rotulo(r)}
              </p>
              <p className="mt-0 mb-1 text-muted">
                Economia {sinal(r.economia)} · Costumes {sinal(r.costumes)} (de −100 a +100)
              </p>
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
              <div className="mt-4">
                <Bussola pessoas={[p]} eu={clube.uid} />
              </div>
            </>
          ) : (
            <div className="px-2 py-3 text-center">
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

        <div className="grid content-start gap-3.5">
          <Card
            titulo={`💡 Sugeriu ${sugeridos.length} ${sugeridos.length === 1 ? "livro" : "livros"}`}
            id="sugestoes"
          >
            {sugeridos.length === 0 ? (
              <p className="m-0 text-muted">Nenhuma sugestão ainda.</p>
            ) : (
              <ul className="m-0 list-none divide-y divide-line p-0">
                {sugeridos.map((l) => (
                  <li key={l.id} className="py-2">
                    <b>{l.titulo}</b> <span className="text-muted">— {l.autor}</span>
                    {l.status === "atual" && <Pill className="ml-1.5">livro da vez</Pill>}
                    {l.status === "lido" && (
                      <span className="ml-1.5 text-[13px] text-muted">· já lido</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card
            titulo={`🎤 ${participou.length} ${participou.length === 1 ? "debate" : "debates"}`}
            id="debates"
          >
            {participou.length === 0 ? (
              <p className="m-0 text-muted">Ainda não confirmou presença em nenhum debate.</p>
            ) : (
              <ul className="m-0 list-none divide-y divide-line p-0">
                {participou.slice(0, 10).map((d) => (
                  <li key={d.id} className="py-2">
                    <Link
                      href={`/debates#debate-${d.id}`}
                      className="font-semibold text-accent underline"
                    >
                      {d.tema}
                    </Link>
                    <div className="text-[13px] text-muted">{formatarDataComDia(d.data)}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
