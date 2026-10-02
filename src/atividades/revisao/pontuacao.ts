import { limitar } from "../../motor/tipos";
import { palavras } from "../../motor/util";

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
