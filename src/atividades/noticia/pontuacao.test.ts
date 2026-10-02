import { describe, expect, it } from "vitest";
import { combinarComTeclado, pontuarDactilografia } from "./pontuacao";
import { NIVEIS } from "./index";

describe("pontuarDactilografia", () => {
  it("dá 100 com precisão total e velocidade acima do alvo", () => {
    const r = pontuarDactilografia({ corretos: 100, totalFonte: 100, minutos: 1, alvoWpm: 15 });
    expect(r.pontuacao).toBe(100);
    expect(r.wpm).toBe(20);
  });
  it("pesa 60 % precisão e 40 % velocidade", () => {
    const r = pontuarDactilografia({ corretos: 50, totalFonte: 100, minutos: 1, alvoWpm: 20 });
    // precisão 0,5 → 30; wpm 10/20 = 0,5 → 20
    expect(r.pontuacao).toBe(50);
  });
  it("não rebenta com zero", () => {
    expect(pontuarDactilografia({ corretos: 0, totalFonte: 0, minutos: 0, alvoWpm: 10 }).pontuacao).toBe(0);
  });
});

describe("combinarComTeclado", () => {
  it("devolve o texto quando a ronda foi saltada", () => {
    expect(combinarComTeclado(80, null)).toBe(80);
  });
  it("combina 75/25", () => {
    expect(combinarComTeclado(80, { corretos: 5, total: 10 })).toBe(73); // 60 + 12,5 → 73
  });
});

describe("textos da Notícia", () => {
  it("têm três textos por nível e cenário, com aspas curvas e fontes entre parênteses", () => {
    for (const cfg of Object.values(NIVEIS)) {
      for (const lista of Object.values(cfg.texto)) {
        expect(lista.length).toBe(3);
        for (const t of lista) {
          expect(t).not.toMatch(/[«»]/);
          expect(t).not.toMatch(/\[\d{4}\]/);
        }
      }
    }
  });
});
