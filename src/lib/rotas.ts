import type { NomeIcone } from "@/components/ui/Icon";

export type Rota = {
  href: string;
  /** Nome da aba. É também o título da página (heurística 4). */
  nome: string;
  icone: NomeIcone;
  /** Seção da ajuda que abre primeiro nesta rota. */
  ajuda: string;
};

/** As 4 primeiras vão na barra inferior do celular; o resto fica em "Mais". */
export const ROTAS: Rota[] = [
  { href: "/inicio", nome: "Início", icone: "home", ajuda: "inicio" },
  { href: "/livro", nome: "Livro da vez", icone: "book", ajuda: "livro" },
  { href: "/debates", nome: "Debates", icone: "mic", ajuda: "debates" },
  { href: "/mapa", nome: "Mapa político", icone: "compass", ajuda: "mapa" },
  { href: "/estante", nome: "Estante", icone: "shelf", ajuda: "estante" },
  { href: "/pauta", nome: "Pauta", icone: "vote", ajuda: "pauta" },
  { href: "/membros", nome: "Membros", icone: "users", ajuda: "membros" },
];

/** Só aparece para o dono do sistema, no fim da lista (em "Mais" no celular). */
export const ROTA_ADMIN: Rota = { href: "/admin", nome: "Admin", icone: "shield", ajuda: "admin" };

export function rotaAtual(pathname: string): Rota | undefined {
  return [...ROTAS, ROTA_ADMIN].find(
    (r) => pathname === r.href || pathname.startsWith(r.href + "/"),
  );
}
