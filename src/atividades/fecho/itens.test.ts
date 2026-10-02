import { describe, expect, it } from "vitest";
import { FRASES, gerarSecao } from "./itens";
import { semente } from "../../motor/aleatorio";

describe("Fecho de Edição: itens", () => {
  it("as frases certas são frases completas: maiúscula no início e ponto final", () => {
    for (const lista of Object.values(FRASES)) {
      for (const f of lista) {
        expect(f, f).toMatch(/^[A-ZÁÉÍÓÚ]/);
        expect(f, f).toMatch(/\.$/);
      }
    }
  });
  it("cada pergunta tem exatamente uma opção certa e opções todas diferentes", () => {
    for (const ctx of ["jornal", "laboratorio"] as const) {
      for (let k = 1; k <= 40; k++) {
        for (const it of gerarSecao(ctx, 8, semente(k))) {
          expect(new Set(it.opcoes).size, it.opcoes.join(" | ")).toBe(it.opcoes.length);
          expect(it.correta).toBeGreaterThanOrEqual(0);
          expect(it.correta).toBeLessThan(it.opcoes.length);
          if (it.pergunta.startsWith("Escolhe a frase")) {
            const certa = it.opcoes[it.correta];
            expect(Object.values(FRASES).flat()).toContain(certa);
            for (const o of it.opcoes) if (o !== certa) expect(Object.values(FRASES).flat()).not.toContain(o);
          }
        }
      }
    }
  });
});
