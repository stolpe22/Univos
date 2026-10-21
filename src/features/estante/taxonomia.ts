/**
 * Situação da leitura. Cada uma tem símbolo e cor próprios (o texto continua na cor normal,
 * para o contraste valer no tema claro e no escuro, e a cor nunca é a única pista).
 */
export const STATUS_LEITURA = [
  {
    valor: "nao_lido",
    rotulo: "Ainda não comecei",
    simbolo: "○",
    classe: "border-line bg-transparent",
  },
  {
    valor: "lendo",
    rotulo: "Estou lendo",
    simbolo: "📖",
    classe: "border-perfil-blue/60 bg-perfil-blue/15",
  },
  {
    valor: "lido",
    rotulo: "Já li",
    simbolo: "✓",
    classe: "border-perfil-green/60 bg-perfil-green/15",
  },
] as const;

export type StatusLeitura = (typeof STATUS_LEITURA)[number]["valor"];
export type TemaLivro = string;
export type TipoLivro = string;

export function opcaoStatus(status: string) {
  return STATUS_LEITURA.find((s) => s.valor === status) ?? STATUS_LEITURA[0];
}

export function rotuloStatus(status: string) {
  return STATUS_LEITURA.find((s) => s.valor === status)?.rotulo ?? "Leitura";
}
