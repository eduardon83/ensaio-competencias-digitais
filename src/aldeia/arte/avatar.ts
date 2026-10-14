// ─── Aldeia Digital · montagem do avatar por camadas ─────────────────────────
// Ordem (pacote de arte): corpo, padrão, cara, óculos de ver, cabelo, calçado, mochila, emblema, capuz, objeto,
// óculos de estilo, chapéu. Cada item cola-se na âncora do fotograma (âncora − pivô). Sudoeste e noroeste são o
// sudeste e o nordeste espelhados. A cor do fato troca as 4 cores da rampa principal.
import type { Aparencia } from "../nucleo/modelo";
import { contexto2d, imagem, manifesto, novaTela, trocarCores } from "./imagens";

export type Anim = "parado" | "andar" | "acenar" | "celebrar" | "pensar" | "outra-vez" | "dormir" | "vestir";
export type Direcao = "se" | "ne" | "sw" | "nw" | "giro";

const W = manifesto.avatar.celula.w;
const H = manifesto.avatar.celula.h;
export const CELULA = { w: W, h: H, origem: manifesto.avatar.celula.origem };
const LINHAS = manifesto.avatar.linhas;
const N_LINHAS = LINHAS.length;

type Ancoras = Record<string, number[] | boolean>;
const ANCORAS = manifesto.avatar.ancoras as Record<string, Ancoras>;
type DefCosmetica = { cat: string; ancora: string; pivo: number[]; frente: string; costas: string | null };
const COSMETICA = manifesto.avatar.cosmetica as Record<string, DefCosmetica>;
const FATOS = new Map(manifesto.avatar.fatos.map((f) => [f.id, f]));
const CORES = manifesto.avatar.cores as Record<string, Record<string, string>>;

/** Linha da folha e número de fotogramas para uma animação e direção (as direções espelhadas usam a de origem). */
export function linhaDe(anim: Anim, dir: Direcao): { linha: number; frames: number; dirFolha: string; espelhar: boolean } {
  const espelhar = dir === "sw" || dir === "nw";
  let d: string = dir === "sw" ? "se" : dir === "nw" ? "ne" : dir;
  if (anim === "vestir") d = "giro";
  let linha = LINHAS.findIndex((l) => l.anim === anim && l.dir === d);
  if (linha < 0) {
    d = "se";
    linha = LINHAS.findIndex((l) => l.anim === anim && l.dir === "se");
  }
  if (linha < 0) linha = 0;
  return { linha, frames: LINHAS[linha].frames, dirFolha: d, espelhar };
}

export function framesDe(anim: Anim): number {
  return LINHAS.find((l) => l.anim === anim)?.frames ?? 1;
}

const pastaFato = (fato: string) => (FATOS.get(fato)?.colecao === "extintos" ? "avatares/fatos-extintos" : "avatares/fatos");
const caminhoCabelo = (a: Aparencia) => (a.cabelo === "rapado" ? null : `avatares/cabelos/avatar-cabelo-${a.cabelo}-${a.corCabelo}`);

/** Folha do fato já com a cor escolhida (em cache por fato e cor). */
const folhasFato = new Map<string, Promise<CanvasImageSource>>();
function folhaFato(fato: string, cor: string): Promise<CanvasImageSource> {
  const k = `${fato}:${cor}`;
  let p = folhasFato.get(k);
  if (!p) {
    p = imagem(`${pastaFato(fato)}/avatar-fato-${fato}`).then((im) => {
      const def = FATOS.get(fato);
      const nova = CORES[cor];
      if (!def || !nova || cor === "original") return im;
      const r = def.rampa.principal as Record<string, string>;
      return trocarCores(im, (["light", "base", "shade", "dark"] as const).map((t) => [r[t], nova[t]] as [string, string]));
    });
    folhasFato.set(k, p);
  }
  return p;
}

const ITENS_CAMADA = ["ver", "calcado", "mochila", "objeto", "oculos", "chapeu"] as const;

