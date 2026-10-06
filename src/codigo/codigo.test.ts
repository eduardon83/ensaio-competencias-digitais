import { describe, expect, it } from "vitest";
import { codificar, descodificar, SLUGS } from "./codigo";
import { TODOS } from "../registo";

describe("códigos de sessão", () => {
  it("codifica e descodifica a mesma configuração", () => {
    const c = codificar({ nivel: 3, atividades: ["noticia", "painel", "matematica"], extensaoTempo: 1.5, identificacao: "numero" }, "TECK");
    expect(c.codigo).toMatch(/^TECK·[2-9A-HJKMNP-Z]{6}$/);
    const d = descodificar(c.codigo);
    expect(d).not.toBeNull();
    expect(d!.config).toEqual({ nivel: 3, atividades: ["noticia", "painel", "matematica"], extensaoTempo: 1.5, identificacao: "numero" });
    expect(d!.sessao).toBe("TECK");
  });
  it("aceita minúsculas, espaços e separadores", () => {
    const c = codificar({ nivel: 1, atividades: ["paginacao"], extensaoTempo: 1, identificacao: "nenhuma" }, "ABCD");
    const escrito = c.codigo.toLowerCase().replace("·", " - ");
    expect(descodificar(escrito)?.codigo).toBe(c.codigo);
  });
  it("rejeita códigos com erro de dígito", () => {
    const c = codificar({ nivel: 5, atividades: ["teclas", "encontra"], extensaoTempo: 2, identificacao: "alcunha" }, "WXYZ");
    const estragado = c.codigo.slice(0, 5) + (c.codigo[5] === "A" ? "B" : "A") + c.codigo.slice(6);
    expect(descodificar(estragado)).toBeNull();
    expect(descodificar("abc")).toBeNull();
    expect(descodificar("TEC0·AAAAAA")).toBeNull(); // 0 não pertence ao alfabeto
  });
  it("inclui testes de segurança e jogos (código com mais um símbolo) e mantém os antigos", () => {
    const cfg = { nivel: 4 as const, atividades: ["noticia", "fraude", "robo"], extensaoTempo: 1 as const, identificacao: "alcunha" as const };
    const c = codificar(cfg, "SAPA");
    expect(c.codigo).toMatch(/^SAPA·[2-9A-HJKMNP-Z]{7}$/);
    expect(descodificar(c.codigo)!.config).toEqual(cfg);
    const antigo = codificar({ nivel: 2, atividades: ["painel"], extensaoTempo: 1, identificacao: "numero" }, "QRDX");
    expect(antigo.codigo).toMatch(/·[2-9A-HJKMNP-Z]{6}$/);
  });
  it("os códigos já distribuídos continuam iguais", () => {
    // Código gerado pela versão anterior (operadores de bits): tem de dar o mesmo nos dois sentidos.
    const ANTIGO = "SAPA·4D9A4VV";
    expect(codificar({ nivel: 4, atividades: ["noticia", "fraude", "robo"], extensaoTempo: 1, identificacao: "alcunha" }, "SAPA").codigo).toBe(ANTIGO);
    expect(descodificar(ANTIGO)!.config).toEqual({ nivel: 4, atividades: ["noticia", "fraude", "robo"], extensaoTempo: 1, identificacao: "alcunha" });
  });
  it("cada atividade, teste e jogo tem uma posição e todos juntos cabem num código", () => {
    for (const d of TODOS.filter((a) => a.disponivel)) expect(SLUGS, d.slug).toContain(d.slug);
    const cfg = { nivel: 5 as const, atividades: [...SLUGS], extensaoTempo: 2 as const, identificacao: "alcunha" as const };
    const c = codificar(cfg, "TUDA");
    expect(c.codigo).toMatch(/^TUDA·[2-9A-HJKMNP-Z]{6,8}$/);
    expect(descodificar(c.codigo)!.config).toEqual(cfg);
    for (const s of ["privacidade", "publicos", "familia"]) expect(descodificar(codificar({ ...cfg, atividades: [s] }, "NEVA").codigo)!.config.atividades).toEqual([s]);
  });
});
