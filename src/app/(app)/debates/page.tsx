import type { Metadata } from "next";
import { AoVivo } from "@/components/AoVivo";
import { Card } from "@/components/ui/Card";
import { PageHead } from "@/components/ui/PageHead";
import { AVISO_DEBATE } from "@/features/ajuda/conteudo";
import { getClubeAtual, podeModerar } from "@/features/clube/queries";
import { ItemDebate } from "@/features/debates/ItemDebate";
import { MarcarDebateForm } from "@/features/debates/MarcarDebateForm";
import { listarDebates, separarDebates } from "@/features/debates/queries";

export const metadata: Metadata = { title: "Debates" };

export default async function DebatesPage({ searchParams }: PageProps<"/debates">) {
  const [clube, { tema }] = await Promise.all([getClubeAtual(), searchParams]);
  if (!clube) return null;
  const modera = podeModerar(clube);
  const { agenda, encerrados } = separarDebates(await listarDebates(clube.id));
  const temaInicial = typeof tema === "string" ? tema.slice(0, 120) : "";
  return (
    <>
      <AoVivo
        canal={`debates-${clube.id}`}
        tabelas={["debates", "presencas", "enquetes", "votos_enquete"]}
      />
      <PageHead
        titulo="Debates"
        descricao="Confirme presença, vote na enquete ou marque um novo debate."
      />

      {/* um lembrete curto, sem card: a regra do FINALIZADO! fica no formato de cada debate */}
      <p className="-mt-1.5 mb-3.5 text-sm text-muted">🤝 {AVISO_DEBATE}</p>

      <div className="grid gap-3.5 md:grid-cols-2">
        <div className="grid content-start gap-3.5">
          <Card titulo="Agenda" id="agenda">
            {agenda.length === 0 ? (
              <p className="px-2 py-4 text-center text-muted">
                Nenhum debate marcado. Marque o próximo no formulário ou pegue um tema das Pautas.
              </p>
            ) : (
              <ul className="m-0 list-none divide-y divide-line p-0">
                {agenda.map((d) => (
                  <ItemDebate key={d.id} debate={d} eu={clube.uid} modera={modera} />
                ))}
              </ul>
            )}
          </Card>
          {encerrados.length > 0 && (
            <Card titulo="Já rolaram" id="ja-rolaram">
              <ul className="m-0 list-none divide-y divide-line p-0">
                {encerrados.slice(0, 10).map((d) => (
                  <ItemDebate key={d.id} debate={d} eu={clube.uid} modera={modera} />
                ))}
              </ul>
            </Card>
          )}
        </div>
        <Card titulo="Marcar debate" id="marcar">
          <MarcarDebateForm key={temaInicial} temaInicial={temaInicial} />
        </Card>
      </div>
    </>
  );
}
