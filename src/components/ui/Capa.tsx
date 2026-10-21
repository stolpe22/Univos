const CORES = ["bg-purple", "bg-blue", "bg-red"] as const;

/** Capa desenhada do livro (cor fixa por livro). Decorativa: o título aparece em texto ao lado. */
export function Capa({
  id,
  titulo,
  pequena = false,
}: {
  id: number;
  titulo: string;
  pequena?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex flex-none items-end rounded-lg bg-linear-160 from-white/15 to-black/25 text-white shadow-md ${CORES[id % CORES.length]} ${
        pequena
          ? "h-[58px] w-10"
          : "h-[110px] w-[76px] p-[7px] font-serif text-[12.5px] leading-tight"
      }`}
    >
      {!pequena && titulo}
    </div>
  );
}
