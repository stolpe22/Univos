"use client";

import { useState, type ComponentPropsWithRef } from "react";
import { Field, classesInput } from "./Field";

type Props = {
  label: string;
  hint?: string;
  erro?: string;
  /** "current-password" no login, "new-password" ao criar ou trocar. */
  autoComplete: "current-password" | "new-password";
} & Omit<ComponentPropsWithRef<"input">, "type" | "autoComplete" | "children">;

/**
 * Campo de senha com botão Mostrar/Esconder. Aceita colar e gerenciador de senhas
 * (WCAG 3.3.8): nunca bloqueie paste aqui.
 */
export function CampoSenha({ label, hint, erro, autoComplete, className = "", ...input }: Props) {
  const [visivel, setVisivel] = useState(false);

  return (
    <Field label={label} hint={hint} erro={erro}>
      {(controle) => (
        <div className="relative">
          <input
            {...input}
            {...controle}
            type={visivel ? "text" : "password"}
            autoComplete={autoComplete}
            autoCapitalize="none"
            spellCheck={false}
            className={`${classesInput} pr-24 ${className}`}
          />
          <button
            type="button"
            onClick={() => setVisivel((v) => !v)}
            aria-pressed={visivel}
            aria-controls={controle.id}
            className="absolute inset-y-0 right-0 min-h-11 min-w-11 cursor-pointer rounded-r-xl px-3 text-sm font-semibold text-accent"
          >
            {visivel ? "Esconder" : "Mostrar"}
            <span className="sr-only"> senha</span>
          </button>
        </div>
      )}
    </Field>
  );
}
