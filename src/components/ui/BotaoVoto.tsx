"use client";

import { useOptimistic, useTransition } from "react";
import { classesBotao } from "./Button";
import { useToast } from "./Toast";

type Props = {
  /** Nome do item, para o leitor de tela ("Votar em Sapiens"). */
  rotulo: string;
  votado: boolean;
  total: number;
  /** Liga ou desliga o voto no servidor. */
  alternar: (votar: boolean) => Promise<{ ok: boolean }>;
};

/**
 * "▲ Votar · 3" / "✓ Votado · 4". Igual na Estante e na Pauta (heurística 4).
 * Atualiza na hora (otimista) e desfaz sozinho se o servidor falhar.
 */
export function BotaoVoto({ rotulo, votado, total, alternar }: Props) {
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [estado, setEstado] = useOptimistic({ votado, total });

  function clicar() {
    const votar = !estado.votado;
    startTransition(async () => {
      setEstado({ votado: votar, total: estado.total + (votar ? 1 : -1) });
      const r = await alternar(votar);
      if (!r.ok) toast("Não deu pra salvar o voto agora. Tente de novo.");
      else toast(votar ? `Voto em “${rotulo}” registrado.` : "Voto removido.");
    });
  }

  return (
    <button
      type="button"
      onClick={clicar}
      aria-pressed={estado.votado}
      aria-label={`${estado.votado ? "Tirar voto de" : "Votar em"} ${rotulo}, ${estado.total} ${estado.total === 1 ? "voto" : "votos"}`}
      className={`${classesBotao(estado.votado ? "primary" : "ghost", "small")} flex-none`}
    >
      {estado.votado ? "✓ Votado" : "▲ Votar"} · {estado.total}
    </button>
  );
}
