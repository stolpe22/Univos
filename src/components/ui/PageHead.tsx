import { AJUDA } from "@/features/ajuda/conteudo";
import { ROTA_ADMIN, ROTAS } from "@/lib/rotas";
import { TituloComInfo } from "./InfoPagina";

/** O texto do "?" de uma aba, a partir do nome dela (ajuda/conteudo.ts). */
export function sobreDaPagina(nome: string) {
  const secao = [...ROTAS, ROTA_ADMIN].find((r) => r.nome === nome)?.ajuda;
  return secao ? AJUDA[secao]?.sobre : undefined;
}

/**
 * Título da página. Use o mesmo nome da aba (heurística 4).
 * Quando o título é uma aba, ganha o "?" com o que a página faz.
 */
export function PageHead({
  titulo,
  descricao,
  ajuda,
}: {
  titulo: string;
  descricao?: string;
  ajuda?: string;
}) {
  const sobre = ajuda ? AJUDA[ajuda]?.sobre : sobreDaPagina(titulo);
  return (
    <div className="mb-3.5">
      {sobre ? (
        <TituloComInfo titulo={titulo} sobre={sobre} />
      ) : (
        <h1 className="mb-1 text-[clamp(24px,4vw,32px)] font-bold">{titulo}</h1>
      )}
      {descricao && <p className="m-0 text-muted">{descricao}</p>}
    </div>
  );
}
