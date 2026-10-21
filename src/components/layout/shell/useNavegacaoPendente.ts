"use client";

import { usePathname } from "next/navigation";
import { useState, type MouseEvent } from "react";

/**
 * Feedback imediato ao tocar num link de navegação (heurística 1): a aba de destino
 * já aparece marcada e uma barrinha corre no topo até a página nova chegar.
 */
export function useNavegacaoPendente() {
  const pathname = usePathname();
  const [pendente, setPendente] = useState<{ origem: string; destino: string } | null>(null);
  // Quando o pathname muda, a navegação terminou e o pendente deixa de valer sozinho.
  const carregando = pendente?.origem === pathname;
  const rotaExibida = carregando ? pendente.destino : pathname;

  /** Use no onClick dos links. Ignora clique com modificador (abrir em outra aba). */
  function indicar(evento: MouseEvent<HTMLAnchorElement>, href: string) {
    if (
      evento.defaultPrevented ||
      evento.button !== 0 ||
      evento.metaKey ||
      evento.ctrlKey ||
      evento.shiftKey ||
      evento.altKey
    )
      return;
    const destino = href.split(/[?#]/, 1)[0];
    if (destino !== pathname) setPendente({ origem: pathname, destino });
  }

  return { rotaExibida, carregando, destino: carregando ? pendente.destino : null, indicar };
}

export type Navegacao = ReturnType<typeof useNavegacaoPendente>;
