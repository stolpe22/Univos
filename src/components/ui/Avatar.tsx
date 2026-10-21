import { Icon } from "./Icon";
import { Bandeira, Caricatura } from "./avatar/Ilustracoes";
import {
  corDoPerfil,
  ehIconeLegado,
  iniciais,
  opcaoDoIcone,
  type CorPerfil,
  type IconePerfil,
} from "./avatar/opcoes";

// As opções ficam em avatar/opcoes.ts; reexportadas para quem já importa daqui.
export {
  CATEGORIAS_ICONES,
  CORES_PERFIL,
  ICONES_PERFIL,
  categoriaDoIcone,
  corDoPerfil,
  rotuloIconePerfil,
  type CategoriaIcone,
  type CorPerfil,
  type IconePerfil,
} from "./avatar/opcoes";

type Props = {
  nome: string;
  cor?: CorPerfil;
  icone?: IconePerfil | "" | null;
  className?: string;
};

/**
 * Círculo com a cor e o ícone que a pessoa escolheu (ou as iniciais).
 * Decorativo: o nome sempre aparece em texto ao lado ou no rótulo do botão/link.
 */
export function Avatar({ nome, cor = "blue", icone, className = "" }: Props) {
  // tamanho padrão só quando quem usa não escolheu outro
  const tamanho = /\bsize-/.test(className) ? "" : "size-8 text-[13px]";
  const opcao = opcaoDoIcone(icone);

  return (
    <span
      aria-hidden="true"
      title={nome}
      className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-full text-white ${corDoPerfil(cor).fundo} ${tamanho} ${className}`}
    >
      {opcao?.figura ? (
        <Caricatura tipo={opcao.figura} />
      ) : opcao?.bandeira ? (
        <Bandeira tipo={opcao.bandeira} />
      ) : opcao?.emoji ? (
        <span className="leading-none">{opcao.emoji}</span>
      ) : ehIconeLegado(icone) ? (
        <Icon nome={icone} />
      ) : (
        <span className="font-semibold">{iniciais(nome)}</span>
      )}
    </span>
  );
}
