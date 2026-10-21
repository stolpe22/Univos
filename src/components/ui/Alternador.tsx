"use client";

type Opcao = { href: string; rotulo: string; contagem?: number; ativa: boolean };

const ESTILOS = {
  // escolha principal da página: barra segmentada; no celular ocupa a largura toda
  abas: {
    caixa: "flex w-full rounded-xl border-[1.5px] border-line bg-card p-1 sm:inline-flex sm:w-auto",
    opcao:
      "flex-1 justify-center rounded-lg px-4 text-sm sm:flex-none aria-[current=page]:bg-accent-soft aria-[current=page]:text-accent",
  },
  // refinamento dentro de uma aba: etiquetas soltas, menores, para não competir com as abas
  etiquetas: {
    caixa: "flex flex-wrap gap-2",
    opcao:
      "rounded-full border-[1.5px] border-line px-3.5 text-[13px] aria-[current=page]:border-accent aria-[current=page]:text-accent",
  },
};

/**
 * Alternância entre visões da mesma página ("Todos | O grupo leu | Eu li"). Troca na hora,
 * sem ir ao servidor: só muda a URL (pushState), então Voltar e links compartilhados
 * funcionam e a página lê a visão com useSearchParams.
 */
export function Alternador({
  rotulo,
  opcoes,
  variante = "abas",
}: {
  rotulo: string;
  opcoes: Opcao[];
  variante?: keyof typeof ESTILOS;
}) {
  const estilo = ESTILOS[variante];
  return (
    <nav aria-label={rotulo} className={estilo.caixa}>
      {opcoes.map((o) => (
        <a
          key={o.href}
          href={o.href}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey) return; // abrir em outra aba
            e.preventDefault();
            if (!o.ativa) window.history.pushState(null, "", o.href);
          }}
          aria-current={o.ativa ? "page" : undefined}
          className={`flex min-h-11 items-center gap-1.5 font-semibold whitespace-nowrap text-muted ${estilo.opcao}`}
        >
          {o.ativa && variante === "etiquetas" && <span aria-hidden="true">✓</span>}
          {o.rotulo}
          {o.contagem !== undefined && (
            <span className="rounded-full bg-line px-1.5 text-xs text-ink">{o.contagem}</span>
          )}
        </a>
      ))}
    </nav>
  );
}
