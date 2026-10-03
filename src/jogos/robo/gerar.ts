// ─── O Robô da Bancada: mapas, interpretador e solução de referência ─────────
// O mapa é gerado a partir de um caminho aleatório (sem cruzamentos), por isso tem sempre solução.
// A solução de referência comprime o caminho com repetições (e "avançar até bloquear" no nível 5) e serve de
// meta de eficiência: quem usar tantas ou menos instruções tem a pontuação máxima de eficiência.
import { amostra, escolher, inteiro, type Gerador } from "../../motor/aleatorio";

export type Dir = 0 | 1 | 2 | 3; // N, E, S, O
export const NOME_DIR = ["Norte", "Este", "Sul", "Oeste"] as const;
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

export type Instr = { t: "avancar" } | { t: "esquerda" } | { t: "direita" } | { t: "apanhar" } | { t: "ate" } | { t: "repetir"; n: number } | { t: "fim" };
export const NOME_INSTR: Record<Instr["t"], string> = { avancar: "Avançar", esquerda: "Virar à esquerda", direita: "Virar à direita", apanhar: "Apanhar", ate: "Avançar até bloquear", repetir: "Repetir", fim: "Fim da repetição" };

export interface Ponto {
  x: number;
  y: number;
}
export interface Mapa {
  lado: number;
  inicio: Ponto & { d: Dir };
  objetivo: Ponto;
  itens: Ponto[];
  obstaculos: Ponto[];
  referencia: Instr[];
  meta: number; // instruções da referência
}

export interface ConfigRobo {
  desafios: number;
  lado: number;
  segmentos: [number, number];
  comprimento: [number, number];
  itens: number;
  obstaculos: number;
  repetir: boolean;
  ate: boolean;
  escada: boolean; // caminho em escada (padrão que se repete)
}

const chave = (p: Ponto) => `${p.x},${p.y}`;
export const nomeCelula = (p: Ponto) => `${String.fromCharCode(65 + p.x)}${p.y + 1}`;
const dentro = (lado: number, p: Ponto) => p.x >= 0 && p.y >= 0 && p.x < lado && p.y < lado;

type Acao = "avancar" | "esquerda" | "direita" | "apanhar";

/** Gera o caminho: lista de segmentos (viragem antes, comprimento). */
function caminho(cfg: ConfigRobo, r: Gerador): { inicio: Ponto & { d: Dir }; segs: { vira: 0 | 1 | -1; n: number }[] } | null {
  let segs: { vira: 0 | 1 | -1; n: number }[];
  if (cfg.escada) {
    const a = inteiro(1, 2, r);
    const b = inteiro(1, 2, r);
    const c = inteiro(2, 3, r);
    const primeiro = escolher<1 | -1>([1, -1], r);
    segs = [{ vira: 0, n: a }];
    for (let i = 0; i < c; i++) {
      if (i > 0) segs.push({ vira: (-primeiro) as 1 | -1, n: a });
      segs.push({ vira: primeiro, n: b });
    }
  } else {
    const k = inteiro(cfg.segmentos[0], cfg.segmentos[1], r);
    segs = Array.from({ length: k }, (_, i) => ({ vira: i === 0 ? 0 : escolher<1 | -1>([1, -1], r), n: inteiro(cfg.comprimento[0], cfg.comprimento[1], r) }));
  }
  const inicio = { x: inteiro(0, cfg.lado - 1, r), y: inteiro(0, cfg.lado - 1, r), d: inteiro(0, 3, r) as Dir };
  let { x, y, d } = inicio;
  const vistos = new Set([chave(inicio)]);
  for (const s of segs) {
    d = ((d + s.vira + 4) % 4) as Dir;
    for (let i = 0; i < s.n; i++) {
      x += DX[d];
      y += DY[d];
      if (!dentro(cfg.lado, { x, y }) || vistos.has(`${x},${y}`)) return null;
      vistos.add(`${x},${y}`);
    }
  }
  return { inicio, segs };
}

