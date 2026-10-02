import { describe, expect, it } from "vitest";
import { diferencas, gerarCopia, pontuarRevisao } from "./pontuacao";
import { NIVEIS } from "./index";
import { semente } from "../../motor/aleatorio";

describe("Revisão: cópias geradas", () => {
  for (const [nivel, cfg] of Object.entries(NIVEIS)) {
    for (const ctx of ["jornal", "laboratorio"] as const) {
      it(`nível ${nivel} · ${ctx}: ${cfg.diferencas} diferenças exatas em cada original, com qualquer semente`, () => {
        expect(cfg.originais[ctx].length).toBeGreaterThanOrEqual(3);
        for (const original of cfg.originais[ctx]) {
          for (let k = 1; k <= 40; k++) {
            const copia = gerarCopia(original, cfg.diferencas, !!cfg.avancado, semente(k));
            expect(copia.split(/\s+/).length).toBe(original.split(/\s+/).length);
            expect(diferencas(original, copia).length, copia).toBe(cfg.diferencas);
          }
        }
      });
    }
  }
  it("as cópias variam entre tentativas", () => {
    const o = NIVEIS[3].originais.jornal[0];
    expect(gerarCopia(o, 7, false, semente(1))).not.toBe(gerarCopia(o, 7, false, semente(2)));
  });
});

describe("pontuarRevisao", () => {
  it("100 quando encontra tudo sem erros", () => {
    expect(pontuarRevisao({ encontradas: 5, errados: 0, total: 5, fracaoTempoRestante: 0.1 })).toBe(100);
  });
  it("desconta meio ponto por clique errado e dá bónus de tempo", () => {
    expect(pontuarRevisao({ encontradas: 4, errados: 2, total: 5, fracaoTempoRestante: 0.5 })).toBe(65);
  });
  it("não fica negativo", () => {
    expect(pontuarRevisao({ encontradas: 0, errados: 9, total: 3, fracaoTempoRestante: null })).toBe(0);
  });
});
