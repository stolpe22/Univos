/**
 * Bolinha de "tem coisa nova" no menu. A cor não é a única pista: o leitor de tela
 * ouve "tem novidade" junto com o nome da aba.
 */
export function PontoNovidade({ className = "" }: { className?: string }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`size-2 shrink-0 rounded-full bg-err ring-2 ring-card ${className}`}
      />
      <span className="sr-only"> (tem novidade)</span>
    </>
  );
}
