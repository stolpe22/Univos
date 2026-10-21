import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

/** Moldura das telas de entrada (login, convite, boas-vindas): fundo animado + cartão de vidro. */
export function TelaEntrada({
  children,
  subtitulo,
}: {
  children: ReactNode;
  subtitulo?: ReactNode;
}) {
  return (
    <div className="tema-escuro relative grid min-h-dvh place-items-center px-4 pt-[max(16px,env(safe-area-inset-top))] pb-[max(16px,env(safe-area-inset-bottom))]">
      <div className="fundo-entrada" aria-hidden="true">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="grade" />
      </div>

      <main className="relative w-full max-w-[390px] animate-rise rounded-[22px] border border-white/20 bg-white/8 px-5 py-6 shadow-2xl backdrop-blur-[18px]">
        <div className="text-center">
          <Logo rotulo="Logo Uni-vos" className="logo-entrada mx-auto size-[86px]" />
          <p className="mt-1.5 mb-0 font-serif text-4xl font-bold">Uni-vos</p>
          <div
            aria-hidden="true"
            className="my-2.5 flex justify-center gap-1.5 text-xs font-bold text-white"
          >
            <span className="rounded-full bg-blue px-2.5 py-0.5">tese</span>
            <span className="rounded-full bg-red px-2.5 py-0.5">antítese</span>
            <span className="rounded-full bg-purple px-2.5 py-0.5">síntese</span>
          </div>
          <p className="mt-0 mb-4 text-[13px] text-muted">
            {subtitulo ?? (
              <>
                Esquerda, direita e quem tá no meio: uni-vos.
                <br />
                Clube do livro &amp; debates.
              </>
            )}
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}

/** Aviso dentro do cartão de vidro (sucesso ou alerta). */
export function Aviso({ tipo, children }: { tipo: "ok" | "alerta"; children: ReactNode }) {
  const cores = tipo === "ok" ? "border-ok/50 bg-ok/15" : "border-err/50 bg-err/15";
  return (
    <div role="status" className={`rounded-xl border px-3 py-2.5 text-sm ${cores}`}>
      {children}
    </div>
  );
}
