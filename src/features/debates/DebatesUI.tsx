"use client";

import { useActionState, useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button, classesBotao } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Card";
import { Field, classesInput } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { agoraLocal, formatarDataComDia } from "@/lib/datas";
import type { EstadoForm } from "@/lib/resultado";
import { desmarcarDebate, marcarDebate, mudarFase, presenca } from "./actions";
import { EnqueteBloco } from "./EnqueteBloco";
import type { Debate } from "./queries";
import { COMO_FUNCIONA, FORMATOS } from "./schemas";

export function ItemDebate({
  debate: d,
  eu,
  modera,
}: {
  debate: Debate;
  eu: string;
  modera: boolean;
}) {
  const podeMudar = modera || d.criadoPor === eu;
  return (
    <li id={`debate-${d.id}`} className="scroll-mt-28 py-3.5">
      <div className="flex items-start justify-between gap-2">
        <b>{d.tema}</b>
        {d.status === "ao_vivo" && <Pill className="animate-pulse">🔴 ao vivo</Pill>}
      </div>
      <div className="text-[13.5px] text-muted">
        {formatarDataComDia(d.data)} · {d.formato}
      </div>
      {COMO_FUNCIONA[d.formato] && (
        <div className="text-[13px] text-muted">{COMO_FUNCIONA[d.formato]}</div>
      )}
      {d.status !== "encerrado" && <Presenca debate={d} eu={eu} />}
      {d.status === "encerrado" && d.presencas.length > 0 && (
        <p className="mt-1 mb-0 text-[13px] text-muted">
          Participaram: {d.presencas.map((p) => p.nome).join(", ")}
        </p>
      )}
      {podeMudar && d.status !== "encerrado" && <MudarFase debate={d} />}
      <EnqueteBloco debate={d} eu={eu} modera={modera} />
    </li>
  );
}

function Presenca({ debate: d, eu }: { debate: Debate; eu: string }) {
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [vou, setVou] = useOptimistic(d.presencas.some((p) => p.id === eu));
  const total =
    d.presencas.length + (vou === d.presencas.some((p) => p.id === eu) ? 0 : vou ? 1 : -1);

  function alternar(novo: boolean) {
    startTransition(async () => {
      setVou(novo);
      const r = await presenca(d.id, novo);
      if (!r.ok) return toast(r.erro);
      toast(novo ? "Presença confirmada." : "Presença cancelada.", {
        desfazer: async () => {
          const volta = await presenca(d.id, !novo);
          if (!volta.ok) throw new Error(volta.erro);
        },
      });
    });
  }

  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        {d.presencas.slice(0, 6).map((p) => (
          <Avatar key={p.id} nome={p.nome} cor={p.cor} className="size-7 text-xs" />
        ))}
        <span className="ml-1 text-[13px] text-muted">
          {total === 0
            ? "Ninguém confirmou ainda"
            : `${total} ${total === 1 ? "confirmado" : "confirmados"}`}
        </span>
      </div>
      <button
        type="button"
        aria-pressed={vou}
        onClick={() => alternar(!vou)}
        className={classesBotao(vou ? "primary" : "ghost", "small")}
      >
        {vou ? "✓ Vou participar" : "Vou participar"}
      </button>
    </div>
  );
}

