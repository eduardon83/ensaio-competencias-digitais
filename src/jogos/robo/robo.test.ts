import { describe, expect, it } from "vitest";
import { semente } from "../../motor/aleatorio";
import { analisar, custo, executar, gerarMapa, textoPrograma, type ConfigRobo, type Instr } from "./gerar";

const NIVEIS: ConfigRobo[] = [
  { desafios: 2, lado: 5, segmentos: [2, 2], comprimento: [1, 3], itens: 0, obstaculos: 2, repetir: false, ate: false, escada: false },
  { desafios: 2, lado: 6, segmentos: [3, 3], comprimento: [1, 3], itens: 1, obstaculos: 4, repetir: false, ate: false, escada: false },
  { desafios: 2, lado: 6, segmentos: [2, 3], comprimento: [3, 5], itens: 1, obstaculos: 4, repetir: true, ate: false, escada: false },
  { desafios: 2, lado: 7, segmentos: [3, 3], comprimento: [1, 2], itens: 0, obstaculos: 6, repetir: true, ate: false, escada: true },
  { desafios: 2, lado: 7, segmentos: [3, 4], comprimento: [2, 5], itens: 2, obstaculos: 5, repetir: true, ate: true, escada: false },
];

describe("O Robô da Bancada", () => {
  it("a solução de referência resolve sempre o mapa", () => {
    NIVEIS.forEach((cfg, n) => {
      for (let s = 1; s <= 40; s++) {
        const m = gerarMapa(cfg, semente(s * 7 + n));
        const ex = executar(m.referencia, m);
        expect(ex.erro, `nível ${n + 1}, semente ${s}: ${textoPrograma(m.referencia)}`).toBeUndefined();
        expect(ex.sucesso).toBe(true);
        expect(m.itens).toHaveLength(cfg.itens);
        expect(m.obstaculos.some((o) => o.x === m.objetivo.x && o.y === m.objetivo.y)).toBe(false);
        if (!cfg.repetir) expect(m.referencia.some((i) => i.t === "repetir")).toBe(false);
      }
    });
  });
  it("as repetições encurtam a solução nos níveis com padrões", () => {
    const m = gerarMapa(NIVEIS[3], semente(3));
    expect(m.referencia.some((i) => i.t === "repetir")).toBe(true);
    expect(m.meta).toBe(custo(m.referencia));
  });
  it("erros: bater, apanhar no sítio errado, repetição por fechar", () => {
    const m = gerarMapa(NIVEIS[1], semente(9));
    const muitos: Instr[] = Array.from({ length: 10 }, () => ({ t: "avancar" }));
    expect(executar(muitos, m).erro).toMatch(/bateu/);
    expect(executar([{ t: "apanhar" }], m).erro).toMatch(/Não há nada/);
    expect("erro" in analisar([{ t: "repetir", n: 2 }, { t: "avancar" }])).toBe(true);
    expect("erro" in analisar([{ t: "fim" }])).toBe(true);
  });
  it("texto do programa", () => {
    expect(textoPrograma([{ t: "repetir", n: 3 }, { t: "avancar" }, { t: "fim" }, { t: "direita" }])).toBe("Repetir 3× [Avançar], Virar à direita");
  });
});
