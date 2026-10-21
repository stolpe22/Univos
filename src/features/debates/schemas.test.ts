import { describe, expect, it } from "vitest";
import { debateSchema, lerDataLocal } from "./schemas";

const agora = new Date("2026-10-20T12:00:00-03:00");

describe("data do debate", () => {
  it("lê o campo no horário de Brasília", () => {
    expect(lerDataLocal("2026-10-26T20:00")?.toISOString()).toBe("2026-10-26T23:00:00.000Z");
    expect(lerDataLocal("amanhã")).toBeNull();
  });

  it("recusa data no passado dizendo o que fazer", () => {
    const r = debateSchema(agora).safeParse({
      tema: "Pena de morte",
      data: "2026-10-19T20:00",
      formato: "Livre",
    });
    expect(r.error?.issues[0].message).toBe("Essa data já passou. Escolha uma data no futuro.");
  });

  it("aceita data no futuro", () => {
    const r = debateSchema(agora).safeParse({
      tema: "Pena de morte",
      data: "2026-10-26T20:00",
      formato: "Rodada com FINALIZADO!",
    });
    expect(r.success).toBe(true);
  });
});
