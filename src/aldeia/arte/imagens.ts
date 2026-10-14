// ─── Aldeia Digital · imagens do pacote de arte ──────────────────────────────
// Ficheiros em public/aldeia (resolução nativa: 1 px de arte = 1 px). Escala sempre por números inteiros, sem
// suavizar (imageSmoothingEnabled = false / image-rendering: pixelated). Tudo em cache.
import manifesto from "./manifesto.json";

export { manifesto };

export const BASE_ARTE = `${import.meta.env.BASE_URL}aldeia/`;
export const urlArte = (caminho: string) => `${BASE_ARTE}${caminho}.png`;

const cache = new Map<string, Promise<HTMLImageElement>>();

/** Carrega uma imagem do pacote (caminho relativo a public/aldeia, sem extensão). */
export function imagem(caminho: string): Promise<HTMLImageElement> {
  let p = cache.get(caminho);
  if (!p) {
    p = new Promise((resolver, rejeitar) => {
      const im = new Image();
      im.decoding = "async";
      im.onload = () => resolver(im);
      im.onerror = () => rejeitar(new Error(`Imagem em falta: ${caminho}`));
      im.src = urlArte(caminho);
    });
    cache.set(caminho, p);
    p.catch(() => cache.delete(caminho));
  }
  return p;
}

export async function imagens(caminhos: string[]): Promise<Map<string, HTMLImageElement>> {
  const lista = await Promise.all(caminhos.map(async (c) => [c, await imagem(c)] as const));
  return new Map(lista);
}

export type Tela = HTMLCanvasElement | OffscreenCanvas;
export function novaTela(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}
export function contexto2d(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = c.getContext("2d", { willReadFrequently: false })!;
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

const hex = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/** Troca cores exatas (paleta indexada do pacote). Usado para mudar a cor do fato. */
export function trocarCores(im: CanvasImageSource & { width: number; height: number }, pares: [string, string][]): HTMLCanvasElement {
  const c = novaTela(im.width, im.height);
  const ctx = contexto2d(c);
  ctx.drawImage(im, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const mapa = new Map(pares.map(([de, para]) => [hex(de).join(","), hex(para)]));
  const px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] === 0) continue;
    const n = mapa.get(`${px[i]},${px[i + 1]},${px[i + 2]}`);
    if (n) {
      px[i] = n[0];
      px[i + 1] = n[1];
      px[i + 2] = n[2];
    }
  }
  ctx.putImageData(d, 0, 0);
  return c;
}

const cacheNoite = new WeakMap<object, HTMLCanvasElement>();
/** Entardecer (tema escuro): a mesma tinta do pacote, × (0,64; 0,60; 0,82) + (26; 14; 34). */
export function tintaNoite(im: HTMLImageElement | HTMLCanvasElement): HTMLCanvasElement {
  const ja = cacheNoite.get(im);
  if (ja) return ja;
  const c = novaTela(im.width, im.height);
  const ctx = contexto2d(c);
  ctx.drawImage(im, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] === 0) continue;
    px[i] = Math.min(255, px[i] * 0.64 + 26);
    px[i + 1] = Math.min(255, px[i + 1] * 0.6 + 14);
    px[i + 2] = Math.min(255, px[i + 2] * 0.82 + 34);
  }
  ctx.putImageData(d, 0, 0);
  cacheNoite.set(im, c);
  return c;
}

/** Folha em tira horizontal: célula e número de fotogramas no manifesto. */
export interface Tira {
  celula: number[];
  fotogramas: number;
  fps: number;
  ciclo?: boolean;
  pivo?: number[] | null;
}
export function tira(caminho: string): Tira {
  return (manifesto.tiras as Record<string, Tira>)[caminho] ?? { celula: [0, 0], fotogramas: 1, fps: 1 };
}

/** Movimento reduzido: modo calmo das Definições ou preferência do sistema. */
export function movimentoReduzido(): boolean {
  if (typeof document === "undefined") return true;
  if (document.documentElement.dataset.calmo === "sim") return true;
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
