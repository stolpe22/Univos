import { opcaoStatus } from "./taxonomia";

/** Selo da situação da leitura: Já li (verde, ✓), Estou lendo (azul, 📖), Ainda não comecei (○). */
export function SituacaoLeitura({
  status,
  rotulo,
  className = "",
}: {
  status: string;
  /** Texto no lugar do nome da situação (ex: "antes de ler", nos comentários). */
  rotulo?: string;
  className?: string;
}) {
  const s = opcaoStatus(status);
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border-[1.5px] px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-ink ${s.classe} ${className}`}
    >
      <span aria-hidden="true">{s.simbolo}</span>
      {rotulo ?? s.rotulo}
    </span>
  );
}
