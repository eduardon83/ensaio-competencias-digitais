import { describe, expect, it } from "vitest";
import { agregar, FILTROS_INICIAIS, inicioAnoLetivo, normalizar, parametros, paraCsv, passa, periodoPorId, periodos, type LinhaTentativa } from "./observatorio";

const hoje = new Date("2026-10-06T12:00:00Z");
const linha = (data: string, extra: Partial<LinhaTentativa> = {}): LinhaTentativa => ({ data, sessao: "s1", atividade: "noticia", nivel: 2, pontuacao: 80, dispositivo: "desktop", contexto: "jornal", formato: "mosaico", origem: "treino", ...extra });

describe("Observatório: períodos", () => {
  it("o ano letivo começa a 1 de setembro", () => {
    expect(inicioAnoLetivo(new Date("2026-08-31T12:00:00Z"))).toBe(2025);
    expect(inicioAnoLetivo(new Date("2026-09-01T12:00:00Z"))).toBe(2026);
  });
  it("tem os períodos recentes, o ano letivo atual e os 10 anteriores", () => {
    const ps = periodos(hoje);
    expect(ps.map((p) => p.id).slice(0, 4)).toEqual(["tudo", "3m", "6m", "12m"]);
    const letivos = ps.filter((p) => p.id.startsWith("letivo-"));
    expect(letivos.length).toBe(11);
    expect(letivos[0]).toMatchObject({ id: "letivo-2026", nome: "Ano letivo 2026/2027 (atual)", desde: "2026-09-01", ate: "2026-10-06" });
    expect(letivos[10]).toMatchObject({ id: "letivo-2016", desde: "2016-09-01", ate: "2017-08-31" });
    expect(periodoPorId("3m", hoje)).toMatchObject({ desde: "2026-07-06", ate: "2026-10-06" });
    expect(periodoPorId("desconhecido", hoje).id).toBe("tudo");
  });
  it("só envia os filtros preenchidos", () => {
    expect(parametros(FILTROS_INICIAIS, hoje)).toEqual({});
    expect(parametros({ ...FILTROS_INICIAIS, periodo: "letivo-2025", nivel: "3" }, hoje)).toEqual({ desde: "2025-09-01", ate: "2026-08-31", nivel: "3" });
  });
});

describe("Observatório: filtros e agregação", () => {
  it("filtra por datas (inclusivas) e por campos", () => {
    const q = { desde: "2026-09-01", ate: "2026-09-30", nivel: "2" };
    expect(passa(linha("2026-09-01T00:10:00Z"), q)).toBe(true);
    expect(passa(linha("2026-09-30T23:59:00Z"), q)).toBe(true);
    expect(passa(linha("2026-10-01T00:00:00Z"), q)).toBe(false);
    expect(passa(linha("2026-09-10T00:00:00Z", { nivel: 3 }), q)).toBe(false);
  });
  it("calcula médias, contagens, meses e esconde grupos abaixo do limiar", () => {
    const ts = [...Array.from({ length: 20 }, (_, i) => linha(`2026-09-${String(1 + (i % 28)).padStart(2, "0")}T10:00:00Z`, { sessao: `s${i % 3}` })), linha("2026-10-02T10:00:00Z", { atividade: "fraude", pontuacao: 40, dispositivo: "tablet" })];
    const a = agregar(ts, [{ data: "2026-09-05T10:00:00Z", ciclo: "c3", pontuacao: 70 }], {}, 20, false, hoje);
    expect(a.total_tentativas).toBe(21);
    expect(a.por_atividade).toEqual({ noticia: { n: 20, media: 80 } });
    expect(a.por_dispositivo).toEqual({ desktop: 20 });
    expect(a.por_mes).toEqual({ "2026-09": 20 });
    expect(a.media_geral).toBe(78);
    expect(a.sessoes).toBe(3); // s0, s1, s2 (a linha extra também é s1)
    expect(a.testes_por_ciclo).toEqual({});
    const completo = agregar(ts, [], { atividade: "fraude" }, 1, true, hoje);
    expect(completo.por_atividade).toEqual({ fraude: { n: 1, media: 40 } });
    expect(completo.por_dia).toEqual({ "2026-10-02": 1 });
  });
  it("em modo público, oculta os totais abaixo do limiar", () => {
    const a = agregar([linha("2026-09-01T10:00:00Z")], [], {}, 20, false, hoje);
    expect(a).toMatchObject({ total_tentativas: 0, sessoes: 0, abaixo_limiar: true, media_geral: null });
    expect(agregar([linha("2026-09-01T10:00:00Z")], [], {}, 1, true, hoje)).toMatchObject({ total_tentativas: 1, abaixo_limiar: false });
  });
  it("completa respostas antigas do ponto de recolha", () => {
    const a = normalizar({ por_dia: { "2026-09-01": 3, "2026-09-02": 2, "2026-10-01": 1 } });
    expect(a.por_mes).toEqual({ "2026-09": 5, "2026-10": 1 });
    expect(a.media_geral).toBeNull();
  });
});

describe("Observatório: CSV", () => {
  it("usa ponto e vírgula, BOM e aspas quando é preciso", () => {
    const a = agregar([linha("2026-09-01T10:00:00Z")], [], {}, 1, true, hoje);
    const csv = paraCsv(a, ["Período: Todo o período"], () => 'Nome; com "aspas"', (_c, v) => v);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain('"Nome; com ""aspas"""');
    expect(csv).toContain("Tentativas;1");
  });
});
