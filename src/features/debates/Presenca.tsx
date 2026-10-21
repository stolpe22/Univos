"use client";

import { useOptimistic, useTransition } from "react";
import { AvatarStack } from "@/components/ui/AvatarStack";
import { classesBotao } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { presenca } from "./actions";
import type { Debate } from "./queries";

/** "Vou participar" com atualização na hora (otimista) e Desfazer no toast. */
export function Presenca({ debate: d, eu }: { debate: Debate; eu: string }) {
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const confirmadoNoServidor = d.presencas.some((p) => p.id === eu);
  const [vou, setVou] = useOptimistic(confirmadoNoServidor);
  const total = d.presencas.length + (vou === confirmadoNoServidor ? 0 : vou ? 1 : -1);

  function alternar(novo: boolean) {
    startTransition(async () => {
      setVou(novo);
      const r = await presenca(d.id, novo);
      if (!r.ok) return toast(r.erro);
      toast(novo ? "Presença confirmada." : "Presença cancelada.", {
        desfazer: async () => {
          const volta = await presenca(d.id, !novo);
          if (!volta.ok) throw new Error(volta.erro);
        },
      });
    });
  }

  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <AvatarStack pessoas={d.presencas} contexto="Confirmaram presença" />
        <span className="ml-1 text-[13px] text-muted">
          {total === 0
            ? "Ninguém confirmou ainda"
            : `${total} ${total === 1 ? "confirmado" : "confirmados"}`}
        </span>
      </div>
      <button
        type="button"
        aria-pressed={vou}
        onClick={() => alternar(!vou)}
        className={classesBotao(vou ? "primary" : "ghost", "small")}
      >
        {vou ? "✓ Vou participar" : "Vou participar"}
      </button>
    </div>
  );
}
