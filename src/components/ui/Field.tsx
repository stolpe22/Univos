import { useId, type ComponentPropsWithRef, type ReactNode } from "react";

export const classesInput =
  "min-h-[46px] w-full rounded-xl border-[1.5px] border-line bg-card px-[.85em] py-[.65em] text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent-soft aria-invalid:border-err";

/** Props que o campo recebe para ficar ligado ao label, à dica e ao erro. */
export type PropsControle = {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
};

type Props = {
  label: string;
  hint?: ReactNode;
  /** Mensagem que diz o que fazer ("A página precisa estar entre 0 e 320."). */
  erro?: string;
  id?: string;
  /** Para select/textarea/stepper. Sem children, renderiza um <input>. */
  children?: (controle: PropsControle) => ReactNode;
} & Omit<ComponentPropsWithRef<"input">, "children">;

/** Label sempre visível + campo + dica + erro com role="alert" (heurísticas 6 e 9). */
export function Field({ label, hint, erro, id, children, className = "", ...input }: Props) {
  const gerado = useId();
  const campo = id ?? gerado;
  const idHint = `${campo}-hint`;
  const idErro = `${campo}-erro`;
  const descritores = [hint ? idHint : null, erro ? idErro : null].filter(Boolean).join(" ");
  const controle: PropsControle = {
    id: campo,
    "aria-invalid": !!erro,
    "aria-describedby": descritores || undefined,
  };

  return (
    <div className="grid gap-1.5">
      <label htmlFor={campo} className="text-sm font-semibold">
        {label}
      </label>
      {children ? (
        children(controle)
      ) : (
        <input {...input} {...controle} className={`${classesInput} ${className}`} />
      )}
      {hint && (
        <small id={idHint} className="text-[13px] text-muted">
          {hint}
        </small>
      )}
      {/* Fica sempre no DOM (vazio) para o leitor de tela anunciar quando o erro aparecer. */}
      <small
        id={idErro}
        role="alert"
        className="text-[13.5px] font-semibold text-err empty:-mt-1.5"
      >
        {erro ? `⚠ ${erro}` : ""}
      </small>
    </div>
  );
}
