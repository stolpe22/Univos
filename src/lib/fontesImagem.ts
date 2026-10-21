import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Fontes da marca para as imagens geradas (o gerador do Next não lê as do site). */
export async function fontesDaMarca() {
  const arquivo = (pacote: string, nome: string) =>
    readFile(join(process.cwd(), "node_modules/@fontsource", pacote, "files", nome));
  const [fraunces, inter, interForte] = await Promise.all([
    arquivo("fraunces", "fraunces-latin-700-normal.woff"),
    arquivo("inter", "inter-latin-400-normal.woff"),
    arquivo("inter", "inter-latin-600-normal.woff"),
  ]);
  return [
    { name: "Fraunces", data: fraunces, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: inter, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: interForte, weight: 600 as const, style: "normal" as const },
  ];
}
