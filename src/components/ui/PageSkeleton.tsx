/** Placeholders reservam o formato dos cards enquanto a rota busca os dados. */
export function PageSkeleton({
  titulo,
  cartoes = 3,
  colunas = 2,
}: {
  titulo: string;
  cartoes?: number;
  colunas?: 1 | 2 | 3;
}) {
  const colunasClass =
    colunas === 3
      ? "md:grid-cols-2 lg:grid-cols-3"
      : colunas === 2
        ? "md:grid-cols-2"
        : "grid-cols-1";

  return (
    <section role="status" aria-label={`Carregando ${titulo}`} className="grid gap-3.5">
      <p className="sr-only">Carregando {titulo}…</p>
      <div
        aria-hidden="true"
        className="h-8 w-2/5 max-w-56 animate-pulse rounded-lg bg-line motion-reduce:animate-none"
      />
      <div aria-hidden="true" className={`grid gap-3.5 ${colunasClass}`}>
        {Array.from({ length: cartoes }, (_, index) => (
          <article
            key={index}
            className="min-h-44 rounded-2xl border border-line bg-card p-4 md:p-[18px]"
          >
            <div className="mb-4 h-5 w-2/5 animate-pulse rounded-md bg-line motion-reduce:animate-none" />
            <div className="grid gap-3">
              <div className="h-4 w-full animate-pulse rounded-md bg-line/80 motion-reduce:animate-none" />
              <div className="h-4 w-4/5 animate-pulse rounded-md bg-line/70 motion-reduce:animate-none" />
              <div className="mt-1 flex items-center gap-2">
                <div className="size-9 shrink-0 animate-pulse rounded-full bg-line motion-reduce:animate-none" />
                <div className="h-9 flex-1 animate-pulse rounded-xl bg-line/70 motion-reduce:animate-none" />
              </div>
              {index % 2 === 0 && (
                <div className="mt-1 h-10 w-2/3 animate-pulse rounded-xl bg-line/80 motion-reduce:animate-none" />
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
