// ─── Aldeia Digital · ligação ao servidor (Worker) ou modo local ─────────────
// Com o Worker (Cloudflare): a API /api/aldeia na mesma origem (a CSP connect-src 'self' já cobre).
// Sem Worker (npm run dev, Docker, alojamento estático): modo local, com o mesmo serviço da turma sobre o
// localStorage. A turma só existe neste navegador; a aplicação diz isso claramente.
import type { ConfigTurma, FrequenciaEmail, ModoIdentificacao } from "../nucleo/catalogo";
import { codigoProfessorValido, gerarCodigoProfessor, gerarCodigoTurma } from "../nucleo/codigos";
import { assinarToken, chaveAleatoria, hmac, lerToken } from "../nucleo/cripto";
import type { Op } from "../nucleo/esquema";
import type { VistaAluno, VistaProfessor, VistaPublica } from "../nucleo/modelo";
import { ServicoTurma, type AcaoProfessor } from "../nucleo/servico";
import { armazemLocal } from "../nucleo/armazem";

export type R<T> = { ok: true; valor: T } | { ok: false; erro: string; detalhe?: string; rede?: boolean; estado?: number };
export interface Entrada {
  vista: VistaAluno;
  chave: string;
}

export interface ServidorAldeia {
  modo: "servidor" | "local";
  criarTurma(config: ConfigTurma): Promise<R<{ turma: string; professor: string; token: string }>>;
  publico(codigo: string): Promise<R<VistaPublica>>;
  registar(codigo: string, p: { nome: string; modo: ModoIdentificacao; fato: string }): Promise<R<Entrada>>;
  entrar(codigo: string, p: { nome: string; modo: ModoIdentificacao }): Promise<R<Entrada>>;
  eu(codigo: string, id: string, chave: string): Promise<R<VistaAluno>>;
  aplicar(codigo: string, id: string, chave: string, ops: Op[]): Promise<R<{ vista: VistaAluno; recusadas: number }>>;
  sair(codigo: string, id: string, chave: string): Promise<void>;
  professorEntrar(codigo: string): Promise<R<{ turma: string; token: string }>>;
  painel(token: string): Promise<R<VistaProfessor>>;
  acao(token: string, acao: AcaoProfessor): Promise<R<VistaProfessor>>;
  email(token: string, d: { endereco: string | null; frequencia: FrequenciaEmail; autorizarNome: boolean }): Promise<R<{ confirmacaoEnviada: boolean }>>;
  apagar(token: string, confirmar: string): Promise<R<{ ok: true }>>;
  confirmarEmail(token: string): Promise<R<{ ok: true }>>;
  sairEmail(token: string): Promise<R<{ ok: true }>>;
}

// ── Servidor remoto ──────────────────────────────────────────────────────────
const BASE = `${import.meta.env.BASE_URL}api/aldeia`;

async function pedir<T>(metodo: "GET" | "POST", caminho: string, corpo?: unknown, autorizacao?: string): Promise<R<T>> {
  try {
    const cab: Record<string, string> = { accept: "application/json" };
    if (corpo !== undefined) cab["content-type"] = "application/json";
    if (autorizacao) cab.authorization = autorizacao;
    const r = await fetch(`${BASE}${caminho}`, { method: metodo, headers: cab, body: corpo === undefined ? undefined : JSON.stringify(corpo), cache: "no-store" });
    const tipo = r.headers.get("content-type") ?? "";
    if (!tipo.includes("json")) return { ok: false, erro: "rede", rede: true, estado: r.status };
    const d = (await r.json()) as Record<string, unknown>;
    if (!r.ok) return { ok: false, erro: String(d.erro ?? "erro"), detalhe: typeof d.detalhe === "string" ? d.detalhe : undefined, estado: r.status };
    return { ok: true, valor: d as T };
  } catch {
    return { ok: false, erro: "rede", rede: true };
  }
}

const aluno = (id: string, chave: string) => `Aluno ${id}.${chave}`;
const portador = (token: string) => `Bearer ${token}`;

export const servidorRemoto: ServidorAldeia = {
  modo: "servidor",
  criarTurma: (config) => pedir("POST", "/turmas", { config, termos: true }),
  publico: (c) => pedir("GET", `/t/${encodeURIComponent(c)}`),
  registar: (c, p) => pedir("POST", `/t/${encodeURIComponent(c)}/alunos`, p),
  entrar: (c, p) => pedir("POST", `/t/${encodeURIComponent(c)}/entrar`, p),
  eu: (c, id, chave) => pedir("GET", `/t/${encodeURIComponent(c)}/eu`, undefined, aluno(id, chave)),
  aplicar: (c, id, chave, ops) => pedir("POST", `/t/${encodeURIComponent(c)}/eu`, { ops }, aluno(id, chave)),
  sair: async (c, id, chave) => {
    await pedir("POST", `/t/${encodeURIComponent(c)}/sair`, {}, aluno(id, chave));
  },
  professorEntrar: (codigo) => pedir("POST", "/professor/entrar", { codigo }),
  painel: (t) => pedir("GET", "/professor", undefined, portador(t)),
  acao: (t, a) => pedir("POST", "/professor/acao", a, portador(t)),
  email: (t, d) => pedir("POST", "/professor/email", d, portador(t)),
  apagar: (t, confirmar) => pedir("POST", "/professor/apagar", { confirmar }, portador(t)),
  confirmarEmail: (token) => pedir("POST", "/email/confirmar", { token }),
  sairEmail: (token) => pedir("POST", "/email/sair", { token }),
};

