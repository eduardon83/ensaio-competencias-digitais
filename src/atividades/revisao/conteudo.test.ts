import { describe, expect, it } from "vitest";
import { diferencas, pontuarRevisao } from "./pontuacao";
import { NIVEIS } from "./index";

describe("conteúdo da Revisão", () => {
  for (const [nivel, cfg] of Object.entries(NIVEIS)) {
    for (const ctx of ["jornal", "laboratorio"] as const) {
      it(`nível ${nivel} · ${ctx}: ${cfg.diferencas} diferenças e o mesmo número de palavras`, () => {
        const o = cfg.original[ctx].split(/\s+/);
        const c = cfg.copia[ctx].split(/\s+/);
        expect(c.length).toBe(o.length);
        expect(diferencas(cfg.original[ctx], cfg.copia[ctx]).length).toBe(cfg.diferencas);
      });
    }
  }
});

describe("pontuarRevisao", () => {
  it("100 quando encontra tudo sem erros", () => {
    expect(pontuarRevisao({ encontradas: 5, errados: 0, total: 5, fracaoTempoRestante: 0.1 })).toBe(100);
  });
  it("desconta meio ponto por clique errado e dá bónus de tempo", () => {
    // (4 − 1) / 5 = 0,6 → 60 + 5
    expect(pontuarRevisao({ encontradas: 4, errados: 2, total: 5, fracaoTempoRestante: 0.5 })).toBe(65);
  });
  it("não fica negativo", () => {
    expect(pontuarRevisao({ encontradas: 0, errados: 9, total: 3, fracaoTempoRestante: null })).toBe(0);
  });
});
