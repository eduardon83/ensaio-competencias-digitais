// ─── Aldeia Digital · validação de pedidos (esquemas fechados) ───────────────
// Campos desconhecidos são recusados. Tipos e tamanhos verificados antes de qualquer regra do jogo.
import {
  CABELOS, DIMENSOES, LUGARES_MAX, MISSAO, MOVEIS, fimAnoLetivo,
  type ConfigTurma, type Dimensao, type FrequenciaEmail, type ModoIdentificacao,
} from "./catalogo";
import type { Aparencia, Casa, Interior } from "./modelo";

type Obj = Record<string, unknown>;
const eObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const soChaves = (o: Obj, permitidas: string[]) => Object.keys(o).every((k) => permitidas.includes(k));
const texto = (v: unknown, max: number): v is string => typeof v === "string" && v.length <= max;
const inteiro = (v: unknown, min: number, max: number): v is number => typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
const textoOuNulo = (v: unknown, max = 40) => v === null || texto(v, max);

export type Op =
  | { op: "resultado"; id: string; missao: string; pontuacao: number; duracaoMs: number }
  | { op: "treino"; id: string; missao: string }
  | { op: "evento"; missao: "nascimento" | "tutorial" | "festa" }
  | { op: "premio"; missao: string; item: string }
  | { op: "aparencia"; valor: Aparencia }
  | { op: "casa"; valor: Casa }
  | { op: "interior"; valor: Interior }
  | { op: "jornal" };

const CAMPOS_APARENCIA = ["fato", "cor", "padrao", "pele", "cabelo", "corCabelo", "ver", "chapeu", "oculos", "mochila", "objeto", "calcado", "emblema"];

export function eAparencia(v: unknown): v is Aparencia {
  if (!eObj(v) || !soChaves(v, CAMPOS_APARENCIA) || Object.keys(v).length !== CAMPOS_APARENCIA.length) return false;
  return texto(v.fato, 40) && texto(v.cor, 20) && texto(v.pele, 20) && texto(v.cabelo, 20) && CABELOS.includes(v.cabelo as string) && texto(v.corCabelo, 20)
    && ["padrao", "ver", "chapeu", "oculos", "mochila", "objeto", "calcado", "emblema"].every((k) => textoOuNulo(v[k]));
}
export function eCasa(v: unknown): v is Casa {
  return eObj(v) && soChaves(v, ["paredes", "telhado", "porta", "jardim"]) && texto(v.paredes, 20) && texto(v.telhado, 20) && texto(v.porta, 20) && textoOuNulo(v.jardim, 20);
}
export function eInterior(v: unknown): v is Interior {
  if (!eObj(v) || !soChaves(v, ["papel", "chao", "moveis", "trofeus", "moldura"])) return false;
  if (!texto(v.papel, 30) || !texto(v.chao, 30) || typeof v.moldura !== "boolean" || !eObj(v.moveis)) return false;
  for (const [k, m] of Object.entries(v.moveis)) {
    if (!(MOVEIS as readonly string[]).includes(k) || !eObj(m) || !soChaves(m, ["lugar", "variante"]) || !texto(m.lugar, 30) || (m.variante !== undefined && !texto(m.variante, 30))) return false;
  }
  return v.trofeus === null || (Array.isArray(v.trofeus) && v.trofeus.length <= 40 && v.trofeus.every((t) => texto(t, 40)));
}

export function eOp(v: unknown): v is Op {
  if (!eObj(v) || typeof v.op !== "string") return false;
  switch (v.op) {
    case "resultado":
      return soChaves(v, ["op", "id", "missao", "pontuacao", "duracaoMs"]) && texto(v.id, 40) && texto(v.missao, 40) && MISSAO.has(v.missao as string) && inteiro(v.pontuacao, 0, 100) && inteiro(v.duracaoMs, 0, 4 * 3600_000);
    case "treino":
      return soChaves(v, ["op", "id", "missao"]) && texto(v.id, 40) && texto(v.missao, 40) && MISSAO.has(v.missao as string);
    case "evento":
      return soChaves(v, ["op", "missao"]) && (v.missao === "nascimento" || v.missao === "tutorial" || v.missao === "festa");
    case "premio":
      return soChaves(v, ["op", "missao", "item"]) && texto(v.missao, 40) && texto(v.item, 40);
    case "aparencia":
      return soChaves(v, ["op", "valor"]) && eAparencia(v.valor);
    case "casa":
      return soChaves(v, ["op", "valor"]) && eCasa(v.valor);
    case "interior":
      return soChaves(v, ["op", "valor"]) && eInterior(v.valor);
    case "jornal":
      return soChaves(v, ["op"]);
    default:
      return false;
  }
}

