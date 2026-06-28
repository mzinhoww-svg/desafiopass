import { describe, it, expect } from "vitest";
import { specialPoints, normalizeName, SPECIAL_POINTS } from "./special-scoring";

describe("normalizeName", () => {
  it("remove acentos, caixa e espacos extras", () => {
    expect(normalizeName("  Müller ")).toBe("muller");
    expect(normalizeName("Vinícius   Júnior")).toBe("vinicius junior");
    expect(normalizeName("HALAND")).toBe("haland");
  });
});

describe("specialPoints campeao", () => {
  it("acerto exato do codigo pontua", () => {
    expect(specialPoints("campeao", "BRA", "BRA")).toBe(SPECIAL_POINTS.campeao);
  });
  it("case-insensitive", () => {
    expect(specialPoints("campeao", "bra", "BRA")).toBe(SPECIAL_POINTS.campeao);
  });
  it("erro nao pontua", () => {
    expect(specialPoints("campeao", "ARG", "BRA")).toBe(0);
  });
  it("vazio/nulo nao pontua", () => {
    expect(specialPoints("campeao", "", "BRA")).toBe(0);
    expect(specialPoints("campeao", "BRA", null)).toBe(0);
  });
});

describe("specialPoints artilheiro", () => {
  it("acerto com normalizacao pontua", () => {
    expect(specialPoints("artilheiro", "Vinicius Junior", "Vinícius Júnior")).toBe(
      SPECIAL_POINTS.artilheiro,
    );
  });
  it("erro nao pontua", () => {
    expect(specialPoints("artilheiro", "Messi", "Mbappé")).toBe(0);
  });
  it("vazio nao pontua", () => {
    expect(specialPoints("artilheiro", "", "Mbappé")).toBe(0);
  });
});
