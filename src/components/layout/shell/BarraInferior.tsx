"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { PaginaNovidade } from "@/features/novidades/regras";
import type { Secao } from "@/lib/rotas";
import { ITEM_BARRA } from "./estilos";
import { PontoNovidade } from "./PontoNovidade";
import { temNovidade } from "./useNovidades";
import type { Navegacao } from "./useNavegacaoPendente";

type Props = {
  secoes: Secao[];
  atual: Secao | undefined;
  novas: Set<PaginaNovidade>;
  /** A página atual fica em "Mais" (perfil, Admin). */
  atualNoMais: boolean;
  /** Nome da página atual, quando ela fica em "Mais". */
  nomeNoMais?: string;
  navegacao: Navegacao;
  aoAbrirMais: () => void;
};

/** Navegação do celular (abaixo de 760 px): as seções + Mais (conta), ícone sempre com texto. */
export function BarraInferior({
  secoes,
  atual,
  novas,
  atualNoMais,
  nomeNoMais,
  navegacao,
  aoAbrirMais,
}: Props) {
  return (
    <nav
      aria-label="Seções"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_rgb(0_0_0/0.06)] md:hidden"
    >
      {secoes.map((s) => {
        const href = s.paginas[0].href;
        return (
          <Link
            key={s.nome}
            href={href}
            onClick={(e) => navegacao.indicar(e, href)}
            aria-current={s === atual ? "page" : undefined}
            aria-label={s.curto === s.nome ? undefined : s.nome}
            className={ITEM_BARRA}
          >
            <span className="relative">
              <Icon nome={s.icone} />
              {temNovidade(s.paginas, novas) && (
                <PontoNovidade className="absolute -top-0.5 -right-1" />
              )}
            </span>
            <span>{s.curto}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={aoAbrirMais}
        aria-haspopup="dialog"
        aria-current={atualNoMais ? "page" : undefined}
        className={`${ITEM_BARRA} cursor-pointer`}
      >
        <Icon nome="more" />
        {/* Mostra onde a pessoa está quando a página é uma das do "Mais" */}
        <span>{(atualNoMais && nomeNoMais) || "Mais"}</span>
      </button>
    </nav>
  );
}