export function eListaOps(v: unknown): v is Op[] {
  return Array.isArray(v) && v.length >= 1 && v.length <= 30 && v.every(eOp);
}

const MODOS: ModoIdentificacao[] = ["numero", "nome", "anonimo"];
const IDS_DIMENSOES = DIMENSOES.map((d) => d.id);

/** Configuração da turma enviada pelo professor ao criar (ou ao mudar, com `parcial`). Devolve a versão limpa. */
export function lerConfig(v: unknown, parcial = false, agora = new Date()): Partial<ConfigTurma> | null {
  if (!eObj(v)) return null;
  const permitidas = ["nome", "lugares", "nivel", "extensao", "escolha", "dimensoes", "identificacao", "ritmo", "tempo", "dataFim", "colecao"];
  if (!soChaves(v, permitidas)) return null;
  const c: Partial<ConfigTurma> = {};
  const falta = (k: string) => !(k in v);
  if (!falta("nome")) {
    if (!texto(v.nome, 40)) return null;
    c.nome = (v.nome as string).replace(/[\p{C}]/gu, "").trim();
  }
  if (!falta("lugares")) {
    if (!inteiro(v.lugares, 1, LUGARES_MAX)) return null;
    c.lugares = v.lugares as number;
  }
  if (!falta("nivel")) {
    if (!inteiro(v.nivel, 1, 5)) return null;
    c.nivel = v.nivel as ConfigTurma["nivel"];
  }
  if (!falta("extensao")) {
    if (!["essencial", "completa", "personalizada"].includes(v.extensao as string)) return null;
    c.extensao = v.extensao as ConfigTurma["extensao"];
  }
  if (!falta("escolha")) {
    if (!Array.isArray(v.escolha) || v.escolha.length > 60 || !v.escolha.every((x) => typeof x === "string" && MISSAO.has(x))) return null;
    c.escolha = [...new Set(v.escolha as string[])];
  }
  if (!falta("dimensoes")) {
    if (!Array.isArray(v.dimensoes) || !v.dimensoes.every((x) => IDS_DIMENSOES.includes(x as Dimensao))) return null;
    c.dimensoes = [...new Set(v.dimensoes as Dimensao[])];
  }
  if (!falta("identificacao")) {
    if (!Array.isArray(v.identificacao) || v.identificacao.length < 1 || !v.identificacao.every((x) => MODOS.includes(x as ModoIdentificacao))) return null;
    c.identificacao = [...new Set(v.identificacao as ModoIdentificacao[])];
  }
  if (!falta("ritmo")) {
    if (v.ritmo !== "livre" && v.ritmo !== "guiado") return null;
    c.ritmo = v.ritmo;
  }
  if (!falta("tempo")) {
    if (![1, 1.25, 1.5, 2].includes(v.tempo as number)) return null;
    c.tempo = v.tempo as ConfigTurma["tempo"];
  }
  if (!falta("dataFim")) {
    if (!texto(v.dataFim, 10) || !/^\d{4}-\d{2}-\d{2}$/.test(v.dataFim as string)) return null;
    const hoje = agora.toISOString().slice(0, 10);
    if ((v.dataFim as string) < hoje || (v.dataFim as string) > fimAnoLetivo(agora)) return null;
    c.dataFim = v.dataFim as string;
  }
  if (!falta("colecao")) {
    if (!["atuais", "extintos", "escolha"].includes(v.colecao as string)) return null;
    c.colecao = v.colecao as ConfigTurma["colecao"];
  }
  if (!parcial && permitidas.some((k) => !(k in c))) return null;
  return c;
}

export function emailValido(v: unknown): v is string {
  return typeof v === "string" && v.length <= 200 && /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(v);
}
export function eFrequencia(v: unknown): v is FrequenciaEmail {
  return v === "nenhum" || v === "semanal" || v === "diario" || v === "marcos";
}
