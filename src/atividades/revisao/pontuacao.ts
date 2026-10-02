import { limitar } from "../../motor/tipos";
import { palavras } from "../../motor/util";
import { escolher, misturar, type Gerador } from "../../motor/aleatorio";

/** Índices das palavras que diferem entre original e cópia (a cópia tem o mesmo número de palavras). */
export function diferencas(original: string, copia: string): number[] {
  const o = palavras(original);
  const c = palavras(copia);
  const r: number[] = [];
  for (let i = 0; i < Math.max(o.length, c.length); i++) if (o[i] !== c[i]) r.push(i);
  return r;
}

/** score = 100 × max(0, (encontradas − 0,5 × cliques errados) / total); bónus +5 se sobrou mais de 30 % do tempo. */
export function pontuarRevisao(e: { encontradas: number; errados: number; total: number; fracaoTempoRestante: number | null }) {
  const base = e.total > 0 ? Math.max(0, (e.encontradas - 0.5 * e.errados) / e.total) : 0;
  const bonus = e.fracaoTempoRestante !== null && e.fracaoTempoRestante > 0.3 ? 5 : 0;
  return limitar(100 * base + bonus);
}

// ─── Gerador de cópias com erros realistas ───────────────────────────────────
// A partir de um original, escolhe `n` palavras e introduz em cada uma um erro do tipo que aparece quando
// se copia do papel para o computador: dígitos trocados, acento em falta, letra trocada ou repetida,
// email com letra a menos, mês errado, vírgula decimal trocada por ponto.

const SEM_ACENTO: Record<string, string> = { á: "a", à: "a", â: "a", ã: "a", é: "e", ê: "e", í: "i", ó: "o", ô: "o", õ: "o", ú: "u", ç: "c", Á: "A", É: "E", Í: "I", Ó: "O", Ú: "U", Ç: "C" };
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

type Mutacao = (w: string, r: Gerador) => string | null;

const trocarDigitos: Mutacao = (w, r) => {
  const pos: number[] = [];
  for (let i = 0; i < w.length - 1; i++) if (/\d/.test(w[i]) && /\d/.test(w[i + 1]) && w[i] !== w[i + 1]) pos.push(i);
  if (!pos.length) return null;
  const i = escolher(pos, r);
  return w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2);
};
const mudarDigito: Mutacao = (w, r) => {
  const pos = [...w].map((c, i) => (/\d/.test(c) ? i : -1)).filter((i) => i >= 0);
  if (!pos.length) return null;
  const i = escolher(pos, r);
  const novo = String((Number(w[i]) + 1 + Math.floor(r() * 8)) % 10);
  return w.slice(0, i) + novo + w.slice(i + 1);
};
const tirarAcento: Mutacao = (w, r) => {
  const pos = [...w].map((c, i) => (SEM_ACENTO[c] ? i : -1)).filter((i) => i >= 0);
  if (!pos.length) return null;
  const i = escolher(pos, r);
  return w.slice(0, i) + SEM_ACENTO[w[i]] + w.slice(i + 1);
};
const trocarLetras: Mutacao = (w, r) => {
  const pos: number[] = [];
  for (let i = 1; i < w.length - 2; i++) if (/\p{L}/u.test(w[i]) && /\p{L}/u.test(w[i + 1]) && w[i].toLowerCase() !== w[i + 1].toLowerCase()) pos.push(i);
  if (!pos.length) return null;
  const i = escolher(pos, r);
  return w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2);
};
const repetirLetra: Mutacao = (w, r) => {
  const pos = [...w].map((c, i) => (i > 0 && /\p{L}/u.test(c) ? i : -1)).filter((i) => i >= 0);
  if (pos.length < 3) return null;
  const i = escolher(pos, r);
  return w.slice(0, i) + w[i] + w.slice(i);
};
const tirarLetraEmail: Mutacao = (w, r) => {
  const a = w.indexOf("@");
  if (a < 3) return null;
  const i = 1 + Math.floor(r() * (a - 1));
  return w.slice(0, i) + w.slice(i + 1);
};
const trocarMes: Mutacao = (w, r) => {
  const limpo = w.replace(/[.,;:]$/, "");
  const k = MESES.indexOf(limpo.toLowerCase());
  if (k < 0) return null;
  const outro = MESES[(k + 1 + Math.floor(r() * 10)) % 12];
  return outro + w.slice(limpo.length);
};
const virgulaPonto: Mutacao = (w) => (/\d,\d/.test(w) ? w.replace(/(\d),(\d)/, "$1.$2") : null);

/** Mutações por ordem de preferência para uma palavra (as específicas primeiro). */
function mutacoesPara(w: string, avancado: boolean): Mutacao[] {
  if (w.includes("@")) return [tirarLetraEmail];
  if (MESES.includes(w.replace(/[.,;:]$/, "").toLowerCase())) return [trocarMes];
  if (/\d/.test(w)) return avancado ? [trocarDigitos, mudarDigito, virgulaPonto] : [trocarDigitos, mudarDigito];
  const letras = w.replace(/[^\p{L}]/gu, "");
  if (letras.length < 4) return [];
  return [tirarAcento, trocarLetras, repetirLetra];
}

/** Gera uma cópia com exatamente `n` palavras diferentes do original. */
export function gerarCopia(original: string, n: number, avancado: boolean, r: Gerador = Math.random): string {
  const ws = palavras(original);
  const candidatos = misturar(ws.map((_, i) => i), r).filter((i) => mutacoesPara(ws[i], avancado).length > 0);
  const copia = [...ws];
  let feitas = 0;
  for (const i of candidatos) {
    if (feitas >= n) break;
    for (const m of misturar(mutacoesPara(ws[i], avancado), r)) {
      const novo = m(ws[i], r);
      if (novo && novo !== ws[i] && !/\s/.test(novo)) {
        copia[i] = novo;
        feitas++;
        break;
      }
    }
  }
  return copia.join(" ");
}