/** Prepara um avatar (carrega as imagens) e devolve uma função síncrona que desenha cada fotograma. */
export async function prepararAvatar(a: Aparencia): Promise<(anim: Anim, dir: Direcao, f: number) => HTMLCanvasElement> {
  const [fato, cara, cabelo, padrao, emblema] = await Promise.all([
    folhaFato(a.fato, a.cor),
    imagem(`avatares/caras/avatar-cara-${a.pele}`),
    caminhoCabelo(a) ? imagem(caminhoCabelo(a)!).catch(() => null) : Promise.resolve(null),
    a.padrao ? imagem(`avatares/padroes/avatar-padrao-${a.padrao}`).catch(() => null) : Promise.resolve(null),
    a.emblema ? imagem(`avatares/emblemas/alfinete-${a.emblema}`).catch(() => null) : Promise.resolve(null),
  ]);
  const itens = new Map<string, { def: DefCosmetica; frente: HTMLImageElement; costas: HTMLImageElement | null }>();
  await Promise.all(
    ITENS_CAMADA.map(async (cat) => {
      const id = a[cat];
      const def = id ? COSMETICA[id] : undefined;
      if (!id || !def) return;
      const [frente, costas] = await Promise.all([imagem(`avatares/cosmetica/${def.frente}`), def.costas ? imagem(`avatares/cosmetica/${def.costas}`).catch(() => null) : Promise.resolve(null)]);
      itens.set(cat, { def, frente, costas });
    }),
  );
  const cache = new Map<string, HTMLCanvasElement>();

  return (anim, dir, f) => {
    const { linha, frames, dirFolha, espelhar } = linhaDe(anim, dir);
    const k = ((f % frames) + frames) % frames;
    const chave = `${linha}:${k}:${espelhar ? 1 : 0}`;
    const ja = cache.get(chave);
    if (ja) return ja;
    const c = novaTela(W, H);
    const ctx = contexto2d(c);
    if (espelhar) {
      ctx.translate(W, 0);
      ctx.scale(-1, 1);
    }
    const an = ANCORAS[`${anim === "vestir" ? "vestir" : LINHAS[linha].anim}/${dirFolha}/${String(k + 1).padStart(2, "0")}`] ?? {};
    const costas = an.costas === true;
    const sx = k * W;
    const linhaY = (l: number) => l * H;
    // sombra no chão
    ctx.fillStyle = "rgba(60, 50, 90, 0.25)";
    ctx.beginPath();
    ctx.ellipse(CELULA.origem.x, CELULA.origem.y, 9, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    const folha = (im: CanvasImageSource, l: number) => ctx.drawImage(im, sx, linhaY(l), W, H, 0, 0, W, H);
    const item = (cat: (typeof ITENS_CAMADA)[number]) => {
      const it = itens.get(cat);
      if (!it) return;
      if (costas && (cat === "ver" || cat === "oculos")) return;
      const spr = costas ? it.costas : it.frente;
      if (!spr) return;
      const pontos = it.def.ancora === "pe" ? ["pe_e", "pe_d"] : [it.def.ancora];
      for (const p of pontos) {
        const pt = an[p];
        if (!Array.isArray(pt)) continue;
        ctx.drawImage(spr, Math.round(pt[0] - it.def.pivo[0]), Math.round(pt[1] - it.def.pivo[1]));
      }
    };
    folha(fato, linha);
    if (padrao) folha(padrao, linha);
    folha(cara, linha);
    item("ver");
    if (cabelo) folha(cabelo, linha);
    item("calcado");
    item("mochila");
    if (emblema && !costas && Array.isArray(an.peito)) ctx.drawImage(emblema, Math.round(an.peito[0] - 3), Math.round(an.peito[1] - 3));
    folha(fato, linha + N_LINHAS); // capuz
    item("objeto");
    item("oculos");
    item("chapeu");
    cache.set(chave, c);
    return c;
  };
}

/** Chave estável de uma aparência (para caches). */
export const chaveAparencia = (a: Aparencia) => JSON.stringify(a);
