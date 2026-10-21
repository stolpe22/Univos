import { Pill } from "@/components/ui/Card";
import type { LivroEstante } from "./queries";

const real = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Classificação (tema, tipo, nível) e dados da edição de referência, quando houver. */
export function MetadadosCatalogo({ livro }: { livro: LivroEstante }) {
  const etiquetas = [livro.temaNome, livro.tipo, livro.nivelNome].filter(Boolean);
  const edicao = [
    livro.anoPublicacao,
    livro.editora,
    livro.precoReferencia !== null ? real(livro.precoReferencia) : null,
  ].filter(Boolean);

  if (etiquetas.length === 0 && edicao.length === 0 && !livro.nota) return null;
  return (
    <div className="grid gap-1.5 pt-1">
      {etiquetas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {etiquetas.map((e) => (
            <Pill key={e}>{e}</Pill>
          ))}
        </div>
      )}
      {(edicao.length > 0 || livro.nota) && (
        <div className="grid gap-1 text-sm text-muted">
          {edicao.length > 0 && <span>{edicao.join(" · ")}</span>}
          {livro.nota && <span>{livro.nota}</span>}
        </div>
      )}
    </div>
  );
}
