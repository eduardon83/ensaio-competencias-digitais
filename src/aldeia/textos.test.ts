import { describe, expect, it } from "vitest";
import "../textos/registo";
import { catalogo } from "../textos/sistema";
import { CIDADANIA } from "./cidadania/conteudo";
import { MISSOES } from "./nucleo/catalogo";
import { ALDEIA } from "./textos";

describe("textos da Aldeia no backoffice", () => {
  const cat = catalogo();
  const aldeia = cat.filter((e) => e.chave.startsWith("aldeia."));
  it("estão registados por id (sem índices nas chaves) e cabem nos limites do Worker", () => {
    expect(aldeia.length).toBeGreaterThan(400);
    expect(aldeia.filter((e) => /\.\d+(\.|$)/.test(e.chave))).toEqual([]);
    expect(cat.length).toBeLessThan(6000);
    expect(JSON.stringify(Object.fromEntries(cat.map((e) => [e.chave, e.padrao]))).length).toBeLessThan(1_500_000);
  });
  it("os textos dos emails e das missões de cidadania estão editáveis", () => {
    expect(aldeia.some((e) => e.chave === "aldeia.emails.resumo.botao")).toBe(true);
    expect(aldeia.some((e) => e.chave === "aldeia.cidadania.cid-votacao-festa.situacoes.c1.s1.certa")).toBe(true);
    expect(aldeia.some((e) => e.chave === "aldeia.tutorial.passos.dados.texto.c1")).toBe(true);
  });
  it("cada missão de cidadania tem conteúdo de 1.º ciclo com 3 situações e um briefing por missão de atividade", () => {
    for (const m of MISSOES.filter((x) => x.tipo === "cidadania")) {
      expect(CIDADANIA[m.id]).toBeTruthy();
      expect(Object.keys(CIDADANIA[m.id].situacoes.c1)).toEqual(["s1", "s2", "s3"]);
    }
    for (const m of MISSOES.filter((x) => x.tipo === "atividade")) expect(ALDEIA.missoes.briefings[m.id]).toBeTruthy();
  });
  it("sem travessões e com aspas curvas", () => {
    const tudo = aldeia.map((e) => e.padrao).join("\n");
    expect(tudo).not.toMatch(/[—–]/);
    expect(tudo).not.toMatch(/[«»]/);
    expect(tudo).not.toMatch(/(^|\s)"[^"]+"/);
  });
});
