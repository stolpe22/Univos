/** Minúsculas e sem acento, para buscas acharem "politico" em "Político". */
export function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");
}

/** "História do Trabalho" → "historia-do-trabalho" (códigos e endereços). */
export function slug(texto: string) {
  return normalizar(texto)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Junta espaços repetidos e tira das pontas. */
export function limparEspacos(texto: string) {
  return texto.trim().replace(/\s+/g, " ");
}
