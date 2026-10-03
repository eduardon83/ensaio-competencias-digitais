import { describe, expect, it } from "vitest";
import { semente } from "../motor/aleatorio";
import { avaliarFormula, ErroFormula, expandirIntervalo, formatar, type Celulas } from "./orcamento/formula";
import { corrigir, folhaResolvida, gerarFolha, type ConfigOrcamento } from "./orcamento/gerar";
import { avaliarEmail, gerarEncomenda, MISSOES, type ConfigCorreio, type Email } from "./correio/avaliar";
import { gerarMisterio, pontuarProvas, type ConfigMisterio } from "./misterio/gerar";
import { gerarSala, pontuarSala } from "./sala/gerar";
import { valorCelula } from "./orcamento/formula";

describe("Orçamento: avaliador de fórmulas", () => {
  const c = { B2: 4.5, C2: 20, B3: 6, C3: 20, D2: "=B2*C2", D3: "=B3*C3", A1: "Despesa", G4: 10 };
  it("aritmética, precedência, parênteses e %", () => {
    expect(avaliarFormula("=1+2*3", {})).toBe(7);
    expect(avaliarFormula("=(1+2)*3", {})).toBe(9);
    expect(avaliarFormula("=-2+5", {})).toBe(3);
    expect(avaliarFormula("=200*10%", {})).toBe(20);
    expect(avaliarFormula("=2,5*2", {})).toBe(5);
  });
  it("referências e funções em português e inglês, com ; ou ,", () => {
    expect(avaliarFormula("=b2*c2", c)).toBe(90);
    expect(avaliarFormula("=SOMA(D2:D3)", c)).toBe(210);
    expect(avaliarFormula("=sum(D2,D3)", c)).toBe(210);
    expect(avaliarFormula("=MÉDIA(D2:D3)", c)).toBe(105);
    expect(avaliarFormula("=MEDIA(D2;D3)", c)).toBe(105);
    expect(avaliarFormula("=MÁXIMO(D2:D3)-MIN(D2:D3)", c)).toBe(30);
    expect(avaliarFormula("=SOMA(D2:D3)*(1-G4/100)", c)).toBe(189);
    expect(avaliarFormula("=SOMA(A1:A3)", c)).toBe(0); // texto ignorado nas funções
  });
  it("erros com código e mensagem", () => {
    const erro = (f: string, cel: Celulas = c) => {
      try {
        avaliarFormula(f, cel);
      } catch (e) {
        return (e as ErroFormula).codigo;
      }
      return "sem erro";
    };
    expect(erro("B2*C2")).toBe("#ERRO!");
    expect(erro("=B2/0")).toBe("#DIV/0!");
    expect(erro("=A1*2")).toBe("#VALOR!");
    expect(erro("=TOTAL(D2:D3)")).toBe("#NOME?");
    expect(erro("=D2:D3")).toBe("#VALOR!");
    expect(erro("=(1+2")).toBe("#ERRO!");
    expect(erro("=E1+1", { E1: "=E1+1" })).toBe("#CIRC!");
  });
  it("intervalos e formatação", () => {
    expect(expandirIntervalo("D2", "D4")).toEqual(["D2", "D3", "D4"]);
    expect(expandirIntervalo("A1", "B2")).toEqual(["A1", "A2", "B1", "B2"]);
    expect(formatar(12.5)).toBe("12,50");
    expect(formatar(90)).toBe("90");
  });
});

