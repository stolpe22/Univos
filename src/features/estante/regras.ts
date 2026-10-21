import { normalizar } from "@/lib/texto";
import type { LivroEstante } from "./queries";

import type { StatusLeitura } from "./taxonomia";

/** O que procurar na leitura de uma pessoa: o que ela já leu, o que está lendo ou os dois. */
export const SITUACOES = [
  { valor: "leu", rotulo: "Leu" },
  { valor: "lendo", rotulo: "Está lendo" },
  { valor: "ambos", rotulo: "Os dois" },
] as const;
export type Situacao = (typeof SITUACOES)[number]["valor"];

/**
 * Filtros da Estante. "grupo" sem pessoa: o que o grupo terminou (moderador marcou).
 * Com pessoa: a leitura dela (situacao), só nos livros do grupo ou em tudo (tudo).
 */
export type FiltroEstante =
  | { tipo: "todos" }
  | { tipo: "eu"; id: string }
  | { tipo: "grupo"; pessoa?: string; tudo?: boolean; situacao?: Situacao };

const STATUS_DA_SITUACAO: Record<Situacao, StatusLeitura[]> = {
  leu: ["lido"],
  lendo: ["lendo"],
  ambos: ["lido", "lendo"],
};

/** Livros que o grupo ainda não leu, mais votado primeiro; no empate, o mais antigo (sort estável). */
export function naoLidosPorVoto(livros: LivroEstante[]) {
  return livros.filter((l) => l.status === "fila").sort((a, b) => b.votos.length - a.votos.length);
}

/** A estante inteira: livro da vez, depois os que o grupo ainda não leu por votos, depois os lidos. */
export function ordenarEstante(livros: LivroEstante[]) {
  return [
    ...livros.filter((l) => l.status === "atual"),
    ...naoLidosPorVoto(livros),
    ...livros.filter((l) => l.status === "lido").reverse(),
  ];
}

/** A pessoa marcou "Já li" no próprio exemplar. */
export function leuOLivro(livro: LivroEstante, pessoa: string) {
  return livro.leituras.some((l) => l.userId === pessoa && l.status === "lido");
}

/** Quem já leu e quem está lendo o livro (pelo que cada pessoa marcou no exemplar). */
export function leiturasDoLivro(livro: LivroEstante) {
  return {
    leram: livro.leituras.filter((l) => l.status === "lido"),
    lendo: livro.leituras.filter((l) => l.status === "lendo"),
  };
}

export function filtrarEstante(livros: LivroEstante[], filtro: FiltroEstante) {
  if (filtro.tipo === "eu") return livros.filter((l) => leuOLivro(l, filtro.id));
  if (filtro.tipo === "todos") return livros;
  const { pessoa, tudo, situacao = "leu" } = filtro;
  if (!pessoa) return livros.filter((l) => l.status === "lido");
  const status = STATUS_DA_SITUACAO[situacao];
  // "com o grupo" = livros que o grupo leu ou está lendo junto (terminados e o livro da vez)
  return livros.filter(
    (l) =>
      (tudo || l.status !== "fila") &&
      l.leituras.some((x) => x.userId === pessoa && status.includes(x.status)),
  );
}

/**
 * Lê o filtro da URL (?ver=eu | ?ver=grupo&pessoa=<id>&so=tudo&situacao=lendo).
 * "lidos" é o endereço antigo.
 */
export function filtroDaUrl(params: URLSearchParams, eu: string): FiltroEstante {
  const ver = params.get("ver");
  if (ver === "eu") return { tipo: "eu", id: eu };
  if (ver !== "grupo" && ver !== "lidos") return { tipo: "todos" };
  const pessoa = params.get("pessoa") || undefined;
  if (!pessoa) return { tipo: "grupo" };
  const situacao = SITUACOES.find((s) => s.valor === params.get("situacao"))?.valor ?? "leu";
  return { tipo: "grupo", pessoa, tudo: params.get("so") === "tudo", situacao };
}

