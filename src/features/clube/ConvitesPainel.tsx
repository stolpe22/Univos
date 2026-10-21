"use client";

import { useActionState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useRetornoForm } from "@/components/ui/useRetornoForm";
import { criarConvite, desativarConvite, type EstadoForm } from "./actions";
import { formatarData } from "@/lib/datas";
import type { Convite } from "./queries";

type Props = {
  origem: string;
  convites: Convite[];
};

export function ConvitesPainel({ origem, convites }: Props) {
  const [estado, acao, gerando] = useActionState<EstadoForm<"rotulo">, FormData>(
    criarConvite,
    null,
  );
  const form = useRef<HTMLFormElement>(null);
  useRetornoForm(estado, form);
  const erroRotulo = estado && !estado.ok ? estado.erros.rotulo : undefined;

  const totalEntradas = convites.reduce((n, c) => n + c.entradas.length, 0);

  return (
    <section
      aria-labelledby="convites-titulo"
      className="animate-rise rounded-2xl border border-line bg-card p-4 md:p-[18px]"
    >
      <h2 id="convites-titulo" className="mt-0 mb-1 text-xl font-bold">
        Convites
      </h2>
      <p className="mt-0 mb-3 text-muted">
        Gere um link pra cada lugar onde for mandar. Assim dá pra ver por onde cada pessoa entrou.
      </p>

      <form ref={form} action={acao} noValidate className="grid gap-2.5">
        <Field
          label="Nome do link"
          name="rotulo"
          autoComplete="off"
          enterKeyHint="done"
          maxLength={60}
          placeholder="Ex: grupo do zap"
          defaultValue={estado && !estado.ok ? estado.valores.rotulo : ""}
          hint="Só quem modera o grupo vê esse nome."
          erro={erroRotulo}
        />
        <Button type="submit" disabled={gerando} className="md:justify-self-start">
          {gerando ? "Gerando…" : "Gerar link"}
        </Button>
      </form>

      <h3 className="mt-5 mb-1 text-lg font-bold">
        Links do grupo
        {convites.length > 0 && (
          <span className="ml-2 font-sans text-sm font-normal text-muted">
            {totalEntradas} {totalEntradas === 1 ? "pessoa entrou" : "pessoas entraram"} por{" "}
            {convites.length} {convites.length === 1 ? "link" : "links"}
          </span>
        )}
      </h3>

      {convites.length === 0 ? (
        <p className="px-2 py-4 text-center text-muted">
          Nenhum link gerado ainda. Dê um nome acima e toque em Gerar link.
        </p>
      ) : (
        <ul className="m-0 list-none divide-y divide-line p-0">
          {convites.map((c) => (
            <ItemConvite key={c.id} convite={c} link={`${origem}/convite/${c.codigo}`} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ItemConvite({ convite: c, link }: { convite: Convite; link: string }) {
  const { toast } = useToast();
  const [mudando, startTransition] = useTransition();

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      toast("Link copiado. Agora é só colar e mandar.");
    } catch {
      toast("Não deu pra copiar. Segure o dedo no link e copie por ali.");
    }
  }

  function mudarStatus(desativar: boolean) {
    startTransition(async () => {
      const r = await desativarConvite(c.id, desativar);
      if (!r.ok) {
        toast("Não deu pra mudar o link agora. Tente de novo.");
        return;
      }
      if (desativar) {
        toast(`Link “${c.rotulo}” desativado. Quem já entrou continua no clube.`, {
          desfazer: async () => {
            const volta = await desativarConvite(c.id, false);
            if (!volta.ok) throw new Error("falhou");
          },
        });
      } else {
        toast(`Link “${c.rotulo}” ativo de novo.`);
      }
    });
  }

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="m-0 font-semibold">
            {c.rotulo}{" "}
            <span
              className={`ml-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                c.ativo ? "bg-accent-soft text-accent" : "bg-line text-muted"
              }`}
            >
              {c.ativo ? "ativo" : "desativado"}
            </span>
          </p>
          <p className="m-0 text-sm text-muted">
            por {c.criadoPor} ·{formatarData(c.criadoEm)}
          </p>
        </div>
        <div className="flex gap-2">
          {c.ativo && (
            <Button variante="ghost" tamanho="small" onClick={copiar}>
              Copiar
            </Button>
          )}
          <Button
            variante="ghost"
            tamanho="small"
            disabled={mudando}
            onClick={() => mudarStatus(c.ativo)}
          >
            {c.ativo ? "Desativar" : "Reativar"}
          </Button>
        </div>
      </div>

      {c.ativo && (
        <p className="mt-2 mb-0 rounded-lg bg-bg px-2.5 py-1.5 font-mono text-[13px] break-all select-all">
          {link}
        </p>
      )}

      <details className="mt-1">
        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold">
          {c.entradas.length === 0
            ? "Ninguém entrou por este link ainda"
            : `${c.entradas.length} ${c.entradas.length === 1 ? "pessoa entrou" : "pessoas entraram"} por este link`}
        </summary>
        {c.entradas.length > 0 && (
          <ul className="m-0 mb-1 list-none p-0 text-sm">
            {c.entradas.map((e) => (
              <li key={`${e.nome}-${e.em}`} className="flex justify-between gap-2 py-1">
                <span>{e.nome}</span>
                <span className="text-muted">{formatarData(e.em)}</span>
              </li>
            ))}
          </ul>
        )}
      </details>
    </li>
  );
}
