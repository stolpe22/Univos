export type CorPerfil = "blue" | "red" | "purple" | "slate";

const CORES: Record<CorPerfil, string> = {
  blue: "bg-blue text-white",
  red: "bg-red text-white",
  purple: "bg-purple text-white",
  slate: "bg-muted text-card",
};

/** Bolinha com a inicial. Decorativa: o nome sempre aparece em texto ao lado. */
export function Avatar({
  nome,
  cor = "purple",
  className = "",
}: {
  nome: string;
  cor?: CorPerfil;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      title={nome}
      className={`grid flex-none place-items-center rounded-full font-bold ${CORES[cor]} ${
        // tamanho padrão só quando quem usa não escolheu outro
        /size-/.test(className) ? "" : "size-8 text-[13px]"
      } ${className}`}
    >
      {nome.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
