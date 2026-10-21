import { corDoPerfil } from "@/components/ui/Avatar";
import type { PessoaNoMapa } from "./queries";

/**
 * O grupo no mapa: economia no eixo horizontal (esquerda → direita) e costumes no
 * vertical (progressista embaixo, conservador em cima).
 */
export function Bussola({
  pessoas,
  eu,
  className = "max-w-[420px]",
}: {
  pessoas: PessoaNoMapa[];
  eu?: string;
  /** Largura máxima (padrão 420 px). */
  className?: string;
}) {
  const com = pessoas.filter((p) => p.resultado);
  const t = (x: number, y: number, texto: string, rot?: string) => (
    <text x={x} y={y} textAnchor="middle" fontSize="11" className="fill-muted" transform={rot}>
      {texto}
    </text>
  );
  return (
    <svg
      viewBox="0 0 320 330"
      role="img"
      aria-label={`Mapa político do grupo. ${
        com.length
          ? com
              .map(
                (p) =>
                  `${p.nome}: economia ${p.resultado!.economia}, costumes ${p.resultado!.costumes}`,
              )
              .join("; ")
          : "Ninguém respondeu ainda."
      }`}
      className={`mx-auto block w-full text-ink ${className}`}
    >
      <defs>
        <linearGradient id="mapa-fundo" x1="0" x2="1">
          <stop offset="0" style={{ stopColor: "var(--red)", stopOpacity: 0.22 }} />
          <stop offset=".5" style={{ stopColor: "var(--purple)", stopOpacity: 0.1 }} />
          <stop offset="1" style={{ stopColor: "var(--blue)", stopOpacity: 0.22 }} />
        </linearGradient>
      </defs>
      <rect
        x="22"
        y="22"
        width="276"
        height="276"
        rx="14"
        fill="url(#mapa-fundo)"
        className="stroke-line"
      />
      <line x1="160" y1="22" x2="160" y2="298" strokeWidth="2" className="stroke-line" />
      <line x1="22" y1="160" x2="298" y2="160" strokeWidth="2" className="stroke-line" />
      {t(160, 15, "CONSERVADOR")}
      {t(160, 316, "PROGRESSISTA")}
      {t(12, 160, "ESQUERDA", "rotate(-90 12 160)")}
      {t(310, 160, "DIREITA", "rotate(90 310 160)")}
      {t(91, 44, "esq. conservadora")}
      {t(229, 44, "dir. conservadora")}
      {t(91, 284, "esq. progressista")}
      {t(229, 284, "dir. progressista")}
      {com.map((p) => {
        const x = 160 + p.resultado!.economia * 1.35;
        const y = 160 - p.resultado!.costumes * 1.35;
        return (
          <g key={p.id}>
            <circle
              cx={x}
              cy={y}
              r="9"
              strokeWidth="2.5"
              className={`${corDoPerfil(p.cor).preenchimento} stroke-card`}
            />
            <text
              x={x}
              y={y - 15}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              className="fill-current"
            >
              {p.id === eu ? `${p.nome} (você)` : p.nome}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Barra de um eixo com o marcador na posição (−100…+100). */
export function Escala({
  valor,
  esquerda,
  direita,
  rotulo,
  tipo,
}: {
  valor: number;
  esquerda: string;
  direita: string;
  rotulo: string;
  tipo: "economia" | "costumes";
}) {
  return (
    <div>
      <p className="mt-4 mb-0 font-bold">{rotulo}</p>
      <div
        role="img"
        aria-label={`${rotulo}: ${valor}, de −100 (${esquerda}) a +100 (${direita})`}
        className={`relative my-2.5 h-2.5 rounded-full ${
          tipo === "economia"
            ? "bg-linear-to-r from-red via-purple to-blue"
            : "bg-linear-to-r from-accent-soft via-purple to-ink"
        }`}
      >
        <span
          className="absolute top-1/2 size-[22px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-ink bg-card shadow"
          style={{ left: `${50 + valor / 2}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span>{esquerda}</span>
        <span>{direita}</span>
      </div>
    </div>
  );
}
