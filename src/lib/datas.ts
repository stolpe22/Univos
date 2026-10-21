/** Datas sempre no fuso do grupo, igual no servidor e no navegador. */
export function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

/** "dom., 26 de out., 20:00" para a agenda. */
export function formatarDataComDia(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

/** Valor mínimo para <input type="datetime-local"> (agora, no horário de Brasília). */
export function agoraLocal() {
  return new Date()
    .toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" })
    .slice(0, 16)
    .replace(" ", "T");
}
