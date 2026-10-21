import { AJUDA, normalizar } from "@/features/ajuda/conteudo";
import { ROTA_ADMIN, ROTAS, type Rota } from "@/lib/rotas";
import type { Resultado } from "./tipos";

/** Outras palavras que levam a cada página ("agenda" acha Debates). */
const APELIDOS: Record<string, string> = {
  "/inicio": "inicio home resumo semana",
  "/livro": "livro da vez leitura pagina comentario spoiler progresso",
  "/debates": "debates agenda presenca finalizado marcar",
  "/mapa": "mapa politico quiz questionario economia costumes",
  "/estante": "estante fila votar sugerir livros lidos",
  "/pauta": "pauta temas propor votar virar debate",
  "/membros": "membros pessoas convite convidar link moderador",
  "/admin": "admin grupos moderadores auditoria criar grupo",
};

/**
 * Busca no que já está no navegador: páginas e perguntas da Ajuda.
 * Ignora acento e caixa. Sem termo, devolve só as páginas (atalho de navegação).
 */
export function buscarLocal(termo: string, dono: boolean): Resultado[] {
  const t = normalizar(termo.trim());
  const rotas: Rota[] = dono ? [...ROTAS, ROTA_ADMIN] : ROTAS;

  const paginas: Resultado[] = rotas
    .filter((r) => !t || normalizar(`${r.nome} ${APELIDOS[r.href] ?? ""}`).includes(t))
    .map((r) => ({ id: `pagina-${r.href}`, grupo: "Páginas", titulo: r.nome, href: r.href }));

  // Uma letra só ainda filtra páginas, mas a Ajuda inteira bateria em quase tudo.
  if (t.length < 2) return paginas;

  const ajuda: Resultado[] = Object.entries(AJUDA)
    .filter(([chave]) => dono || chave !== "admin")
    .flatMap(([chave, secao]) =>
      secao.perguntas
        .filter((p) => normalizar(`${p.pergunta} ${p.resposta}`).includes(t))
        .map((p) => ({
          id: `ajuda-${chave}-${p.pergunta}`,
          grupo: "Ajuda" as const,
          titulo: p.pergunta,
          detalhe: secao.titulo,
          pergunta: p.pergunta,
        })),
    )
    .slice(0, 5);

  return [...paginas, ...ajuda];
}
