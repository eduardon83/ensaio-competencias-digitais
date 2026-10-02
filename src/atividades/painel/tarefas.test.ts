import { describe, expect, it } from "vitest";
import { INICIAL, NIVEIS, TAREFAS, prepararTarefa, type Estado } from "./index";

// Estado em que quase todas as tarefas já estariam cumpridas (pior caso: o aluno mexeu em tudo antes).
const MEXIDO: Estado = {
  ...INICIAL,
  notificacoes: true, distrito: "porto", janelaAberta: false, pagina: 3, secao: "desporto", artigoAberto: false, usouCaminho: true,
  newsletter: true, tamanho: "grande", menuAberto: false, menuEscolha: "Contactos", acordeao: "horario", termos: true, enviado: true,
  rascunhoApagado: false, desfeito: true, volume: 50, pesquisa: "horário", pesquisaEnviada: "horário", ligacaoAberta: "sobre", data: "2026-10-15", separador: "cultura",
};

describe("O Painel", () => {
  it("todas as tarefas dos níveis existem", () => {
    for (const cfg of Object.values(NIVEIS)) for (const id of cfg.tarefas) expect(TAREFAS[id], id).toBeDefined();
  });
  it("nenhuma tarefa começa já cumprida, mesmo depois de o aluno mexer em tudo", () => {
    for (const t of Object.values(TAREFAS)) {
      for (const base of [INICIAL, MEXIDO, { ...MEXIDO, notificacoes: false, menuEscolha: "Sobre o jornal" }]) {
        expect(t.verificar(prepararTarefa(t, base)), t.id).toBe(false);
      }
    }
  });
});
