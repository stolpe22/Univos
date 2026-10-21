import { formatarData } from "@/lib/datas";
import { descreverEvento } from "./formatos";
import type { EventoAuditoria } from "./queries";

/** Histórico de todos os grupos. Só o dono vê (a RLS também garante). */
export function Auditoria({ eventos }: { eventos: EventoAuditoria[] }) {
  return (
    <section
      aria-labelledby="auditoria-titulo"
      className="animate-rise rounded-2xl border border-line bg-card p-4 md:p-[18px]"
    >
      <h2 id="auditoria-titulo" className="mt-0 mb-1 text-xl font-bold">
        Auditoria
      </h2>
      <p className="mt-0 mb-2 text-muted">
        Grupos criados, links gerados e desativados, quem entrou por qual link e mudanças de
        moderador. Só você vê isto.
      </p>
      {eventos.length === 0 ? (
        <p className="px-2 py-4 text-center text-muted">
          Nada registrado ainda. Gere um convite em Membros e ele aparece aqui.
        </p>
      ) : (
        <ol className="m-0 list-none divide-y divide-line p-0">
          {eventos.map((e) => (
            <li key={e.id} className="grid gap-0.5 py-2.5 text-sm">
              <span>{descreverEvento(e)}</span>
              <span className="text-muted">
                {e.grupo && <>{e.grupo} · </>}
                <time dateTime={e.em}>{formatarData(e.em)}</time>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
