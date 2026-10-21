"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";
import type { EstadoForm } from "@/lib/resultado";
import { useToast } from "./Toast";

type Opcoes = {
  /** Desfaz o que a action fez, a partir de `estado.desfazer` (botão Desfazer no toast). */
  desfazer?: (dados: unknown) => Promise<{ ok: boolean; erro?: string }>;
  /** Roda depois de dar certo (ex: selecionar o item criado). */
  aoOk?: (dados: unknown) => void;
  /** Limpa o formulário depois de dar certo (o React 19 já limpa campos sem estado). */
  limpar?: boolean;
};

/**
 * Retorno padrão de todo formulário com useActionState (heurísticas 1, 3 e 9):
 * deu certo → toast (com Desfazer, se houver); erro geral → toast;
 * erro de campo → foco no primeiro campo inválido.
 */
export function useRetornoForm(
  estado: EstadoForm,
  form: RefObject<HTMLFormElement | null>,
  opcoes: Opcoes = {},
) {
  const { toast } = useToast();

  const reagir = useEffectEvent((atual: NonNullable<EstadoForm>) => {
    if (atual.ok) {
      if (opcoes.limpar) form.current?.reset();
      opcoes.aoOk?.(atual.desfazer);
      const { desfazer } = opcoes;
      toast(
        atual.mensagem,
        desfazer && atual.desfazer !== undefined
          ? {
              desfazer: async () => {
                const r = await desfazer(atual.desfazer);
                if (!r.ok) throw new Error(r.erro);
              },
            }
          : undefined,
      );
    } else if (atual.erros.geral) {
      toast(atual.erros.geral);
    } else {
      form.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    }
  });

  useEffect(() => {
    if (estado) reagir(estado);
  }, [estado]);
}
