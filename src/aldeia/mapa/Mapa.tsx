// ─── Aldeia Digital · mapa isométrico (canvas 2D, carregado à parte) ─────────
// Canvas para o desenho; por cima, uma camada de botões HTML (um por edifício e a tua casa) que dá o foco visível
// (--foco), a ordem de Tab por leitura e os nomes para leitores de ecrã. Tudo o que o mapa faz está também no Mapa
// em lista. Escala inteira (1 px de arte = 2 px no ecrã), 30 fps, sem animações no modo calmo.
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as KE, type PointerEvent as PE } from "react";
import { Check, LockKeyhole } from "lucide-react";
import { prepararAvatar, type Anim, type Direcao } from "../arte/avatar";
import { contexto2d, imagem, movimentoReduzido, novaTela, tintaNoite, tira } from "../arte/imagens";
import type { IdEdificio } from "../nucleo/catalogo";
import type { Aparencia, Casa, Vizinho } from "../nucleo/modelo";
import { nomeVisivel } from "../nucleo/nomes";
import { ALDEIA } from "../textos";
import {
  ADERECOS, ARTE_CASA, ARTE_EDIFICIOS, CHAO, JARDINS, LOTES, MUNDO_H, MUNDO_W, N, P, POSICAO_EDIFICIO,
  caminho, deEcra, direcaoDoPasso, grelhaPassagem, ordemLeitura, portaCasa, portaEdificio, type EstadoEdificio,
} from "./mundo";

export interface InfoEdificio {
  estado: EstadoEdificio;
  missao: boolean;
  abreNo: number | null;
}
export type Alvo = IdEdificio | "casa";

export interface PropsMapa {
  escuro: boolean;
  eu: { lugar: number; aparencia: Aparencia; casa: Casa; nome: string };
  vizinhos: Vizinho[];
  edificios: Record<IdEdificio, InfoEdificio>;
  /** Pedido externo para andar até um sítio (Mapa em lista, tutorial). O número muda a cada pedido. */
  irPara?: { alvo: Alvo; n: number } | null;
  /** Animação pedida ao avatar (celebrar depois de uma missão, acenar ao chegar). */
  animacao?: { anim: Anim; n: number } | null;
  /** Destaques do tutorial (edifícios, a casa ou o próprio avatar). */
  destaque?: (Alvo | "avatar")[];
  aoEntrar: (alvo: Alvo) => void;
  aoTocarObras?: (id: IdEdificio, abreNo: number | null) => void;
}

const NPC: Partial<Record<IdEdificio, string>> = {
  escola: "professora", jornal: "diretora-graca", laboratorio: "doutora-ines", biblioteca: "bibliotecaria", arquivo: "tome", junta: "presidente-junta",
  seguranca: "mae", mercado: "marta", oficina: "robo", museu: "rui", horta: "avo",
};
const PASSO_MS = 400;

interface Objeto {
  prof: number;
  desenhar: (ctx: CanvasRenderingContext2D, t: number) => void;
}


