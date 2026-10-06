// ─── Códigos de sessão do professor (sem servidor) ───────────────────────────
// Toda a configuração da sessão vai dentro do código: nível, atividades, tempo alargado e como os alunos se
// identificam. Formato XXXX·YYYYYY — XXXX identifica a sessão (aleatório), YYYYYY (6 a 8 símbolos) codifica a configuração com
// um carácter de verificação. Alfabeto sem caracteres ambíguos (sem 0/O, 1/I/L).

import type { ExtensaoTempo } from "../preferencias/preferencias";
import type { Nivel } from "../motor/tipos";

export const ALFABETO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // 31 símbolos
const BASE = ALFABETO.length;

export type Identificacao = "nenhuma" | "numero" | "alcunha";
const IDENT: Identificacao[] = ["nenhuma", "numero", "alcunha"];
const EXT: ExtensaoTempo[] = [1, 1.25, 1.5, 2];

export interface ConfigSessao {
  nivel: Nivel;
  atividades: string[]; // slugs, pela ordem do catálogo
  extensaoTempo: ExtensaoTempo;
  identificacao: Identificacao;
}

export interface CodigoSessao {
  codigo: string; // "XXXX·YYYYYY"
  sessao: string; // XXXX
  config: ConfigSessao;
}

// Ordem fixa: as 11 atividades (por número) e depois os testes de segurança e os jogos. Nunca reordenar:
// acrescentar sempre no fim (os códigos já distribuídos dependem destas posições).
export const EXTRAS = ["boas-praticas", "fraude", "redes-sociais", "leitura", "sala-trancada", "misterio", "orcamento", "correio", "robo"];
// As 11 atividades originais por número (posições fixas), os extras e depois as atividades novas.
const ORIGINAIS = ["noticia", "painel", "revisao", "arquivo", "cartao", "paginacao", "fecho", "teclas", "encontra", "simulador", "matematica"];
const NOVAS = ["maqueta", "privacidade", "publicos", "familia"];
export const SLUGS = [...ORIGINAIS, ...EXTRAS, ...NOVAS];

function paraBase(n: number, comprimento: number): string {
  let s = "";
  for (let i = 0; i < comprimento; i++) {
    s = ALFABETO[n % BASE] + s;
    n = Math.floor(n / BASE);
  }
  return s;
}
function deBase(s: string): number {
  let n = 0;
  for (const c of s) {
    const v = ALFABETO.indexOf(c);
    if (v < 0) return NaN;
    n = n * BASE + v;
  }
  return n;
}
function verificacao(s: string): string {
  let soma = 0;
  for (let i = 0; i < s.length; i++) soma += (i + 1) * ALFABETO.indexOf(s[i]);
  return ALFABETO[soma % BASE];
}

export function gerarSessao(): string {
  const bytes = new Uint8Array(4);
  if (typeof crypto !== "undefined") crypto.getRandomValues(bytes);
  else for (let i = 0; i < 4; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => ALFABETO[b % BASE]).join("");
}

/** Codifica a configuração: máscara (um bit por posição de SLUGS) · nível (3 bits) · extensão (2) · identificação (2).
 *  Aritmética normal e não operadores de bits, que em JavaScript cortam a 32 bits (a máscara já passa disso).
 *  Só com atividades cabe em 5 símbolos (códigos antigos); com segurança ou jogos usa 6 ou 7. Mais 1 de verificação. */
export function codificar(config: ConfigSessao, sessao = gerarSessao()): CodigoSessao {
  let mascara = 0;
  for (const slug of new Set(config.atividades)) {
    const i = SLUGS.indexOf(slug);
    if (i >= 0) mascara += 2 ** i;
  }
  const n = mascara * 128 + config.nivel * 16 + EXT.indexOf(config.extensaoTempo) * 4 + IDENT.indexOf(config.identificacao);
  const corpo = paraBase(n, n < BASE ** 5 ? 5 : n < BASE ** 6 ? 6 : 7);
  const codigo = `${sessao}·${corpo}${verificacao(corpo)}`;
  return { codigo, sessao, config: normalizarConfig(config) };
}

function normalizarConfig(c: ConfigSessao): ConfigSessao {
  return { ...c, atividades: SLUGS.filter((s) => c.atividades.includes(s)) };
}

/** Lê um código escrito pelo aluno (aceita minúsculas, espaços, ponto, hífen). Devolve null se inválido ou com erro de dígito. */
export function descodificar(texto: string): CodigoSessao | null {
  const limpo = texto.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (limpo.length < 10 || limpo.length > 12) return null;
  const sessao = limpo.slice(0, 4);
  const corpo = limpo.slice(4, -1);
  const check = limpo[limpo.length - 1];
  if ([...sessao, ...corpo, check].some((c) => !ALFABETO.includes(c))) return null;
  if (verificacao(corpo) !== check) return null;
  const n = deBase(corpo);
  if (!Number.isFinite(n)) return null;
  const identificacao = IDENT[n % 4];
  const extensaoTempo = EXT[Math.floor(n / 4) % 4];
  const nivel = (Math.floor(n / 16) % 8) as Nivel;
  const mascara = Math.floor(n / 128);
  const atividades = SLUGS.filter((_, i) => Math.floor(mascara / 2 ** i) % 2 === 1);
  if (!identificacao || !extensaoTempo || nivel < 1 || nivel > 5 || atividades.length === 0) return null;
  return { codigo: `${sessao}·${corpo}${check}`, sessao, config: { nivel, atividades, extensaoTempo, identificacao } };
}

export function formatarCodigo(c: string): string {
  const limpo = c.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return limpo.length > 4 ? `${limpo.slice(0, 4)}·${limpo.slice(4)}` : limpo;
}
