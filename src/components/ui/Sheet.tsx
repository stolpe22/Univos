"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./Button";
import { useToast } from "./Toast";

type Props = {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
};

/**
 * Janela do Uni-vos: sobe de baixo no celular e vira modal centralizado no desktop.
 * Usa <dialog> nativo, que já prende o foco, fecha com Esc e devolve o foco ao sair.
 */
export function Sheet({ aberto, aoFechar, titulo, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const { esconder } = useToast();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (aberto && !dialog.open) {
      esconder(); // toast some quando um sheet abre
      dialog.showModal();
    } else if (!aberto && dialog.open) {
      dialog.close();
    }
  }, [aberto, esconder]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onClose={aoFechar}
      onClick={(e) => {
        // toque no fundo escuro fecha (o conteúdo fica num div, então só o fundo é o próprio dialog)
        if (e.target === ref.current) aoFechar();
      }}
      className="m-0 mt-auto max-h-[85dvh] w-full max-w-none animate-up overflow-auto rounded-t-[20px] bg-card p-0 text-ink backdrop:animate-fade backdrop:bg-black/50 md:m-auto md:max-w-[560px] md:rounded-[20px]"
    >
      <div className="p-[18px] pb-[calc(18px+env(safe-area-inset-bottom))]">
        <div
          aria-hidden="true"
          className="mx-auto -mt-1.5 mb-3 h-1 w-10 rounded-full bg-line md:hidden"
        />
        <div className="mb-2 flex items-start justify-between gap-2.5">
          <h2 id={idTitulo} className="m-0 min-w-0 text-xl font-bold break-words">
            {titulo}
          </h2>
          {/* título longo quebra linha; o Fechar nunca */}
          <Button
            variante="ghost"
            tamanho="small"
            onClick={aoFechar}
            className="shrink-0 whitespace-nowrap"
          >
            Fechar
          </Button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
