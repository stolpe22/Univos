"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Avatar, type CorPerfil } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Sheet } from "@/components/ui/Sheet";
import { AjudaSheet } from "@/features/ajuda/AjudaSheet";
import { sair } from "@/features/auth/actions";
import { BuscaGlobal } from "@/features/busca/BuscaGlobal";
import { trocarGrupo } from "@/features/clube/actions";
import { ROTA_ADMIN, ROTAS, rotaAtual } from "@/lib/rotas";

type Grupo = { id: string; nome: string };

type Props = {
  usuario: { nome: string; cor: CorPerfil };
  grupo: Grupo;
  /** Grupos que a pessoa pode abrir. Com mais de um, aparece "Trocar de grupo". */
  grupos: Grupo[];
  /** Dono do sistema: ganha a aba Admin. */
  dono: boolean;
  children: ReactNode;
};

const NA_BARRA = ROTAS.slice(0, 4);

export function AppShell({ usuario, grupo, grupos, dono, children }: Props) {
  const pathname = usePathname();
  const atual = rotaAtual(pathname);
  const [ajudaAberta, setAjudaAberta] = useState(false);
  const [maisAberto, setMaisAberto] = useState(false);
  const [gruposAberto, setGruposAberto] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  /** Pergunta que a Ajuda abre já buscando (vinda da busca global). */
  const [ajudaBusca, setAjudaBusca] = useState("");
  const todas = dono ? [...ROTAS, ROTA_ADMIN] : ROTAS;
  const noMais = todas.slice(4);
  const atualNoMais = !!atual && noMais.includes(atual);
  const variosGrupos = grupos.length > 1;

  function abrirAjuda(busca = "") {
    setMaisAberto(false);
    setAjudaBusca(busca);
    setAjudaAberta(true);
  }

  // Ctrl+K (ou ⌘K) abre a busca de qualquer tela.
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMaisAberto(false);
        setAjudaAberta(false);
        setGruposAberto(false);
        setBuscaAberta(true);
      }
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, []);

  function abrirGrupos() {
    setMaisAberto(false);
    setGruposAberto(true);
  }

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-xl bg-card p-3 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Pular para o conteúdo
      </a>

      <header className="sticky top-0 z-20 bg-bg/85 pt-[env(safe-area-inset-top)] backdrop-blur-md after:block after:h-[3px] after:bg-grad">
        <div className="mx-auto flex max-w-[1040px] items-center gap-2 px-4 py-2.5">
          <Link
            href="/inicio"
            aria-label="Uni-vos, ir para o Início"
            className="flex min-h-11 items-center gap-2.5"
          >
            <Logo className="size-[34px]" />
            {/* Em tela estreita fica só a logo, pra caber o nome do grupo */}
            <span className="hidden bg-grad bg-clip-text font-serif text-[22px] font-bold text-transparent min-[420px]:inline">
              Uni-vos
            </span>
          </Link>
          {variosGrupos ? (
            <button
              type="button"
              onClick={abrirGrupos}
              aria-haspopup="dialog"
              className="flex min-h-11 min-w-0 cursor-pointer items-center gap-1.5 rounded-xl px-2 text-sm font-semibold text-muted"
            >
              <span className="truncate">{grupo.nome}</span>
              <Icon nome="swap" className="size-4" />
              <span className="sr-only">: trocar de grupo</span>
            </button>
          ) : (
            <span className="min-w-0 truncate text-sm font-semibold text-muted">{grupo.nome}</span>
          )}
          <span className="flex-1" />

          {/* Ajuda sempre no mesmo lugar, topo à direita (WCAG 3.2.6) */}
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden min-h-11 cursor-pointer items-center gap-2 rounded-xl border-[1.5px] border-line bg-transparent px-3 text-sm font-semibold text-ink md:inline-flex" />
            {/* Busca global: sempre no topo, ao lado da Ajuda */}
            <Button
              variante="ghost"
              onClick={() => setBuscaAberta(true)}
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
            <Button
              variante="ghost"
              onClick={() => abrirAjuda()}
              aria-label="Ajuda"
              className="px-3"
            >
              <Icon nome="help" />
              <span className="hidden md:inline">Ajuda</span>
            </Button>
            <Avatar nome={usuario.nome} cor={usuario.cor} />
            <form action={sair} className="hidden md:block">
              <Button type="submit" variante="ghost" tamanho="small">
                Sair
              </Button>
            </form>
          </div>
        </div>

        <nav aria-label="Seções" className="mx-auto hidden max-w-[1040px] gap-1 px-4 pb-2 md:flex">
          {todas.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              aria-current={r === atual ? "page" : undefined}
              className="flex min-h-11 items-center rounded-xl px-[1.1em] font-semibold whitespace-nowrap text-muted aria-[current=page]:bg-accent-soft aria-[current=page]:text-accent"
            >
              {r.nome}
            </Link>
          ))}
        </nav>
      </header>

      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-[1040px] px-3.5 pt-3.5 pb-[calc(var(--navh)+28px+env(safe-area-inset-bottom))] outline-none md:px-4 md:pt-[18px] md:pb-[60px]"
      >
        {children}
      </main>

      {/* Barra inferior no celular: 4 seções + Mais */}
      <nav
        aria-label="Seções"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_rgb(0_0_0/0.06)] md:hidden"
      >
        {NA_BARRA.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            aria-current={r === atual ? "page" : undefined}
            className={ITEM_BARRA}
          >
            <Icon nome={r.icone} />
            <span>{r.nome}</span>
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setMaisAberto(true)}
          aria-haspopup="dialog"
          aria-current={atualNoMais ? "page" : undefined}
          className={`${ITEM_BARRA} cursor-pointer`}
        >
          <Icon nome="more" />
          {/* Mostra onde a pessoa está quando a página é uma das do "Mais" */}
          <span>{atualNoMais ? atual.nome : "Mais"}</span>
        </button>
      </nav>

      <Sheet aberto={maisAberto} aoFechar={() => setMaisAberto(false)} titulo="Mais">
        <div className="grid gap-1">
          {noMais.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              aria-current={r === atual ? "page" : undefined}
              onClick={() => setMaisAberto(false)}
              className={ITEM_MENU}
            >
              <Icon nome={r.icone} />
              {r.nome}
            </Link>
          ))}
          <hr className="my-2 border-line" />
          {variosGrupos && (
            <button type="button" onClick={abrirGrupos} className={ITEM_MENU}>
              <Icon nome="swap" />
              Trocar de grupo
            </button>
          )}
          <ThemeToggle className={`${ITEM_MENU} md:hidden`} />
          <button type="button" onClick={() => abrirAjuda()} className={ITEM_MENU}>
            <Icon nome="help" />
            Ajuda
          </button>
          <form action={sair}>
            <button type="submit" className={ITEM_MENU}>
              <Icon nome="out" />
              Sair da conta
            </button>
          </form>
        </div>
      </Sheet>

      <Sheet aberto={gruposAberto} aoFechar={() => setGruposAberto(false)} titulo="Trocar de grupo">
        <div className="grid gap-1">
          {grupos.map((g) => (
            <form key={g.id} action={trocarGrupo.bind(null, g.id)}>
              <button
                type="submit"
                aria-current={g.id === grupo.id ? "true" : undefined}
                className={ITEM_MENU}
              >
                {g.nome}
                {g.id === grupo.id && (
                  <span className="ml-auto text-sm font-normal text-muted">aberto agora</span>
                )}
              </button>
            </form>
          ))}
        </div>
      </Sheet>

      <BuscaGlobal
        aberto={buscaAberta}
        aoFechar={() => setBuscaAberta(false)}
        dono={dono}
        aoAbrirAjuda={(pergunta) => abrirAjuda(pergunta)}
      />

      <AjudaSheet
        key={ajudaBusca}
        buscaInicial={ajudaBusca}
        aberto={ajudaAberta}
        aoFechar={() => setAjudaAberta(false)}
        secaoAtual={atual?.ajuda}
      />
    </>
  );
}

const ITEM_BARRA =
  "relative flex min-h-[var(--navh)] flex-col items-center justify-center gap-[3px] px-0.5 py-1.5 text-[11px] leading-tight font-semibold text-muted aria-[current=page]:text-accent aria-[current=page]:before:absolute aria-[current=page]:before:top-0 aria-[current=page]:before:h-[3px] aria-[current=page]:before:w-7 aria-[current=page]:before:rounded-b-[3px] aria-[current=page]:before:bg-grad";

const ITEM_MENU =
  "flex min-h-[54px] w-full cursor-pointer items-center gap-3.5 rounded-xl px-3 text-left text-base font-semibold text-ink aria-[current=page]:bg-accent-soft aria-[current=page]:text-accent aria-[current=true]:bg-accent-soft aria-[current=true]:text-accent [@media(hover:hover)]:hover:bg-accent-soft [@media(hover:hover)]:hover:text-accent";