// ── Modo local (sem Worker) ──────────────────────────────────────────────────
const PREFIXO = "ecd.aldeia.local.";
function segredoLocal(nome: string): string {
  const k = `${PREFIXO}${nome}`;
  let v = localStorage.getItem(k);
  if (!v) {
    v = chaveAleatoria(24);
    localStorage.setItem(k, v);
  }
  return v;
}
function indiceProfessores(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(`${PREFIXO}professores`) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}
const servico = (codigo: string) => new ServicoTurma(armazemLocal(`${PREFIXO}t.${codigo}.`));
const erroDe = <T,>(r: { ok: false; erro: string; detalhe?: string }): R<T> => ({ ok: false, erro: r.erro, detalhe: r.detalhe });

/** Corre o alarme diário de uma turma local (fecho e apagamento) antes de a usar. */
async function preparar(codigo: string): Promise<ServicoTurma> {
  const s = servico(codigo);
  const t = await s.turma();
  if (t) {
    const r = await s.aoAlarme();
    if (r.apagada) {
      const idx = indiceProfessores();
      for (const [h, c] of Object.entries(idx)) if (c === codigo) delete idx[h];
      localStorage.setItem(`${PREFIXO}professores`, JSON.stringify(idx));
    }
  }
  return s;
}

async function lerPainel(token: string): Promise<string | null> {
  const d = await lerToken(segredoLocal("segredo"), token, "painel");
  return d?.t ?? null;
}

export const servidorLocal: ServidorAldeia = {
  modo: "local",
  async criarTurma(config) {
    const codigo = gerarCodigoTurma();
    const professor = gerarCodigoProfessor();
    const h = await hmac(segredoLocal("pimenta"), professor);
    const r = await servico(codigo).criar({ codigo, hashProfessor: h, config });
    if (!r.ok) return erroDe(r);
    const idx = indiceProfessores();
    idx[h] = codigo;
    localStorage.setItem(`${PREFIXO}professores`, JSON.stringify(idx));
    const token = await assinarToken(segredoLocal("segredo"), { t: codigo, p: "painel", exp: Date.now() + 2 * 3600_000 });
    return { ok: true, valor: { turma: codigo, professor, token } };
  },
  async publico(c) {
    const r = await (await preparar(c)).publico();
    if (!r.ok || r.valor.estado === "fechada") return { ok: false, erro: "turma" };
    return r;
  },
  async registar(c, p) {
    const r = await (await preparar(c)).registar(p);
    return r.ok ? r : erroDe(r);
  },
  async entrar(c, p) {
    const r = await (await preparar(c)).entrar(p);
    return r.ok ? r : erroDe(r);
  },
  async eu(c, id, chave) {
    const s = await preparar(c);
    if (!(await s.autenticar(id, chave))) return { ok: false, erro: "chave" };
    const r = await s.vista(id);
    return r.ok ? r : erroDe(r);
  },
  async aplicar(c, id, chave, ops) {
    const s = await preparar(c);
    if (!(await s.autenticar(id, chave))) return { ok: false, erro: "chave" };
    const r = await s.aplicar(id, ops);
    return r.ok ? r : erroDe(r);
  },
  async sair(c, id, chave) {
    await servico(c).sair(id, chave);
  },
  async professorEntrar(codigo) {
    const limpo = codigoProfessorValido(codigo);
    const turma = limpo ? indiceProfessores()[await hmac(segredoLocal("pimenta"), limpo)] : undefined;
    if (!turma || !(await servico(turma).turma())) return { ok: false, erro: "codigo" };
    return { ok: true, valor: { turma, token: await assinarToken(segredoLocal("segredo"), { t: turma, p: "painel", exp: Date.now() + 2 * 3600_000 }) } };
  },
  async painel(token) {
    const t = await lerPainel(token);
    if (!t) return { ok: false, erro: "token" };
    const r = await (await preparar(t)).painel();
    return r.ok ? r : erroDe(r);
  },
  async acao(token, a) {
    const t = await lerPainel(token);
    if (!t) return { ok: false, erro: "token" };
    const r = await servico(t).acao(a);
    return r.ok ? r : erroDe(r);
  },
  async email() {
    return { ok: false, erro: "email-local" };
  },
  async apagar(token, confirmar) {
    const t = await lerPainel(token);
    if (!t || t !== confirmar) return { ok: false, erro: "pedido" };
    await servico(t).apagarTudo();
    return { ok: true, valor: { ok: true } };
  },
  async confirmarEmail() {
    return { ok: false, erro: "email-local" };
  },
  async sairEmail() {
    return { ok: false, erro: "email-local" };
  },
};

// ── Escolha automática ───────────────────────────────────────────────────────
export interface Ligacao {
  estado: "servidor" | "local" | "indisponivel";
  email: boolean;
  servidor: ServidorAldeia;
}
let ligacao: Promise<Ligacao> | null = null;

/** Pergunta ao Worker se a Aldeia está disponível (1,5 s). Sem Worker, modo local; com Worker em manutenção, indisponível. */
export function obterLigacao(): Promise<Ligacao> {
  ligacao ??= (async () => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1500);
      const r = await fetch(`${BASE}/estado`, { signal: ctrl.signal, headers: { accept: "application/json" }, cache: "no-store" });
      clearTimeout(t);
      if (!(r.headers.get("content-type") ?? "").includes("json")) return { estado: "local", email: false, servidor: servidorLocal };
      const d = (await r.json()) as { disponivel?: boolean; email?: boolean };
      return d.disponivel ? { estado: "servidor", email: Boolean(d.email), servidor: servidorRemoto } : { estado: "indisponivel", email: false, servidor: servidorLocal };
    } catch {
      return { estado: "local", email: false, servidor: servidorLocal };
    }
  })();
  return ligacao;
}
