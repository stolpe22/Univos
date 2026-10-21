"use client";

import { useOptimistic, useTransition } from "react";
import { AvatarStack } from "@/components/ui/AvatarStack";
import { classesBotao } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatarDia } from "@/lib/datas";
import { marcarMeta } from "./actions";
import type { MetaLeitura as Meta } from "./queries";

/**
 * A meta da semana ("Capítulo 5") com o botão "Cheguei!" e quem já chegou.
 * Sem página: cada pessoa lê uma edição diferente, então ela mesma diz que chegou.
 */
export function MetaLeitura({
  meta,
  eu,
  leitores,
}: {
  meta: Meta;
  eu: string;
  /** Quantas pessoas cadastraram o exemplar (pra mostrar "2 de 5 chegaram"). */
  leitores: number;
}) {
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const chegouNoServidor = meta.alcancaram.some((p) => p.id === eu);
  const [cheguei, setCheguei] = useOptimistic(chegouNoServidor);
  const total = meta.alcancaram.length + (cheguei === chegouNoServidor ? 0 : cheguei ? 1 : -1);

  function alternar(novo: boolean) {
    startTransition(async () => {
      setCheguei(novo);
      const r = await marcarMeta(meta.id, novo);
      if (!r.ok) return toast(r.erro);
      toast(novo ? "Boa! Você chegou na meta. 🎉" : "Marcação desfeita.", {
        desfazer: async () => {
          const volta = await marcarMeta(meta.id, !novo);
          if (!volta.ok) throw new Error(volta.erro);
        },
      });
    });
  }

  return (
    <div>
      <p className="mt-0 mb-0.5 text-lg font-bold">{meta.texto}</p>
      <p className="mt-0 mb-3 text-sm text-muted">Até {formatarDia(meta.prazo)}</p>
      <button
        type="button"
        aria-pressed={cheguei}
        onClick={() => alternar(!cheguei)}
        className={`${classesBotao(cheguei ? "primary" : "ghost")} w-full`}
      >
        {cheguei ? "✓ Cheguei!" : "Cheguei!"}
      </button>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
        {meta.alcancaram.length > 0 && (
          <AvatarStack pessoas={meta.alcancaram} contexto="Chegaram na meta" />
        )}
        <span>
          {total === 0
            ? "Ninguém chegou ainda. Seja a primeira pessoa."
            : `${total} de ${Math.max(leitores, total)} ${total === 1 ? "chegou" : "chegaram"}`}
          {meta.alcancaram.length > 0 && `: ${meta.alcancaram.map((p) => p.nome).join(", ")}`}
        </span>
      </div>
    </div>
  );
}
