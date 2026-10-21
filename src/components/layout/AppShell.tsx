"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AoVivo } from "@/components/AoVivo";
import { AjudaSheet } from "@/features/ajuda/AjudaSheet";
import { BuscaGlobal } from "@/features/busca/BuscaGlobal";
import type { Novidades } from "@/features/novidades/regras";
import { ROTA_ADMIN, ROTA_PERFIL, rotaAtual, SECAO_ADMIN, SECOES, secaoDe } from "@/lib/rotas";
import { BarraInferior } from "./shell/BarraInferior";
import { Cabecalho, IndicadorCarregando, type UsuarioShell } from "./shell/Cabecalho";
import { MenuMais, TrocarGrupoSheet } from "./shell/Menus";
import { SubAbas } from "./shell/SubAbas";
import { useNavegacaoPendente } from "./shell/useNavegacaoPendente";
import { useNovidades } from "./shell/useNovidades";

type Grupo = { id: string; nome: string };

type Props = {
  usuario: UsuarioShell;
  grupo: Grupo;
  /** Grupos que a pessoa pode abrir. Com mais de um, aparece "Trocar de grupo". */
  grupos: Grupo[];
  /** Dono do sistema: ganha a aba Admin. */
  dono: boolean;
  /** O que é novo no grupo pra esta pessoa (bolinhas no menu). */
  novidades: Novidades;
  children: ReactNode;
};

type Janela = "mais" | "grupos" | "busca" | "ajuda" | null;

/**
 * Moldura das páginas logadas. Só compõe as partes (shell/) e decide qual janela
 * está aberta: uma por vez, para nunca empilhar sheets.
 */
export function AppShell({ usuario, grupo, grupos, dono, novidades, children }: Props) {
  const navegacao = useNavegacaoPendente();
  const [janela, setJanela] = useState<Janela>(null);
  /** Pergunta que a Ajuda abre já buscando (vinda da busca global). */
  const [ajudaBusca, setAjudaBusca] = useState("");

  const secoes = dono ? [...SECOES, SECAO_ADMIN] : SECOES;
  const atual = rotaAtual(navegacao.rotaExibida);
  const secao = secaoDe(atual, secoes);
  // sub-abas só nas páginas da seção, não nas de detalhe (/debates/12)
  const comSubAbas =
    secao && atual && secao.paginas.length > 1 && navegacao.rotaExibida === atual.href;
  const variosGrupos = grupos.length > 1;
  // a página que está na tela (não a que está carregando) é a que conta como vista
  const novas = useNovidades(novidades, usePathname());
  const fechar = () => setJanela(null);

  function abrirAjuda(busca = "") {
    setAjudaBusca(busca);
    setJanela("ajuda");
  }

  // Ctrl+K (ou ⌘K) abre a busca de qualquer tela.
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setJanela("busca");
      }
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, []);

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-xl bg-card p-3 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Pular para o conteúdo
      </a>

      {/* tempo real: novidade no grupo recarrega as bolinhas sem precisar atualizar a página */}
      <AoVivo
        canal={`novidades-${grupo.id}`}
        tabelas={["livros", "membros", "debates", "quiz_resultados"]}
      />
      <Cabecalho
        usuario={usuario}
        nomeGrupo={grupo.nome}
        variosGrupos={variosGrupos}
        secoes={secoes}
        atual={secao}
        novas={novas}
        navegacao={navegacao}
        aoBuscar={() => setJanela("busca")}
        aoAjuda={() => abrirAjuda()}
        aoTrocarGrupo={() => setJanela("grupos")}
      />
      {navegacao.carregando && <IndicadorCarregando />}

      <main
        id="conteudo"
        tabIndex={-1}
        aria-busy={navegacao.carregando || undefined}
        className="mx-auto max-w-[1040px] px-3.5 pt-3.5 pb-[calc(var(--navh)+28px+env(safe-area-inset-bottom))] outline-none md:px-4 md:pt-[18px] md:pb-[60px]"
      >
        {comSubAbas && <SubAbas secao={secao} atual={atual} novas={novas} navegacao={navegacao} />}
        {children}
      </main>

      <BarraInferior
        secoes={SECOES}
        atual={secao}
        novas={novas}
        atualNoMais={atual === ROTA_ADMIN || atual === ROTA_PERFIL}
        nomeNoMais={atual === ROTA_ADMIN ? ROTA_ADMIN.nome : undefined}
        navegacao={navegacao}
        aoAbrirMais={() => setJanela("mais")}
      />

      <MenuMais
        aberto={janela === "mais"}
        aoFechar={fechar}
        usuario={usuario}
        rotas={dono ? [ROTA_ADMIN] : []}
        atual={atual}
        variosGrupos={variosGrupos}
        navegacao={navegacao}
        aoTrocarGrupo={() => setJanela("grupos")}
        aoAjuda={() => abrirAjuda()}
      />
      <TrocarGrupoSheet
        aberto={janela === "grupos"}
        aoFechar={fechar}
        grupos={grupos}
        atual={grupo.id}
      />
      <BuscaGlobal
        aberto={janela === "busca"}
        aoFechar={fechar}
        dono={dono}
        aoAbrirAjuda={abrirAjuda}
      />
      <AjudaSheet
        key={ajudaBusca}
        buscaInicial={ajudaBusca}
        aberto={janela === "ajuda"}
        aoFechar={fechar}
        secaoAtual={atual?.ajuda}
      />
    </>
  );
}
