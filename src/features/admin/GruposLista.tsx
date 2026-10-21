"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { trocarGrupo } from "@/features/clube/actions";
import { definirPapel } from "./actions";
import type { GrupoAdmin, PessoaDoGrupo } from "./queries";

/** Todos os grupos, com as pessoas e o botão de tornar (ou tirar) moderador. */
export function GruposLista({ grupos, grupoAtual }: { grupos: GrupoAdmin[]; grupoAtual: string }) {
  return (
    <section
      aria-labelledby="grupos-titulo"
      className="animate-rise rounded-2xl border border-line bg-card p-4 md:p-[18px]"
    >
      <h2 id="grupos-titulo" className="mt-0 mb-1 text-xl font-bold">
        Grupos
      </h2>
      <p className="mt-0 mb-2 text-muted">
        Moderador gera e desativa convites do grupo. Só você escolhe quem modera.
      </p>
      {grupos.length === 0 ? (
        <p className="px-2 py-4 text-center text-muted">
          Nenhum grupo ainda. Crie o primeiro acima.
        </p>
      ) : (
        <ul className="m-0 list-none divide-y divide-line p-0">
          {grupos.map((g) => (
            <li key={g.id} className="py-2">
              <details>
                <summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-x-2 font-semibold">
                  {g.nome}
                  {g.id === grupoAtual && (
                    <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent">
                      aberto agora
                    </span>
                  )}
                  <span className="text-sm font-normal text-muted">
                    {g.pessoas.length} {g.pessoas.length === 1 ? "pessoa" : "pessoas"}
                  </span>
                </summary>

                {g.id !== grupoAtual && (
                  <form action={trocarGrupo.bind(null, g.id)} className="mb-2">
                    <Button type="submit" variante="ghost" tamanho="small">
                      Abrir este grupo
                    </Button>
                  </form>
                )}

                {g.pessoas.length === 0 ? (
                  <p className="m-0 py-2 text-sm text-muted">
                    Ninguém no grupo ainda. Abra o grupo e gere um convite em Membros.
                  </p>
                ) : (
                  <ul className="m-0 list-none p-0">
                    {g.pessoas.map((p) => (
                      <Pessoa key={p.id} pessoa={p} grupo={g.id} />
                    ))}
                  </ul>
                )}
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Pessoa({ pessoa: p, grupo }: { pessoa: PessoaDoGrupo; grupo: string }) {
  const { toast } = useToast();
  const [salvando, startTransition] = useTransition();
  const moderador = p.papel === "moderador";

  function mudar(para: "membro" | "moderador") {
    startTransition(async () => {
      const r = await definirPapel(grupo, p.id, para);
      if (!r.ok) {
        toast("Não deu pra mudar agora. Tente de novo.");
        return;
      }
      const de = para === "moderador" ? "membro" : "moderador";
      toast(
        para === "moderador" ? `${p.nome} agora modera o grupo.` : `${p.nome} não modera mais.`,
        {
          desfazer: async () => {
            const volta = await definirPapel(grupo, p.id, de);
            if (!volta.ok) throw new Error("falhou");
          },
        },
      );
    });
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-1.5">
      <span>
        {p.nome}{" "}
        {moderador && (
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent">
            moderador
          </span>
        )}
      </span>
      <Button
        variante="ghost"
        tamanho="small"
        disabled={salvando}
        onClick={() => mudar(moderador ? "membro" : "moderador")}
      >
        {moderador ? "Tirar moderação" : "Tornar moderador"}
      </Button>
    </li>
  );
}
