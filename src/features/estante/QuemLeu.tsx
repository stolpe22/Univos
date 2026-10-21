import { Avatar } from "@/components/ui/Avatar";
import type { EdicaoLeitura, LivroEstante } from "./queries";
import { leiturasDoLivro } from "./regras";

const MAXIMO = 3;

/**
 * Indicador pequeno no canto do livro: as bolinhas de quem já leu (✓) e de quem está
 * lendo (📖). Os nomes ficam no texto para leitor de tela.
 */
export function QuemLeu({ livro, eu }: { livro: LivroEstante; eu: string }) {
  const { leram, lendo } = leiturasDoLivro(livro);
  if (leram.length === 0 && lendo.length === 0) return null;
  return (
    <div className="grid justify-items-end gap-1">
      <Linha simbolo="✓" rotulo="Já leram" pessoas={leram} eu={eu} cor="text-perfil-green" />
      <Linha simbolo="📖" rotulo="Estão lendo" pessoas={lendo} eu={eu} cor="text-accent" />
    </div>
  );
}

function Linha({
  simbolo,
  rotulo,
  pessoas,
  eu,
  cor,
}: {
  simbolo: string;
  rotulo: string;
  pessoas: EdicaoLeitura[];
  eu: string;
  cor: string;
}) {
  if (pessoas.length === 0) return null;
  const nomes = pessoas.map((p) => (p.userId === eu ? "você" : p.nome));
  const sobra = pessoas.length - MAXIMO;
  return (
    <div className="flex items-center gap-1" title={`${rotulo}: ${nomes.join(", ")}`}>
      <span className="sr-only">
        {rotulo}: {nomes.join(", ")}.
      </span>
      <span aria-hidden="true" className={`text-xs font-bold ${cor}`}>
        {simbolo}
      </span>
      <span aria-hidden="true" className="flex -space-x-1">
        {pessoas.slice(0, MAXIMO).map((p) => (
          <Avatar
            key={p.userId}
            nome={p.nome}
            cor={p.cor}
            icone={p.icone}
            className="size-6 text-[10px] ring-2 ring-card"
          />
        ))}
      </span>
      {sobra > 0 && (
        <span aria-hidden="true" className="text-xs font-semibold text-muted">
          +{sobra}
        </span>
      )}
    </div>
  );
}
