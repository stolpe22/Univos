/**
 * O que a pessoa pode escolher para o próprio avatar: a cor do círculo e o que aparece
 * dentro dele. Esta é a única lista: o schema do perfil e o componente leem daqui.
 */

export const CORES_PERFIL = [
  { valor: "blue", rotulo: "Azul", fundo: "bg-perfil-blue", preenchimento: "fill-perfil-blue" },
  { valor: "red", rotulo: "Vermelho", fundo: "bg-perfil-red", preenchimento: "fill-perfil-red" },
  {
    valor: "purple",
    rotulo: "Roxo",
    fundo: "bg-perfil-purple",
    preenchimento: "fill-perfil-purple",
  },
  { valor: "slate", rotulo: "Cinza", fundo: "bg-perfil-slate", preenchimento: "fill-perfil-slate" },
  { valor: "green", rotulo: "Verde", fundo: "bg-perfil-green", preenchimento: "fill-perfil-green" },
  {
    valor: "orange",
    rotulo: "Laranja",
    fundo: "bg-perfil-orange",
    preenchimento: "fill-perfil-orange",
  },
  { valor: "pink", rotulo: "Rosa", fundo: "bg-perfil-pink", preenchimento: "fill-perfil-pink" },
  { valor: "teal", rotulo: "Turquesa", fundo: "bg-perfil-teal", preenchimento: "fill-perfil-teal" },
  { valor: "amber", rotulo: "Âmbar", fundo: "bg-perfil-amber", preenchimento: "fill-perfil-amber" },
  {
    valor: "indigo",
    rotulo: "Índigo",
    fundo: "bg-perfil-indigo",
    preenchimento: "fill-perfil-indigo",
  },
] as const;

export type CorPerfil = (typeof CORES_PERFIL)[number]["valor"];

export function corDoPerfil(cor: CorPerfil | null | undefined) {
  return CORES_PERFIL.find((c) => c.valor === cor) ?? CORES_PERFIL[0];
}

export type FiguraPolitica = "che" | "lula" | "bolsonaro" | "flavio" | "renan";
export type TipoBandeira = "brasil" | "partido_vermelho" | "partido_azul" | "partido_verde";

type OpcaoIcone = {
  valor: string;
  rotulo: string;
  emoji?: string;
  figura?: FiguraPolitica;
  bandeira?: TipoBandeira;
};

const FIGURAS = [
  { valor: "cat", rotulo: "Gato", emoji: "🐱" },
  { valor: "dog", rotulo: "Cachorro", emoji: "🐶" },
  { valor: "fox", rotulo: "Raposa", emoji: "🦊" },
  { valor: "rabbit", rotulo: "Coelho", emoji: "🐰" },
  { valor: "panda", rotulo: "Panda", emoji: "🐼" },
  { valor: "frog", rotulo: "Sapo", emoji: "🐸" },
  { valor: "owl", rotulo: "Coruja", emoji: "🦉" },
  { valor: "turtle", rotulo: "Tartaruga", emoji: "🐢" },
  { valor: "person", rotulo: "Pessoa", emoji: "🧑" },
  { valor: "people", rotulo: "Pessoas", emoji: "🧑‍🤝‍🧑" },
] as const satisfies readonly OpcaoIcone[];

const POLITICAS = [
  { valor: "che", rotulo: "Che Guevara", figura: "che" },
  { valor: "lula", rotulo: "Lula", figura: "lula" },
  { valor: "bolsonaro", rotulo: "Jair Bolsonaro", figura: "bolsonaro" },
  { valor: "flavio", rotulo: "Flávio Bolsonaro", figura: "flavio" },
  { valor: "renan", rotulo: "Renan Santos", figura: "renan" },
] as const satisfies readonly OpcaoIcone[];

