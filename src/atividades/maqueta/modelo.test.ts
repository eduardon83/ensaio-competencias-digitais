import { describe, expect, it } from "vitest";
import { semente } from "../../motor/aleatorio";
import {
  apagar, aproximar, CAMARA_INICIAL, colar, conjunto, criarCubo, criarMaqueta, dividir, encaixar, moverPara, orbitar, rodar, separar, SINAIS_INICIAIS, sinaisDaCamara, verificar, VISTAS, type ConfigMaqueta, type Maqueta,
} from "./modelo";

const CFG: ConfigMaqueta = { tarefas: [], ferramentas: [], ortografica: true, segundos: 360, aleatorio: true, caixoteColado: true };
const ob = (m: Maqueta, id: string) => m.objetos.find((o) => o.id === id)!;
const S = SINAIS_INICIAIS;

describe("A Maqueta: modelo", () => {
  it("as posições mudam e nada começa já arrumado", () => {
    const posicoes = new Set<string>();
    for (let s = 1; s <= 20; s++) {
      const m = criarMaqueta(CFG, semente(s));
      posicoes.add(JSON.stringify(ob(m, "telhado").pos));
      for (const t of ["telhado", "colar", "rodar", "dividir", "separar", "apagar", "criar"] as const) expect(verificar(t, m, S), `${t} semente ${s}`).toBe(false);
      expect(conjunto(m, ["caixote"]).sort()).toEqual(["banco", "caixote"]);
    }
    expect(posicoes.size).toBeGreaterThan(3);
  });
  it("telhado: arrastar perto do edifício encaixa em cima; colar junta os dois", () => {
    let m = criarMaqueta(CFG, semente(3));
    m = encaixar(moverPara(m, ["telhado"], "telhado", 0.4, -0.3));
    expect(verificar("telhado", m, S)).toBe(true);
    expect(ob(m, "telhado").pos.y).toBe(2);
    m = colar(m, ["telhado", "edificio"]);
    expect(verificar("colar", m, S)).toBe(true);
    // rodar o grupo mantém o telhado no sítio
    m = rodar(m, ["edificio"], m.anguloRodar);
    expect(verificar("rodar", m, S)).toBe(true);
    expect(verificar("telhado", m, S)).toBe(true);
  });
  it("apagar um objeto colado apaga o grupo; separado apaga só o caixote", () => {
    const m = criarMaqueta(CFG, semente(5));
    const tudo = apagar(m, ["caixote"]);
    expect(tudo.objetos.some((o) => o.id === "banco")).toBe(false);
    expect(verificar("apagar", tudo, S)).toBe(false);
    const sep = separar(m, ["caixote"]);
    expect(verificar("separar", sep, S)).toBe(true);
    const so = apagar(sep, ["caixote"]);
    expect(verificar("apagar", so, S)).toBe(true);
  });
  it("dividir o muro dá duas metades com o mesmo comprimento total", () => {
    const m = dividir(criarMaqueta(CFG, semente(2)), "muro");
    const partes = m.objetos.filter((o) => o.tipo === "muro");
    expect(partes).toHaveLength(2);
    expect(partes[0].tam.x + partes[1].tam.x).toBe(6);
    expect(verificar("dividir", m, S)).toBe(true);
  });
  it("criar cubo e terreno fixo", () => {
    const m = criarCubo(criarMaqueta(CFG, semente(1)));
    expect(verificar("criar", m, S)).toBe(true);
    expect(apagar(m, ["terreno"]).objetos.some((o) => o.id === "terreno")).toBe(true);
  });
  it("sinais da câmara: trás, aproximar, topo, frente ortográfica", () => {
    let s = sinaisDaCamara(CAMARA_INICIAL, S);
    expect(s).toEqual(S);
    s = sinaisDaCamara(orbitar(CAMARA_INICIAL, 145), s);
    expect(s.viuTras).toBe(true);
    s = sinaisDaCamara(aproximar(CAMARA_INICIAL, 0.6), s);
    expect(s.aproximou).toBe(true);
    s = sinaisDaCamara({ ...CAMARA_INICIAL, ...VISTAS.topo }, s);
    expect(s.viuTopo).toBe(true);
    expect(sinaisDaCamara({ ...CAMARA_INICIAL, ...VISTAS.frente }, S).viuOrtoFrente).toBe(false);
    expect(sinaisDaCamara({ ...CAMARA_INICIAL, ...VISTAS.frente, orto: true }, S).viuOrtoFrente).toBe(true);
  });
});

describe("A Maqueta: criar", () => {
  it("o cubo novo nunca fica em cima de outro objeto", () => {
    for (let s = 1; s <= 40; s++) {
      let m = criarMaqueta(CFG, semente(s));
      m = criarCubo(criarCubo(m));
      const cubos = m.objetos.filter((o) => o.tipo === "cubo");
      for (const c of cubos)
        for (const o of m.objetos.filter((k) => !k.fixo && k.id !== c.id)) {
          const meio = Math.max(o.tam.x, o.tam.z) / 2 + 0.5;
          expect(Math.abs(o.pos.x - c.pos.x) < meio && Math.abs(o.pos.z - c.pos.z) < meio, `semente ${s}: ${c.id} sobre ${o.id}`).toBe(false);
        }
    }
  });
});
