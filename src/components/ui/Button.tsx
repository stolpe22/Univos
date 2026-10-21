import type { ButtonHTMLAttributes } from "react";

type Variante = "primary" | "ghost";
type Tamanho = "normal" | "small";

const BASE =
  "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100";

const VARIANTES: Record<Variante, string> = {
  // Principal = degradê. Secundário = contornado. Nunca o contrário.
  primary:
    "bg-grad bg-size-[200%_100%] text-white [@media(hover:hover)]:hover:bg-position-[100%_0] [@media(hover:hover)]:hover:shadow-lg",
  ghost:
    "border-[1.5px] border-line bg-transparent text-ink [@media(hover:hover)]:hover:border-accent [@media(hover:hover)]:hover:text-accent",
};

const TAMANHOS: Record<Tamanho, string> = {
  normal: "px-[1.1em] py-[.6em]",
  small: "px-[.85em] py-[.35em] text-[13.5px]",
};

/** Classes do botão, para usar também em <Link> com cara de botão. */
export function classesBotao(variante: Variante = "primary", tamanho: Tamanho = "normal") {
  return `${BASE} ${VARIANTES[variante]} ${TAMANHOS[tamanho]}`;
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  tamanho?: Tamanho;
};

export function Button({
  variante = "primary",
  tamanho = "normal",
  className = "",
  type = "button",
  ...props
}: Props) {
  return (
    <button type={type} className={`${classesBotao(variante, tamanho)} ${className}`} {...props} />
  );
}
