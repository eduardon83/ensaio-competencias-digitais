import { describe, expect, it } from "vitest";
import "./registo";
import { aplicar, catalogo } from "./sistema";
import { PAGINAS } from "./paginas";
import { CONTEXTOS } from "../contextos";
import { MENSAGENS } from "../seguranca/fraude";

describe("Textos editáveis", () => {
  const cat = catalogo();
  it("há textos de todos os grupos e as chaves são únicas", () => {
    const grupos = new Map<string, number>();
    for (const e of cat) grupos.set(e.grupo, (grupos.get(e.grupo) ?? 0) + 1);
    console.log("textos editáveis por grupo:", Object.fromEntries(grupos), "total", cat.length);
    for (const g of ["Páginas", "Cenários", "Geral", "Atividades", "Segurança", "Jogos"]) expect(grupos.get(g) ?? 0, g).toBeGreaterThan(5);
    expect(new Set(cat.map((e) => e.chave)).size).toBe(cat.length);
  });
  it("identificadores e respostas automáticas ficam de fora", () => {
    const chaves = cat.map((e) => e.chave);
    expect(chaves.some((c) => /\.(id|slug|veredicto|email|correta|para|icone)$/.test(c))).toBe(false);
    expect(chaves.some((c) => /\.sinais\./.test(c))).toBe(false);
    expect(cat.every((e) => /\p{L}/u.test(e.padrao))).toBe(true);
    expect(cat.some((e) => /^[a-z0-9_\-./]+$/.test(e.padrao))).toBe(false);
  });
  it("aplicar muda os objetos e aplicar vazio repõe os originais", () => {
    const original = PAGINAS.inicio.titulo;
    const brief = CONTEXTOS.jornal.briefs.noticia;
    const m0 = MENSAGENS[0].corpo;
    aplicar({ "paginas.inicio.titulo": "Título novo", "contextos.jornal.briefs.noticia": "Brief novo", "seguranca.mensagens.0.corpo": "Corpo novo", "chave.inexistente": "x" });
    expect(PAGINAS.inicio.titulo).toBe("Título novo");
    expect(CONTEXTOS.jornal.briefs.noticia).toBe("Brief novo");
    expect(MENSAGENS[0].corpo).toBe("Corpo novo");
    aplicar({});
    expect(PAGINAS.inicio.titulo).toBe(original);
    expect(CONTEXTOS.jornal.briefs.noticia).toBe(brief);
    expect(MENSAGENS[0].corpo).toBe(m0);
  });
});
