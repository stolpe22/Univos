"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, classesInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import type { EstadoForm } from "@/lib/resultado";
import { salvarPagina, voltarPagina } from "./actions";
import { passo } from "./regras";

type Props = { total: number; minhaPagina: number; ultimaAtualizacao: string | null };

export function PaginaForm({ total, minhaPagina, ultimaAtualizacao }: Props) {
  const { toast } = useToast();
  const [estado, acao, salvando] = useActionState<EstadoForm<"pagina">, FormData>(
    salvarPagina,
    null,
  );
  const [valor, setValor] = useState(String(minhaPagina));
  const ref = useRef<HTMLInputElement>(null);
  const erro = estado && !estado.ok ? estado.erros.pagina : undefined;

  useEffect(() => {
    if (!estado) return;
    if (estado.ok) {
      const antes = estado.desfazer as { livro: number; pagina: number } | undefined;
      toast(estado.mensagem, {
        desfazer: antes
          ? async () => {
              const r = await voltarPagina(antes.livro, antes.pagina);
              if (!r.ok) throw new Error(r.erro);
              setValor(String(antes.pagina));
            }
          : undefined,
      });
    } else if (estado.erros.pagina) {
      ref.current?.focus();
    } else if (estado.erros.geral) {
      toast(estado.erros.geral);
    }
  }, [estado, toast]);

  return (
    <form action={acao} noValidate className="grid gap-2.5">
      <Field
        label="Em que página você parou?"
        hint={`De 0 a ${total}. ${ultimaAtualizacao ? `Última atualização: ${ultimaAtualizacao}.` : "Você ainda não atualizou."}`}
        erro={erro}
      >
        {(controle) => (
          <div className="grid grid-cols-[64px_1fr_64px] gap-1.5">
            <Button
              variante="ghost"
              onClick={() => setValor(String(passo(Number(valor), -10, total)))}
              aria-label="Voltar 10 páginas"
            >
              −10
            </Button>
            <input
              {...controle}
              ref={ref}
              name="pagina"
              type="number"
              inputMode="numeric"
              enterKeyHint="done"
              min={0}
              max={total}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className={`${classesInput} text-center font-bold`}
            />
            <Button
              variante="ghost"
              onClick={() => setValor(String(passo(Number(valor), 10, total)))}
              aria-label="Avançar 10 páginas"
            >
              +10
            </Button>
          </div>
        )}
      </Field>
      <Button type="submit" disabled={salvando}>
        {salvando ? "Salvando…" : "Salvar página"}
      </Button>
    </form>
  );
}
