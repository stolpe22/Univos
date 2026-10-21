import { useId } from "react";
import { LOGO } from "@/lib/logo";

/**
 * Logo do Uni-vos: círculo em degradê azul → vermelho com foice e martelo, em que o
 * cabo do martelo forma o traço vertical do cifrão. O desenho está em src/lib/logo.ts.
 */
export function Logo({ className = "", rotulo }: { className?: string; rotulo?: string }) {
  const id = useId();
  const g = `url(#${id})`;
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={rotulo ? "img" : undefined}
      aria-label={rotulo}
      aria-hidden={rotulo ? undefined : true}
    >
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="1" y1="1" x2="63" y2="63">
          <stop offset="0" style={{ stopColor: "var(--blue)" }} />
          <stop offset=".375" style={{ stopColor: "var(--blue)" }} />
          <stop offset=".625" style={{ stopColor: "var(--logo-red)" }} />
          <stop offset="1" style={{ stopColor: "var(--logo-red)" }} />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill={g} />
      <path d={LOGO.lamina} fill="white" />
      <path d={LOGO.cabo} stroke="white" strokeWidth="5" strokeLinecap="round" />
      <path d={LOGO.traco} stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      {/* contorno na cor do fundo separa o S do traço vertical */}
      <path d={LOGO.cifrao} fill="none" stroke={g} strokeWidth="6.6" strokeLinecap="round" />
      <path d={LOGO.cifrao} fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <path d={LOGO.martelo} fill="none" stroke={g} strokeWidth="2.6" strokeLinejoin="round" />
      <path d={LOGO.martelo} fill="white" />
      <rect {...LOGO.encaixe} fill="white" />
    </svg>
  );
}