export function gerarMapa(cfg: ConfigRobo, r: Gerador = Math.random): Mapa {
  for (let tent = 0; tent < 500; tent++) {
    const c = caminho(cfg, r);
    if (!c) continue;
    const acoes: Acao[] = [];
    const celulas: Ponto[] = [{ x: c.inicio.x, y: c.inicio.y }];
    const fins: { p: Ponto; d: Dir; idx: number }[] = [];
    let { x, y, d } = c.inicio;
    c.segs.forEach((s) => {
      if (s.vira) {
        d = ((d + s.vira + 4) % 4) as Dir;
        acoes.push(s.vira === 1 ? "direita" : "esquerda");
      }
      for (let i = 0; i < s.n; i++) {
        x += DX[d];
        y += DY[d];
        acoes.push("avancar");
        celulas.push({ x, y });
      }
      fins.push({ p: { x, y }, d, idx: acoes.length });
    });
    const objetivo = { x, y };
    // Itens nos fins de segmento (exceto o último, que é o objetivo).
    const escolhidos = amostra(fins.slice(0, -1), cfg.itens, r).sort((a, b) => a.idx - b.idx);
    if (escolhidos.length < cfg.itens) continue;
    escolhidos.reverse().forEach((f) => acoes.splice(f.idx, 0, "apanhar"));
    const noCaminho = new Set(celulas.map(chave));
    const obstaculos: Ponto[] = [];
    if (cfg.ate) {
      // Bloqueios logo a seguir ao fim dos segmentos, para "avançar até bloquear" fazer sentido.
      for (const f of fins) {
        const q = { x: f.p.x + DX[f.d], y: f.p.y + DY[f.d] };
        if (dentro(cfg.lado, q) && !noCaminho.has(chave(q)) && !obstaculos.some((o) => chave(o) === chave(q))) obstaculos.push(q);
      }
    }
    const livres: Ponto[] = [];
    for (let yy = 0; yy < cfg.lado; yy++) for (let xx = 0; xx < cfg.lado; xx++) if (!noCaminho.has(`${xx},${yy}`) && !obstaculos.some((o) => o.x === xx && o.y === yy)) livres.push({ x: xx, y: yy });
    obstaculos.push(...amostra(livres, cfg.obstaculos, r));
    const base: Omit<Mapa, "referencia" | "meta"> = { lado: cfg.lado, inicio: c.inicio, objetivo, itens: escolhidos.map((f) => f.p), obstaculos };
    const referencia = comprimir(acoes, base as Mapa, cfg);
    return { ...base, referencia, meta: custo(referencia) };
  }
  throw new Error("Não foi possível gerar o mapa");
}

export const custo = (p: Instr[]) => p.filter((i) => i.t !== "fim").length;

// ─── Compressão (solução de referência) ──────────────────────────────────────
type Simples = Exclude<Instr, { t: "repetir" } | { t: "fim" }>;

function comRuns(seq: Simples[]): Instr[] {
  const out: Instr[] = [];
  for (let i = 0; i < seq.length; ) {
    let j = i;
    while (j < seq.length && seq[j].t === seq[i].t) j++;
    const k = j - i;
    if (k >= 3) out.push({ t: "repetir", n: k }, seq[i], { t: "fim" });
    else for (let m = 0; m < k; m++) out.push(seq[i]);
    i = j;
  }
  return out;
}

function comprimir(acoes: Acao[], mapa: Mapa, cfg: ConfigRobo): Instr[] {
  let seq: Simples[] = acoes.map((t) => ({ t }));
  if (cfg.ate) {
    // Substitui corridas de "avançar" que acabam num bloqueio por "avançar até bloquear".
    const bloq = new Set(mapa.obstaculos.map(chave));
    const novo: Simples[] = [];
    let { x, y, d } = mapa.inicio;
    for (let i = 0; i < seq.length; ) {
      const a = seq[i];
      if (a.t !== "avancar") {
        if (a.t === "direita") d = ((d + 1) % 4) as Dir;
        if (a.t === "esquerda") d = ((d + 3) % 4) as Dir;
        novo.push(a);
        i++;
        continue;
      }
      let j = i;
      while (j < seq.length && seq[j].t === "avancar") j++;
      const k = j - i;
      x += DX[d] * k;
      y += DY[d] * k;
      const q = { x: x + DX[d], y: y + DY[d] };
      if (k >= 2 && (!dentro(mapa.lado, q) || bloq.has(chave(q)))) novo.push({ t: "ate" });
      else for (let m = 0; m < k; m++) novo.push({ t: "avancar" });
      i = j;
    }
    seq = novo;
  }
  if (!cfg.repetir) return seq;
  let melhor = comRuns(seq);
  const igual = (a: Simples[], b: Simples[]) => a.length === b.length && a.every((x, i) => x.t === b[i].t);
  for (let p = 2; p <= seq.length / 2; p++)
    for (let s = 0; s + 2 * p <= seq.length; s++) {
      const bloco = seq.slice(s, s + p);
      let c = 1;
      while (s + (c + 1) * p <= seq.length && igual(seq.slice(s + c * p, s + (c + 1) * p), bloco)) c++;
      if (c < 2) continue;
      const cand: Instr[] = [...comRuns(seq.slice(0, s)), { t: "repetir", n: c }, ...comRuns(bloco), { t: "fim" }, ...comRuns(seq.slice(s + c * p))];
      if (custo(cand) < custo(melhor)) melhor = cand;
    }
  return melhor;
}

