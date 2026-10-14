// ─── Aldeia Digital · modelo de dados (turma e aluno) ────────────────────────
// Por aluno: cerca de 5 kB. Nunca: email, data de nascimento, IP, impressão digital do dispositivo, texto livre além do nome.
import { CASA_OPCOES, LUGARES_MOVEL, MOVEIS, type ConfigTurma, type FrequenciaEmail, type ModoIdentificacao, type Movel } from "./catalogo";

export interface Aparencia {
  fato: string;
  cor: string; // "original" ou uma das cores do fato
  padrao: string | null;
  pele: string;
  cabelo: string; // "rapado" não tem camada
  corCabelo: string; // no lenço: o padrão do lenço
  ver: string | null; // óculos de ver (sempre disponíveis)
  chapeu: string | null;
  oculos: string | null;
  mochila: string | null;
  objeto: string | null;
  calcado: string | null;
  emblema: string | null;
}

export interface Casa {
  paredes: string;
  telhado: string;
  porta: string;
  jardim: string | null;
}

export interface LugarMovel {
  lugar: string;
  variante?: string;
}
export interface Interior {
  papel: string;
  chao: string;
  moveis: Partial<Record<Movel, LugarMovel>>;
  /** Ordem dos troféus nas prateleiras; null = arrumação automática. */
  trofeus: string[] | null;
  moldura: boolean; // o Jornal da Aldeia emoldurado (no fim)
}

export interface Progresso {
  primeira: number;
  melhor: number;
  ultima: number;
  tentativas: number;
  duracaoMs: number; // da melhor tentativa
  primeiraEm: string;
  em: string; // última tentativa
  premio?: string; // item escolhido na pequena seleção
}

export interface Aluno {
  id: string;
  nome: string;
  nomeNormalizado: string;
  modo: ModoIdentificacao;
  lugar: number; // 1 a 32 (lote da casa)
  aparencia: Aparencia;
  casa: Casa;
  interior: Interior;
  progresso: Record<string, Progresso>;
  /** Últimos resultados (para o alerta de "3 seguidos abaixo de 50"). */
  recentes: { m: string; p: number; em: string }[];
  treinos: number;
  marcos: { tutorial?: string; jornal?: string };
  /** Resumos (SHA-256) das chaves de dispositivo; no máximo 5, a mais antiga cai. */
  chaves: { h: string; em: string }[];
  /** Entradas noutro computador (só a data; nunca o IP). */
  entradas: string[];
  /** Ids das últimas operações aplicadas (repetições da fila de envio não contam duas vezes). */
  ops: string[];
  criadoEm: string;
  vistoEm: string;
  versao: number;
}

export interface EmailTurma {
  endereco: string;
  confirmado: boolean;
  frequencia: FrequenciaEmail;
  autorizarNome: boolean;
  pedidos: string[]; // datas dos pedidos de confirmação (máximo 3 por dia)
  ultimoEnvio?: string;
  alertasEnviados: string[]; // chaves de alertas já incluídos num email
  marcosEnviados: string[];
}

export interface TurmaDados {
  codigo: string;
  hashProfessor: string;
  config: ConfigTurma;
  capitulosAbertos: number[];
  criadoEm: string;
  atualizadoEm: string;
  fechadaEm?: string;
  email: EmailTurma | null;
  semLugarEm?: string;
  versao: number;
}

export type EstadoTurma = "aberta" | "fechada";

/** O que um aluno vê da turma antes de entrar: sem nomes (não há lista pública de nomes na entrada). */
export interface VistaPublica {
  codigo: string;
  estado: EstadoTurma;
  config: Omit<ConfigTurma, "nome" | "lugares">;
  capitulosAbertos: number[];
  lugaresLivres: number;
  fatosOcupados: string[];
}

/** Um colega, como aparece na aldeia: fachada da casa e avatar à porta. O interior é privado. */
export interface Vizinho {
  lugar: number;
  nome: string;
  aparencia: Aparencia;
  casa: Casa;
  ativo: boolean; // atividade nos últimos 7 dias (senão dorme à porta)
}

export interface VistaAluno {
  aluno: Aluno;
  turma: VistaPublica;
  vizinhos: Vizinho[];
  objetivo: { atingido: boolean; feitos: number; precisa: number; capitulo: number };
}

/** Dados que o painel do professor recebe (sem os resumos das chaves). */
export type AlunoPainel = Omit<Aluno, "chaves" | "ops">;
export interface VistaProfessor {
  turma: Omit<TurmaDados, "hashProfessor" | "email"> & { email: (Omit<EmailTurma, "pedidos" | "alertasEnviados" | "marcosEnviados">) | null };
  alunos: AlunoPainel[];
}

// ── Valores iniciais ─────────────────────────────────────────────────────────
export function aparenciaInicial(fato: string): Aparencia {
  return { fato, cor: "original", padrao: null, pele: "pele-2", cabelo: "franja", corCabelo: "castanho", ver: null, chapeu: null, oculos: null, mochila: null, objeto: null, calcado: null, emblema: null };
}

/** Fachada por omissão: varia com o lugar, para a aldeia não ter casas todas iguais. */
export function casaInicial(lugar: number): Casa {
  const p = CASA_OPCOES.paredes;
  const t = CASA_OPCOES.telhados;
  const d = CASA_OPCOES.portas;
  return { paredes: p[lugar % p.length], telhado: t[(lugar * 5) % t.length], porta: d[(lugar * 7) % d.length], jardim: null };
}

export function interiorInicial(): Interior {
  const moveis: Interior["moveis"] = {};
  for (const m of MOVEIS) moveis[m] = { lugar: LUGARES_MOVEL[m][0].id };
  return { papel: "liso-pessego", chao: "madeira", moveis, trofeus: null, moldura: false };
}

export const LIMITE_ALUNO_BYTES = 64 * 1024;
export const MAX_CHAVES = 5;
export const MAX_RECENTES = 10;
export const MAX_OPS = 40;