export default function Mapa(props: PropsMapa) {
  const { escuro, eu, vizinhos, edificios, irPara, destaque, animacao } = props;
  const caixa = useRef<HTMLDivElement>(null);
  const tela = useRef<HTMLCanvasElement>(null);
  const camada = useRef<HTMLDivElement>(null);
  const destaqueAvatar = useRef<HTMLDivElement>(null);
  const grelha = useMemo(() => grelhaPassagem(), []);
  const portas = useMemo(() => {
    const m = new Map<Alvo, [number, number]>();
    for (const id of Object.keys(ARTE_EDIFICIOS) as IdEdificio[]) m.set(id, portaEdificio(grelha, id));
    m.set("casa", portaCasa(grelha, eu.lugar));
    return m;
  }, [grelha, eu.lugar]);
  const [pronto, setPronto] = useState(false);
  const [foco, setFoco] = useState<[number, number] | null>(null);
  const [falando, setFalando] = useState<string>("");
  const estado = useRef({
    pos: [...portas.get("casa")!] as [number, number],
    rota: [] as [number, number][],
    inicioPasso: 0,
    de: [...portas.get("casa")!] as [number, number],
    dir: "se" as Direcao,
    anim: "acenar" as Anim,
    animAte: performance.now() + 1500,
    aoChegar: null as null | (() => void),
    cam: [0, 0] as [number, number],
    camAlvo: [0, 0] as [number, number],
    parado: performance.now(),
    sujo: true,
  });
  const recursos = useRef<{
    chao: HTMLCanvasElement | null;
    agua: HTMLImageElement | HTMLCanvasElement | null;
    estaticos: Objeto[];
    avatar: ((a: Anim, d: Direcao, f: number) => HTMLCanvasElement) | null;
    vizinhos: { v: Vizinho; montar: (a: Anim, d: Direcao, f: number) => HTMLCanvasElement; pos: [number, number] }[];
    marcadores: { x: number; y: number; tipo: "missao" | "bloqueado" }[];
    foco: HTMLImageElement | null;
    marcador: HTMLImageElement | null;
    bloqueado: HTMLImageElement | null;
    halo: HTMLImageElement | null;
    lampadas: [number, number][];
    nuvem: HTMLImageElement | null;
    caixas: Map<Alvo, { x: number; y: number; w: number; h: number }>;
  }>({ chao: null, agua: null, estaticos: [], avatar: null, vizinhos: [], marcadores: [], foco: null, marcador: null, bloqueado: null, halo: null, lampadas: [], nuvem: null, caixas: new Map() });
  const [caixas, setCaixas] = useState<Map<Alvo, { x: number; y: number; w: number; h: number }>>(new Map());
  const luz = escuro ? "entardecer" : "dia";
  const chaveEdificios = JSON.stringify(edificios);
  const chaveVizinhos = JSON.stringify(vizinhos.map((v) => [v.lugar, v.aparencia, v.casa, v.ativo]));
  const chaveEu = JSON.stringify([eu.aparencia, eu.casa, eu.lugar]);

  // ── Carregar e montar a cena ───────────────────────────────────────────────
  useEffect(() => {
    let vivo = true;
    (async () => {
      const noite = (im: HTMLImageElement) => (escuro ? tintaNoite(im) : im);
      const tiposChao = [...new Set(CHAO.flat())];
      const mos = new Map<string, HTMLImageElement | HTMLCanvasElement>();
      await Promise.all([...tiposChao, "borda-relva"].map(async (t) => mos.set(t, noite(await imagem(`mundo/mosaicos/mosaico-${t}`)))));
      const agua = noite(await imagem("mundo/mosaicos/mosaico-agua"));
      // Chão desenhado uma vez (sem a água, que mexe).
      const chao = novaTela(MUNDO_W, MUNDO_H);
      const cc = contexto2d(chao);
      cc.fillStyle = escuro ? "#2a2f48" : "#cfe9f5";
      cc.fillRect(0, 0, MUNDO_W, MUNDO_H);
      for (let i = 0; i < N; i++)
        for (let j = 0; j < N; j++) {
          const t = CHAO[j][i];
          const [x, y] = P(i, j);
          if (i === N - 1 || j === N - 1) cc.drawImage(mos.get("borda-relva")!, x - 32, y);
          if (t === "agua") continue;
          cc.drawImage(mos.get(t)!, x - 32, y);
        }
      const estaticos: Objeto[] = [];
      const caixasNovas = new Map<Alvo, { x: number; y: number; w: number; h: number }>();
      const marcadores: { x: number; y: number; tipo: "missao" | "bloqueado" }[] = [];
      // Edifícios no estado de cada um (forma e ícone dizem o estado).
      await Promise.all(
        (Object.keys(ARTE_EDIFICIOS) as IdEdificio[]).map(async (id) => {
          const pos = POSICAO_EDIFICIO.get(id)!;
          const info = edificios[id];
          const est = info?.estado ?? "obras";
          const arte = ARTE_EDIFICIOS[id].estados[est];
          const im = await imagem(`mundo/edificios/${id}/edificio-${id}-${est}-${luz}`);
          const [nx, ny] = P(pos.i, pos.j);
          const x = nx - arte.origem[0];
          const y = ny - arte.origem[1];
          caixasNovas.set(id, { x: x + 8, y: y + 8, w: im.width - 16, h: im.height - 16 });
          estaticos.push({ prof: pos.i + pos.w + pos.j + pos.d, desenhar: (ctx) => ctx.drawImage(im, x, y) });
          const m = arte.ancoras.marcador;
          if (info?.missao) marcadores.push({ x: x + m[0], y: y + m[1], tipo: "missao" });
          else if (est === "obras") marcadores.push({ x: x + m[0], y: y + m[1], tipo: "bloqueado" });
          // Personagem à porta (só nos edifícios abertos).
          const npc = NPC[id];
          if (npc && est !== "obras") {
            const caminhoNpc = npc === "robo" ? "personagens/robo/npc-robo-parado" : `personagens/${npc}/npc-${npc}-parado-se`;
            const sprite = noite(await imagem(caminhoNpc).catch(() => imagem(`personagens/${npc}/npc-${npc}-parado-se`)));
            const meta = tira(caminhoNpc);
            const [pi, pj] = portas.get(id)!;
            const ni = pi + 1 < N && grelha[pj][pi + 1] ? pi + 1 : pi;
            const nj = ni === pi ? pj + 1 : pj;
            const [sx, sy] = P(ni + 0.5, nj + 0.5);
            const cw = meta.celula[0] || 48;
            const ch = meta.celula[1] || 72;
            const piv = meta.pivo ?? [cw / 2, ch - 3];
            const frames = Math.max(1, meta.fotogramas || 1);
            const fase = Math.random() * 1000;
            grelha[nj][ni] = false;
            estaticos.push({ prof: ni + nj + 1.2, desenhar: (ctx, t) => ctx.drawImage(sprite, (Math.floor((t + fase) / 250) % frames) * cw, 0, cw, ch, sx - piv[0], sy - piv[1], cw, ch) });
          }
        }),
      );
      // Adereços (árvores com baloiço lento, candeeiros acesos ao entardecer).
      const lampadas: [number, number][] = [];
      const desenharAdereco = async (a: (typeof ADERECOS)[number]) => {
        const nome = a.t === "candeeiro" && escuro ? "candeeiro-aceso" : a.t;
        const im = escuro && nome !== "candeeiro-aceso" ? tintaNoite(await imagem(`mundo/aderecos/${nome}`)) : await imagem(`mundo/aderecos/${nome}`);
        const meta = tira(`mundo/aderecos/${a.t}`);
        const frames = a.t.startsWith("arvore") ? meta.fotogramas || 4 : 1;
        const cw = frames > 1 ? meta.celula[0] : im.width;
        const ch = frames > 1 ? meta.celula[1] : im.height;
        const [x, y] = P(a.i, a.j);
        const fase = Math.floor(Math.random() * 4);
        if (a.t === "candeeiro") lampadas.push([x, y - 38]);
        estaticos.push({
          prof: a.i + a.j + (a.t.startsWith("arvore") ? 1 : 0),
          desenhar: (ctx, t) => {
            const f = frames > 1 ? (Math.floor(t / 333) + fase) % frames : 0;
            if (a.espelhar) {
              ctx.save();
              ctx.translate(x, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(im, f * cw, 0, cw, ch, -a.piv[0], y - a.piv[1], cw, ch);
              ctx.restore();
            } else ctx.drawImage(im, f * cw, 0, cw, ch, x - a.piv[0], y - a.piv[1], cw, ch);
          },
        });
      };
      await Promise.all(ADERECOS.map(desenharAdereco));
      // Casas: a minha, a dos colegas; lotes vazios são jardins.
      const casas = new Map<number, { casa: Casa; fato: string }>([[eu.lugar, { casa: eu.casa, fato: eu.aparencia.fato }], ...vizinhos.map((v) => [v.lugar, { casa: v.casa, fato: v.aparencia.fato }] as [number, { casa: Casa; fato: string }])]);
      const caixaCorreio = noite(await imagem("mundo/aderecos/caixa-correio-casa"));
      for (const l of LOTES) {
        const c = casas.get(l.n);
        const [nx, ny] = P(l.i, l.j);
        if (!c) {
          for (const a of JARDINS[l.n - 1] ?? []) await desenharAdereco(a);
          continue;
        }
        const [paredes, porta, telhado] = await Promise.all([imagem(`mundo/casa/casa-paredes-${c.casa.paredes}`), imagem(`mundo/casa/casa-porta-${c.casa.porta}`), imagem(`mundo/casa/casa-telhado-${c.casa.telhado}`)]);
        const camadas = [paredes, porta, telhado].map(noite);
        const x = nx - ARTE_CASA.origem[0];
        const y = ny - ARTE_CASA.origem[1];
        const bandeira = await imagem(`mundo/casa/bandeiras/bandeira-${c.fato}`).catch(() => null);
        const ban = ARTE_CASA.ancoras.bandeira;
        if (l.n === eu.lugar) caixasNovas.set("casa", { x: x + 10, y: y + 10, w: paredes.width - 20, h: paredes.height - 14 });
        estaticos.push({
          prof: l.i + 2 + l.j + 2,
          desenhar: (ctx, t) => {
            for (const k of camadas) ctx.drawImage(k, x, y);
            if (bandeira) ctx.drawImage(bandeira, (Math.floor(t / 250) % 4) * 16, 0, 16, 28, x + ban[0] - 2, y + ban[1] - 27, 16, 28);
          },
        });
        const [cx, cy] = P(l.i + 0.1, l.j + 2.5);
        estaticos.push({ prof: l.i + l.j + 2.7, desenhar: (ctx) => ctx.drawImage(caixaCorreio, cx - 5, cy - 21) });
        if (c.casa.jardim) {
          const nome = { flores: "canteiro-flores", horta: "canteiro-flores", baloico: "baloico", arvore: "arvore-laranjeira" }[c.casa.jardim] ?? "canteiro-flores";
          const piv = nome === "arvore-laranjeira" ? [24, 60] : nome === "baloico" ? [16, 32] : [16, 17];
          await desenharAdereco({ t: nome, i: l.i + 2.5, j: l.j + 0.9, piv });
        }
      }
      const [focoIm, marcador, bloqueado, halo, nuvem, montarEu] = await Promise.all([
        imagem("mundo/mosaicos/mosaico-foco"), imagem("ui/marcador-missao"), imagem("ui/marcador-bloqueado"), imagem("mundo/aderecos/luz-halo"), imagem("mundo/aderecos/sombra-nuvem"), prepararAvatar(eu.aparencia),
      ]);
      const viz = await Promise.all(vizinhos.map(async (v) => ({ v, montar: await prepararAvatar(v.aparencia), pos: portaCasa(grelha, v.lugar) })));
      if (!vivo) return;
      Object.assign(recursos.current, { chao, agua, estaticos, avatar: montarEu, vizinhos: viz, marcadores, foco: focoIm, marcador, bloqueado, halo, lampadas, nuvem, caixas: caixasNovas });
      setCaixas(caixasNovas);
      estado.current.sujo = true;
      setPronto(true);
    })().catch(() => setPronto(true));
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [luz, chaveEdificios, chaveVizinhos, chaveEu]);

  // ── Andar ──────────────────────────────────────────────────────────────────
  function andarPara(destino: [number, number], aoChegar?: () => void) {
    const e = estado.current;
    const origem: [number, number] = [Math.round(e.pos[0]), Math.round(e.pos[1])];
    if (movimentoReduzido()) {
      // Modo calmo: muda de sítio sem passos.
      e.pos = [...destino];
      e.rota = [];
      e.anim = "parado";
      e.sujo = true;
      e.parado = performance.now();
      aoChegar?.();
      return;
    }
    const rota = caminho(grelha, origem, destino);
    if (!rota.length) {
      if (origem[0] === destino[0] && origem[1] === destino[1]) aoChegar?.();
      return;
    }
    e.de = origem;
    e.rota = rota;
    e.inicioPasso = performance.now();
    e.aoChegar = aoChegar ?? null;
    e.anim = "andar";
  }

  function entrar(alvo: Alvo) {
    const porta = portas.get(alvo);
    if (!porta) return;
    andarPara(porta, () => {
      const e = estado.current;
      e.anim = "pensar";
      e.animAte = performance.now() + (movimentoReduzido() ? 0 : 500);
      e.dir = "ne";
      setTimeout(() => props.aoEntrar(alvo), movimentoReduzido() ? 0 : 450);
    });
  }

  useEffect(() => {
    if (irPara) entrar(irPara.alvo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [irPara?.n]);
  useEffect(() => {
    if (!animacao) return;
    const e = estado.current;
    e.anim = animacao.anim;
    e.dir = "se";
    e.animAte = performance.now() + (animacao.anim === "celebrar" ? 1700 : 1400);
    e.sujo = true;
  }, [animacao?.n]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Ciclo de desenho ───────────────────────────────────────────────────────
  useEffect(() => {
    const c = tela.current;
    const cx = caixa.current;
    if (!c || !cx || !pronto) return;
    let pedido = 0;
    let ultimo = 0;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const k = Math.max(1, Math.round(2 * dpr)); // píxeis do dispositivo por píxel de arte
    const escalaCss = k / dpr;
    let largura = 0;
    let altura = 0;
    const ajustar = () => {
      largura = cx.clientWidth;
      altura = cx.clientHeight;
      c.width = Math.round(largura * dpr);
      c.height = Math.round(altura * dpr);
      c.style.width = `${largura}px`;
      c.style.height = `${altura}px`;
      estado.current.sujo = true;
    };
    ajustar();
    const ro = new ResizeObserver(ajustar);
    ro.observe(cx);
    const ctx = contexto2d(c);
    const e = estado.current;
    const [px0, py0] = P(e.pos[0] + 0.5, e.pos[1] + 0.5);
    e.cam = [px0, py0 - 20];
    e.camAlvo = [...e.cam];

    const frame = (t: number) => {
      pedido = requestAnimationFrame(frame);
      const calmo = movimentoReduzido();
      if (t - ultimo < 33) return;
      ultimo = t;
      const r = recursos.current;
      // avanço do passo
      if (e.rota.length) {
        const p = Math.min(1, (t - e.inicioPasso) / PASSO_MS);
        const prox = e.rota[0];
        e.dir = direcaoDoPasso(prox[0] - e.de[0], prox[1] - e.de[1]);
        e.pos = [e.de[0] + (prox[0] - e.de[0]) * p, e.de[1] + (prox[1] - e.de[1]) * p];
        if (p >= 1) {
          e.de = prox;
          e.rota.shift();
          e.inicioPasso = t;
          if (!e.rota.length) {
            e.anim = "parado";
            e.parado = t;
            const f = e.aoChegar;
            e.aoChegar = null;
            f?.();
          }
        }
        e.sujo = true;
      } else if (e.anim !== "parado" && t > e.animAte) {
        e.anim = "parado";
        e.parado = t;
        e.sujo = true;
      } else if (e.anim === "parado" && !calmo && t - e.parado > 20_000 && t - e.parado < 20_700) {
        e.anim = "pensar";
        e.animAte = t + 600;
      }
      if (calmo && !e.sujo) return;
      const [ax, ay] = P(e.pos[0] + 0.5, e.pos[1] + 0.5);
      e.camAlvo = [ax, ay - 20];
      const lerp = calmo ? 1 : 0.18;
      e.cam = [e.cam[0] + (e.camAlvo[0] - e.cam[0]) * lerp, e.cam[1] + (e.camAlvo[1] - e.cam[1]) * lerp];
      // limites do mundo
      const meiaW = largura / escalaCss / 2;
      const meiaH = altura / escalaCss / 2;
      const camX = Math.max(meiaW, Math.min(MUNDO_W - meiaW, e.cam[0]));
      const camY = Math.max(meiaH, Math.min(MUNDO_H - meiaH, e.cam[1]));
      const tx = Math.round(c.width / 2 - camX * k);
      const ty = Math.round(c.height / 2 - camY * k);
      const tt = calmo ? 0 : t;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = escuro ? "#2a2f48" : "#cfe9f5";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.setTransform(k, 0, 0, k, tx, ty);
      ctx.imageSmoothingEnabled = false;
      if (r.chao) ctx.drawImage(r.chao, 0, 0);
      // água (4 fotogramas a 4 fps)
      if (r.agua) {
        const f = Math.floor(tt / 250) % 4;
        for (let i = 0; i < N; i++)
          for (let j = 0; j < N; j++) {
            if (CHAO[j][i] !== "agua") continue;
            const [x, y] = P(i, j);
            ctx.drawImage(r.agua, f * 64, 0, 64, 32, x - 32, y, 64, 32);
          }
      }
      if (foco && r.foco) {
        const [fx, fy] = P(foco[0], foco[1]);
        ctx.drawImage(r.foco, fx - 32, fy);
      }
      // objetos por profundidade
      const dinamicos: Objeto[] = [];
      if (r.avatar) {
        const montar = r.avatar;
        const fr = calmo ? 0 : Math.floor(tt / 83);
        const anim = e.anim;
        dinamicos.push({ prof: Math.floor(e.pos[0]) + Math.floor(e.pos[1]) + 1.5, desenhar: (cc) => cc.drawImage(montar(anim, e.dir, fr), Math.round(ax - 22), Math.round(ay - 60)) });
      }
      for (const v of r.vizinhos) {
        const [vx, vy] = P(v.pos[0] + 0.5, v.pos[1] + 0.5);
        const fr = calmo ? 0 : Math.floor(tt / 83);
        dinamicos.push({ prof: v.pos[0] + v.pos[1] + 1.4, desenhar: (cc) => cc.drawImage(v.montar(v.v.ativo ? "parado" : "dormir", "se", fr), vx - 22, vy - 60) });
      }
      const todos = [...r.estaticos, ...dinamicos].sort((a, b) => a.prof - b.prof);
      for (const o of todos) o.desenhar(ctx, tt);
      // marcadores de missão (flutuam a 4 fps) e cadeados das obras
      for (const m of r.marcadores) {
        if (m.tipo === "missao" && r.marcador) {
          const f = calmo ? 0 : Math.floor(tt / 250) % 4;
          ctx.drawImage(r.marcador, f * 16, 0, 16, 22, m.x - 8, m.y - 21, 16, 22);
        } else if (m.tipo === "bloqueado" && r.bloqueado) ctx.drawImage(r.bloqueado, m.x - 6, m.y - 14);
      }
      if (escuro && r.halo) {
        ctx.globalCompositeOperation = "screen";
        for (const [lx, ly] of r.lampadas) ctx.drawImage(r.halo, lx - 23, ly - 6);
        ctx.globalCompositeOperation = "source-over";
      }
      if (!escuro && !calmo && r.nuvem) {
        ctx.globalAlpha = 0.6;
        for (const [bx, by] of [[600, 700], [1700, 1050], [2300, 500]]) {
          const d = ((tt / 1000) * 4) % (MUNDO_W + 300);
          ctx.drawImage(r.nuvem, ((bx + d) % (MUNDO_W + 200)) - 150, by - d / 2 + 0);
        }
        ctx.globalAlpha = 1;
      }
      // camada HTML acompanha a câmara
      if (camada.current) camada.current.style.transform = `translate(${tx / dpr}px, ${ty / dpr}px) scale(${escalaCss})`;
      if (destaqueAvatar.current) {
        destaqueAvatar.current.style.left = `${Math.round(ax - 26)}px`;
        destaqueAvatar.current.style.top = `${Math.round(ay - 62)}px`;
      }
      e.sujo = false;
    };
    pedido = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(pedido);
      ro.disconnect();
    };
  }, [pronto, escuro, foco]);

  // ── Rato, toque e teclado ──────────────────────────────────────────────────
  function mosaicoDoPonto(ev: { clientX: number; clientY: number }): [number, number] | null {
    const c = tela.current;
    const cam = camada.current;
    if (!c || !cam) return null;
    const m = new DOMMatrix(getComputedStyle(cam).transform);
    const r = c.getBoundingClientRect();
    const x = (ev.clientX - r.left - m.e) / m.a;
    const y = (ev.clientY - r.top - m.f) / m.d;
    const [i, j] = deEcra(x, y);
    const fi = Math.floor(i);
    const fj = Math.floor(j);
    return fi >= 0 && fj >= 0 && fi < N && fj < N ? [fi, fj] : null;
  }
  function aoTocar(ev: PE<HTMLCanvasElement>) {
    const m = mosaicoDoPonto(ev);
    if (!m) return;
    caixa.current?.focus({ preventScroll: true });
    // casa de um colega: mostra o nome (o interior é privado)
    const lote = LOTES.find((l) => m[0] >= l.i && m[0] < l.i + 2 && m[1] >= l.j && m[1] < l.j + 2);
    if (lote) {
      if (lote.n === eu.lugar) return entrar("casa");
      const v = vizinhos.find((x) => x.lugar === lote.n);
      if (v) setFalando(`${ALDEIA.interface.mapa.casaDe.replace("{nome}", nomeVisivel(v.nome))}. ${ALDEIA.interface.mapa.privada}`);
      return;
    }
    andarPara(m);
  }
  function aoPassar(ev: PE<HTMLCanvasElement>) {
    if (ev.pointerType !== "mouse") return;
    const m = mosaicoDoPonto(ev);
    if (m && grelha[m[1]][m[0]] && (!foco || foco[0] !== m[0] || foco[1] !== m[1])) setFoco(m);
  }
  function aoTeclar(ev: KE<HTMLDivElement>) {
    if (ev.target !== caixa.current) return;
    const e = estado.current;
    const passos: Record<string, [number, number]> = {
      ArrowUp: [-1, -1], w: [-1, -1], W: [-1, -1], ArrowDown: [1, 1], s: [1, 1], S: [1, 1],
      ArrowLeft: [-1, 1], a: [-1, 1], A: [-1, 1], ArrowRight: [1, -1], d: [1, -1], D: [1, -1],
    };
    const p = passos[ev.key];
    if (p) {
      ev.preventDefault();
      if (e.rota.length > 1) return;
      const atual: [number, number] = [Math.round(e.pos[0]), Math.round(e.pos[1])];
      // tenta a diagonal do ecrã e, se não der, um dos lados
      for (const [di, dj] of [p, [p[0], 0], [0, p[1]]] as [number, number][]) {
        const n: [number, number] = [atual[0] + di, atual[1] + dj];
        if (n[0] >= 0 && n[1] >= 0 && n[0] < N && n[1] < N && grelha[n[1]][n[0]]) {
          andarPara(n);
          break;
        }
      }
      return;
    }
    if (ev.key === "Enter" || ev.key === " ") {
      const atual: [number, number] = [Math.round(e.pos[0]), Math.round(e.pos[1])];
      for (const [alvo, porta] of portas) if (Math.abs(porta[0] - atual[0]) + Math.abs(porta[1] - atual[1]) <= 1) {
        ev.preventDefault();
        if (alvo !== "casa" && edificios[alvo]?.estado === "obras") props.aoTocarObras?.(alvo, edificios[alvo].abreNo);
        else entrar(alvo);
        return;
      }
    }
  }

  const ordem = useMemo(() => {
    const ids: Alvo[] = ordemLeitura();
    const casa = caixas.get("casa");
    if (casa) {
      const pos = ids.findIndex((id) => (caixas.get(id)?.y ?? 0) > casa.y);
      ids.splice(pos < 0 ? ids.length : pos, 0, "casa");
    }
    return ids;
  }, [caixas]);

  const nomeAlvo = (a: Alvo) => (a === "casa" ? ALDEIA.interface.mapa.aTuaCasa : ALDEIA.edificios[a].nome);
  const rotuloAlvo = (a: Alvo) => {
    if (a === "casa") return ALDEIA.interface.mapa.aTuaCasa;
    const i = edificios[a];
    const E = ALDEIA.estadosEdificio;
    const estadoTxt = i.estado === "obras" ? `${E.obras}${i.abreNo !== null ? `. ${E.abreNoCapitulo.replace("{capitulo}", String(i.abreNo))}` : ""}` : i.missao ? E.missao : i.estado === "concluido" ? E.concluido : i.estado === "festivo" ? E.festivo : E.aberto;
    return `${nomeAlvo(a)}: ${estadoTxt}`;
  };
  const caixasDestaque = (destaque ?? []).filter((d): d is Alvo => d !== "avatar").map((d) => caixas.get(d)).filter((b): b is NonNullable<typeof b> => Boolean(b));
  useEffect(() => {
    if (!falando) return;
    const t = setTimeout(() => setFalando(""), 4000);
    return () => clearTimeout(t);
  }, [falando]);

  return (
    <div
      ref={caixa}
      className="aldeia-mapa"
      tabIndex={0}
      role="application"
      aria-roledescription={ALDEIA.interface.mapa.titulo}
      aria-label={ALDEIA.interface.mapa.titulo}
      aria-describedby="aldeia-mapa-instrucoes"
      onKeyDown={aoTeclar}
    >
      <p id="aldeia-mapa-instrucoes" className="sr-only">
        {ALDEIA.interface.mapa.descricao} {ALDEIA.interface.mapa.instrucoes}
      </p>
      <canvas ref={tela} onPointerDown={aoTocar} onPointerMove={aoPassar} onPointerLeave={() => setFoco(null)} aria-hidden="true" />
      <div ref={camada} className="aldeia-mapa__camada" style={{ width: MUNDO_W, height: MUNDO_H }}>
        {ordem.map((alvo) => {
          const b = caixas.get(alvo);
          if (!b) return null;
          const info = alvo === "casa" ? null : edificios[alvo];
          const obras = info?.estado === "obras";
          return (
            <div key={alvo}>
              <button
                type="button"
                className="aldeia-mapa__edificio"
                style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
                aria-label={rotuloAlvo(alvo)}
                onClick={() => (obras && alvo !== "casa" ? props.aoTocarObras?.(alvo, info?.abreNo ?? null) : entrar(alvo))}
              />
              {info && (info.estado === "concluido" || obras || info.missao) && (
                <span className="aldeia-mapa__etiqueta" aria-hidden="true" style={{ left: b.x + b.w / 2, top: info.missao ? b.y + 30 : b.y + 4 }}>
                  {info.missao ? ALDEIA.estadosEdificio.missao : obras ? (
                    <>
                      <LockKeyhole size={10} aria-hidden="true" /> {ALDEIA.estadosEdificio.obras}
                    </>
                  ) : (
                    <>
                      <Check size={10} aria-hidden="true" /> {nomeAlvo(alvo)}
                    </>
                  )}
                </span>
              )}
            </div>
          );
        })}
        {caixasDestaque.map((b, k) => (
          <div key={k} className="aldeia-destaque" aria-hidden="true" style={{ left: b.x - 4, top: b.y - 4, width: b.w + 8, height: b.h + 8 }} />
        ))}
        {destaque?.includes("avatar") && <div ref={destaqueAvatar} className="aldeia-destaque" aria-hidden="true" style={{ width: 52, height: 68 }} />}
      </div>
      {falando && (
        <div className="aldeia-mapa__aviso" role="status">
          {falando}
        </div>
      )}
      {!pronto && <div className="aldeia-mapa__espera" role="status">{ALDEIA.interface.a_carregar}</div>}
    </div>
  );
}
