import type { ReactNode } from "react";

type Props = {
  titulo?: ReactNode;
  /** id do título, para aria-labelledby (padrão: gerado a partir do id do card). */
  id?: string;
  className?: string;
  children: ReactNode;
};

/** Card padrão: uma tarefa principal por card (heurística 8). */
export function Card({ titulo, id, className = "", children }: Props) {
  const idTitulo = id ? `${id}-titulo` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={titulo && idTitulo ? idTitulo : undefined}
      className={`animate-rise rounded-2xl border border-line bg-card p-4 md:p-[18px] ${className}`}
    >
      {titulo && (
        <h2 id={idTitulo} className="mt-0 mb-2 text-xl font-bold">
          {titulo}
        </h2>
      )}
      {children}
    </section>
  );
}

/** Etiqueta pequena ("você", "ao vivo", "Livro da vez"). */
export function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-block rounded-full bg-accent-soft px-2.5 py-0.5 font-sans text-xs font-bold text-accent ${className}`}
    >
      {children}
    </span>
  );
}

/** Estado vazio: sempre com texto e uma ação. */
export function Vazio({ children }: { children: ReactNode }) {
  return <div className="px-2 py-4 text-center text-muted">{children}</div>;
}
