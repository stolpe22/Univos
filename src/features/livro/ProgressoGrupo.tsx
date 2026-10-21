import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { ProgressoPessoa } from "./queries";
import { porcentagem } from "./regras";

/** Lista com a página de cada pessoa. Usada no Livro da vez e no Início. */
export function ProgressoGrupo({
  pessoas,
  total,
  eu,
}: {
  pessoas: ProgressoPessoa[];
  total: number;
  eu: string;
}) {
  if (pessoas.length === 0) {
    return <p className="m-0 py-3 text-center text-muted">Ninguém no grupo ainda.</p>;
  }
  return (
    <ul className="m-0 list-none divide-y divide-line p-0">
      {pessoas.map((p) => {
        const pct = porcentagem(p.pagina, total);
        return (
          <li key={p.id} className="flex items-center gap-2.5 py-3">
            <Avatar nome={p.nome} cor={p.cor} />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-x-2">
                <b className="flex items-center gap-1.5">
                  {p.nome}
                  {p.id === eu && <Pill>você</Pill>}
                </b>
                <span className="text-[13.5px] text-muted">
                  pág. {p.pagina} · {pct}%
                </span>
              </div>
              <ProgressBar valor={p.pagina} max={total} rotulo={`Progresso de ${p.nome}`} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
