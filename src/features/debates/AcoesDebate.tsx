"use client";

import Link from "next/link";
import { Button, classesBotao } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MudarFase } from "./MudarFase";
import type { Debate } from "./queries";

/** Abrir, copiar o link, mandar no WhatsApp e (quem pode) iniciar ou encerrar. */
export function AcoesDebate({
  debate,
  incluirAbrir = false,
  permiteMudar = false,
}: {
  debate: Debate;
  incluirAbrir?: boolean;
  permiteMudar?: boolean;
}) {
  const { toast } = useToast();
  const link = () => new URL(`/debates/${debate.id}`, window.location.origin).toString();

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link());
      toast("Link do debate copiado. Agora é só colar no grupo.");
    } catch {
      toast("Não deu pra copiar o link. Tente de novo pelo navegador.");
    }
  }

  function mandarNoWhatsApp() {
    const texto = `Debate: ${debate.tema}\n${link()}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(texto)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div
      role="group"
      aria-label="Ações do debate"
      className="grid grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))]"
    >
      {incluirAbrir && (
        <Link
          href={`/debates/${debate.id}`}
          className={`${classesBotao("primary", "small")} w-full justify-center`}
        >
          Abrir debate
        </Link>
      )}
      <Button variante="ghost" tamanho="small" onClick={copiar} className="w-full justify-center">
        Copiar link
      </Button>
      <Button
        variante="ghost"
        tamanho="small"
        onClick={mandarNoWhatsApp}
        className="col-span-full w-full justify-center sm:col-span-1"
      >
        Compartilhar no WhatsApp
      </Button>
      {permiteMudar && debate.status !== "encerrado" && (
        <div className="col-span-full sm:col-span-1">
          <MudarFase debate={debate} className="w-full justify-center" />
        </div>
      )}
    </div>
  );
}
