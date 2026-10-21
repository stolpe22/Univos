"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, classesInput } from "@/components/ui/Field";
import { useRetornoForm } from "@/components/ui/useRetornoForm";
import type { EstadoForm } from "@/lib/resultado";
import { salvarPagina, voltarPagina } from "./actions";
import { passo } from "./regras";

type Props = {
  /** Total de páginas da edição de quem lê (cadastrada em Meus livros). */
  total: number;
  minhaPagina: number;
  ultimaAtualizacao: string | null;
};

/** O que salvarPagina devolve para o Desfazer: a página (e a edição) de antes. */
type Anterior = {
  livro: number;
  anterior: {
    pagina: number;
    paginasEdicao: number;
    edicaoConfirmada: boolean;
    status: "nao_lido" | "lendo" | "lido";
    atualizadoEm: string;
  } | null;
};

export function PaginaForm({ total, minhaPagina, ultimaAtualizacao }: Props) {
  const [estado, acao, salvando] = useActionState<EstadoForm<"pagina">, FormData>(
    salvarPagina,
    null,
  );
  const [valor, setValor] = useState(String(minhaPagina));
  const form = useRef<HTMLFormElement>(null);
  useRetornoForm(estado, form, {
    desfazer: async (dados) => {
      const { livro, anterior } = dados as Anterior;
      const r = await voltarPagina(livro, anterior);
      if (r.ok) setValor(String(anterior?.pagina ?? 0));
      return r;
    },
  });
  const erro = estado && !estado.ok ? estado.erros.pagina : undefined;

  return (
    <form ref={form} action={acao} noValidate className="grid gap-2.5">
      <Field
        label="Em que página você parou?"
        hint={
          <>
            Sua edição tem {total} páginas. Mudou de edição?{" "}
            <Link href="/meus-livros" className="font-semibold text-accent underline">
              Atualize em Meus livros
            </Link>
            .{" "}
            {ultimaAtualizacao
              ? `Última atualização: ${ultimaAtualizacao}.`
              : "Você ainda não atualizou."}
          </>
        }
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
