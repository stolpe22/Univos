"use client";

import { Field, classesInput } from "@/components/ui/Field";

export type Seletor = {
  chave: string;
  rotulo: string;
  /** Texto da opção "qualquer um" ("Todos os temas"). */
  todos: string;
  opcoes: readonly { valor: string; rotulo: string }[];
};

/**
 * Filtro rápido de uma lista de livros: texto (título, autor, tema…) e seletores.
 * Filtra na hora, sem lista de sugestões. Seletor sem opção não aparece.
 */
export function FiltroLivros({
  valores,
  aoMudar,
  seletores,
  mostrando,
  total,
}: {
  valores: Record<string, string>;
  aoMudar: (chave: string, valor: string) => void;
  seletores: Seletor[];
  mostrando: number;
  total: number;
}) {
  const visiveis = seletores.filter((s) => s.opcoes.length > 0);
  const ativo = Object.values(valores).some((v) => v.trim() !== "");
  const escolhidos = visiveis.filter((s) => valores[s.chave]).length;

  return (
    <div role="search" aria-label="Filtros da lista" className="mb-3 grid gap-2">
      <Field
        label="Filtrar livros"
        type="search"
        autoComplete="off"
        placeholder="Título, autor, tema, editora…"
        value={valores.texto ?? ""}
        onChange={(e) => aoMudar("texto", e.target.value)}
      />
      {visiveis.length > 0 && (
        // recolhido para a lista aparecer logo no celular; abre sozinho se tiver filtro ativo
        <details open={escolhidos > 0} className="rounded-xl border border-line">
          <summary className="flex min-h-11 cursor-pointer items-center px-3 text-sm font-semibold text-accent">
            Mais filtros{escolhidos > 0 && ` (${escolhidos})`}
          </summary>
          <div className="grid grid-cols-2 gap-2 border-t border-line p-3 sm:grid-cols-3">
            {visiveis.map((s) => (
              <label key={s.chave} className="grid min-w-0 gap-1 text-sm font-semibold">
                {s.rotulo}
                <select
                  className={classesInput}
                  value={valores[s.chave] ?? ""}
                  onChange={(e) => aoMudar(s.chave, e.target.value)}
                >
                  <option value="">{s.todos}</option>
                  {s.opcoes.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.rotulo}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </details>
      )}
      {ativo && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="m-0 text-muted" aria-live="polite">
            Mostrando {mostrando} de {total}
          </p>
          <button
            type="button"
            onClick={() => {
              for (const chave of Object.keys(valores)) aoMudar(chave, "");
            }}
            className="min-h-11 cursor-pointer px-1 font-semibold text-accent underline"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
