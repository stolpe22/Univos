import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { SituacaoLeitura } from "@/features/estante/SituacaoLeitura";
import { Pill } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatarData } from "@/lib/datas";
import type { ProgressoPessoa } from "./queries";
import { porcentagem } from "./regras";

/**
 * Quem está lendo o livro da vez: só quem cadastrou o exemplar em Meus livros, cada um
 * na própria edição ("pág. 120 de 400 · 30%"). Usada no Livro da vez e no Início.
 */
export function ProgressoGrupo({ pessoas, eu }: { pessoas: ProgressoPessoa[]; eu: string }) {
  if (pessoas.length === 0) {
    return (
      <p className="m-0 py-3 text-center text-muted">
        Ninguém cadastrou o exemplar ainda.{" "}
        <Link href="/meus-livros" className="font-semibold text-accent underline">
          Cadastre o seu em Meus livros
        </Link>{" "}
        pra aparecer aqui.
      </p>
    );
  }
  return (
    <ul className="m-0 list-none divide-y divide-line p-0">
      {pessoas.map((p) => (
        <li key={p.id} className="flex items-center gap-2.5 py-3">
          <Avatar nome={p.nome} cor={p.cor} icone={p.icone} />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-x-2">
              <b className="flex items-center gap-1.5">
                {p.nome}
                {p.id === eu && <Pill>você</Pill>}
                <SituacaoLeitura status={p.statusLeitura} />
              </b>
              <span className="text-[13.5px] text-muted">
                pág. {p.pagina} de {p.paginasEdicao} · {porcentagem(p.pagina, p.paginasEdicao)}%
              </span>
            </div>
            <ProgressBar valor={p.pagina} max={p.paginasEdicao} rotulo={`Progresso de ${p.nome}`} />
            {p.atualizadoEm && (
              <span className="mt-1 block text-xs text-muted">
                Atualizado em {formatarData(p.atualizadoEm)}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
