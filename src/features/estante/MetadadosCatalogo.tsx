import { Pill } from "@/components/ui/Card";
import type { LivroEstante } from "./queries";

const real = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Classificação (tema, tipo, nível) e, com `completo`, os dados da edição de referência e a
 * descrição. Na lista da Estante só as etiquetas; o resto fica na página do livro.
 */
export function MetadadosCatalogo({
  livro,
  completo = false,
}: {
  livro: LivroEstante;
  completo?: boolean;
}) {
  const etiquetas = [livro.temaNome, livro.tipo, livro.nivelNome].filter(Boolean);
  const edicao = completo
    ? [
        livro.anoPublicacao,
        livro.editora,
        livro.precoReferencia !== null ? real(livro.precoReferencia) : null,
      ].filter(Boolean)
    : [];
  const nota = completo ? livro.nota : null;

  if (etiquetas.length === 0 && edicao.length === 0 && !nota) return null;
  return (
    <div className="grid gap-1.5 pt-1">
      {etiquetas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {etiquetas.map((e) => (
            <Pill key={e}>{e}</Pill>
          ))}
        </div>
      )}
      {(edicao.length > 0 || nota) && (
        <div className="grid gap-1 text-sm text-muted">
          {edicao.length > 0 && <span>{edicao.join(" · ")}</span>}
          {nota && <span className="whitespace-pre-line">{nota}</span>}
        </div>
      )}
    </div>
  );
}
