// ─── Dados: sessão anónima e tentativas ──────────────────────────────────────
// Implementação local (localStorage). A interface `Repositorio` é o contrato a cumprir pela versão
// Supabase (tabelas sessions / attempts / test_runs da especificação). Não guardamos IP, impressão
// digital do dispositivo nem analítica de terceiros: só o que explica o resultado.

import type { Contexto, Formato } from "../preferencias/preferencias";
import type { Ciclo, Metricas, Nivel } from "../motor/tipos";
import { enviar } from "./telemetria";

export type Origem = "teste" | "treino" | "codigo";

export interface Tentativa {
  id: string;
  sessaoId: string;
  atividade: string; // slug
  nivel: Nivel;
  pontuacao: number;
  duracaoMs: number;
  metricas: Metricas;
  origem: Origem;
  contexto: Contexto;
  formato: Formato;
  extensaoTempo: number;
  dispositivo: "desktop" | "tablet" | "telemovel";
  concluidaEm: string; // ISO
  codigo?: string; // sessão do professor (XXXX), quando a tentativa vem de um código
  aluno?: string; // identificador pedido pelo professor (número de turma ou alcunha)
}

export interface ResultadoTeste {
  id: string;
  sessaoId: string;
  ciclo: Ciclo | "codigo";
  pontuacaoGlobal: number;
  faixa: string;
  porDominio: Record<string, number>;
  tentativas: string[]; // ids
  concluidoEm: string;
  codigo?: string;
  aluno?: string;
}

export interface Estatisticas {
  totalTentativas: number;
  totalTestes: number;
  porNivel: Record<number, number>;
  mediaPorAtividade: Record<string, { media: number; n: number }>;
  porDispositivo: Record<string, number>;
}

export interface Repositorio {
  sessaoId(): string;
  guardarTentativa(t: Omit<Tentativa, "id" | "sessaoId" | "concluidaEm" | "dispositivo">): Tentativa;
  listarTentativas(): Tentativa[];
  melhor(atividade: string, nivel: Nivel): Tentativa | undefined;
  guardarTeste(r: Omit<ResultadoTeste, "id" | "sessaoId" | "concluidoEm">): ResultadoTeste;
  listarTestes(): ResultadoTeste[];
  estatisticas(): Estatisticas;
  apagarTudo(): void;
}

const CHAVE_SESSAO = "ecd.sessao.v1";
const CHAVE_TENTATIVAS = "ecd.tentativas.v1";
const CHAVE_TESTES = "ecd.testes.v1";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function ler<T>(chave: string, porOmissao: T): T {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : porOmissao;
  } catch {
    return porOmissao;
  }
}
function escrever(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* sem persistência */
  }
}

export function classeDispositivo(): Tentativa["dispositivo"] {
  if (typeof window === "undefined") return "desktop";
  const l = window.innerWidth;
  const toque = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (toque && l < 700) return "telemovel";
  if (toque && l < 1100) return "tablet";
  return "desktop";
}

export const repositorioLocal: Repositorio = {
  sessaoId() {
    let id = ler<string | null>(CHAVE_SESSAO, null);
    if (!id) {
      id = uuid();
      escrever(CHAVE_SESSAO, id);
    }
    return id;
  },
  guardarTentativa(t) {
    const todas = ler<Tentativa[]>(CHAVE_TENTATIVAS, []);
    const nova: Tentativa = { ...t, id: uuid(), sessaoId: this.sessaoId(), dispositivo: classeDispositivo(), concluidaEm: new Date().toISOString() };
    todas.push(nova);
    escrever(CHAVE_TENTATIVAS, todas);
    enviar("tentativa", {
      sessao: nova.sessaoId,
      atividade: nova.atividade,
      nivel: nova.nivel,
      pontuacao: nova.pontuacao,
      duracaoS: Math.round(nova.duracaoMs / 1000),
      origem: nova.origem,
      contexto: nova.contexto,
      formato: nova.formato,
      extensaoTempo: nova.extensaoTempo,
      dispositivo: nova.dispositivo,
      metricas: nova.metricas,
      codigo: nova.codigo,
      aluno: nova.aluno,
    });
    return nova;
  },
  listarTentativas() {
    return ler<Tentativa[]>(CHAVE_TENTATIVAS, []);
  },
  melhor(atividade, nivel) {
    return this.listarTentativas()
      .filter((t) => t.atividade === atividade && t.nivel === nivel)
      .sort((a, b) => b.pontuacao - a.pontuacao)[0];
  },
  guardarTeste(r) {
    const todos = ler<ResultadoTeste[]>(CHAVE_TESTES, []);
    const novo: ResultadoTeste = { ...r, id: uuid(), sessaoId: this.sessaoId(), concluidoEm: new Date().toISOString() };
    todos.push(novo);
    escrever(CHAVE_TESTES, todos);
    enviar("teste", { sessao: novo.sessaoId, ciclo: novo.ciclo, pontuacaoGlobal: novo.pontuacaoGlobal, faixa: novo.faixa, porDominio: novo.porDominio, codigo: novo.codigo, aluno: novo.aluno });
    return novo;
  },
  listarTestes() {
    return ler<ResultadoTeste[]>(CHAVE_TESTES, []);
  },
  estatisticas() {
    const ts = this.listarTentativas();
    const porNivel: Record<number, number> = {};
    const porDispositivo: Record<string, number> = {};
    const soma: Record<string, { total: number; n: number }> = {};
    for (const t of ts) {
      porNivel[t.nivel] = (porNivel[t.nivel] ?? 0) + 1;
      porDispositivo[t.dispositivo] = (porDispositivo[t.dispositivo] ?? 0) + 1;
      const s = (soma[t.atividade] ??= { total: 0, n: 0 });
      s.total += t.pontuacao;
      s.n += 1;
    }
    const mediaPorAtividade: Record<string, { media: number; n: number }> = {};
    for (const [k, v] of Object.entries(soma)) mediaPorAtividade[k] = { media: Math.round(v.total / v.n), n: v.n };
    return { totalTentativas: ts.length, totalTestes: this.listarTestes().length, porNivel, mediaPorAtividade, porDispositivo };
  },
  apagarTudo() {
    try {
      localStorage.removeItem(CHAVE_TENTATIVAS);
      localStorage.removeItem(CHAVE_TESTES);
      localStorage.removeItem(CHAVE_SESSAO);
      localStorage.removeItem("ecd.percurso.v1");
    } catch {
      /* nada */
    }
  },
};

// ─── Progresso do percurso de teste (pausa/retoma no mesmo dispositivo) ──────
export interface Percurso {
  ciclo: string; // chave do percurso: ciclo ("c3") ou sessão de professor ("codigo:XXXX")
  indice: number; // próxima atividade
  tentativas: string[]; // ids das tentativas já feitas
  iniciadoEm: string;
}
export function lerPercurso(ciclo: string): Percurso | null {
  const p = ler<Percurso | null>("ecd.percurso.v1", null);
  return p && p.ciclo === ciclo ? p : null;
}
export function guardarPercurso(p: Percurso | null) {
  if (p) escrever("ecd.percurso.v1", p);
  else {
    try {
      localStorage.removeItem("ecd.percurso.v1");
    } catch {
      /* nada */
    }
  }
}
