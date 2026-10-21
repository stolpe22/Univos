"use client";

import { useId, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

/**
 * Título da página com um "?" discreto: abre, logo abaixo, para que serve a página.
 * Funciona com toque e teclado (nada depende de hover).
 */
export function TituloComInfo({
  titulo,
  sobre,
  className = "",
  children,
}: {
  titulo: string;
  sobre: string;
  className?: string;
  /** Conteúdo do título, se for diferente do nome da página (ex: "E aí, Lucas 👋"). */
  children?: ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const id = useId();

  return (
    <>
      <h1
        className={`mb-1 flex flex-wrap items-center text-[clamp(24px,4vw,32px)] font-bold ${className}`}
      >
        <span>{children ?? titulo}</span>
        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          aria-expanded={aberto}
          aria-controls={id}
          aria-label={`Para que serve ${titulo}?`}
          className="inline-flex size-11 flex-none cursor-pointer items-center justify-center rounded-full opacity-70 aria-expanded:opacity-100 [@media(hover:hover)]:hover:opacity-100"
        >
          <Icon nome="help" className="size-5" />
        </button>
      </h1>
      <p
        id={id}
        hidden={!aberto}
        className="mt-0 mb-2 animate-rise rounded-xl border border-line bg-card px-3 py-2.5 text-[14.5px] text-ink"
      >
        {sobre}
      </p>
    </>
  );
}
