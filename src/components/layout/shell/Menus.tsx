"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";
import { sair } from "@/features/auth/actions";
import { trocarGrupo } from "@/features/clube/actions";
import type { Rota } from "@/lib/rotas";
import { ThemeToggle } from "../ThemeToggle";
import type { UsuarioShell } from "./Cabecalho";
import { ITEM_MENU } from "./estilos";
import type { Navegacao } from "./useNavegacaoPendente";

/** "Mais" do celular: a conta (perfil, grupo, tema, Ajuda, Sair) e o Admin para o dono. */
export function MenuMais({
  aberto,
  aoFechar,
  usuario,
  rotas,
  atual,
  variosGrupos,
  navegacao,
  aoTrocarGrupo,
  aoAjuda,
}: {
  aberto: boolean;
  aoFechar: () => void;
  usuario: UsuarioShell;
  rotas: Rota[];
  atual: Rota | undefined;
  variosGrupos: boolean;
  navegacao: Navegacao;
  aoTrocarGrupo: () => void;
  aoAjuda: () => void;
}) {
  return (
    <Sheet aberto={aberto} aoFechar={aoFechar} titulo="Mais">
      <div className="grid gap-1">
        <Link
          href="/meu-perfil"
          onClick={(e) => {
            navegacao.indicar(e, "/meu-perfil");
            aoFechar();
          }}
          className={ITEM_MENU}
        >
          <Avatar
            nome={usuario.nome}
            cor={usuario.cor}
            icone={usuario.icone}
            className="size-11 text-base"
          />
          Meu perfil
        </Link>
        {rotas.length > 0 && <hr className="my-2 border-line" />}
        {rotas.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            onClick={(e) => {
              navegacao.indicar(e, r.href);
              aoFechar();
            }}
            aria-current={r === atual ? "page" : undefined}
            className={ITEM_MENU}
          >
            <Icon nome={r.icone} />
            {r.nome}
          </Link>
        ))}
        <hr className="my-2 border-line" />
        {variosGrupos && (
          <button type="button" onClick={aoTrocarGrupo} className={ITEM_MENU}>
            <Icon nome="swap" />
            Trocar de grupo
          </button>
        )}
        <ThemeToggle className={`${ITEM_MENU} md:hidden`} />
        <button type="button" onClick={aoAjuda} className={ITEM_MENU}>
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
  );
}

/** Lista dos grupos da pessoa; escolher grava a preferência e volta ao Início. */
export function TrocarGrupoSheet({
  aberto,
  aoFechar,
  grupos,
  atual,
}: {
  aberto: boolean;
  aoFechar: () => void;
  grupos: { id: string; nome: string }[];
  atual: string;
}) {
  return (
    <Sheet aberto={aberto} aoFechar={aoFechar} titulo="Trocar de grupo">
      <div className="grid gap-1">
        {grupos.map((g) => (
          <form key={g.id} action={trocarGrupo.bind(null, g.id)}>
            <button
              type="submit"
              aria-current={g.id === atual ? "true" : undefined}
              className={ITEM_MENU}
            >
              {g.nome}
              {g.id === atual && (
                <span className="ml-auto text-sm font-normal text-muted">aberto agora</span>
              )}
            </button>
          </form>
        ))}
      </div>
    </Sheet>
  );
}
