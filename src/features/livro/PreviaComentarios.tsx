"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Sheet } from "@/components/ui/Sheet";
import { SituacaoLeitura } from "@/features/estante/SituacaoLeitura";
import { verComentarios } from "./actions";
import type { ComentarioPosicionado } from "./queries";
import { ehSpoiler, momentoDoComentario } from "./regras";

type Props = {
  livroId: number;
  titulo: string;
  total: number;
  /** Quanto do livro eu já li (0 a 1): esconde o que é spoiler pra mim. */
  minhaPosicao: number;
  eu: string;
};

/**
 * 💬 com o número de comentários no card do livro. Com mouse, passar por cima abre uma
 * prévia; tocar (ou Enter) abre a mesma lista num sheet. Só leitura: comentar é na
 * página do livro. Nada depende só do hover.
 */
export function PreviaComentarios({ livroId, titulo, total, minhaPosicao, eu }: Props) {
  const [comentarios, setComentarios] = useState<ComentarioPosicionado[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [flutuando, setFlutuando] = useState(false);
  const [aberto, setAberto] = useState(false);
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined);
  const idPrevia = useId();

  async function carregar() {
    if (comentarios) return;
    const r = await verComentarios(livroId);
    if (r.ok) setComentarios(r.dados);
    else setErro(r.erro);
  }

  // Esc fecha a prévia flutuante (WCAG 1.4.13: conteúdo no hover precisa poder sumir)
  useEffect(() => {
    if (!flutuando) return;
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && setFlutuando(false);
    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [flutuando]);

  const lista = (
    <ListaLeitura
      comentarios={comentarios}
      erro={erro}
      minhaPosicao={minhaPosicao}
      eu={eu}
      livroId={livroId}
    />
  );

  return (
    <div
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        espera.current = setTimeout(() => {
          setFlutuando(true);
          void carregar();
        }, 250);
      }}
      onPointerLeave={() => {
        clearTimeout(espera.current);
        setFlutuando(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="dialog"
        aria-describedby={flutuando ? idPrevia : undefined}
        aria-label={`${total} ${total === 1 ? "comentário" : "comentários"} em ${titulo}. Ver`}
        onClick={() => {
          clearTimeout(espera.current);
          setFlutuando(false);
          setAberto(true);
          void carregar();
        }}
        className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1 rounded-xl border-[1.5px] border-line px-2.5 text-sm font-semibold text-ink"
      >
        <span aria-hidden="true">💬</span>
        {total}
      </button>

      {flutuando && (
        <div
          id={idPrevia}
          role="tooltip"
          className="absolute top-full right-0 z-30 mt-1 max-h-80 w-80 overflow-y-auto rounded-xl border border-line bg-card p-3 shadow-xl"
        >
          <p className="mt-0 mb-1 text-sm font-bold">Comentários</p>
          {lista}
        </div>
      )}

      <Sheet aberto={aberto} aoFechar={() => setAberto(false)} titulo="Comentários">
        <p className="mt-0 mb-1 text-muted">{titulo}</p>
        {lista}
      </Sheet>
    </div>
  );
}

function ListaLeitura({
  comentarios,
  erro,
  minhaPosicao,
  eu,
  livroId,
}: {
  comentarios: ComentarioPosicionado[] | null;
  erro: string | null;
  minhaPosicao: number;
  eu: string;
  livroId: number;
}) {
  if (erro) return <p className="m-0 text-sm text-err">{erro}</p>;
  if (!comentarios) return <p className="m-0 text-sm text-muted">Carregando comentários…</p>;
  return (
    <>
      <ul className="m-0 list-none divide-y divide-line p-0">
        {comentarios.map((c) => (
          <li key={c.id} className="flex items-start gap-2 py-2">
            <Avatar
              nome={c.autorNome}
              cor={c.autorCor}
              icone={c.autorIcone || null}
              className="size-7 text-[11px]"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <small className="font-semibold">{c.autor === eu ? "Você" : c.autorNome}</small>
                <SituacaoLeitura
                  status={c.situacao}
                  rotulo={momentoDoComentario(c.situacao, c.pagina, c.paginasEdicaoAutor)}
                />
              </div>
              {ehSpoiler(c, minhaPosicao, eu) ? (
                <p className="mt-1 mb-0 text-sm text-muted">
                  🙈 Comentário de {Math.round(c.posicao * 100)}% do livro, depois de onde você
                  está. Abra o livro para ver.
                </p>
              ) : (
                <p className="mt-0.5 mb-0 text-sm whitespace-pre-line">{c.texto}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
      <Link
        href={`/estante/${livroId}#comentarios`}
        className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline"
      >
        Abrir o livro para comentar
      </Link>
    </>
  );
}
