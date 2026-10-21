"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";

type Tema = "claro" | "escuro";

const CHAVE_TEMA = "univos-tema";
const EVENTO_TEMA = "univos:tema";
let temaTemporario: Tema | null = null;

function lerTema(): Tema {
  try {
    const salvo = window.localStorage.getItem(CHAVE_TEMA);
    if (salvo === "claro" || salvo === "escuro") return salvo;
  } catch {
    // O tema segue o sistema até a pessoa escolher um nesta visita.
  }
  if (temaTemporario) return temaTemporario;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
}

function assinarTema(atualizar: () => void) {
  const preferencia = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(EVENTO_TEMA, atualizar);
  window.addEventListener("storage", atualizar);
  preferencia.addEventListener("change", atualizar);
  return () => {
    window.removeEventListener(EVENTO_TEMA, atualizar);
    window.removeEventListener("storage", atualizar);
    preferencia.removeEventListener("change", atualizar);
  };
}

/** Permite escolher e manter o tema; sem escolha salva, acompanha o sistema. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const tema = useSyncExternalStore(assinarTema, lerTema, () => "claro");

  useEffect(() => {
    let salvo: string | null = null;
    try {
      salvo = window.localStorage.getItem(CHAVE_TEMA);
    } catch {
      // O seletor continua funcionando nesta visita mesmo se o navegador bloquear o storage.
    }
    if (salvo === "claro" || salvo === "escuro") {
      document.documentElement.dataset.theme = salvo;
    } else if (temaTemporario) {
      document.documentElement.dataset.theme = temaTemporario;
    } else {
      delete document.documentElement.dataset.theme;
    }
  }, [tema]);

  function alternar() {
    const proximo = tema === "escuro" ? "claro" : "escuro";
    temaTemporario = proximo;
    document.documentElement.dataset.theme = proximo;
    try {
      window.localStorage.setItem(CHAVE_TEMA, proximo);
    } catch {
      // A mudança visual vale até a página ser fechada.
    }
    window.dispatchEvent(new Event(EVENTO_TEMA));
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
      <span>Tema {tema}</span>
    </button>
  );
}