describe("Orçamento: folha e correção", () => {
  const cfg5: ConfigOrcamento = { despesas: 4, porAluno: true, desconto: true, restante: true, estatisticas: true, exemplos: false, exemploFeito: false };
  it("as soluções de referência dão valores coerentes e o orçamento chega", () => {
    for (let s = 1; s <= 30; s++) {
      const f = gerarFolha(cfg5, semente(s));
      expect(f.tarefas).toHaveLength(10);
      const res = folhaResolvida(f);
      for (const t of f.tarefas) expect(Number.isFinite(Number(valorCelula(t.celula, res))), t.celula).toBe(true);
      const restante = f.tarefas.find((t) => t.rotulo === "Fica do orçamento")!;
      expect(Number(valorCelula(restante.celula, res))).toBeGreaterThan(0);
    }
  });
  it("fórmula certa = certo; valor à mão = parcial; erros em cadeia não penalizam", () => {
    const f = gerarFolha(cfg5, semente(7));
    const total = f.tarefas.find((t) => t.rotulo === "Total")!;
    expect(corrigir(total, total.solucao, f).estado).toBe("certo");
    expect(corrigir(total, "=D2+D3+D4+D5", f).estado).toBe("certo");
    const esperado = corrigir(total, total.solucao, f).esperado;
    expect(corrigir(total, String(esperado).replace(".", ","), f).estado).toBe("parcial");
    expect(corrigir(total, "=SOMA(D2:D3)", f).estado).toBe("errado");
    expect(corrigir(total, "", f).estado).toBe("errado");
    expect(corrigir(total, `=${total.celula}+1`, f).estado).toBe("errado");
  });
  it("o nível 1 traz a primeira linha feita e menos tarefas", () => {
    const f = gerarFolha({ despesas: 3, porAluno: false, desconto: false, restante: false, estatisticas: false, exemplos: true, exemploFeito: true }, semente(3));
    expect(f.fixas.D2).toBe("=B2*C2");
    expect(f.tarefas.map((t) => t.celula)).toEqual(["D3", "D4", "D5"]);
  });
});

describe("Correio da Redação: grelha", () => {
  const cfg: ConfigCorreio = { cc: true, cco: true, anexo: true, informal: true, conteudo: 4, distratores: 5 };
  it("as missões têm contactos certos distintos e a lista inclui-os", () => {
    for (const m of MISSOES) {
      expect(new Set([m.para.email, m.cc.email, m.cco.email]).size, m.id).toBe(3);
      expect(m.distratores.map((d) => d.email)).not.toContain(m.para.email);
      expect(m.conteudo.length).toBeGreaterThanOrEqual(4);
    }
    for (let s = 1; s <= 20; s++) {
      const enc = gerarEncomenda(cfg, semente(s));
      const ends = enc.contactos.map((c) => c.email);
      expect(ends).toContain(enc.missao.para.email);
      expect(ends).toContain(enc.missao.cco.email);
      expect(enc.anexos).toContain(enc.missao.anexo);
    }
  });
  it("um email modelo cumpre todos os critérios", () => {
    const enc = gerarEncomenda(cfg, semente(11));
    const m = enc.missao;
    const corpo = [`Ex.mo(a) Senhor(a) ${m.para.nome},`, "", m.conteudo.map((p) => p.chaves[0]).join(", ") + ".", "", "Com os melhores cumprimentos,", enc.assinatura].join("\n");
    const e: Email = { para: m.para.email, cc: m.cc.email, cco: m.cco.email, assunto: m.exemploAssunto, corpo, anexos: [m.anexo] };
    const r = avaliarEmail(e, enc, cfg);
    expect(r.filter((c) => !c.ok).map((c) => c.criterio)).toEqual([]);
  });
  it("deteta destinatários trocados, informalidade e anexos errados", () => {
    const enc = gerarEncomenda(cfg, semente(4));
    const m = enc.missao;
    const e: Email = { para: `${m.para.email}; ${m.cc.email}`, cc: "", cco: "", assunto: "", corpo: "Olá!!\nmanda isso tb 😀\nbjs", anexos: [m.outrosAnexos[0]] };
    const falhas = avaliarEmail(e, enc, cfg).filter((c) => !c.ok).map((c) => c.criterio);
    for (const k of ["Destinatário (Para)", "Com conhecimento (CC)", "Cópia oculta (CCO)", "Assunto claro", "Saudação formal", "Despedida", "Assinatura", "Anexo", "Linguagem adequada"]) expect(falhas).toContain(k);
  });
  it("números no conteúdo têm de aparecer como números inteiros (16 não conta como 6)", () => {
    const enc = { ...gerarEncomenda(cfg, semente(1)), missao: MISSOES.find((x) => x.id === "falta")! };
    const base: Email = { para: "", cc: "", cco: "", assunto: "", corpo: "", anexos: [] };
    const dia = (corpo: string) => avaliarEmail({ ...base, corpo }, enc, cfg).find((c) => c.criterio.includes("dia"))!.ok;
    expect(dia("faltei no dia 16")).toBe(false);
    expect(dia("faltei no dia 6.")).toBe(true);
  });
});