const VEICULOS = [
  { valor: "car", rotulo: "Carro", emoji: "🚗" },
  { valor: "suv", rotulo: "Utilitário", emoji: "🚙" },
  { valor: "bike", rotulo: "Bicicleta", emoji: "🚲" },
  { valor: "motorcycle", rotulo: "Moto", emoji: "🏍️" },
  { valor: "bus", rotulo: "Ônibus", emoji: "🚌" },
  { valor: "rocket", rotulo: "Foguete", emoji: "🚀" },
] as const satisfies readonly OpcaoIcone[];

const BANDEIRAS = [
  { valor: "flag_brasil", rotulo: "Bandeira do Brasil", bandeira: "brasil" },
  { valor: "flag_vermelha", rotulo: "Bandeira vermelha", bandeira: "partido_vermelho" },
  { valor: "flag_azul", rotulo: "Bandeira azul", bandeira: "partido_azul" },
  { valor: "flag_verde", rotulo: "Bandeira verde", bandeira: "partido_verde" },
] as const satisfies readonly OpcaoIcone[];

export const CATEGORIAS_ICONES = [
  { valor: "figuras", rotulo: "Figuras", opcoes: FIGURAS },
  { valor: "politica", rotulo: "Figuras políticas", opcoes: POLITICAS },
  { valor: "veiculos", rotulo: "Veículos", opcoes: VEICULOS },
  { valor: "bandeiras", rotulo: "Bandeiras", opcoes: BANDEIRAS },
] as const;

export type CategoriaIcone = (typeof CATEGORIAS_ICONES)[number]["valor"];

export const ICONES_PERFIL: readonly OpcaoIcone[] = [
  ...FIGURAS,
  ...POLITICAS,
  ...VEICULOS,
  ...BANDEIRAS,
];

/** Ícones da primeira versão do avatar (desenhados com o <Icon>). Continuam valendo. */
const ICONES_LEGADOS = {
  book: "Livro",
  mic: "Microfone",
  compass: "Bússola",
  vote: "Voto",
  users: "Pessoas",
  sun: "Sol",
  moon: "Lua",
  shield: "Escudo",
  home: "Casa",
  search: "Busca",
} as const;

export type IconeLegado = keyof typeof ICONES_LEGADOS;
export type IconePerfil =
  | (typeof FIGURAS)[number]["valor"]
  | (typeof POLITICAS)[number]["valor"]
  | (typeof VEICULOS)[number]["valor"]
  | (typeof BANDEIRAS)[number]["valor"]
  | IconeLegado;

/** Todos os valores aceitos no banco, para o schema (sem ícone = "" = iniciais). */
export const VALORES_COR = CORES_PERFIL.map((c) => c.valor) as [CorPerfil, ...CorPerfil[]];
export const VALORES_ICONE = [
  "",
  ...ICONES_PERFIL.map((i) => i.valor),
  ...Object.keys(ICONES_LEGADOS),
] as [IconePerfil | "", ...(IconePerfil | "")[]];

export function opcaoDoIcone(icone: string | null | undefined): OpcaoIcone | undefined {
  return ICONES_PERFIL.find((o) => o.valor === icone);
}

export function ehIconeLegado(icone: string | null | undefined): icone is IconeLegado {
  return !!icone && icone in ICONES_LEGADOS;
}

export function rotuloIconePerfil(icone: IconePerfil | "") {
  if (ehIconeLegado(icone)) return ICONES_LEGADOS[icone];
  return opcaoDoIcone(icone)?.rotulo ?? "Iniciais";
}

export function categoriaDoIcone(icone: IconePerfil | ""): CategoriaIcone {
  return CATEGORIAS_ICONES.find((c) => c.opcoes.some((o) => o.valor === icone))?.valor ?? "figuras";
}

/** "Ana Paula Souza" → "AS"; "Joju" → "Jo". */
export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length > 1) return `${partes[0][0]}${partes.at(-1)![0]}`;
  return partes[0]?.slice(0, 2) || "?";
}
