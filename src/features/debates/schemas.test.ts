import { describe, expect, it } from "vitest";
import { debateSchema, lerDataLocal } from "./schemas";

const agora = new Date("2026-10-20T12:00:00-03:00");
const base = { tema: "Pena de morte", formato: "Livre", quando: "data", data: "", hora: "" };
const marcar = (campos: Partial<typeof base>) =>
  debateSchema(agora).safeParse({ ...base, ...campos });

describe("data do debate", () => {
  it("lê dia e hora no horário de Brasília; sem hora vale 00:00", () => {
    expect(lerDataLocal("2026-10-26", "20:00")?.toISOString()).toBe("2026-10-26T23:00:00.000Z");
    expect(lerDataLocal("2026-10-26")?.toISOString()).toBe("2026-10-26T03:00:00.000Z");
    expect(lerDataLocal("amanhã")).toBeNull();
    expect(lerDataLocal("2026-10-26", "8h")).toBeNull();
  });

  it("aceita só a data, inclusive hoje", () => {
    const r = marcar({ data: "2026-10-20" });
    expect(r.success).toBe(true);
    expect(r.data?.comHora).toBe(false);
    expect(r.data?.aoVivo).toBe(false);
  });

  it("aceita data e hora no futuro", () => {
    const r = marcar({ data: "2026-10-26", hora: "20:00" });
    expect(r.data?.comHora).toBe(true);
    expect(r.data?.data.toISOString()).toBe("2026-10-26T23:00:00.000Z");
  });

  it("recusa dia ou horário que já passou, dizendo o que fazer", () => {
    expect(marcar({ data: "2026-10-19" }).error?.issues[0].message).toBe(
      "Esse dia já passou. Escolha hoje ou um dia no futuro.",
    );
    const r = marcar({ data: "2026-10-20", hora: "09:00" });
    expect(r.error?.issues[0].path).toEqual(["hora"]);
    expect(r.error?.issues[0].message).toBe(
      "Esse horário já passou. Escolha um mais tarde ou deixe a hora em branco.",
    );
  });

  it("pede o dia quando é pra marcar data", () => {
    expect(marcar({}).error?.issues[0].message).toBe("Escolha o dia do debate.");
  });

  it("já está rolando: nasce em andamento, agora, sem pedir data", () => {
    const r = marcar({ quando: "agora" });
    expect(r.data).toMatchObject({ aoVivo: true, comHora: true, data: agora });
  });
});