export function urlDoFiltro(filtro: FiltroEstante) {
  if (filtro.tipo === "todos") return "/estante";
  if (filtro.tipo === "eu") return "/estante?ver=eu";
  const params = new URLSearchParams({ ver: "grupo" });
  if (filtro.pessoa) params.set("pessoa", filtro.pessoa);
  if (filtro.pessoa && filtro.tudo) params.set("so", "tudo");
  if (filtro.pessoa && filtro.situacao && filtro.situacao !== "leu") {
    params.set("situacao", filtro.situacao);
  }
  return `/estante?${params}`;
}

/** Quantas pessoas cadastraram o próprio exemplar (têm o livro). */
export function comExemplar(livro: LivroEstante) {
  return livro.leituras.filter((l) => l.temEdicao).length;
}

/** Pessoas que já leram ou estão lendo algum livro da estante, em ordem alfabética. */
export function leitores(livros: LivroEstante[]) {
  const nomes = new Map<string, string>();
  for (const livro of livros) {
    for (const l of livro.leituras) if (l.status !== "nao_lido") nomes.set(l.userId, l.nome);
  }
  return [...nomes]
    .map(([id, nome]) => ({ id, nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/** Campos do livro em que o filtro de texto procura (o mesmo na Estante e em Meus livros). */
export function textoDoLivro(livro: LivroEstante) {
  return normalizar(
    [livro.titulo, livro.autor, livro.temaNome, livro.tipo, livro.nivelNome, livro.editora]
      .filter(Boolean)
      .join(" "),
  );
}

/** Todas as palavras digitadas aparecem no livro, sem ligar para acento ou maiúscula. */
export function combinaTexto(livro: LivroEstante, busca: string) {
  const palavras = normalizar(busca).split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return true;
  const texto = textoDoLivro(livro);
  return palavras.every((p) => texto.includes(p));
}

/** Filtro rápido da lista: texto, classificação do catálogo e comentários (vazio = qualquer um). */
export type FiltroCatalogo = {
  texto: string;
  tema: string;
  tipo: string;
  nivel: string;
  /** "com": só livros com comentário; "sem": só os sem nenhum. */
  comentarios: string;
};
export const FILTRO_VAZIO: FiltroCatalogo = {
  texto: "",
  tema: "",
  tipo: "",
  nivel: "",
  comentarios: "",
};

/** Opções do seletor de comentários (a mesma lista na Estante e em Meus livros). */
export const OPCOES_COMENTARIOS = [
  { valor: "com", rotulo: "Com comentários" },
  { valor: "sem", rotulo: "Sem comentários" },
] as const;

export function filtrarCatalogo(livros: LivroEstante[], f: FiltroCatalogo) {
  return livros.filter(
    (l) =>
      combinaTexto(l, f.texto) &&
      (!f.tema || l.tema === f.tema) &&
      (!f.tipo || l.tipo === f.tipo) &&
      (!f.nivel || String(l.nivel) === f.nivel) &&
      (!f.comentarios || (f.comentarios === "com") === l.comentarios > 0),
  );
}

/** Só as opções que algum livro usa, para os seletores não mostrarem escolha vazia. */
export function opcoesCatalogo(livros: LivroEstante[]) {
  const unicos = (pares: [string, string][]) =>
    [...new Map(pares)]
      .map(([valor, rotulo]) => ({ valor, rotulo }))
      .sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt-BR"));
  return {
    temas: unicos(livros.flatMap((l) => (l.tema ? [[l.tema, l.temaNome ?? l.tema]] : []))),
    tipos: unicos(livros.flatMap((l) => (l.tipo ? [[l.tipo, l.tipo]] : []))),
    // nível segue a ordem do número (1, 2, 3…), não a alfabética
    niveis: unicos(
      livros.flatMap((l) =>
        l.nivel !== null ? [[String(l.nivel), l.nivelNome ?? `Nível ${l.nivel}`]] : [],
      ),
    ).sort((a, b) => Number(a.valor) - Number(b.valor)),
  };
}
