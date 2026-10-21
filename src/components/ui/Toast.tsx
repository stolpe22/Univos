"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Desfazer = () => void | Promise<void>;
type Aviso = { id: number; texto: string; desfazer?: Desfazer };

type ToastApi = {
  /** Mostra um aviso curto. Com `desfazer`, mostra o botão Desfazer por 6 s. */
  toast: (texto: string, opcoes?: { desfazer?: Desfazer }) => void;
  /** Esconde o aviso atual (ex.: quando um sheet abre). */
  esconder: () => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return api;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const esconder = useCallback(() => {
    clearTimeout(timer.current);
    setAviso(null);
  }, []);

  const toast = useCallback<ToastApi["toast"]>((texto, opcoes) => {
    clearTimeout(timer.current);
    setAviso({ id: Date.now(), texto, desfazer: opcoes?.desfazer });
    timer.current = setTimeout(() => setAviso(null), opcoes?.desfazer ? 6000 : 2400);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function aoDesfazer() {
    const fn = aviso?.desfazer;
    esconder();
    if (!fn) return;
    try {
      await fn();
      toast("Pronto, desfeito.");
    } catch {
      toast("Não deu pra desfazer agora. Tente de novo.");
    }
  }

  return (
    <ToastContext value={{ toast, esconder }}>
      {children}
      {/* Fica acima da barra inferior no celular. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--navh)+12px+env(safe-area-inset-bottom))] z-60 flex justify-center px-3.5 md:bottom-5"
      >
        {aviso && (
          <div
            key={aviso.id}
            className="pointer-events-auto flex max-w-full animate-rise items-center gap-3.5 rounded-xl bg-ink px-3.5 py-2.5 text-sm text-bg shadow-xl"
          >
            <span>{aviso.texto}</span>
            {aviso.desfazer && (
              <button
                type="button"
                onClick={aoDesfazer}
                className="min-h-11 cursor-pointer px-1 font-bold underline"
              >
                Desfazer
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext>
  );
}
