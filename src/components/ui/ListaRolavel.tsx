import type { ReactNode } from "react";

/**
 * Lista com altura máxima e rolagem própria, para listas longas não esticarem a página.
 * Recebe foco pelo teclado (as setas rolam) e tem rótulo para o leitor de tela (WCAG 2.1.1).
 * Uma sombra embaixo indica que tem mais item ao rolar.
 */
export function ListaRolavel({
  rotulo,
  children,
  className = "max-h-72",
}: {
  /** Ex: "Livros que Karol sugeriu". */
  rotulo: string;
  children: ReactNode;
  /** Altura máxima (padrão max-h-72 ≈ 6 itens). */
  className?: string;
}) {
  return (
    <ul
      tabIndex={0}
      aria-label={rotulo}
      className={`m-0 list-none divide-y divide-line overflow-y-auto overscroll-contain rounded-lg p-0 pr-1 [mask-image:linear-gradient(to_bottom,black_calc(100%-24px),transparent)] ${className}`}
    >
      {children}
      {/* respiro no fim, para o último item não ficar sob o esmaecido */}
      <li aria-hidden="true" className="h-4 border-0" />
    </ul>
  );
}
