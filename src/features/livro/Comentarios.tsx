"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { BotaoApagar } from "@/components/ui/BotaoApagar";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Field, classesInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useRetornoForm } from "@/components/ui/useRetornoForm";
import { SituacaoLeitura } from "@/features/estante/SituacaoLeitura";
import type { EstadoForm } from "@/lib/resultado";
import { apagarComentario, comentar, desfazerComentario } from "./actions";
import type { ComentarioPosicionado } from "./queries";
import { ehSpoiler, momentoDoComentario } from "./regras";

/** Como está a minha leitura agora: é o que vai marcado no meu comentário novo. */
export type MinhaLeitura = {
  situacao: "nao_lido" | "lendo" | "lido";
  pagina: number;
  paginas: number;
};

type Props = {
  livroId: number;
  comentarios: ComentarioPosicionado[];
  minha: MinhaLeitura;
  /** Quanto do livro quem lê já leu, de 0 a 1 (base do "sem spoiler"). */
  minhaPosicao: number;
  eu: string;
};

/** Comentários sem spoiler: escondidos se foram escritos num ponto do livro depois do seu. */
export function Comentarios({ livroId, comentarios, minha, minhaPosicao, eu }: Props) {
  const [revelados, setRevelados] = useState<Set<number>>(new Set());

  return (
    <>
      <p className="mt-0 mb-1 text-[13px] text-muted">
        Cada comentário mostra se a pessoa escreveu antes de ler, lendo ou depois de ler. Os de
        trechos depois de onde você está ficam escondidos, mesmo com edições diferentes.
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
              escondido={ehSpoiler(c, minhaPosicao, eu) && !revelados.has(c.id)}
              revelar={() => setRevelados((s) => new Set(s).add(c.id))}
            />
          ))}
        </ul>
      )}
      <NovoComentario livroId={livroId} minha={minha} />
    </>
  );
}

function ItemComentario({
  c,
  meu,
  escondido,
  revelar,
}: {
  c: ComentarioPosicionado;
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
      <Avatar nome={c.autorNome} cor={c.autorCor} icone={c.autorIcone || null} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pt-1">
            <small className="font-semibold">{c.autorNome}</small>
            <SituacaoLeitura
              status={c.situacao}
              rotulo={momentoDoComentario(c.situacao, c.pagina, c.paginasEdicaoAutor)}
            />
          </div>
        </div>
        {escondido ? (
          <div className="mt-1 rounded-lg bg-accent-soft px-2.5 py-2 text-[13.5px]">
            🙈 Comentário de {Math.round(c.posicao * 100)}% do livro, depois de onde você está.{" "}
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
      {meu && <BotaoApagar rotulo="Apagar meu comentário" onClick={apagar} disabled={apagando} />}
    </li>
  );
}

function NovoComentario({ livroId, minha }: { livroId: number; minha: MinhaLeitura }) {
  const [estado, acao, publicando] = useActionState<EstadoForm<"texto">, FormData>(comentar, null);
  const [tamanho, setTamanho] = useState(0);
  const form = useRef<HTMLFormElement>(null);
  useRetornoForm(estado, form, {
    desfazer: (id) => desfazerComentario({ apagar: id as number }),
    aoOk: () => setTamanho(0),
  });
  const erro = estado && !estado.ok ? estado.erros.texto : undefined;

  return (
    <form ref={form} action={acao} noValidate className="mt-3 grid gap-2">
      <input type="hidden" name="livroId" value={livroId} />
      <Field
        label={`Seu comentário (vai marcado: ${momentoDoComentario(minha.situacao, minha.pagina, minha.paginas)})`}
        hint={`${tamanho}/500 caracteres`}
        erro={erro}
      >
        {(controle) => (
          <textarea
            {...controle}
            name="texto"
            rows={3}
            maxLength={500}
            enterKeyHint="send"
            placeholder={
              minha.situacao === "nao_lido" ? "O que espera do livro?" : "O que achou até aqui?"
            }
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
