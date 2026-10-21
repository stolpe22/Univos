"use client";

import { useTransition } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { trocarGrupo } from "@/features/clube/actions";
import { definirPapel } from "./actions";
import type { GrupoAdmin, PessoaDoGrupo } from "./queries";

/** Grupos expansíveis com o nome de cada pessoa junto da ação correspondente. */
export function GruposLista({ grupos, grupoAtual }: { grupos: GrupoAdmin[]; grupoAtual: string }) {
  return (
    <section
      aria-labelledby="grupos-titulo"
      className="animate-rise rounded-2xl border border-line bg-card p-4 md:p-[18px]"
    >
      <h2 id="grupos-titulo" className="mt-0 mb-1 text-xl font-bold">
        Grupos
      </h2>
      <p className="mt-0 mb-3 text-muted">
        Moderadores geram e desativam convites. Só você escolhe quem modera.
      </p>
      {grupos.length === 0 ? (
        <p className="px-2 py-4 text-center text-muted">
          Nenhum grupo ainda. Crie o primeiro acima.
        </p>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {grupos.map((grupo) => (
            <li key={grupo.id}>
              <details className="group overflow-hidden rounded-2xl border border-line bg-bg open:border-accent/40">
                <summary className="grid min-h-20 cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 p-3.5 transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 break-words text-base font-bold leading-snug text-ink sm:text-lg">
                    {grupo.nome}
                  </span>
                  {grupo.id === grupoAtual && (
                    <span className="whitespace-nowrap rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">
                      Aberto agora
                    </span>
                  )}
                  {grupo.id !== grupoAtual && <span aria-hidden="true" />}
                  <span className="whitespace-nowrap text-sm text-muted">
                    {grupo.pessoas.length} {grupo.pessoas.length === 1 ? "pessoa" : "pessoas"}
                  </span>
                  <span className="flex min-h-11 items-center justify-self-end gap-1 text-right text-sm font-semibold text-accent">
                    <span className="group-open:hidden">Ver membros e ações</span>
                    <span className="hidden group-open:inline">Ocultar detalhes</span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 transition-transform group-open:rotate-180"
                    >
                      ⌄
                    </span>
                  </span>
                </summary>

                <div className="grid gap-3 border-t border-line p-3">
                  {grupo.id !== grupoAtual && (
                    <form action={trocarGrupo.bind(null, grupo.id)}>
                      <Button type="submit" variante="ghost" tamanho="small">
                        Abrir este grupo
                      </Button>
                    </form>
                  )}

                  {grupo.pessoas.length === 0 ? (
                    <p className="m-0 py-2 text-sm text-muted">
                      Ninguém no grupo ainda. Abra o grupo e gere um convite em Membros.
                    </p>
                  ) : (
                    <ul className="m-0 grid list-none gap-2 p-0">
                      {grupo.pessoas.map((pessoa) => (
                        <Pessoa
                          key={pessoa.id}
                          pessoa={pessoa}
                          grupo={grupo.id}
                          nomeGrupo={grupo.nome}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Pessoa({
  pessoa,
  grupo,
  nomeGrupo,
}: {
  pessoa: PessoaDoGrupo;
  grupo: string;
  nomeGrupo: string;
}) {
  const { toast } = useToast();
  const [salvando, startTransition] = useTransition();
  const moderador = pessoa.papel === "moderador";

  function mudar(para: "membro" | "moderador") {
    startTransition(async () => {
      const resultado = await definirPapel(grupo, pessoa.id, para);
      if (!resultado.ok) {
        toast("Não deu pra mudar agora. Tente de novo.");
        return;
      }
      const papelAnterior = para === "moderador" ? "membro" : "moderador";
      toast(
        para === "moderador"
          ? `${pessoa.nome} agora modera o grupo ${nomeGrupo}.`
          : `${pessoa.nome} não modera mais o grupo ${nomeGrupo}.`,
        {
          desfazer: async () => {
            const volta = await definirPapel(grupo, pessoa.id, papelAnterior);
            if (!volta.ok) throw new Error("Não deu pra desfazer agora.");
          },
        },
      );
    });
  }

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-line bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar
          nome={pessoa.nome}
          cor={pessoa.cor}
          icone={pessoa.icone || null}
          className="size-11 text-base"
        />
        <div className="min-w-0">
          <p className="m-0 break-words font-semibold text-ink">{pessoa.nome}</p>
          <p className="mt-1 mb-0 text-sm text-muted">
            {moderador ? "Moderador deste grupo" : "Membro deste grupo"}
          </p>
        </div>
      </div>
      <Button
        variante="ghost"
        tamanho="small"
        className="w-full shrink-0 sm:w-auto"
        disabled={salvando}
        aria-label={
          moderador
            ? `Tirar moderação de ${pessoa.nome} no grupo ${nomeGrupo}`
            : `Tornar ${pessoa.nome} moderador do grupo ${nomeGrupo}`
        }
        onClick={() => mudar(moderador ? "membro" : "moderador")}
      >
        {moderador ? `Tirar moderação de ${pessoa.nome}` : `Tornar ${pessoa.nome} moderador`}
      </Button>
    </li>
  );
}
