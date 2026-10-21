"use client";

import Link from "next/link";
import type { PaginaNovidade } from "@/features/novidades/regras";
import type { Rota, Secao } from "@/lib/rotas";
import { ITEM_SUBABA } from "./estilos";
import { PontoNovidade } from "./PontoNovidade";
import { temNovidade } from "./useNovidades";
import type { Navegacao } from "./useNavegacaoPendente";

/**
 * Sub-abas no topo das páginas de uma seção com mais de uma página
 * (Livros: Livro da vez · Estante · Meus livros). Cada uma é uma rota de verdade.
 * Sublinhadas, para não confundir com os filtros dentro da página (barra segmentada).
 */
export function SubAbas({
  secao,
  atual,
  novas,
  navegacao,
}: {
  secao: Secao;
  atual: Rota;
  novas: Set<PaginaNovidade>;
  navegacao: Navegacao;
}) {
  return (
    <nav aria-label={secao.nome} className="mb-3.5 flex border-b border-line">
      {secao.paginas.map((r) => (
        <Link
          key={r.href}
          href={r.href}
          onClick={(e) => navegacao.indicar(e, r.href)}
          aria-current={r === atual ? "page" : undefined}
          className={ITEM_SUBABA}
        >
          {r.nomeSubaba ?? r.nome}
          {temNovidade([r], novas) && <PontoNovidade className="ml-1.5" />}
        </Link>
      ))}
    </nav>
  );
}
