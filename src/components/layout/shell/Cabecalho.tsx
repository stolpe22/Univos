"use client";

import Link from "next/link";
import { Avatar, type CorPerfil, type IconePerfil } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { sair } from "@/features/auth/actions";
import type { PaginaNovidade } from "@/features/novidades/regras";
import { rotaAtual, secaoDe, type Secao } from "@/lib/rotas";
import { ThemeToggle } from "../ThemeToggle";
import { ITEM_ABA } from "./estilos";
import { PontoNovidade } from "./PontoNovidade";
import { temNovidade } from "./useNovidades";
import type { Navegacao } from "./useNavegacaoPendente";

export type UsuarioShell = { nome: string; cor: CorPerfil; icone: IconePerfil | "" };

type Props = {
  usuario: UsuarioShell;
  nomeGrupo: string;
  variosGrupos: boolean;
  /** Seções do menu (abas do desktop). */
  secoes: Secao[];
  atual: Secao | undefined;
  /** Páginas com coisa nova pra esta pessoa (bolinha na aba). */
  novas: Set<PaginaNovidade>;
  navegacao: Navegacao;
  aoBuscar: () => void;
  aoAjuda: () => void;
  aoTrocarGrupo: () => void;
};

/** Topo fixo: marca, grupo, ações (Ajuda sempre no mesmo lugar, WCAG 3.2.6) e abas do desktop. */
export function Cabecalho({
  usuario,
  nomeGrupo,
  variosGrupos,
  secoes,
  atual,
  novas,
  navegacao,
  aoBuscar,
  aoAjuda,
  aoTrocarGrupo,
}: Props) {
  return (
    <header className="sticky top-0 z-20 bg-bg/85 pt-[env(safe-area-inset-top)] backdrop-blur-md after:block after:h-[3px] after:bg-grad">
      <div className="mx-auto flex max-w-[1040px] items-center gap-2 px-4 py-2.5">
        <Link
          href="/inicio"
          onClick={(e) => navegacao.indicar(e, "/inicio")}
          aria-label="Uni-vos, ir para o Início"
          className="flex min-h-11 items-center gap-2.5"
        >
          {/* mesmo tamanho do avatar do perfil, na outra ponta do cabeçalho */}
          <Logo className="size-11" />
          {/* No celular fica só a logo, pra caber o nome do grupo */}
          <span className="hidden bg-grad bg-clip-text font-serif text-[22px] font-bold text-transparent md:inline">
            Uni-vos
          </span>
        </Link>

        {variosGrupos ? (
          <button
            type="button"
            onClick={aoTrocarGrupo}
            aria-haspopup="dialog"
            className="flex min-h-11 min-w-0 cursor-pointer items-center gap-1.5 rounded-xl px-2 text-sm font-semibold text-muted"
          >
            <span className="truncate">{nomeGrupo}</span>
            <Icon nome="swap" className="size-4" />
            <span className="sr-only">: trocar de grupo</span>
          </button>
        ) : (
          <span className="min-w-0 truncate text-sm font-semibold text-muted">{nomeGrupo}</span>
        )}
        <span className="flex-1" />

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden min-h-11 cursor-pointer items-center gap-2 rounded-xl border-[1.5px] border-line bg-transparent px-3 text-sm font-semibold text-ink md:inline-flex" />
          <Button
            variante="ghost"
            onClick={aoBuscar}
            aria-label="Buscar"
            aria-keyshortcuts="Control+K"
            aria-haspopup="dialog"
            className="px-3"
          >
            <Icon nome="search" />
            <span className="hidden md:inline">Buscar</span>
            <kbd className="hidden rounded border border-line px-1 text-xs font-normal text-muted lg:inline">
              Ctrl K
            </kbd>
          </Button>
          <Button variante="ghost" onClick={aoAjuda} aria-label="Ajuda" className="px-3">
            <Icon nome="help" />
            <span className="hidden md:inline">Ajuda</span>
          </Button>
          <Link
            href="/meu-perfil"
            onClick={(e) => navegacao.indicar(e, "/meu-perfil")}
            aria-label={`Meu perfil (${usuario.nome})`}
            title="Meu perfil"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full"
          >
            <Avatar
              nome={usuario.nome}
              cor={usuario.cor}
              icone={usuario.icone}
              className="size-11 text-base"
            />
          </Link>
          <form action={sair} className="hidden md:block">
            <Button type="submit" variante="ghost" tamanho="small">
              Sair
            </Button>
          </form>
        </div>
      </div>

      <nav aria-label="Seções" className="mx-auto hidden max-w-[1040px] gap-1 px-4 pb-2 md:flex">
        {secoes.map((s) => {
          const href = s.paginas[0].href;
          const indo = navegacao.destino && secaoDe(rotaAtual(navegacao.destino), secoes) === s;
          return (
            <Link
              key={s.nome}
              href={href}
              onClick={(e) => navegacao.indicar(e, href)}
              aria-current={s === atual ? "page" : undefined}
              aria-busy={indo || undefined}
              className={ITEM_ABA}
            >
              {s.nome}
              {temNovidade(s.paginas, novas) && <PontoNovidade className="ml-1.5" />}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

/** Barrinha no topo enquanto a página nova carrega. */
export function IndicadorCarregando() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] overflow-hidden"
      role="status"
      aria-label="Abrindo página"
    >
      <span className="block h-full w-1/3 animate-[navegacao-progresso_1.2s_ease-in-out_infinite] rounded-full bg-grad motion-reduce:animate-none" />
    </div>
  );
}