// ─── Interpretador ───────────────────────────────────────────────────────────
export interface Estado extends Ponto {
  d: Dir;
  apanhados: string[];
}
export interface Execucao {
  passos: Estado[]; // o primeiro é o estado inicial
  erro?: string;
  sucesso: boolean;
}

type No = Simples | { t: "repetir"; n: number; corpo: No[] };

export function analisar(prog: Instr[]): { arvore: No[] } | { erro: string } {
  const pilha: No[][] = [[]];
  const abertos: { n: number }[] = [];
  for (const i of prog) {
    if (i.t === "repetir") {
      const no = { t: "repetir" as const, n: i.n, corpo: [] as No[] };
      pilha[pilha.length - 1].push(no);
      pilha.push(no.corpo);
      abertos.push(no);
    } else if (i.t === "fim") {
      if (!abertos.length) return { erro: "Há um “Fim da repetição” sem “Repetir” antes." };
      pilha.pop();
      abertos.pop();
    } else pilha[pilha.length - 1].push(i);
  }
  if (abertos.length) return { erro: "Falta fechar uma repetição com “Fim da repetição”." };
  return { arvore: pilha[0] };
}

export function executar(prog: Instr[], mapa: Mapa, limite = 300): Execucao {
  const a = analisar(prog);
  const inicial: Estado = { ...mapa.inicio, apanhados: [] };
  if ("erro" in a) return { passos: [inicial], erro: a.erro, sucesso: false };
  const bloq = new Set(mapa.obstaculos.map(chave));
  const itens = new Set(mapa.itens.map(chave));
  const passos: Estado[] = [inicial];
  let e = inicial;
  const livre = (q: Ponto) => dentro(mapa.lado, q) && !bloq.has(chave(q));
  const correr = (nos: No[]): string | null => {
    for (const no of nos) {
      if (passos.length > limite) return "O programa é demasiado longo.";
      if (no.t === "repetir") {
        for (let k = 0; k < no.n; k++) {
          const err = correr(no.corpo);
          if (err) return err;
        }
        continue;
      }
      if (no.t === "esquerda" || no.t === "direita") e = { ...e, d: ((e.d + (no.t === "direita" ? 1 : 3)) % 4) as Dir };
      else if (no.t === "avancar") {
        const q = { x: e.x + DX[e.d], y: e.y + DY[e.d] };
        if (!livre(q)) return `O robô bateu ${dentro(mapa.lado, q) ? "numa caixa" : "na borda da bancada"} em ${nomeCelula(e)}.`;
        e = { ...e, ...q };
      } else if (no.t === "ate") {
        let q = { x: e.x + DX[e.d], y: e.y + DY[e.d] };
        while (livre(q)) {
          e = { ...e, ...q };
          passos.push(e);
          q = { x: e.x + DX[e.d], y: e.y + DY[e.d] };
        }
        continue;
      } else if (no.t === "apanhar") {
        const k = chave(e);
        if (!itens.has(k) || e.apanhados.includes(k)) return `Não há nada para apanhar em ${nomeCelula(e)}.`;
        e = { ...e, apanhados: [...e.apanhados, k] };
      }
      passos.push(e);
    }
    return null;
  };
  const erro = correr(a.arvore) ?? undefined;
  const fim = passos[passos.length - 1];
  const sucesso = !erro && fim.x === mapa.objetivo.x && fim.y === mapa.objetivo.y && fim.apanhados.length === mapa.itens.length;
  return { passos, erro, sucesso };
}

/** Programa em texto: "Repetir 3× [Avançar], Virar à direita". */
export function textoPrograma(p: Instr[]): string {
  const partes: string[] = [];
  for (const i of p) {
    if (i.t === "repetir") partes.push(`Repetir ${i.n}× [`);
    else if (i.t === "fim") partes.push("]");
    else partes.push(NOME_INSTR[i.t]);
  }
  return partes.join(", ").replace(/\[, /g, "[").replace(/, \]/g, "]");
}
