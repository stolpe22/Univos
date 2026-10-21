import { BANDEIRA_BRASIL, COR_BANDEIRA, PALETA_FIGURAS, TRACOS } from "./arte";
import type { FiguraPolitica, TipoBandeira } from "./opcoes";

/** Caricatura simples de figura política, desenhada em SVG (decorativa). */
export function Caricatura({ tipo }: { tipo: FiguraPolitica }) {
  const p = PALETA_FIGURAS[tipo];
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="size-full">
      <path d="M5 64c2-16 13-23 27-23s25 7 27 23" fill={p.roupa} />
      <path d="M23 40h18v10H23z" fill={p.pele} />
      <ellipse cx="32" cy="27" rx="18" ry="21" fill={p.pele} />
      <path
        d={
          tipo === "che"
            ? "M14 23Q12 4 31 6q18-1 19 17l-7-5-7 2-6-5-8 7z"
            : "M14 23Q12 4 32 6q18 0 19 17l-7-6q-12 2-23-1z"
        }
        fill={p.cabelo}
      />
      {tipo === "che" && (
        <>
          <path d="M14 13h36v5H14z" fill={TRACOS.boinaChe} />
          <path
            d="m31 9 1.7 3.2 3.6.5-2.6 2.5.6 3.6-3.3-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z"
            fill={TRACOS.estrelaChe}
          />
        </>
      )}
      <path d="M23 27h3m12 0h3" stroke={TRACOS.olhos} strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M29 34q3 2 6 0"
        fill="none"
        stroke={TRACOS.boca}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {p.barba &&
        (tipo === "che" ? (
          <path d="M16 31q4 5 7 4l3 8q6 5 12 0l3-8q4 1 7-4l-3 15q-12 10-26 0z" fill={p.barba} />
        ) : (
          <path d="M17 34q3 5 8 4 7 8 14 0 5 1 8-4l-3 12q-11 9-24 0z" fill={p.barba} />
        ))}
      {tipo === "bolsonaro" && (
        <path d="M18 9q14-11 29 1l-4 4q-12-2-24 0z" fill={TRACOS.topeteBolsonaro} />
      )}
      {tipo === "flavio" && <path d="M21 8q11-8 22 0l-2 4q-9-2-18 1z" fill={TRACOS.topeteFlavio} />}
    </svg>
  );
}

/** Bandeira redonda (decorativa). */
export function Bandeira({ tipo }: { tipo: TipoBandeira }) {
  if (tipo === "brasil") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true" className="size-full">
        <circle cx="32" cy="32" r="32" fill={BANDEIRA_BRASIL.verde} />
        <path d="m32 11 24 21-24 21L8 32z" fill={BANDEIRA_BRASIL.amarelo} />
        <circle cx="32" cy="32" r="12" fill={BANDEIRA_BRASIL.azul} />
        <path d="M21 30q12-4 22 2" fill="none" stroke="white" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="size-full">
      <circle cx="32" cy="32" r="32" fill={COR_BANDEIRA[tipo]} />
      <path
        d="m32 12 5.8 12 13.2 1.9-9.5 9.3 2.2 13.1L32 42l-11.7 6.3 2.2-13.1-9.5-9.3 13.2-1.9z"
        fill="white"
      />
    </svg>
  );
}
