import { describe, expect, it } from "vitest";
import { gerarArvore, gerarArtigo, gerarHistorico, gerarSeparadores, type No } from "./gerar";
import { semente } from "../../motor/aleatorio";

function contar(nos: No[]): number {
  return nos.reduce((s, n) => s + (n.tipo === "pasta" ? contar(n.filhos) : 1), 0);
}

describe("O Arquivo: geração", () => {
  it("gera árvores em todas as profundidades e cenários, sem nomes repetidos e com alvos válidos", () => {
    for (const ctx of ["jornal", "laboratorio"] as const) {
      for (let prof = 1; prof <= 5; prof++) {
        for (let k = 1; k <= 25; k++) {
          const a = gerarArvore(ctx, prof, semente(k * 31 + prof));
          const nomes: string[] = [];
          const ir = (nos: No[]) => nos.forEach((n) => (n.tipo === "pasta" ? ir(n.filhos) : nomes.push(n.nome)));
          ir(a.raiz);
          expect(new Set(nomes).size).toBe(nomes.length);
          expect(contar(a.raiz)).toBeLessThan(200);
          expect(nomes).toContain(a.alvo.no.nome);
          expect(a.mover!.no.id).not.toBe(a.renomear!.no.id);
        }
      }
    }
  });
  it("separadores, histórico e artigo são coerentes", () => {
    for (let k = 1; k <= 30; k++) {
      const s = gerarSeparadores("jornal", 2 + (k % 3), semente(k));
      expect(s.separadores.some((x) => x.id === s.alvo)).toBe(true);
      const h = gerarHistorico("laboratorio", 3 + (k % 4), semente(k));
      expect(h.alvoAtras).toBeLessThan(h.paginas.length - 1);
      expect(h.alvoFrente).toBeGreaterThanOrEqual(h.alvoAtras);
      const art = gerarArtigo("jornal", 1 + (k % 8), semente(k));
      expect(art.opcoes).toContain(art.correta);
      expect(new Set(art.opcoes).size).toBe(art.opcoes.length);
    }
  });
});
