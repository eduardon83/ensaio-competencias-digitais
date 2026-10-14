// ─── Aldeia Digital · sessões guardadas neste navegador ──────────────────────
// Aluno: a chave do dispositivo (aleatória, 128 bits) por turma, para "Continuar como…". "Sair deste computador" apaga-a.
// Professor: as turmas criadas aqui (código da turma e nome; nunca o código do professor) e o token do painel
// (sessionStorage, 2 horas, sem cookies).
import type { Op } from "../nucleo/esquema";
import type { VistaAluno } from "../nucleo/modelo";

export interface SessaoAluno {
  codigo: string;
  id: string;
  chave: string;
  nome: string;
  fato: string;
  local: boolean;
  em: string;
}

const CHAVE_SESSOES = "ecd.aldeia.sessoes.v1";
const ler = <T,>(k: string, omissao: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : omissao;
  } catch {
    return omissao;
  }
};
const escrever = (k: string, v: unknown) => {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* sem armazenamento: a sessão dura só esta página */
  }
};

export function sessoesAluno(): Record<string, SessaoAluno> {
  return ler<Record<string, SessaoAluno>>(CHAVE_SESSOES, {});
}
export function sessaoAluno(codigo: string): SessaoAluno | null {
  return sessoesAluno()[codigo] ?? null;
}
export function guardarSessaoAluno(s: SessaoAluno) {
  escrever(CHAVE_SESSOES, { ...sessoesAluno(), [s.codigo]: s });
}
export function apagarSessaoAluno(codigo: string) {
  const todas = sessoesAluno();
  delete todas[codigo];
  escrever(CHAVE_SESSOES, todas);
  escrever(`ecd.aldeia.vista.${codigo}`, null);
  escrever(`ecd.aldeia.fila.${codigo}`, null);
  escrever(`ecd.aldeia.vistos.${codigo}`, null);
}

/** Última vista recebida (para continuar sem rede). */
export function vistaGuardada(codigo: string): VistaAluno | null {
  return ler<VistaAluno | null>(`ecd.aldeia.vista.${codigo}`, null);
}
export function guardarVista(codigo: string, v: VistaAluno) {
  escrever(`ecd.aldeia.vista.${codigo}`, v);
}

/** Operações por enviar (fila: sobrevive a recarregar a página). */
export function filaGuardada(codigo: string): Op[] {
  return ler<Op[]>(`ecd.aldeia.fila.${codigo}`, []);
}
export function guardarFila(codigo: string, ops: Op[]) {
  escrever(`ecd.aldeia.fila.${codigo}`, ops.length ? ops : null);
}

/** Momentos da história já vistos (diálogos de abertura de capítulo, chegadas, celebrações). Só deste navegador. */
export function vistos(codigo: string): string[] {
  return ler<string[]>(`ecd.aldeia.vistos.${codigo}`, []);
}
export function marcarVisto(codigo: string, chave: string) {
  const l = vistos(codigo);
  if (!l.includes(chave)) escrever(`ecd.aldeia.vistos.${codigo}`, [...l, chave].slice(-200));
}

// ── Professor ────────────────────────────────────────────────────────────────
export interface TurmaGuardada {
  codigo: string;
  nome: string;
  criadoEm: string;
  local: boolean;
}
const CHAVE_TURMAS = "ecd.professor.aldeias.v1";
export function turmasGuardadas(): TurmaGuardada[] {
  return ler<TurmaGuardada[]>(CHAVE_TURMAS, []);
}
export function guardarTurma(t: TurmaGuardada) {
  escrever(CHAVE_TURMAS, [t, ...turmasGuardadas().filter((x) => x.codigo !== t.codigo)].slice(0, 50));
}
export function esquecerTurma(codigo: string) {
  escrever(CHAVE_TURMAS, turmasGuardadas().filter((x) => x.codigo !== codigo));
}

const CHAVE_TOKEN = "ecd.aldeia.painel.v1";
export function tokenPainel(): { token: string; turma: string } | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(CHAVE_TOKEN) ?? "null") as { token: string; turma: string; ate: number } | null;
    return v && v.ate > Date.now() ? v : null;
  } catch {
    return null;
  }
}
export function guardarTokenPainel(token: string, turma: string) {
  try {
    sessionStorage.setItem(CHAVE_TOKEN, JSON.stringify({ token, turma, ate: Date.now() + 2 * 3600_000 - 60_000 }));
  } catch {
    /* nada */
  }
}
export function apagarTokenPainel() {
  try {
    sessionStorage.removeItem(CHAVE_TOKEN);
  } catch {
    /* nada */
  }
}
