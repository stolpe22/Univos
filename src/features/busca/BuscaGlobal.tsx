"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { classesInput } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { buscarNoGrupo } from "./actions";
import { buscarLocal } from "./locais";
import { ORDEM_GRUPOS, type Resultado } from "./tipos";

type Props = {
  aberto: boolean;
  aoFechar: () => void;
  dono: boolean;
  /** Resultado da Ajuda: abre a Ajuda já buscando a pergunta. */
  aoAbrirAjuda: (pergunta: string) => void;
};

/** Espera a pessoa parar de digitar antes de ir ao banco. */
const ESPERA_MS = 250;

/**
 * Busca global (Ctrl+K): páginas, livros, debates, pauta, pessoas e ajuda.
 * Padrão combobox: ↑ ↓ escolhem, Enter abre, Esc fecha.
 */
export function BuscaGlobal({ aberto, aoFechar, dono, aoAbrirAjuda }: Props) {
  const router = useRouter();
  const idLista = useId();
  const [termo, setTermo] = useState("");
  const [remoto, setRemoto] = useState<{ para: string; itens: Resultado[]; falhou: boolean }>({
    para: "",
    itens: [],
    falhou: false,
  });
  const [ativo, setAtivo] = useState(0);
  const pedido = useRef(0);

  const limpo = termo.trim();
  const buscaNoBanco = limpo.length >= 2;

  useEffect(() => {
    if (!buscaNoBanco) return;
    const meu = ++pedido.current;
    const timer = setTimeout(async () => {
      const r = await buscarNoGrupo(limpo);
      // só vale a resposta do último pedido (a pessoa pode ter continuado digitando)
      if (meu === pedido.current) setRemoto({ para: limpo, itens: r.itens, falhou: !r.ok });
    }, ESPERA_MS);
    return () => clearTimeout(timer);
  }, [limpo, buscaNoBanco]);

  const buscando = buscaNoBanco && remoto.para !== limpo;
  const resultados = useMemo(() => {
    const todos = [...buscarLocal(limpo, dono), ...(buscaNoBanco && !buscando ? remoto.itens : [])];
    return ORDEM_GRUPOS.flatMap((g) => todos.filter((r) => r.grupo === g));
  }, [limpo, dono, buscaNoBanco, buscando, remoto.itens]);

  const indiceAtivo = Math.min(ativo, Math.max(resultados.length - 1, 0));

  function fechar() {
    setTermo("");
    setAtivo(0);
    aoFechar();
  }

  function escolher(r: Resultado) {
    fechar();
    if (r.pergunta) aoAbrirAjuda(r.pergunta);
    else if (r.href) router.push(r.href);
  }

  function aoTeclar(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAtivo((i) =>
        resultados.length ? (Math.min(i, resultados.length - 1) + 1) % resultados.length : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAtivo((i) =>
        resultados.length
          ? (Math.min(i, resultados.length - 1) - 1 + resultados.length) % resultados.length
          : 0,
      );
    } else if (e.key === "Enter" && resultados[indiceAtivo]) {
      e.preventDefault();
      escolher(resultados[indiceAtivo]);
    }
  }

  // Mantém o item ativo visível ao navegar com as setas.
  useEffect(() => {
    document.getElementById(`${idLista}-${indiceAtivo}`)?.scrollIntoView({ block: "nearest" });
  }, [indiceAtivo, idLista]);

  return (
    <Sheet aberto={aberto} aoFechar={fechar} titulo="Buscar">
      <label htmlFor={`${idLista}-campo`} className="text-sm font-semibold">
        Buscar no Uni-vos
      </label>
      <input
        id={`${idLista}-campo`}
        type="search"
        role="combobox"
        aria-expanded={resultados.length > 0}
        aria-controls={idLista}
        aria-activedescendant={resultados.length ? `${idLista}-${indiceAtivo}` : undefined}
        aria-autocomplete="list"
        aria-describedby={`${idLista}-dica`}
        autoFocus
        autoComplete="off"
        enterKeyHint="search"
        maxLength={60}
        placeholder="Livro, debate, tema, pessoa, ajuda…"
        value={termo}
        onChange={(e) => {
          setTermo(e.target.value);
          setAtivo(0);
        }}
        onKeyDown={aoTeclar}
        className={`${classesInput} mt-1.5`}
      />
      <p id={`${idLista}-dica`} className="mt-1.5 mb-2 text-[13px] text-muted">
        <span className="hidden md:inline">
          Use <kbd className="rounded border border-line px-1">↑</kbd>{" "}
          <kbd className="rounded border border-line px-1">↓</kbd> e Enter. Abra de qualquer tela
          com <kbd className="rounded border border-line px-1">Ctrl</kbd>+
          <kbd className="rounded border border-line px-1">K</kbd>.
        </span>
        <span className="md:hidden">Ignora acento: “politica” acha “política”.</span>
      </p>

      <div role="status" aria-live="polite" className="sr-only">
        {buscando
          ? "Buscando…"
          : limpo && `${resultados.length} ${resultados.length === 1 ? "resultado" : "resultados"}`}
      </div>

      {remoto.falhou && remoto.para === limpo && (
        <p className="my-2 text-sm text-err">
          ⚠ Não deu pra buscar livros, debates e pessoas agora. Confira sua internet e digite de
          novo.
        </p>
      )}

      <ul id={idLista} role="listbox" aria-label="Resultados" className="m-0 list-none p-0">
        {resultados.map((r, i) => {
          const novoGrupo = i === 0 || resultados[i - 1].grupo !== r.grupo;
          return (
            <li key={r.id} role="presentation">
              {novoGrupo && (
                <p
                  role="presentation"
                  className="mt-3 mb-1 text-xs font-bold tracking-wide text-muted uppercase"
                >
                  {r.grupo}
                </p>
              )}
              <div
                id={`${idLista}-${i}`}
                role="option"
                aria-selected={i === indiceAtivo}
                tabIndex={-1}
                onClick={() => escolher(r)}
                onMouseMove={() => setAtivo(i)}
                className="flex min-h-11 cursor-pointer flex-col justify-center rounded-xl px-3 py-1.5 aria-selected:bg-accent-soft aria-selected:text-accent"
              >
                <span className="font-semibold">{r.titulo}</span>
                {r.detalhe && <span className="text-[13px] text-muted">{r.detalhe}</span>}
              </div>
            </li>
          );
        })}
      </ul>

      {buscando && <p className="my-3 text-center text-sm text-muted">Buscando…</p>}
      {limpo && !buscando && resultados.length === 0 && (
        <p className="my-4 text-center text-muted">
          Nada encontrado para “{limpo}”. Tente outra palavra, como o nome de um livro ou de uma
          pessoa.
        </p>
      )}
    </Sheet>
  );
}
