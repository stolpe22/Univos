"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import type { TaxonomiaCatalogo } from "./queries";
import { SugerirLivroForm } from "./SugerirLivroForm";

/**
 * Botão "+ Sugerir livro" que abre o formulário num Sheet (sobe de baixo no celular,
 * modal no desktop), para a estante ter a tela toda. Fecha sozinho quando dá certo.
 */
export function SugerirLivroBotao({
  taxonomia,
  admin,
  className = "",
}: {
  taxonomia: TaxonomiaCatalogo;
  admin: boolean;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button aria-haspopup="dialog" onClick={() => setAberto(true)} className={className}>
        + Sugerir livro
      </Button>
      <Sheet aberto={aberto} aoFechar={() => setAberto(false)} titulo="Sugerir livro">
        <SugerirLivroForm
          taxonomia={taxonomia}
          admin={admin}
          aoAdicionar={() => setAberto(false)}
        />
      </Sheet>
    </>
  );
}
