import { describe, expect, it } from "vitest";
import { caminho, deEcra, direcaoDoPasso, estadoEdificio, grelhaPassagem, ordemLeitura, P, portaCasa, portaEdificio } from "./mundo";
import { ID_EDIFICIOS, type ConfigTurma } from "../nucleo/catalogo";
import { estadoCapitulos } from "../nucleo/regras";

const CONFIG: ConfigTurma = { nome: "", lugares: 32, nivel: 2, extensao: "completa", escolha: [], dimensoes: ["direitos", "democracia", "sustentabilidade", "financeira"], identificacao: ["anonimo"], ritmo: "livre", tempo: 1, dataFim: "2027-06-30", colecao: "atuais" };

describe("mundo da aldeia", () => {
  const g = grelhaPassagem();
  it("a projeção e a inversa batem certo", () => {
    const [x, y] = P(12.5, 7.25);
    const [i, j] = deEcra(x, y);
    expect(i).toBeCloseTo(12.5);
    expect(j).toBeCloseTo(7.25);
  });
  it("há caminho da casa de cada lote até à porta de cada edifício", () => {
    const portas = ID_EDIFICIOS.map((id) => portaEdificio(g, id));
    for (const lugar of [1, 8, 17, 32]) {
      const casa = portaCasa(g, lugar);
      expect(g[casa[1]][casa[0]]).toBe(true);
      for (const p of portas) {
        expect(g[p[1]][p[0]]).toBe(true);
        const c = caminho(g, casa, p);
        expect(c.length).toBeGreaterThan(0);
        expect(c[c.length - 1]).toEqual(p);
      }
    }
  });
  it("direções diagonais dos sprites", () => {
    expect(direcaoDoPasso(1, 0)).toBe("se");
    expect(direcaoDoPasso(0, 1)).toBe("sw");
    expect(direcaoDoPasso(0, -1)).toBe("ne");
    expect(direcaoDoPasso(-1, 0)).toBe("nw");
  });
  it("estados: núcleo aberto, expansão em obras até abrir, missão nova no capítulo aberto", () => {
    const caps = estadoCapitulos(CONFIG, [0], { progresso: {} });
    expect(estadoEdificio("escola", caps, {}).estado).toBe("aberto");
    expect(estadoEdificio("escola", caps, {}).missao).toBe(true); // a prática do capítulo 0
    expect(estadoEdificio("biblioteca", caps, {}).estado).toBe("obras");
    expect(estadoEdificio("biblioteca", caps, {}).abreNo).toBe(4);
    expect(estadoEdificio("museu", caps, {}).estado).toBe("obras");
  });
  it("Tab percorre os 12 edifícios", () => {
    expect(new Set(ordemLeitura()).size).toBe(12);
  });
});

describe("banda do briefing", () => {
  it("os centros dos edifícios batem com a cena", async () => {
    const { CENTRO_EDIFICIO } = await import("../arte/pixel");
    const cena = (await import("../mundo/cena.json")).default;
    for (const e of cena.edificios) {
      const [x, y] = P(e.i + e.w / 2, e.j + e.d / 2);
      expect(CENTRO_EDIFICIO[e.id]).toEqual([Math.round(x), Math.round(y - 40)]);
    }
  });
});
