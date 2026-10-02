import { describe, expect, it } from "vitest";
import { INICIAL, NIVEIS, criarTarefas, gerarParametros, prepararTarefa, sortearTarefas, type Estado } from "./index";

// Estado em que quase todas as tarefas já estariam cumpridas (pior caso: o aluno mexeu em tudo antes).
const MEXIDO: Estado = {
  ...INICIAL,
  notificacoes: true, distrito: "porto", janelaAberta: false, pagina: 3, secao: "desporto", artigoAberto: false, usouCaminho: true,
  newsletter: true, tamanho: "grande", menuAberto: false, menuEscolha: "Contactos", acordeao: "horario", termos: true, enviado: true,
  rascunhoApagado: false, desfeito: true, volume: 50, pesquisa: "horário", pesquisaEnviada: "horário", ligacaoAberta: "sobre", data: "2026-10-15", separador: "cultura",
};

// Gerador determinista para os testes.
function semente(n: number) {
  let s = n;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

const ROT = {
  sitio: "", secoes: [{ id: "inicio", nome: "Início" }, { id: "desporto", nome: "Desporto" }, { id: "cultura", nome: "Cultura" }, { id: "escola", nome: "Escola" }],
  separadores: [{ id: "noticias", nome: "Notícias" }, { id: "cultura", nome: "Cultura" }, { id: "opiniao", nome: "Opinião" }],
  artigos: ["", "a", "b", "c"], distritoRotulo: "", rascunho: "", pesquisaAlvo: "", volumeRotulo: "Volume",
  acordeoes: [{ id: "horario", titulo: "Horário", texto: "" }, { id: "entregas", titulo: "Entregas", texto: "" }, { id: "fotos", titulo: "Fotografias", texto: "" }, { id: "assinaturas", titulo: "Assinaturas", texto: "" }],
  menu: ["Início", "Edições", "Contactos", "Arquivo", "Sobre o jornal"],
};

describe("O Painel", () => {
  it("todas as tarefas dos níveis existem", () => {
    const mapa = criarTarefas(gerarParametros(semente(1)), ROT);
    for (const cfg of Object.values(NIVEIS)) for (const id of cfg.pool) expect(mapa[id], id).toBeDefined();
  });

  it("nenhuma tarefa começa já cumprida, com quaisquer alvos e mesmo depois de o aluno mexer em tudo", () => {
    for (let k = 0; k < 50; k++) {
      const mapa = criarTarefas(gerarParametros(semente(k + 7)), ROT, k % 2 === 0);
      for (const t of Object.values(mapa)) {
        for (const base of [INICIAL, MEXIDO]) expect(t.verificar(prepararTarefa(t, base)), t.id).toBe(false);
      }
    }
  });

  it("sorteia o número certo de tarefas, sem repetir controlos", () => {
    for (const [nivel, cfg] of Object.entries(NIVEIS)) {
      for (let k = 0; k < 30; k++) {
        const ids = sortearTarefas(cfg, semente(k * 13 + Number(nivel)));
        expect(ids.length, `nível ${nivel}`).toBe(cfg.n);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids.includes("notificacoes") && ids.includes("notificacoes_off")).toBe(false);
        expect(ids.includes("newsletter") && ids.includes("newsletter_off")).toBe(false);
      }
    }
  });

  it("varia entre tentativas", () => {
    const a = sortearTarefas(NIVEIS[3], semente(1)).join();
    const b = sortearTarefas(NIVEIS[3], semente(2)).join();
    expect(a).not.toBe(b);
  });
});
