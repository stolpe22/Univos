"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { mudarFase } from "./actions";
import type { Debate } from "./queries";

/**
 * Marca o debate como em andamento ou encerra. Não abre chamada nem transmissão: só
 * avisa o grupo e muda a fase da enquete. Encerrar não tem volta, então pede confirmação.
 */
export function MudarFase({ debate: d, className = "" }: { debate: Debate; className?: string }) {
  const { toast } = useToast();
  const [confirmando, setConfirmando] = useState(false);
  const [mudando, startTransition] = useTransition();
  const iniciar = d.status === "agendado";
  const temEnquete = d.enquete?.status === "aprovada";

  function mudar() {
    setConfirmando(false);
    startTransition(async () => {
      const r = await mudarFase(d.id, iniciar ? "ao_vivo" : "encerrado");
      if (!r.ok) return toast(r.erro);
      toast(
        iniciar
          ? "Debate marcado como em andamento."
          : temEnquete
            ? "Debate encerrado. A votação de depois abriu."
            : "Debate encerrado.",
      );
    });
  }

  return (
    <>
      <Button
        variante="ghost"
        tamanho="small"
        className={className}
        disabled={mudando}
        onClick={() => setConfirmando(true)}
      >
        {iniciar ? "▶ Iniciar debate" : "■ Encerrar debate"}
      </Button>
      <Sheet
        aberto={confirmando}
        aoFechar={() => setConfirmando(false)}
        titulo={iniciar ? "Iniciar debate?" : "Encerrar o debate?"}
      >
        <p className="mt-1 mb-4">
          {iniciar
            ? `“${d.tema}” aparece como em andamento pra todo mundo no Uni-vos. Isso não abre chamada nem transmissão.${temEnquete ? " A votação de antes fecha." : ""} Depois, encerre o debate pra abrir a votação final.`
            : `“${d.tema}” vai para Já rolaram.${temEnquete ? " Abre a votação de depois da enquete." : ""} Essa mudança não dá pra desfazer.`}
        </p>
        <div className="flex justify-end gap-2">
          <Button variante="ghost" onClick={() => setConfirmando(false)}>
            Cancelar
          </Button>
          <Button onClick={mudar}>{iniciar ? "Iniciar debate" : "Encerrar"}</Button>
        </div>
      </Sheet>
    </>
  );
}
