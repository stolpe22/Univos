"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

type Tema = "claro" | "escuro";

const CHAVE_TEMA = "univos-tema";
const EVENTO_TEMA = "univos:tema";

/** Permite escolher e manter o tema; sem escolha salva, acompanha o sistema. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    let salvo: string | null = null;
    try {
      salvo = window.localStorage.getItem(CHAVE_TEMA);
    } catch {
      // O seletor continua funcionando nesta visita mesmo se o navegador bloquear o storage.
    }
    const preferido = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "escuro"
      : "claro";
    const inicial = salvo === "claro" || salvo === "escuro" ? salvo : preferido;

    if (salvo === "claro" || salvo === "escuro") document.documentElement.dataset.theme = salvo;
    else delete document.documentElement.dataset.theme;
    setTema(inicial);

    function sincronizar(evento: Event) {
      const novoTema = (evento as CustomEvent<Tema>).detail;
      setTema(novoTema);
    }
    window.addEventListener(EVENTO_TEMA, sincronizar);
    return () => window.removeEventListener(EVENTO_TEMA, sincronizar);
  }, []);

  function alternar() {
    const proximo = tema === "escuro" ? "claro" : "escuro";
    document.documentElement.dataset.theme = proximo;
    try {
      window.localStorage.setItem(CHAVE_TEMA, proximo);
    } catch {
      // A mudança visual vale até a página ser fechada.
    }
    setTema(proximo);
    window.dispatchEvent(new CustomEvent(EVENTO_TEMA, { detail: proximo }));
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label="Tema escuro"
      aria-pressed={tema === "escuro"}
      className={className}
    >
      <Icon nome={tema === "escuro" ? "sun" : "moon"} />
      <span>{tema === null ? "Tema" : `Tema ${tema}`}</span>
    </button>
  );
}
