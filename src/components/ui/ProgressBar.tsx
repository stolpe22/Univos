type Props = {
  valor: number;
  max?: number;
  /** Lido pelo leitor de tela ("Progresso de Karol"). */
  rotulo: string;
  className?: string;
};

export function ProgressBar({ valor, max = 100, rotulo, className = "" }: Props) {
  const pct = max > 0 ? Math.round((Math.min(Math.max(valor, 0), max) / max) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-label={rotulo}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${pct}%`}
      className={`h-2 overflow-hidden rounded-full bg-line ${className}`}
    >
      <div
        className="h-full origin-left animate-grow bg-grad transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
