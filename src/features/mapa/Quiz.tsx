"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Sheet } from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { comecarQuiz, refazerQuiz, responder } from "./actions";
import { AFIRMACOES } from "./afirmacoes";
import { embaralhar, proximaPendente } from "./ordem";

const ESCALA = [
  { simbolo: "−−", texto: "Discordo totalmente" },
  { simbolo: "−", texto: "Discordo" },
  { simbolo: "0", texto: "Neutro" },
  { simbolo: "+", texto: "Concordo" },
  { simbolo: "++", texto: "Concordo plenamente" },
];

type Props = {
  semente: number | null;
  respostasIniciais: Record<number, number>;
  temResultado: boolean;
};

/**
 * O questionário: uma afirmação por vez, Voltar e Pausar (heurística 3),
 * teclas 1–5 e ← (heurística 7), resposta marcada ao voltar (heurística 6).
 */
export function Quiz({ semente: sementeInicial, respostasIniciais, temResultado }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [semente, setSemente] = useState(sementeInicial);
  const [respostas, setRespostas] = useState(respostasIniciais);
  const [respondendo, setRespondendo] = useState(false);
  const ordem = useMemo(() => (semente ? embaralhar(semente, AFIRMACOES.length) : []), [semente]);
  const [indice, setIndice] = useState(() => proximaPendente(ordem, respostasIniciais));
  const [comecando, startComecar] = useTransition();
  const respondidas = Object.keys(respostas).length;
  const titulo = useRef<HTMLHeadingElement>(null);

  const responderAtual = useCallback(
    (valor: number) => {
      if (respondendo || !semente) return;
      const afirmacao = ordem[indice];
      setRespostas((r) => ({ ...r, [afirmacao]: valor }));
      setRespondendo(true);
      responder(afirmacao, valor).then((r) => {
        setRespondendo(false);
        if (!r.ok) {
          toast(r.erro);
          return;
        }
        if (r.dados.concluido) {
          setSemente(null);
          toast("Resultado pronto! Ele também aparece em Membros.");
          router.refresh();
        } else if (indice < ordem.length - 1) {
          setIndice(indice + 1);
        }
      });
    },
    [respondendo, semente, ordem, indice, toast, router],
  );

  // Teclas 1–5 respondem, ← volta (só durante o questionário e fora de campos de texto).
  useEffect(() => {
    if (!semente) return;
    function aoTeclar(e: KeyboardEvent) {
      const alvo = e.target as HTMLElement;
      if (/INPUT|TEXTAREA|SELECT/.test(alvo.tagName) || document.querySelector("dialog[open]"))
        return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key >= "1" && e.key <= "5") {
        e.preventDefault();
        responderAtual(Number(e.key));
      } else if (e.key === "ArrowLeft" && indice > 0) {
        e.preventDefault();
        setIndice(indice - 1);
      }
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [semente, indice, responderAtual]);

  // Pergunta nova: o foco vai para o enunciado, para o leitor de tela ler.
  useEffect(() => {
    if (semente) titulo.current?.focus();
  }, [indice, semente]);

  function comecar() {
    startComecar(async () => {
      const r = await comecarQuiz();
      if (!r.ok) return toast(r.erro);
      const nova = embaralhar(r.dados, AFIRMACOES.length);
      setIndice(proximaPendente(nova, respostas));
      setSemente(r.dados);
    });
  }

  function pausar() {
    setSemente(null);
    toast(`Respostas guardadas (${respondidas}/40). Continue quando quiser.`);
  }

  if (!semente) {
    return (
      <div>
        <h2 className="mt-0 mb-1 text-xl font-bold">Como funciona</h2>
        <ul className="my-1.5 pl-5">
          <li>40 afirmações, uma por vez (cerca de 5 minutos).</li>
          <li>Diga o quanto concorda, de “Discordo totalmente” a “Concordo plenamente”.</li>
          <li>Dá pra voltar, mudar a resposta ou pausar quando quiser.</li>
          <li className="hidden md:list-item">
            Atalhos: teclas <kbd className="rounded border border-line px-1">1</kbd> a{" "}
            <kbd className="rounded border border-line px-1">5</kbd> respondem,{" "}
            <kbd className="rounded border border-line px-1">←</kbd> volta.
          </li>
        </ul>
        <p className="mt-3 mb-5 text-[13px] text-muted">
          É um jogo para puxar debate, não um teste científico.
        </p>
        {!temResultado && (
          <Button onClick={comecar} disabled={comecando}>
            {comecando ? "Abrindo…" : respondidas > 0 ? `Continuar (${respondidas}/40)` : "Começar"}
          </Button>
        )}
      </div>
    );
  }

  const afirmacao = AFIRMACOES[ordem[indice]];
  const marcada = respostas[ordem[indice]];

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Pill>
          Pergunta {indice + 1} de {AFIRMACOES.length}
        </Pill>
        <span className="text-[13.5px] text-muted">
          {afirmacao.eixo === "economia" ? "💰 Economia" : "🏛️ Costumes"}
        </span>
      </div>
      <ProgressBar
        valor={respondidas}
        max={AFIRMACOES.length}
        rotulo="Progresso do questionário"
        className="mt-3 mb-4"
      />
      <h2
        ref={titulo}
        tabIndex={-1}
        aria-live="polite"
        className="mt-2 mb-5 min-h-[2.5em] text-[clamp(20px,3vw,28px)] font-bold outline-none"
      >
        {afirmacao.texto}
      </h2>
      <div role="group" aria-label="Quanto você concorda?" className="grid gap-2 sm:grid-cols-5">
        {ESCALA.map((e, k) => {
          const valor = k + 1;
          const ativo = marcada === valor;
          return (
            <button
              key={valor}
              type="button"
              aria-pressed={ativo}
              disabled={respondendo}
              onClick={() => responderAtual(valor)}
              className={`flex min-h-[52px] cursor-pointer items-center gap-3.5 rounded-xl border-[1.5px] px-4 py-2.5 text-left transition disabled:cursor-wait sm:flex-col sm:items-center sm:gap-1 sm:px-2 sm:py-3.5 sm:text-center ${
                ativo
                  ? "border-transparent bg-grad text-white"
                  : "border-line bg-card text-ink [@media(hover:hover)]:hover:border-accent"
              }`}
            >
              <b aria-hidden="true" className="w-6 text-lg whitespace-nowrap sm:w-auto">
                {e.simbolo}
              </b>
              <span className="text-[15px] sm:text-[12.5px]">{e.texto}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex justify-between gap-2">
        <Button
          variante="ghost"
          tamanho="small"
          disabled={indice === 0}
          onClick={() => setIndice(indice - 1)}
        >
          ← Voltar
        </Button>
        <Button variante="ghost" tamanho="small" onClick={pausar}>
          Pausar
        </Button>
      </div>
    </div>
  );
}

/** "Refazer questionário": apaga tudo, então pede confirmação. */
export function RefazerQuiz() {
  const { toast } = useToast();
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [apagando, startTransition] = useTransition();

  function refazer() {
    setConfirmando(false);
    startTransition(async () => {
      const r = await refazerQuiz();
      if (!r.ok) return toast(r.erro);
      toast("Respostas apagadas. Toque em Começar quando quiser.");
      router.refresh();
    });
  }

  return (
    <>
      <Button variante="ghost" disabled={apagando} onClick={() => setConfirmando(true)}>
        Refazer questionário
      </Button>
      <Sheet
        aberto={confirmando}
        aoFechar={() => setConfirmando(false)}
        titulo="Refazer o questionário?"
      >
        <p className="mt-1 mb-4">
          Suas 40 respostas e o resultado atual serão apagados, e você começa do zero. Isso não dá
          pra desfazer.
        </p>
        <div className="flex justify-end gap-2">
          <Button variante="ghost" onClick={() => setConfirmando(false)}>
            Cancelar
          </Button>
          <Button onClick={refazer}>Apagar e refazer</Button>
        </div>
      </Sheet>
    </>
  );
}
