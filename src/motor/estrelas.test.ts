import { describe, expect, it } from "vitest";
import { estrelasDe } from "./tipos";
import { textoEstrelas } from "./Relatorio";

describe("estrelas", () => {
  it("abaixo de 50 nenhuma; 50–74 uma; 75–90 duas; 91–100 três", () => {
    expect([0, 49].map(estrelasDe)).toEqual([0, 0]);
    expect([50, 74].map(estrelasDe)).toEqual([1, 1]);
    expect([75, 90].map(estrelasDe)).toEqual([2, 2]);
    expect([91, 100].map(estrelasDe)).toEqual([3, 3]);
  });
  it("o relatório diz quantos pontos faltam para a estrela seguinte", () => {
    expect(textoEstrelas(73).proxima).toContain("faltam 2");
    expect(textoEstrelas(40).frase).toContain("tentar novamente");
    expect(textoEstrelas(90).proxima).toContain("91");
    expect(textoEstrelas(95).proxima).toContain("três estrelas");
  });
});
