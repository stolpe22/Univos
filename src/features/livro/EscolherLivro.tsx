"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { escolherLivro } from "./actions";

/**
 * Começa um livro da Estante como livro da vez (só quem modera vê). A confirmação mostra
 * votos e quem tem o livro, para lembrar de combinar com o grupo antes. Não tem Desfazer.
 */
export function EscolherLivro({
  livro,
  variante = "ghost",
}: {
  livro: { id: number; titulo: string; votos: number; comExemplar: number };
  variante?: "primary" | "ghost";
}) {
  const { toast } = useToast();
  const [confirmando, setConfirmando] = useState(false);
  const [escolhendo, startTransition] = useTransition();

  function escolher() {
    setConfirmando(false);
    startTransition(async () => {
      const r = await escolherLivro(livro.id);
      toast(r.ok ? `“${livro.titulo}” é o novo livro da vez.` : r.erro);
    });
  }

  return (
    <>
      <Button
        variante={variante}
        aria-haspopup="dialog"
        onClick={() => setConfirmando(true)}
        disabled={escolhendo}
      >
        {escolhendo ? "Começando…" : "Começar como livro da vez"}
      </Button>
      <Sheet
        aberto={confirmando}
        aoFechar={() => setConfirmando(false)}
        titulo="Começar este livro?"
      >
        <p className="mt-1 mb-2">
          “{livro.titulo}” tem {livro.votos} {livro.votos === 1 ? "voto" : "votos"} e{" "}
          {livro.comExemplar === 1
            ? "1 pessoa já tem o livro"
            : `${livro.comExemplar} pessoas já têm o livro`}
          .
        </p>
        <p className="mt-0 mb-4 text-muted">
          Combinem antes no grupo. Ele vira o livro da vez para todo mundo, e isso não dá pra
          desfazer.
        </p>
        <div className="flex justify-end gap-2">
          <Button variante="ghost" onClick={() => setConfirmando(false)}>
            Cancelar
          </Button>
          <Button onClick={escolher}>Começar</Button>
        </div>
      </Sheet>
    </>
  );
}
