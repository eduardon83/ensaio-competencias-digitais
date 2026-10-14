// ─── Aldeia Digital · geometria do mundo (puro, testado) ─────────────────────
// Projeção 2:1 em píxeis nativos: x = OX + (i − j) × 32, y = OY + (i + j) × 16 (canto norte do mosaico).
// Profundidade: chão primeiro; depois objetos por i + j da esquina sul; o avatar pelo mosaico dos pés.
import cena from "../mundo/cena.json";
import manifesto from "../arte/manifesto.json";
import { EDIFICIOS, type DefMissao, type IdEdificio } from "../nucleo/catalogo";
import type { EstadoCapitulo } from "../nucleo/regras";

export const N = cena.tamanho;
export const OX = N * 32 + 40;
export const OY = 160;
export const MUNDO_W = N * 64 + 80;
export const MUNDO_H = N * 32 + 220;

export const P = (i: number, j: number): [number, number] => [OX + (i - j) * 32, OY + (i + j) * 16];
/** Ponto do ecrã (nativo) para coordenadas do mosaico (reais). */
export function deEcra(x: number, y: number): [number, number] {
  const a = (x - OX) / 32;
  const b = (y - OY) / 16;
  return [(a + b) / 2, (b - a) / 2];
}

export const CHAO: string[][] = cena.chao;
export interface Aderecos {
  t: string;
  i: number;
  j: number;
  piv: number[];
  espelhar?: boolean;
}
export const ADERECOS: Aderecos[] = cena.aderecos;
export const JARDINS: Aderecos[][] = cena.jardins;
export const LOTES: { n: number; i: number; j: number }[] = cena.lotes;
export const POSICAO_EDIFICIO = new Map(cena.edificios.map((e) => [e.id as IdEdificio, e]));

type EstadoArte = { origem: number[]; ancoras: Record<string, number[]> };
export const ARTE_EDIFICIOS = manifesto.mundo.edificios as Record<string, { pegada: string; estados: Record<string, EstadoArte> }>;
export const ARTE_CASA = manifesto.mundo.casa;

export type EstadoEdificio = "obras" | "aberto" | "concluido" | "festivo";

/** Mosaicos por onde se anda: chão sem água, fora das pegadas dos edifícios, dos lotes e das árvores. */
export function grelhaPassagem(): boolean[][] {
  const g = CHAO.map((linha) => linha.map((t) => t !== "agua"));
  const bloquear = (i: number, j: number) => {
    if (i >= 0 && j >= 0 && i < N && j < N) g[j][i] = false;
  };
  for (const e of cena.edificios) for (let i = e.i; i < e.i + e.w; i++) for (let j = e.j; j < e.j + e.d; j++) bloquear(i, j);
  for (const l of LOTES) for (let i = l.i; i < l.i + 2; i++) for (let j = l.j; j < l.j + 2; j++) bloquear(i, j);
  for (const a of ADERECOS) if (a.t.startsWith("arvore") || a.t === "arbusto" || a.t === "candeeiro") bloquear(Math.floor(a.i), Math.floor(a.j));
  // a borda da ilha
  for (let k = 0; k < N; k++) {
    bloquear(k, N - 1);
    bloquear(N - 1, k);
  }
  return g;
}

function maisPerto(g: boolean[][], i: number, j: number): [number, number] {
  let melhor: [number, number] = [Math.round(i), Math.round(j)];
  let d = Infinity;
  for (let jj = 0; jj < N; jj++)
    for (let ii = 0; ii < N; ii++) {
      if (!g[jj][ii]) continue;
      const dd = (ii + 0.5 - i) ** 2 + (jj + 0.5 - j) ** 2;
      if (dd < d) {
        d = dd;
        melhor = [ii, jj];
      }
    }
  return melhor;
}

/** Mosaico em frente à porta de um edifício (a partir da âncora "porta" do estado aberto). */
export function portaEdificio(g: boolean[][], id: IdEdificio): [number, number] {
  const e = POSICAO_EDIFICIO.get(id)!;
  const arte = ARTE_EDIFICIOS[id].estados.aberto;
  const [nx, ny] = P(e.i, e.j);
  const x = nx - arte.origem[0] + arte.ancoras.porta[0];
  const y = ny - arte.origem[1] + arte.ancoras.porta[1];
  const [i, j] = deEcra(x, y);
  return maisPerto(g, i, j + 0.6);
}

