"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Field, classesInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import type { EstadoForm } from "@/lib/resultado";
import { apagarComentario, comentar, desfazerComentario } from "./actions";
import type { Comentario } from "./queries";
import { ehSpoiler } from "./regras";

type Props = { comentarios: Comentario[]; minhaPagina: number; eu: string };

export function Comentarios({ comentarios, minhaPagina, eu }: Props) {
  const [revelados, setRevelados] = useState<Set<number>>(new Set());

  return (
    <>
      <p className="mt-0 mb-1 text-[13px] text-muted">
        Comentários de páginas depois da sua ficam escondidos.
      </p>
      {comentarios.length === 0 ? (
        <p className="px-2 py-4 text-center text-muted">
          Nenhum comentário ainda. Seja a primeira pessoa a comentar.
        </p>
      ) : (
        <ul className="m-0 list-none divide-y divide-line p-0">
          {comentarios.map((c) => (
            <ItemComentario
              key={c.id}
              c={c}
              meu={c.autor === eu}
              escondido={ehSpoiler(c, minhaPagina, eu) && !revelados.has(c.id)}
              revelar={() => setRevelados((s) => new Set(s).add(c.id))}
            />
          ))}
        </ul>
      )}
      <NovoComentario minhaPagina={minhaPagina} />
    </>
  );
}

function ItemComentario({
  c,
  meu,
  escondido,
  revelar,
}: {
  c: Comentario;
  meu: boolean;
  escondido: boolean;
  revelar: () => void;
}) {
  const { toast } = useToast();
  const [apagando, startTransition] = useTransition();

  function apagar() {
    startTransition(async () => {
      const r = await apagarComentario(c.id);
      if (!r.ok) return toast(r.erro);
      toast("Comentário apagado.", {
        desfazer: async () => {
          const volta = await desfazerComentario({ recolocar: r.dados });
          if (!volta.ok) throw new Error(volta.erro);
        },
      });
    });
  }

  return (
    <li className="flex items-start gap-2.5 py-3">
      <Avatar nome={c.autorNome} cor={c.autorCor} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <small className="text-muted">
            {c.autorNome} · pág. {c.pagina}
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
        {escondido ? (
          <div className="mt-1 rounded-lg bg-accent-soft px-2.5 py-2 text-[13.5px]">
            🙈 Comentário da pág. {c.pagina}, depois de onde você está.{" "}
            <button
              type="button"
              onClick={revelar}
              className="min-h-11 cursor-pointer font-semibold text-accent underline"
            >
              Mostrar mesmo assim
            </button>
          </div>
        ) : (
          <p className="m-0 whitespace-pre-line">{c.texto}</p>
        )}
      </div>
    </li>
  );
}

function NovoComentario({ minhaPagina }: { minhaPagina: number }) {
  const { toast } = useToast();
  const [estado, acao, publicando] = useActionState<EstadoForm<"texto">, FormData>(comentar, null);
  const [tamanho, setTamanho] = useState(0);
  const ref = useRef<HTMLTextAreaElement>(null);
  const erro = estado && !estado.ok ? estado.erros.texto : undefined;

  useEffect(() => {
    if (!estado) return;
    if (estado.ok) {
      const id = estado.desfazer as number;
      toast(estado.mensagem, {
        desfazer: async () => {
          const r = await desfazerComentario({ apagar: id });
          if (!r.ok) throw new Error(r.erro);
        },
      });
    } else if (estado.erros.texto) ref.current?.focus();
    else if (estado.erros.geral) toast(estado.erros.geral);
  }, [estado, toast]);

  return (
    <form
      action={(f) => {
        setTamanho(0);
        return acao(f);
      }}
      noValidate
      className="mt-3 grid gap-2"
    >
      <Field
        label={`Seu comentário (marcado na pág. ${minhaPagina})`}
        hint={`${tamanho}/500 caracteres`}
        erro={erro}
      >
        {(controle) => (
          <textarea
            {...controle}
            ref={ref}
            name="texto"
            rows={3}
            maxLength={500}
            enterKeyHint="send"
            placeholder="O que achou até aqui?"
            defaultValue={estado && !estado.ok ? estado.valores.texto : ""}
            onChange={(e) => setTamanho(e.target.value.length)}
            className={classesInput}
          />
        )}
      </Field>
      <Button type="submit" disabled={publicando}>
        {publicando ? "Publicando…" : "Publicar comentário"}
      </Button>
    </form>
  );
}
