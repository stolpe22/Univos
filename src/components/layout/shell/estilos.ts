/** Item da barra inferior do celular (ícone + texto, destaque da aba atual). */
export const ITEM_BARRA =
  "relative flex min-h-[var(--navh)] flex-col items-center justify-center gap-[3px] px-0.5 py-1.5 text-[11px] leading-tight font-semibold text-muted aria-[current=page]:text-accent aria-[current=page]:before:absolute aria-[current=page]:before:top-0 aria-[current=page]:before:h-[3px] aria-[current=page]:before:w-7 aria-[current=page]:before:rounded-b-[3px] aria-[current=page]:before:bg-grad";

/** Linha de menu dentro dos sheets (Mais, Trocar de grupo). */
export const ITEM_MENU =
  "flex min-h-[54px] w-full cursor-pointer items-center gap-3.5 rounded-xl px-3 text-left text-base font-semibold text-ink aria-[current=page]:bg-accent-soft aria-[current=page]:text-accent aria-[current=true]:bg-accent-soft aria-[current=true]:text-accent [@media(hover:hover)]:hover:bg-accent-soft [@media(hover:hover)]:hover:text-accent";

/** Aba do topo no desktop. */
export const ITEM_ABA =
  "flex min-h-11 items-center rounded-xl px-[1.1em] font-semibold whitespace-nowrap text-muted aria-[current=page]:bg-accent-soft aria-[current=page]:text-accent";

/** Sub-aba no topo das páginas de uma seção (Livro da vez · Estante · Meus livros). */
export const ITEM_SUBABA =
  "-mb-px flex min-h-11 flex-1 items-center justify-center border-b-[3px] border-transparent px-2 text-sm font-semibold whitespace-nowrap text-muted aria-[current=page]:border-accent aria-[current=page]:text-accent sm:flex-none sm:px-4";
