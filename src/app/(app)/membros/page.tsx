import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Card";
import { PageHead } from "@/components/ui/PageHead";
import { ConvitesPainel } from "@/features/clube/ConvitesPainel";
import { getClubeAtual, listarConvites, podeModerar } from "@/features/clube/queries";
import { listarDebates } from "@/features/debates/queries";
import { listarEstante } from "@/features/estante/queries";
import { rotulo } from "@/features/mapa/afirmacoes";
import { listarMapaDoGrupo } from "@/features/mapa/queries";

export const metadata: Metadata = { title: "Membros" };

export default async function MembrosPage() {
  const clube = await getClubeAtual();
  if (!clube) return null; // o layout já manda pra /boas-vindas

  const modera = podeModerar(clube);
  const [h, convites, pessoas, livros, debates] = await Promise.all([
    headers(),
    modera ? listarConvites(clube.id) : Promise.resolve([]),
    listarMapaDoGrupo(clube.id),
    listarEstante(clube.id),
    listarDebates(clube.id),
  ]);

  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocolo =
    h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  // Você primeiro, depois os outros em ordem alfabética.
  const ordenadas = [...pessoas].sort((a, b) =>
    a.id === clube.uid ? -1 : b.id === clube.uid ? 1 : 0,
  );

  return (
    <>
      <PageHead titulo="Membros" descricao={`Quem faz parte do grupo ${clube.nome}.`} />
      {pessoas.length === 0 ? (
        <p className="text-muted">
          Ninguém no grupo ainda. Gere um convite abaixo e mande pro pessoal.
        </p>
      ) : (
        <ul className="m-0 grid list-none gap-3.5 p-0 md:grid-cols-3">
          {ordenadas.map((p) => {
            const sugestoes = livros.filter((l) => l.sugeridoPor === p.id).length;
            const presencas = debates.filter((d) => d.presencas.some((x) => x.id === p.id)).length;
            return (
              <li key={p.id} id={`pessoa-${p.id}`} className="animate-rise scroll-mt-28">
                <Link
                  href={`/membros/${p.id}`}
                  className="block h-full rounded-2xl border border-line bg-card p-4 md:p-[18px] [@media(hover:hover)]:hover:border-accent"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Avatar nome={p.nome} cor={p.cor} />
                    <h2 className="m-0 text-lg font-bold">{p.nome}</h2>
                    {p.id === clube.uid && <Pill>você</Pill>}
                    {p.papel === "moderador" && <Pill>moderador</Pill>}
                  </div>
                  <p className="mt-2.5 mb-1.5">
                    {p.resultado ? (
                      <Pill>🧭 {rotulo(p.resultado)}</Pill>
                    ) : (
                      <span className="text-[13px] text-muted">Ainda não fez o mapa político</span>
                    )}
                  </p>
                  <p className="m-0 text-muted">
                    💡 {sugestoes} {sugestoes === 1 ? "sugestão" : "sugestões"} · 🎤 {presencas}{" "}
                    {presencas === 1 ? "debate" : "debates"}
                  </p>
                  <p className="mt-2 mb-0 text-sm font-semibold text-accent">Ver perfil →</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {modera && (
        <div className="mt-3.5">
          <ConvitesPainel origem={`${protocolo}://${host}`} convites={convites} />
        </div>
      )}
    </>
  );
}
