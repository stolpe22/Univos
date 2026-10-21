import { describe, expect, it } from "vitest";
import { embaralhar, proximaPendente } from "./ordem";

describe("ordem do questionário", () => {
  it("é a mesma para a mesma semente (retomar não muda a ordem)", () => {
    expect(embaralhar(12345, 40)).toEqual(embaralhar(12345, 40));
  });

  it("muda com outra semente e não perde nem repete afirmação", () => {
    const a = embaralhar(1, 40);
    const b = embaralhar(2, 40);
    expect(a).not.toEqual(b);
    expect([...a].sort((x, y) => x - y)).toEqual(Array.from({ length: 40 }, (_, i) => i));
  });

  it("continua na primeira sem resposta", () => {
    const ordem = [5, 2, 9];
    expect(proximaPendente(ordem, {})).toBe(0);
    expect(proximaPendente(ordem, { 5: 4 })).toBe(1);
    expect(proximaPendente(ordem, { 5: 4, 2: 1, 9: 3 })).toBe(2);
  });
});
