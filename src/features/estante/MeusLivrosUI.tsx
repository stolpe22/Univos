"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { SituacaoLeitura } from "./SituacaoLeitura";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { porcentagem } from "@/features/livro/regras";
import { normalizar } from "@/lib/texto";
import { FiltroLivros } from "./FiltroLivros";
import { EdicoesDoGrupo } from "./EdicoesDoGrupo";
import { MetadadosCatalogo } from "./MetadadosCatalogo";
import type { LivroEstante, TaxonomiaCatalogo } from "./queries";
import {
  combinaTexto,
  filtrarCatalogo,
  FILTRO_VAZIO,
  opcoesCatalogo,
  OPCOES_COMENTARIOS,
} from "./regras";
import { SugerirLivroForm } from "./SugerirLivroForm";
import { STATUS_LEITURA } from "./taxonomia";

type Props = {
  livros: LivroEstante[];
  taxonomia: TaxonomiaCatalogo;
  eu: string;
  admin: boolean;
};

/** "Meus livros": achar um título da estante, registrar o exemplar e ver a própria biblioteca. */
export function MeusLivrosUI({ livros, taxonomia, eu, admin }: Props) {
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null);
  const selecionado = livros.find((l) => l.id === selecionadoId);
  const meus = livros.filter((l) => l.leituras.some((x) => x.userId === eu));

  return (
    <div className="grid gap-3.5">
      <Card
        titulo="Adicionar à minha biblioteca"
        id="adicionar-meu-livro"
        className="relative z-10"
      >
        <p className="mt-0 text-sm text-muted">
          Vincule seu exemplar a um livro que já esteja na estante do grupo.
        </p>
        <BuscarLivro livros={livros} aoEscolher={(l) => setSelecionadoId(l.id)} />
        {selecionado && (
          <section
            className="mt-4 rounded-xl border border-line bg-bg p-3"
            aria-labelledby="livro-selecionado-titulo"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 id="livro-selecionado-titulo" className="m-0 text-lg font-bold">
                  {selecionado.titulo}
                </h3>
                <p className="mt-1 mb-2 text-sm text-muted">
                  {selecionado.autor} · cerca de {selecionado.paginas} páginas na edição de
                  referência
                </p>
                <MetadadosCatalogo livro={selecionado} completo />
              </div>
              <Button variante="ghost" tamanho="small" onClick={() => setSelecionadoId(null)}>
                Fechar
              </Button>
            </div>
            <EdicoesDoGrupo livro={selecionado} eu={eu} abertoInicial />
          </section>
        )}
      </Card>

      <Card titulo="Não encontrou o livro?" id="cadastrar-livro-publico">
        <p className="mt-0 text-sm text-muted">
          Cadastre o título na estante do grupo. Depois ele aparece aqui pra você registrar seu
          exemplar.
        </p>
        <details className="rounded-xl border border-line p-3">
          <summary className="min-h-11 cursor-pointer content-center font-semibold text-accent">
            Cadastrar livro na estante
          </summary>
          <div className="mt-3">
            <SugerirLivroForm taxonomia={taxonomia} admin={admin} aoAdicionar={setSelecionadoId} />
          </div>
        </details>
      </Card>

      <Card titulo={`Minha biblioteca (${meus.length})`} id="minha-biblioteca">
        <MinhaBiblioteca
          livros={meus}
          eu={eu}
          aoAbrir={(l) => {
            setSelecionadoId(l.id);
            // o formulário fica no primeiro card: leva a tela até ele
            document
              .getElementById("adicionar-meu-livro")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      </Card>
    </div>
  );
}

/** Campo com sugestões (combobox): ↑ ↓ escolhem, Enter seleciona, Esc fecha. Ignora acento. */
function BuscarLivro({
  livros,
  aoEscolher,
}: {
  livros: LivroEstante[];
  aoEscolher: (livro: LivroEstante) => void;
}) {
  const idLista = useId();
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const resultados = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return [];
    return livros.filter((l) => combinaTexto(l, termo)).slice(0, 7);
  }, [busca, livros]);
  const mostrando = aberto && resultados.length > 0;

  function escolher(livro: LivroEstante) {
    setBusca(`${livro.titulo} — ${livro.autor}`);
    setAberto(false);
    aoEscolher(livro);
  }

  function aoTeclar(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && resultados.length) {
      e.preventDefault();
      setAberto(true);
      setAtivo((i) => Math.min(i + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp" && resultados.length) {
      e.preventDefault();
      setAtivo((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && mostrando && resultados[ativo]) {
      e.preventDefault();
      escolher(resultados[ativo]);
    } else if (e.key === "Escape") {
      setAberto(false);
    }
  }

  return (
    <div className="relative">
      <Field
        label="Buscar livro da estante"
        type="search"
        autoComplete="off"
        placeholder="Digite título ou autor"
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value);
          setAberto(true);
          setAtivo(0);
        }}
        onFocus={() => setAberto(true)}
        onKeyDown={aoTeclar}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={mostrando}
        aria-controls={idLista}
        aria-activedescendant={mostrando ? `${idLista}-${ativo}` : undefined}
      />
      {mostrando && (
        <ul
          id={idLista}
          role="listbox"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-line bg-card p-1 shadow-xl"
        >
          {resultados.map((livro, i) => (
            <li
              id={`${idLista}-${i}`}
              key={livro.id}
              role="option"
              aria-selected={i === ativo}
              onClick={() => escolher(livro)}
              onMouseMove={() => setAtivo(i)}
              className="min-h-12 cursor-pointer rounded-lg px-3 py-2 aria-selected:bg-accent-soft"
            >
              <span className="block font-semibold">{livro.titulo}</span>
              <span className="block text-sm text-muted">
                {livro.autor} · {livro.paginas} páginas na referência
              </span>
            </li>
          ))}
        </ul>
      )}
      {aberto && busca.trim() && resultados.length === 0 && (
        <p className="mt-2 mb-0 text-sm text-muted">
          Nenhum título encontrado na estante. Cadastre o livro no último card desta página.
        </p>
      )}
    </div>
  );
}

