import type { Metadata } from "next";
import Link from "next/link";
import { classesBotao } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHead } from "@/components/ui/PageHead";
import { REGRA_DA_CASA } from "@/features/ajuda/conteudo";
import { getClubeAtual } from "@/features/clube/queries";
import { rotulo } from "@/features/mapa/afirmacoes";
import { Bussola, Escala } from "@/features/mapa/Bussola";
import { getMeuQuiz, listarMapaDoGrupo } from "@/features/mapa/queries";
import { Quiz, RefazerQuiz } from "@/features/mapa/Quiz";

export const metadata: Metadata = { title: "Mapa político" };

const sinal = (n: number) => (n > 0 ? `+${n}` : String(n));

export default async function MapaPage() {
  const clube = await getClubeAtual();
  if (!clube) return null;
  const [meu, grupo] = await Promise.all([getMeuQuiz(clube.uid), listarMapaDoGrupo(clube.id)]);
  const r = meu.resultado;
  const faltam = grupo.filter((p) => !p.resultado);

  if (!r) {
    return (
      <>
        <PageHead
          titulo="Mapa político"
          descricao="Descubra onde você está em dois eixos: economia e costumes."
        />
        <div className="grid items-start gap-3.5 md:grid-cols-2">
          <Card>
            <Quiz semente={null} respostasIniciais={meu.respostas} temResultado={false} />
          </Card>
          <Card titulo="O grupo no mapa" id="grupo-no-mapa">
            <Bussola pessoas={grupo} eu={clube.uid} />
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead
        titulo="Mapa político"
        descricao="É um jogo para puxar debate, não um teste científico."
      />
      <div className="mb-3.5 animate-rise rounded-2xl bg-grad p-5 text-white">
        <p className="m-0 text-white/90">Seu resultado</p>
        <p className="my-1 font-serif text-[clamp(26px,4vw,38px)] font-bold">{rotulo(r)}</p>
        <p className="m-0 text-white/90">
          Economia {sinal(r.economia)} · Costumes {sinal(r.costumes)} (de −100 a +100)
        </p>
      </div>
      <div className="grid items-start gap-3.5 md:grid-cols-2">
        <Card titulo="Seus eixos" id="eixos">
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
          <div className="mt-5 flex flex-wrap gap-2">
            {/* Atalho entre módulos: do resultado direto para marcar um debate */}
            <Link href="/debates#marcar" className={classesBotao()}>
              Marcar um debate
            </Link>
            <RefazerQuiz />
          </div>
          <p className="mt-4 mb-0 rounded-xl bg-accent-soft px-3 py-2.5 text-[13.5px] text-accent">
            Seu resultado aparece no seu perfil e no mapa do grupo. {REGRA_DA_CASA}
          </p>
        </Card>
        <Card titulo="O grupo no mapa" id="grupo-no-mapa">
          <Bussola pessoas={grupo} eu={clube.uid} />
          {faltam.length > 0 && (
            <p className="mb-0 text-center text-[13px] text-muted">
              Ainda não responderam: {faltam.map((p) => p.nome).join(", ")}
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
