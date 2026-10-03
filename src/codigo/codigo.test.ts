import { describe, expect, it } from "vitest";
import { codificar, descodificar } from "./codigo";

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
});
