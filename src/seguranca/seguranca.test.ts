import { describe, expect, it } from "vitest";
import { semente } from "../motor/aleatorio";
import { MENSAGENS, sortearMensagens } from "./fraude";
import { avaliarSenha, SITUACOES } from "./boas-praticas";
import { PUBLICACOES, SITUACOES_REDES } from "./redes";
import { TEMAS } from "./conteudo";
import { TESTES_SEGURANCA } from ".";

const MARCAS_REAIS = /\b(cgd|millennium|novo banco|santander|bpi|ctt|mbway|mb way|netflix|amazon|paypal|worten|fnac|google|microsoft|apple|facebook|instagram|tiktok|whatsapp business)\b/i;

describe("Segurança: conteúdos", () => {
  it("três temas, cada um com um teste registado", () => {
    expect(TEMAS.map((t) => t.id)).toEqual(["boas-praticas", "fraude", "redes-sociais"]);
    for (const t of TEMAS) expect(TESTES_SEGURANCA[t.id].slug).toBe(t.teste.slug);
    for (const d of Object.values(TESTES_SEGURANCA)) expect(d.numero).toBeGreaterThanOrEqual(200);
  });
  it("os exemplos não usam marcas reais", () => {
    for (const m of MENSAGENS) expect(`${m.de} ${m.assunto ?? ""} ${m.corpo}`, m.id).not.toMatch(MARCAS_REAIS);
    for (const p of PUBLICACOES) expect(`${p.autor} ${p.texto}`, p.id).not.toMatch(MARCAS_REAIS);
  });
});

describe("O Email Desconfiado", () => {
  it("cada fraude tem sinais e as legítimas não", () => {
    for (const m of MENSAGENS) expect(m.sinais.length > 0, m.id).toBe(m.fraude);
  });
  it("o sorteio mistura legítimas e fraudes e não repete", () => {
    for (let s = 1; s <= 30; s++) {
      const ms = sortearMensagens(6, semente(s));
      expect(new Set(ms.map((m) => m.id)).size).toBe(6);
      expect(ms.some((m) => m.fraude)).toBe(true);
      expect(ms.some((m) => !m.fraude)).toBe(true);
    }
  });
});

describe("Boas práticas", () => {
  const cfg = { minimo: 12, exigeTipos: 3, proibeNome: true };
  it("a palavra-passe forte cumpre todas as regras e as fracas não", () => {
    expect(avaliarSenha("Bicicleta-azul-come-7", cfg, "Rita").every((r) => r.ok)).toBe(true);
    expect(avaliarSenha("123456", cfg, "Rita").every((r) => r.ok)).toBe(false);
    expect(avaliarSenha("Rita-2012-Rita!", cfg, "Rita").every((r) => r.ok)).toBe(false);
  });
  it("as situações têm a resposta certa distinta das outras", () => {
    for (const s of [...SITUACOES, ...SITUACOES_REDES]) expect(new Set(s.opcoes).size).toBe(s.opcoes.length);
  });
});

describe("Verdade ou Boato?", () => {
  it("há publicações dos três tipos, todas com fontes e explicação", () => {
    for (const v of ["verdadeiro", "falso", "enganador"]) expect(PUBLICACOES.filter((p) => p.veredicto === v).length).toBeGreaterThanOrEqual(2);
    for (const p of PUBLICACOES) {
      expect(p.fontes.length).toBeGreaterThan(0);
      if (p.chave === "imagem") expect(p.imagem).toBeDefined();
    }
  });
});
