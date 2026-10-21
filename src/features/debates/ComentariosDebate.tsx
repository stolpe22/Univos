"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Field, classesInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useRetornoForm } from "@/components/ui/useRetornoForm";
import { formatarData } from "@/lib/datas";
import type { EstadoForm } from "@/lib/resultado";
import { apagarComentarioDebate, comentarDebate, recolocarComentarioDebate } from "./actions";
import type { ComentarioDebate } from "./queries";

export function ComentariosDebate({
  debateId,
  comentarios,
  eu,
}: {
  debateId: number;
  comentarios: ComentarioDebate[];
  eu: string;
}) {
  return (
    <>
      {comentarios.length === 0 ? (
        <p className="px-2 py-4 text-center text-muted">
          Ainda não há comentários. Comece a conversa.
        </p>
      ) : (
        <ul className="m-0 list-none divide-y divide-line p-0">
          {comentarios.map((c) => (
            <ItemComentario key={c.id} comentario={c} debateId={debateId} meu={c.autor === eu} />
          ))}
        </ul>
      )}
      <NovoComentario debateId={debateId} />
    </>
  );
}

function ItemComentario({
  comentario: c,
  debateId,
  meu,
}: {
  comentario: ComentarioDebate;
  debateId: number;
  meu: boolean;
}) {
  const { toast } = useToast();
  const [apagando, startTransition] = useTransition();

  function apagar() {
    startTransition(async () => {
      const r = await apagarComentarioDebate(c.id, debateId);
      if (!r.ok) return toast(r.erro);
      toast("Comentário apagado.", {
        desfazer: async () => {
          const volta = await recolocarComentarioDebate(debateId, r.dados.texto);
          if (!volta.ok) throw new Error(volta.erro);
        },
      });
    });
  }

  return (
    <li className="flex items-start gap-2.5 py-3">
      <Avatar nome={c.autorNome} cor={c.autorCor} icone={c.autorIcone} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <small className="text-muted">
            {c.autorNome} · {formatarData(c.criadoEm)}
          </small>
          {meu && (
            <button
              type="button"
              onClick={apagar}
              disabled={apagando}
              className="min-h-11 cursor-pointer px-2 text-sm font-semibold text-accent underline disabled:opacity-40"
            >
              Apagar
            </button>
          )}
        </div>
        <p className="m-0 whitespace-pre-line">{c.texto}</p>
      </div>
    </li>
  );
}

function NovoComentario({ debateId }: { debateId: number }) {
  const [estado, acao, publicando] = useActionState<EstadoForm<"texto">, FormData>(
    comentarDebate.bind(null, debateId),
    null,
  );
  const form = useRef<HTMLFormElement>(null);
  const [tamanho, setTamanho] = useState(0);
  useRetornoForm(estado, form, {
    desfazer: (id) => apagarComentarioDebate(id as number, debateId),
    aoOk: () => setTamanho(0),
  });
  const erro = estado && !estado.ok ? estado.erros.texto : undefined;

  return (
    <form ref={form} action={acao} noValidate className="mt-3 grid gap-2">
      <Field label="Seu comentário" hint={`${tamanho}/1000 caracteres`} erro={erro}>
        {(controle) => (
          <textarea
            {...controle}
            name="texto"
            rows={3}
            maxLength={1000}
            enterKeyHint="send"
            placeholder="O que você pensa sobre esse debate?"
            defaultValue={estado && !estado.ok ? estado.valores.texto : ""}
            onChange={(e) => setTamanho(e.target.value.length)}
            className={classesInput}
          />
        )}
      </Field>
      <Button type="submit" disabled={publicando}>
        {publicando ? "Publicando…" : "Comentar"}
      </Button>
    </form>
  );
}
