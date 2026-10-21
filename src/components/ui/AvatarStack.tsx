import { Avatar, type CorPerfil, type IconePerfil } from "./Avatar";

type PessoaAvatar = {
  id: string;
  nome: string;
  cor: CorPerfil;
  icone?: IconePerfil | "" | null;
};

/** Avatares sobrepostos com rótulo acessível e limite visual para telas estreitas. */
export function AvatarStack({
  pessoas,
  contexto = "Participaram",
}: {
  pessoas: PessoaAvatar[];
  contexto?: string;
}) {
  if (pessoas.length === 0) return null;
  const visiveis = pessoas.slice(0, 4);
  const restantes = pessoas.length - visiveis.length;

  return (
    <div
      role="img"
      aria-label={`${contexto}: ${pessoas.map((pessoa) => pessoa.nome).join(", ")}`}
      className="flex min-w-0 items-center"
    >
      <div aria-hidden="true" className="flex items-center -space-x-2">
        {visiveis.map((pessoa) => (
          <Avatar
            key={pessoa.id}
            nome={pessoa.nome}
            cor={pessoa.cor}
            icone={pessoa.icone || null}
            className="size-8 text-[11px]"
          />
        ))}
        {restantes > 0 && (
          <span className="grid size-8 place-items-center rounded-full border-2 border-card bg-muted text-[11px] font-bold text-card">
            +{restantes}
          </span>
        )}
      </div>
    </div>
  );
}
