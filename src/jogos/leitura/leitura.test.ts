import { describe, expect, it } from "vitest";
import { TEXTOS, TEXTO_PRATICA } from "./textos";
import { fraseDitado, gerarLacunas, palavraCerta, tokenizar, unidadesOrdenar } from "./gerar";
import { semente } from "../../motor/aleatorio";

const palavras = (t: string) => t.split(/\s+/).filter(Boolean).length;

describe("Biblioteca Viva: textos", () => {
  it("todos os autores estão em domínio público (morreram há mais de 70 anos)", () => {
    for (const t of [...TEXTOS, TEXTO_PRATICA]) expect(2026 - t.falecimento, t.id).toBeGreaterThan(70);
  });
  it("há pelo menos dois textos por nível e o tamanho médio cresce com o nível", () => {
    const medias = [1, 2, 3, 4, 5].map((n) => {
      const ts = TEXTOS.filter((t) => t.nivel === n);
      expect(ts.length, `nível ${n}`).toBeGreaterThanOrEqual(2);
      return ts.reduce((s, t) => s + palavras(t.texto), 0) / ts.length;
    });
    for (let i = 1; i < medias.length; i++) expect(medias[i], `média do nível ${i + 1}`).toBeGreaterThanOrEqual(medias[i - 1]);
  });
  it("as palavras do glossário aparecem no texto e as perguntas têm resposta válida", () => {
    for (const t of TEXTOS) {
      for (const k of Object.keys(t.glossario)) expect(t.texto, `${t.id}: ${k}`).toContain(k);
      expect(t.perguntas.length, t.id).toBeGreaterThanOrEqual(3);
      for (const q of t.perguntas) {
        expect(q.correta).toBeLessThan(q.opcoes.length);
        expect(new Set(q.opcoes).size, q.pergunta).toBe(q.opcoes.length);
      }
      expect(t.texto, t.id).not.toMatch(/[«»]/);
    }
  });
  it("os ids são únicos", () => {
    expect(new Set(TEXTOS.map((t) => t.id)).size).toBe(TEXTOS.length);
  });
});

describe("Biblioteca Viva: geração das rondas", () => {
  it("as palavras em falta são distintas, existem no texto e respeitam o número pedido", () => {
    for (const t of TEXTOS) {
      for (let k = 1; k <= 20; k++) {
        const n = [3, 4, 5, 6, 8][t.nivel - 1];
        const { partes, lacunas } = gerarLacunas(t.texto, n, semente(k));
        expect(lacunas.length, t.id).toBe(n);
        expect(new Set(lacunas.map((l) => l.certa.toLowerCase())).size).toBe(lacunas.length);
        for (const l of lacunas) expect(partes[l.indice].t).toBe(l.certa);
        expect(partes.map((p) => p.t).join("")).toBe(t.texto);
      }
    }
  });
  it("o bloco a ordenar é contínuo e a frase do ditado vem do texto", () => {
    for (const t of TEXTOS) {
      for (let k = 1; k <= 10; k++) {
        const u = unidadesOrdenar(t, 5, semente(k));
        expect(u.length).toBeGreaterThanOrEqual(Math.min(5, 2));
        for (const x of u) expect(t.texto).toContain(x);
        expect(t.texto).toContain(fraseDitado(t, semente(k)));
      }
    }
  });
  it("tokenizar mantém o texto todo e palavraCerta trata os acentos conforme o nível", () => {
    const t = "O Tejo desce de Espanha.";
    expect(tokenizar(t).map((p) => p.t).join("")).toBe(t);
    expect(palavraCerta("lagrimas", "lágrimas", false)).toBe(true);
    expect(palavraCerta("lagrimas", "lágrimas", true)).toBe(false);
    expect(palavraCerta(" Lágrimas ", "lágrimas", true)).toBe(true);
  });
});
