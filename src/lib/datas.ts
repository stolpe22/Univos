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

/** Data do debate: com hora ("dom., 26 de out., 20:00") ou só o dia ("dom., 26 de out."). */
export function formatarQuando(iso: string, comHora: boolean) {
  if (comHora) return formatarDataComDia(iso);
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
  });
}

/** "2026-10-26" (só a data, sem hora) → "segunda-feira, 26 de out." Para prazos. */
export function formatarDia(dataIso: string) {
  // meio-dia evita o dia "pular" por causa do fuso
  return new Date(`${dataIso}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
}

/** Hoje no horário de Brasília, como "2026-10-21" (para comparar com campos de data). */
export function hojeLocal() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}