export function portaCasa(g: boolean[][], lugar: number): [number, number] {
  const l = LOTES.find((x) => x.n === lugar) ?? LOTES[0];
  const [nx, ny] = P(l.i, l.j);
  const x = nx - ARTE_CASA.origem[0] + ARTE_CASA.ancoras.porta[0];
  const y = ny - ARTE_CASA.origem[1] + ARTE_CASA.ancoras.porta[1];
  const [i, j] = deEcra(x, y);
  return maisPerto(g, i, j + 0.6);
}

/** Caminho mais curto (A*, 8 direções; nas diagonais os dois vizinhos têm de estar livres). */
export function caminho(g: boolean[][], de: [number, number], para: [number, number]): [number, number][] {
  const livre = (i: number, j: number) => i >= 0 && j >= 0 && i < N && j < N && g[j][i];
  if (!livre(...para)) para = maisPerto(g, para[0] + 0.5, para[1] + 0.5);
  const chave = (i: number, j: number) => j * N + i;
  const aberto = new Map<number, number>([[chave(...de), 0]]);
  const custo = new Map<number, number>([[chave(...de), 0]]);
  const veio = new Map<number, number>();
  const h = (i: number, j: number) => Math.max(Math.abs(i - para[0]), Math.abs(j - para[1]));
  const alvo = chave(...para);
  let voltas = 0;
  while (aberto.size && voltas++ < 4000) {
    let atual = -1;
    let melhor = Infinity;
    for (const [k, f] of aberto) if (f < melhor) [melhor, atual] = [f, k];
    aberto.delete(atual);
    if (atual === alvo) break;
    const ci = atual % N;
    const cj = Math.floor(atual / N);
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const ni = ci + di;
      const nj = cj + dj;
      if (!livre(ni, nj)) continue;
      if (di && dj && (!livre(ci + di, cj) || !livre(ci, cj + dj))) continue;
      const nk = chave(ni, nj);
      const c = (custo.get(atual) ?? 0) + (di && dj ? 1.414 : 1);
      if (c < (custo.get(nk) ?? Infinity)) {
        custo.set(nk, c);
        veio.set(nk, atual);
        aberto.set(nk, c + h(ni, nj));
      }
    }
  }
  if (!veio.has(alvo) && alvo !== chave(...de)) return [];
  const out: [number, number][] = [];
  let k = alvo;
  while (k !== chave(...de)) {
    out.unshift([k % N, Math.floor(k / N)]);
    k = veio.get(k)!;
    if (k === undefined) break;
  }
  return out;
}

/** Direção do sprite a partir do passo (os sprites são diagonais: se, sw, ne, nw). */
export function direcaoDoPasso(di: number, dj: number): "se" | "sw" | "ne" | "nw" {
  const dx = di - dj;
  const dy = di + dj;
  if (dy > 0) return dx >= 0 ? "se" : "sw";
  if (dy < 0) return dx >= 0 ? "ne" : "nw";
  return dx > 0 ? "se" : "nw";
}

/** Estado de um edifício para este aluno (a forma e o ícone dizem o estado, nunca só a cor). */
export function estadoEdificio(id: IdEdificio, caps: EstadoCapitulo[], progresso: Record<string, unknown>): { estado: EstadoEdificio; missao: boolean; abreNo: number | null; missoes: DefMissao[] } {
  const nucleo = EDIFICIOS.find((e) => e.id === id)?.nucleo || id === "largo";
  const missoes = caps.flatMap((c) => c.missoes.filter((m) => m.edificio === id));
  const festa = caps.length > 0 && caps.every((c) => c.concluido);
  const abertas = caps.filter((c) => c.aberto).flatMap((c) => c.missoes.filter((m) => m.edificio === id));
  const missao = abertas.some((m) => !(m.id in progresso) && m.tipo !== "evento");
  const abreNo = missoes.length && !abertas.length ? (caps.find((c) => c.missoes.some((m) => m.edificio === id))?.n ?? null) : null;
  if (festa) return { estado: "festivo", missao: false, abreNo: null, missoes };
  const comPontos = missoes.filter((m) => m.tipo !== "evento");
  if (comPontos.length && comPontos.every((m) => m.id in progresso)) return { estado: "concluido", missao: false, abreNo: null, missoes };
  if (abertas.length || nucleo) return { estado: "aberto", missao, abreNo, missoes };
  return { estado: "obras", missao: false, abreNo, missoes };
}

/** Ordem de leitura dos edifícios (de cima para baixo, da esquerda para a direita) para a tecla Tab. */
export function ordemLeitura(): IdEdificio[] {
  return [...cena.edificios]
    .map((e) => ({ id: e.id as IdEdificio, xy: P(e.i + e.w / 2, e.j + e.d / 2) }))
    .sort((a, b) => a.xy[1] - b.xy[1] || a.xy[0] - b.xy[0])
    .map((e) => e.id);
}
