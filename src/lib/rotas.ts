import type { NomeIcone } from "@/components/ui/Icon";

export type Rota = {
  href: string;
  /** Nome da aba. É também o título da página (heurística 4). */
  nome: string;
  /** Rótulo alternativo quando a rota aparece como sub-aba. */
  nomeSubaba?: string;
  icone: NomeIcone;
  /** Seção da ajuda que abre primeiro nesta rota. */
  ajuda: string;
};

/** Todas as páginas do menu. O agrupamento em seções fica em SECOES, abaixo. */
export const ROTAS: Rota[] = [
  { href: "/inicio", nome: "Início", icone: "home", ajuda: "inicio" },
  { href: "/livro", nome: "Livro da vez", icone: "book", ajuda: "livro" },
  { href: "/debates", nome: "Debates", icone: "mic", ajuda: "debates" },
  { href: "/mapa", nome: "Mapa político", icone: "compass", ajuda: "mapa" },
  { href: "/estante", nome: "Estante", icone: "shelf", ajuda: "estante" },
  { href: "/meus-livros", nome: "Meus livros", icone: "shelf", ajuda: "meus-livros" },
  { href: "/pauta", nome: "Pauta", nomeSubaba: "Pautas", icone: "vote", ajuda: "pauta" },
  { href: "/membros", nome: "Membros", icone: "users", ajuda: "membros" },
];

/** Só aparece para o dono do sistema, no fim da lista (em "Mais" no celular). */
export const ROTA_ADMIN: Rota = { href: "/admin", nome: "Admin", icone: "shield", ajuda: "admin" };

/** Fora das seções (abre pela foto no topo ou por Mais), mas tem título e ajuda próprios. */
export const ROTA_PERFIL: Rota = {
  href: "/meu-perfil",
  nome: "Meu perfil",
  icone: "users",
  ajuda: "meu-perfil",
};

export function rotaAtual(pathname: string): Rota | undefined {
  return [...ROTAS, ROTA_ADMIN, ROTA_PERFIL].find(
    (r) => pathname === r.href || pathname.startsWith(r.href + "/"),
  );
}

/**
 * Seções do menu: páginas parecidas ficam juntas e viram sub-abas no topo da página
 * (Livros: Livro da vez · Estante · Meus livros). Cada página continua com rota própria.
 */
export type Secao = {
  nome: string;
  /** Nome na barra inferior do celular, onde o espaço é curto. */
  curto: string;
  icone: NomeIcone;
  /** A primeira é para onde a seção leva. */
  paginas: Rota[];
};

function pagina(href: string) {
  const rota = ROTAS.find((r) => r.href === href);
  if (!rota) throw new Error(`Rota ${href} não existe em ROTAS`);
  return rota;
}

export const SECOES: Secao[] = [
  { nome: "Início", curto: "Início", icone: "home", paginas: [pagina("/inicio")] },
  {
    nome: "Livros",
    curto: "Livros",
    icone: "book",
    paginas: [pagina("/livro"), pagina("/estante"), pagina("/meus-livros")],
  },
  {
    nome: "Debates",
    curto: "Debates",
    icone: "mic",
    paginas: [pagina("/debates"), pagina("/pauta")],
  },
  { nome: "Mapa político", curto: "Mapa", icone: "compass", paginas: [pagina("/mapa")] },
  { nome: "Membros", curto: "Membros", icone: "users", paginas: [pagina("/membros")] },
];

/** Só para o dono: aba no desktop, item do "Mais" no celular. */
export const SECAO_ADMIN: Secao = {
  nome: "Admin",
  curto: "Admin",
  icone: "shield",
  paginas: [ROTA_ADMIN],
};

export function secaoDe(rota: Rota | undefined, secoes: Secao[] = [...SECOES, SECAO_ADMIN]) {
  return rota ? secoes.find((s) => s.paginas.includes(rota)) : undefined;
}
