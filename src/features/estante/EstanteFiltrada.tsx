"use client";

import { useSearchParams } from "next/navigation";
import { Alternador } from "@/components/ui/Alternador";
import { Card } from "@/components/ui/Card";
import { classesInput } from "@/components/ui/Field";
import { ListaEstante } from "./ListaEstante";
import type { LivroEstante, TaxonomiaCatalogo } from "./queries";
import {
  filtrarEstante,
  filtroDaUrl,
  leitores,
  naoLidosPorVoto,
  SITUACOES,
  urlDoFiltro,
  type FiltroEstante,
} from "./regras";
import { SugerirLivroBotao } from "./SugerirLivroBotao";

/**
 * A Estante com os filtros. Todos os livros já vêm do servidor e o filtro roda aqui,
 * então trocar de visão é instantâneo; a URL guarda a escolha (Voltar funciona).
 */
export function EstanteFiltrada({
  livros,
  eu,
  modera,
  taxonomia,
  admin,
}: {
  livros: LivroEstante[];
  eu: string;
  modera: boolean;
  taxonomia: TaxonomiaCatalogo;
  admin: boolean;
}) {
  const filtro = filtroDaUrl(useSearchParams(), eu);
  const quemLeu = leitores(livros);
  const nome = (id: string) =>
    id === eu ? "você" : (quemLeu.find((p) => p.id === id)?.nome ?? "essa pessoa");
  const contar = (f: FiltroEstante) => filtrarEstante(livros, f).length;
  const ir = (f: FiltroEstante) => window.history.pushState(null, "", urlDoFiltro(f));

  const visiveis = filtrarEstante(livros, filtro);
  const pessoa = filtro.tipo === "grupo" ? filtro.pessoa : undefined;
  const tudo = filtro.tipo === "grupo" && !!filtro.tudo;
  const situacao = (filtro.tipo === "grupo" && filtro.situacao) || "leu";
  const verbo = { leu: "leu", lendo: "está lendo", ambos: "leu ou está lendo" }[situacao];

  const titulo =
    filtro.tipo === "eu"
      ? "Lidos por você"
      : filtro.tipo === "todos"
        ? "Todos os livros"
        : !pessoa
          ? "Terminados pelo grupo"
          : tudo
            ? `Tudo que ${nome(pessoa)} ${verbo}`
            : `O que ${nome(pessoa)} ${verbo} com o grupo`;

  const vazio =
    filtro.tipo === "todos"
      ? "A estante está vazia. Toque em + Sugerir livro, no topo, para colocar o primeiro."
      : filtro.tipo === "eu"
        ? "Você ainda não marcou nenhum livro como lido. Abra Exemplares e progresso do grupo num livro e escolha “Já li”."
        : !pessoa
          ? "O grupo ainda não terminou nenhum livro. Quando quem modera tocar em Terminamos este livro, ele aparece aqui."
          : tudo
            ? "Nenhum livro nessa situação. Tente Os dois."
            : "Nenhum livro do grupo nessa situação. Veja em Tudo, que inclui o que a pessoa leu por conta própria.";

  return (
    <>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <Alternador
          rotulo="Filtrar a estante"
          opcoes={[
            {
              href: urlDoFiltro({ tipo: "todos" }),
              rotulo: "Todos",
              contagem: livros.length,
              ativa: filtro.tipo === "todos",
            },
            {
              href: urlDoFiltro({ tipo: "grupo" }),
              rotulo: "O grupo leu",
              contagem: contar({ tipo: "grupo" }),
              ativa: filtro.tipo === "grupo",
            },
            {
              href: urlDoFiltro({ tipo: "eu", id: eu }),
              rotulo: "Eu li",
              contagem: contar({ tipo: "eu", id: eu }),
              ativa: filtro.tipo === "eu",
            },
          ]}
        />
        <SugerirLivroBotao taxonomia={taxonomia} admin={admin} className="w-full sm:w-auto" />
      </div>

      {filtro.tipo === "grupo" && quemLeu.length > 0 && (
        <div className="mb-3.5 grid gap-2 sm:flex sm:flex-wrap sm:items-end">
          <label className="grid gap-1 text-sm font-semibold sm:w-64">
            Pessoa
            <select
              className={classesInput}
              value={pessoa ?? ""}
              onChange={(e) =>
                ir({ tipo: "grupo", pessoa: e.target.value || undefined, tudo, situacao })
              }
            >
              <option value="">O grupo todo</option>
              {quemLeu.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id === eu ? `${p.nome} (você)` : p.nome}
                </option>
              ))}
            </select>
          </label>
          {pessoa && (
            <>
              <Alternador
                variante="etiquetas"
                rotulo="Situação da leitura"
                opcoes={SITUACOES.map((x) => {
                  const f = { tipo: "grupo", pessoa, tudo, situacao: x.valor } as const;
                  return {
                    href: urlDoFiltro(f),
                    rotulo: x.rotulo,
                    contagem: contar(f),
                    ativa: x.valor === situacao,
                  };
                })}
              />
              <Alternador
                variante="etiquetas"
                rotulo="Quais livros"
                opcoes={[false, true].map((t) => {
                  const f = { tipo: "grupo", pessoa, tudo: t, situacao } as const;
                  return {
                    href: urlDoFiltro(f),
                    rotulo: t ? "Tudo" : "Com o grupo",
                    contagem: contar(f),
                    ativa: t === tudo,
                  };
                })}
              />
            </>
          )}
        </div>
      )}

      <Card titulo={titulo} id="estante">
        <ListaEstante
          livros={visiveis}
          eu={eu}
          modera={modera}
          maisVotado={naoLidosPorVoto(livros)[0]?.id ?? null}
          temLivroDaVez={livros.some((l) => l.status === "atual")}
          vazio={vazio}
        />
      </Card>
    </>
  );
}
