import { describe, expect, it } from "vitest";
import { corresponde, normalizar } from "./normalizar";

describe("normalizar", () => {
  it("iguala Unicode e ASCII", () => {
    expect(normalizar("7 × 8 = 56")).toBe(normalizar("7*8=56"));
    expect(normalizar("x² − 5x + 6 = 0")).toBe("x^2-5x+6=0");
    expect(normalizar("√16 = 4")).toBe("sqrt16=4");
    expect(normalizar("x ≤ 4")).toBe("x<=4");
  });
  it("aceita vírgula ou ponto decimal", () => {
    expect(normalizar("12,5")).toBe("12.5");
    expect(normalizar("12.5")).toBe("12.5");
  });
  it("não funde números ao retirar o asterisco", () => {
    expect(normalizar("3*4")).toBe("3*4");
    expect(normalizar("3*x")).toBe("3x");
  });
  it("simplifica parênteses em expoentes simples", () => {
    expect(normalizar("10^(-3)")).toBe("10^-3");
    expect(normalizar("e^(ipi)")).toBe("e^ipi");
    expect(normalizar("2^(x+1)")).toBe("2^(x+1)");
  });
});

describe("corresponde", () => {
  it("compara com várias formas aceites", () => {
    expect(corresponde("(a + b) / 2", ["(a+b)/2"])).toBe(true);
    expect(corresponde("a+b/2", ["(a+b)/2"])).toBe(false);
    expect(corresponde("", ["0"])).toBe(false);
    expect(corresponde("∑_(i=1)^n i", ["sum_(i=1)^n i"])).toBe(true);
  });
});
