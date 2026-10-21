import { Icon } from "./Icon";

/**
 * Apagar como ícone de lixeira (44×44): não disputa espaço com o texto ao lado no celular.
 * O nome vai no aria-label e no title ("Apagar comentário"), já que não há texto visível.
 */
export function BotaoApagar({
  rotulo,
  onClick,
  disabled,
}: {
  rotulo: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={rotulo}
      title={rotulo}
      className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl text-muted disabled:opacity-40 [@media(hover:hover)]:hover:bg-accent-soft [@media(hover:hover)]:hover:text-err"
    >
      <Icon nome="trash" className="size-5" />
    </button>
  );
}
