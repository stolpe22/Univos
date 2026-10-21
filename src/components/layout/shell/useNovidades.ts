"use client";

import { useEffect, useMemo, useState } from "react";
import { marcarVisto } from "@/features/novidades/actions";
import {
  paginaDaRota,
  paginasComNovidade,
  type Novidades,
  type PaginaNovidade,
} from "@/features/novidades/regras";

/**
 * Quais páginas têm bolinha. A página na tela conta como vista até a última novidade dela:
 * some na hora aqui (sem esperar o servidor) e o "visto" é gravado só pra esta pessoa.
 * Se chegar novidade enquanto ela está na página, conta como vista também.
 */
export function useNovidades(novidades: Novidades, caminho: string) {
  const [vistoAte, setVistoAte] = useState<Partial<Record<PaginaNovidade, string>>>({});
  const pagina = paginaDaRota(caminho);
  const ultima = pagina ? (novidades.ultimas[pagina] ?? null) : null;

  // Ajuste durante a renderização (padrão do React para estado derivado de props):
  // mudou a página ou chegou novidade nela → lembra até onde já foi visto.
  const chave = `${pagina}|${ultima}`;
  const [chaveVista, setChaveVista] = useState("");
  if (chave !== chaveVista) {
    setChaveVista(chave);
    if (pagina && ultima) setVistoAte((v) => ({ ...v, [pagina]: ultima }));
  }

  // Grava no servidor (só efeito externo, sem estado aqui).
  useEffect(() => {
    if (pagina) void marcarVisto(pagina);
  }, [pagina, ultima]);

  return useMemo(() => paginasComNovidade(novidades, vistoAte), [novidades, vistoAte]);
}

/** Alguma das páginas (de uma seção, ou uma sub-aba) tem bolinha? */
export function temNovidade(rotas: { href: string }[], novas: Set<PaginaNovidade>) {
  return rotas.some((r) => {
    const p = paginaDaRota(r.href);
    return p !== null && novas.has(p);
  });
}