describe("Quem Apagou o Ficheiro?: coerência", () => {
  const niveis: ConfigMisterio[] = [
    { suspeitos: 3, motivo: false, troca: "nunca", doisHorarios: false, fotografias: false, ficheiroParecido: false },
    { suspeitos: 4, motivo: true, troca: "sempre", doisHorarios: false, fotografias: false, ficheiroParecido: false },
    { suspeitos: 5, motivo: true, troca: "sempre", doisHorarios: true, fotografias: true, ficheiroParecido: true },
  ];
  it("o culpado é quem estava no computador do registo; provas essenciais coerentes", () => {
    for (const cfg of niveis)
      for (let s = 1; s <= 40; s++) {
        const c = gerarMisterio(cfg, s % 2 ? "jornal" : "laboratorio", semente(s));
        expect(c.suspeitos).toContain(c.culpado);
        expect(new Set(c.suspeitos).size).toBe(cfg.suspeitos);
        const ess = c.provas.filter((p) => p.peso === "essencial");
        expect(ess.some((p) => p.fonte === "registo" && p.texto.includes(c.pc) && p.texto.includes(c.ficheiro))).toBe(true);
        const reserva = ess.find((p) => p.fonte === "reservas")!;
        expect(reserva.texto).toContain(c.pc);
        if (cfg.troca === "sempre") {
          const troca = ess.find((p) => p.fonte === "mensagens")!;
          expect(troca.texto).toContain(c.culpado);
          expect(reserva.texto).not.toContain(c.culpado);
        } else expect(reserva.texto.endsWith(c.culpado)).toBe(true);
        // só um registo de eliminação do ficheiro do caso
        expect(c.provas.filter((p) => p.fonte === "registo" && p.texto.includes(`apagou “${c.ficheiro}”`))).toHaveLength(1);
      }
  });
  it("pontuação das provas: essenciais contam, irrelevantes penalizam, apoio é neutro", () => {
    const c = gerarMisterio(niveis[2], "jornal", semente(5));
    const id = (peso: string) => c.provas.filter((p) => p.peso === peso).map((p) => p.id);
    expect(pontuarProvas(c.provas, new Set(id("essencial")))).toBe(1);
    expect(pontuarProvas(c.provas, new Set([...id("essencial"), ...id("apoio")]))).toBe(1);
    expect(pontuarProvas(c.provas, new Set([...id("essencial"), id("irrelevante")[0]]))).toBeCloseTo(2 / 3);
    expect(pontuarProvas(c.provas, new Set(id("irrelevante")))).toBe(0);
  });
});

describe("A Sala Trancada: enigmas", () => {
  it("cada enigma dá um algarismo de 1 a 9 que se encontra nos dados", () => {
    for (let s = 1; s <= 60; s++) {
      const es = gerarSala({ enigmas: 5, nota: true, dificil: s % 2 === 0, contagemCertos: false }, semente(s));
      expect(new Set(es.map((e) => e.app)).size).toBe(5);
      for (const e of es) {
        expect(e.digito).toBeGreaterThanOrEqual(1);
        expect(e.digito).toBeLessThanOrEqual(9);
        const d = e.dados;
        if (d.app === "ficheiros") {
          if (e.pista.includes("PDF")) expect(d.ficheiros.filter((f) => f.pasta === "Trabalhos" && f.nome.endsWith(".pdf")).length).toBe(e.digito);
          else expect(Number(d.ficheiros.find((f) => f.nome === "chave.txt")!.data.slice(0, 2))).toBe(e.digito);
        }
        if (d.app === "folha") {
          const col = d.linhas.map((l) => l[1]);
          const v = typeof col[0] === "number" ? (col as number[]).reduce((a, b) => a + b, 0) : col.filter((x) => x === "Sim").length;
          expect(v).toBe(e.digito);
        }
        if (d.app === "email" && e.pista.includes("anexos")) expect(d.mensagens.find((m) => m.de === "Direção da Escola")!.anexos).toBe(e.digito);
        if (d.app === "nota") expect(d.opcoes[d.correta].length).toBeGreaterThanOrEqual(16);
      }
    }
  });
  it("pontuação", () => {
    expect(pontuarSala(true, 4, 4, 0, 0, 0)).toBe(100);
    expect(pontuarSala(true, 4, 4, 2, 1, 1)).toBe(65);
    expect(pontuarSala(true, 4, 4, 9, 2, 3)).toBe(50);
    expect(pontuarSala(false, 2, 4, 0, 3, 0)).toBe(23);
    expect(pontuarSala(false, 0, 4, 2, 3, 0)).toBe(0);
  });
});
