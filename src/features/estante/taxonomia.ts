export const STATUS_LEITURA = [
  { valor: "nao_lido", rotulo: "Ainda não comecei" },
  { valor: "lendo", rotulo: "Estou lendo" },
  { valor: "lido", rotulo: "Já li" },
] as const;

export type StatusLeitura = (typeof STATUS_LEITURA)[number]["valor"];
export type TemaLivro = string;
export type TipoLivro = string;

export function rotuloStatus(status: string) {
  return STATUS_LEITURA.find((s) => s.valor === status)?.rotulo ?? "Leitura";
}