/** Começar (ao vivo) ou encerrar. Só anda pra frente, então pede confirmação. */
function MudarFase({ debate: d }: { debate: Debate }) {
  const { toast } = useToast();
  const [confirmando, setConfirmando] = useState(false);
  const [mudando, startTransition] = useTransition();
  const proxima = d.status === "agendado" ? "ao_vivo" : "encerrado";
  const temEnquete = d.enquete?.status === "aprovada";

  function mudar() {
    setConfirmando(false);
    startTransition(async () => {
      const r = await mudarFase(d.id, proxima);
      toast(
        r.ok
          ? proxima === "ao_vivo"
            ? "Debate ao vivo! Lembrem do FINALIZADO!"
            : temEnquete
              ? "Debate encerrado. A votação de depois abriu."
              : "Debate encerrado."
          : r.erro,
      );
    });
  }

  return (
    <>
      <Button
        variante="ghost"
        tamanho="small"
        className="mt-2"
        disabled={mudando}
        onClick={() => setConfirmando(true)}
      >
        {proxima === "ao_vivo" ? "▶ Começar agora" : "■ Encerrar debate"}
      </Button>
      <Sheet
        aberto={confirmando}
        aoFechar={() => setConfirmando(false)}
        titulo={proxima === "ao_vivo" ? "Começar o debate?" : "Encerrar o debate?"}
      >
        <p className="mt-1 mb-4">
          {proxima === "ao_vivo"
            ? `“${d.tema}” fica ao vivo pra todo mundo.${temEnquete ? " A votação de antes da enquete fecha." : ""}`
            : `“${d.tema}” vai para Já rolaram.${temEnquete ? " Abre a votação de depois da enquete." : ""}`}{" "}
          Não dá pra voltar atrás.
        </p>
        <div className="flex justify-end gap-2">
          <Button variante="ghost" onClick={() => setConfirmando(false)}>
            Cancelar
          </Button>
          <Button onClick={mudar}>{proxima === "ao_vivo" ? "Começar" : "Encerrar"}</Button>
        </div>
      </Sheet>
    </>
  );
}

type Campos = "tema" | "data" | "formato";

/** Marcar debate. "Virar debate" (Pauta) chega com o tema preenchido (WCAG 3.3.7). */
export function MarcarDebateForm({ temaInicial }: { temaInicial: string }) {
  const { toast } = useToast();
  const [estado, acao, enviando] = useActionState<EstadoForm<Campos>, FormData>(marcarDebate, null);
  const form = useRef<HTMLFormElement>(null);
  const erros = estado && !estado.ok ? estado.erros : {};
  const valores = estado && !estado.ok ? estado.valores : {};
  const [minimo] = useState(agoraLocal);
  const [formato, setFormato] = useState<string>(FORMATOS[0]);

  // Veio da Pauta com o tema: o próximo passo é a data.
  useEffect(() => {
    if (temaInicial) {
      form.current?.querySelector<HTMLInputElement>("input[name=data]")?.focus();
      toast("Tema preenchido. Agora escolha a data.");
    }
  }, [temaInicial, toast]);

  useEffect(() => {
    if (!estado) return;
    if (estado.ok) {
      const id = estado.desfazer as number;
      toast(estado.mensagem, {
        desfazer: async () => {
          const r = await desmarcarDebate(id);
          if (!r.ok) throw new Error(r.erro);
        },
      });
    } else if (estado.erros.geral) toast(estado.erros.geral);
    else form.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [estado, toast]);

  return (
    <form ref={form} action={acao} noValidate className="grid gap-3">
      <Field
        label="Tema"
        name="tema"
        autoComplete="off"
        enterKeyHint="next"
        maxLength={120}
        placeholder="Ex: Pena de morte"
        defaultValue={valores.tema ?? temaInicial}
        erro={erros.tema}
      />
      <Field
        label="Data e hora"
        name="data"
        type="datetime-local"
        min={minimo}
        // o minuto pode virar entre o servidor e o navegador
        suppressHydrationWarning
        hint="Horário de Brasília."
        defaultValue={valores.data ?? ""}
        erro={erros.data}
      />
      <Field label="Formato" hint={COMO_FUNCIONA[formato]} erro={erros.formato}>
        {(controle) => (
          <select
            {...controle}
            name="formato"
            value={formato}
            onChange={(e) => setFormato(e.target.value)}
            className={classesInput}
          >
            {FORMATOS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        )}
      </Field>
      <Button type="submit" disabled={enviando}>
        {enviando ? "Marcando…" : "Marcar debate"}
      </Button>
    </form>
  );
}