function MinhaBiblioteca({
  livros,
  eu,
  aoAbrir,
}: {
  livros: LivroEstante[];
  eu: string;
  aoAbrir: (livro: LivroEstante) => void;
}) {
  // os mesmos filtros da Estante, mais a sua situação de leitura
  const [filtro, setFiltro] = useState({ ...FILTRO_VAZIO, situacao: "" });
  if (livros.length === 0) {
    return (
      <p className="m-0 py-3 text-muted">
        Seus livros aparecem aqui quando você registra um exemplar usando a busca acima.
      </p>
    );
  }
  const minhaSituacao = (l: LivroEstante) => l.leituras.find((x) => x.userId === eu)?.status;
  const opcoes = opcoesCatalogo(livros);
  const visiveis = filtrarCatalogo(livros, filtro).filter(
    (l) => !filtro.situacao || minhaSituacao(l) === filtro.situacao,
  );
  return (
    <>
      <FiltroLivros
        valores={filtro}
        aoMudar={(chave, valor) => setFiltro((atual) => ({ ...atual, [chave]: valor }))}
        mostrando={visiveis.length}
        total={livros.length}
        seletores={[
          {
            chave: "situacao",
            rotulo: "Situação",
            todos: "Todas",
            opcoes: STATUS_LEITURA.filter((s) => livros.some((l) => minhaSituacao(l) === s.valor)),
          },
          { chave: "tema", rotulo: "Tema", todos: "Todos", opcoes: opcoes.temas },
          { chave: "tipo", rotulo: "Tipo", todos: "Todos", opcoes: opcoes.tipos },
          { chave: "nivel", rotulo: "Nível", todos: "Todos", opcoes: opcoes.niveis },
          {
            chave: "comentarios",
            rotulo: "Comentários",
            todos: "Todos",
            opcoes: OPCOES_COMENTARIOS,
          },
        ]}
      />
      {visiveis.length === 0 && (
        <p className="m-0 py-3 text-muted">
          Nenhum livro seu com esses filtros. Mude o texto ou toque em Limpar filtros.
        </p>
      )}
      <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
        {visiveis.map((livro) => {
          const leitura = livro.leituras.find((l) => l.userId === eu);
          if (!leitura) return null;
          return (
            <li key={livro.id} className="rounded-xl border border-line bg-bg p-3">
              <Link
                href={`/estante/${livro.id}`}
                className="inline-flex min-h-11 items-center font-bold text-accent underline"
              >
                {livro.titulo}
              </Link>
              <p className="mt-0 mb-2 text-sm text-muted">{livro.autor}</p>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <SituacaoLeitura status={leitura.status} />
                <span>
                  {leitura.pagina}/{leitura.paginas} páginas ·{" "}
                  {porcentagem(leitura.pagina, leitura.paginas)}%
                </span>
              </div>
              <ProgressBar
                valor={leitura.pagina}
                max={leitura.paginas}
                rotulo={`Seu progresso em ${livro.titulo}`}
              />
              <button
                type="button"
                onClick={() => aoAbrir(livro)}
                className="mt-1 min-h-11 cursor-pointer text-sm font-semibold text-accent underline"
              >
                Atualizar meu progresso
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
