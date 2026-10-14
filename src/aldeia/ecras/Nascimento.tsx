// ─── Aldeia Digital · nascimento do avatar ───────────────────────────────────
// Coreografia do pacote de arte (nascimento-v2): a Dona Cegonha chega, entrega a trouxa, o ovo baloiça; três toques
// (rato, toque, Espaço ou Enter) racham-no; a tampa salta em arco e pousa à direita do ninho; o avatar sai de dentro,
// salta para o chão e acena. Montada por camadas para qualquer fato (o pacote só traz a sequência pronta de 6).
// Modo calmo: 4 imagens fixas e o botão "Abrir o ovo". Nada pode correr mal: o avatar nasce sempre contente.
import { useEffect, useMemo, useRef, useState } from "react";
import { usePreferencias } from "../../preferencias/preferencias";
import { Botao } from "../../ui";
import { prepararAvatar, type Anim } from "../arte/avatar";
import { contexto2d, imagem, movimentoReduzido } from "../arte/imagens";
import type { Aparencia } from "../nucleo/modelo";
import { ALDEIA } from "../textos";
import { Dialogo, preencherAluno } from "./comum";

const SW = 200;
const SH = 120;
const CHAO = 100;
const NX = 74;
const NY = 70;
const EX = 88;
const EY = 33;
const CEG: [number, number] = [20, 42];
const SEG = { chegada: [0, 22], entrega: [22, 30], espera: [30, 42], "toque-1": [42, 49], "toque-2": [49, 56], "toque-3": [56, 63], abertura: [63, 79], sair: [79, 96], acenar: [96, 104] } as const;

type Spr = { im: CanvasImageSource; f: number; cw: number; ch: number; x: number; y: number; modo?: GlobalCompositeOperation };
interface Quadro {
  ceg: Spr | null;
  ovo: { im: "inteiro" | "racha-1" | "racha-2" | "racha-3" | "fundo"; x: number; y: number } | null;
  tampa: { flip: boolean; x: number; y: number } | null;
  av: { anim: Anim; f: number; x: number; y: number; dentro: boolean } | null;
  tras: Spr[];
  frente: Spr[];
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** A coreografia inteira como uma lista de quadros (só números: as imagens entram ao desenhar). */
function coreografia(im: Record<string, HTMLImageElement>): Quadro[] {
  const q: Quadro[] = [];
  const s = (nome: string, f: number, x: number, y: number, cw = 64, ch = 64, modo?: GlobalCompositeOperation): Spr => ({ im: im[nome], f, cw, ch, x, y, modo });
  const brilho = (k: number, x: number, y: number) => s("brilho", k % 4, x, y, 9, 9);
  const poeira = (k: number, x: number, y: number) => s("poeira", Math.min(3, k), x, y, 16, 10);
  const coracao = (k: number, x: number, y: number) => s("coracao", k % 4, x, y, 9, 12);
  const parada = (f = 0) => s("parada", f, ...CEG);
  const falar = (aberta: boolean) => s("falar", aberta ? 1 : 0, ...CEG);
  for (let k = 0; k < 18; k++) {
    const t = easeOut(k / 17);
    q.push({ ceg: s("voo", k % 6, -60 + 84 * t, 4 + 30 * t + Math.sin(k / 3) * 2 * (1 - t)), ovo: null, tampa: null, av: null, tras: [], frente: [] });
  }
  for (let k = 0; k < 4; k++) q.push({ ceg: s("pousarTrouxa", k, ...CEG), ovo: null, tampa: null, av: null, tras: [], frente: [] });
  for (let k = 0; k < 4; k++) q.push({ ceg: s("entregar", k, ...CEG), ovo: null, tampa: null, av: null, tras: [], frente: [] });
  const salto = [-3, -1, 0, 0];
  for (let k = 0; k < 4; k++)
    q.push({ ceg: s("entregar", 4 + k, ...CEG), ovo: { im: "inteiro", x: EX, y: EY + salto[k] }, tampa: null, av: null, tras: [], frente: [brilho(k, EX + 2, EY + 6), brilho(k + 2, EX + 34, EY + 14), poeira(k, EX + 14, EY + 46)] });
  const wob = [0, 0, -1, -1, 0, 0, 1, 1, 0, 0, 0, 0];
  for (let k = 0; k < 12; k++) q.push({ ceg: falar(Math.floor(k / 2) % 2 === 1), ovo: { im: "inteiro", x: EX + wob[k], y: EY }, tampa: null, av: null, tras: [], frente: k % 6 < 3 ? [brilho(Math.floor(k / 3), EX + 38, EY + 4)] : [] });
  for (const r of [1, 2, 3]) {
    const sh = [-2, 2, -2, 1, -1, 0, 0];
    for (let k = 0; k < 7; k++) {
      const rr = k >= 1 ? r : r - 1;
      const frente: Spr[] = [];
      if (k >= 2) frente.push(poeira(k - 2, EX + 14 + (r - 2) * 8, EY + 18));
      if (k >= 3) frente.push(brilho(k - 3, EX + (r % 2 ? 6 : 30), EY + 10));
      q.push({ ceg: parada(k === 1 ? 2 : 0), ovo: { im: rr === 0 ? "inteiro" : (`racha-${rr}` as "racha-1"), x: EX + sh[k], y: EY }, tampa: null, av: null, tras: [], frente });
    }
  }
  for (const w of [-2, 2, -2, 2]) q.push({ ceg: parada(), ovo: { im: "racha-3", x: EX + w, y: EY }, tampa: null, av: null, tras: [], frente: [] });
  const L = 12;
  const x1 = NX + 76;
  const yAberta = CHAO + 2 - 22;
  const yVirada = CHAO + 2 - 57;
  for (let k = 0; k < L; k++) {
    const t = k / (L - 1);
    const virada = k >= L - 2;
    const frente: Spr[] = [];
    if (k >= 1 && k < 9) frente.push(s("confetes", k - 1, EX - 2, EY - 18, 48, 40));
    if (virada) frente.push(poeira(k - (L - 2), x1 + 14, CHAO - 6));
    q.push({
      ceg: falar(true), ovo: { im: "fundo", x: EX, y: EY },
      tampa: virada ? { flip: true, x: x1, y: yVirada } : { flip: false, x: EX + (x1 - EX) * t, y: EY + (yAberta - EY) * t - Math.sin(Math.PI * t) * 30 },
      av: null, tras: k < 6 ? [s("luz", k, EX - 2, EY - 6, 48, 48, "screen")] : [], frente,
    });
  }
  const tampaChao = { flip: true, x: x1, y: yVirada };
  [EY + 7, EY + 1, EY - 5, EY - 11, EY - 16, EY - 19].forEach((ay, k) => {
    q.push({ ceg: parada(), ovo: { im: "fundo", x: EX, y: EY }, tampa: tampaChao, av: { anim: "parado", f: k < 4 ? 5 : 0, x: EX, y: ay, dentro: true }, tras: [], frente: k >= 2 ? [coracao(Math.min(k, 3), EX + 36, EY - 4)] : [] });
  });
  for (let k = 0; k < 4; k++) q.push({ ceg: parada(), ovo: { im: "fundo", x: EX, y: EY }, tampa: tampaChao, av: { anim: "celebrar", f: k % 2 ? 4 : 3, x: EX, y: EY - 21 - (k % 2), dentro: true }, tras: [], frente: [] });
  const [jx0, jy0, jx1, jy1] = [EX, EY - 21, NX + 36 - 22 - 4, CHAO + 12 - 60];
  for (let k = 0; k < 7; k++) {
    const t = (k + 1) / 7;
    q.push({ ceg: parada(), ovo: { im: "fundo", x: EX, y: EY }, tampa: tampaChao, av: { anim: "celebrar", f: k < 6 ? 5 : 8, x: jx0 + (jx1 - jx0) * t, y: jy0 + (jy1 - jy0) * t - Math.sin(Math.PI * t) * 14, dentro: false }, tras: [], frente: [] });
  }
  for (let k = 0; k < 8; k++) q.push({ ceg: s("acenar", k % 4, ...CEG), ovo: { im: "fundo", x: EX, y: EY }, tampa: tampaChao, av: { anim: "acenar", f: k, x: jx1, y: jy1, dentro: false }, tras: [], frente: k < 4 ? [coracao(k, jx1 + 34, jy1 + 8)] : [] });
  return q;
}

type Fase = "chegada" | "espera" | "toques" | "abrir" | "acenar";

function som(tipo: "toque" | "pop") {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ac = new AC();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.value = tipo === "pop" ? 660 : 440;
    g.gain.setValueAtTime(0.08, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + (tipo === "pop" ? 0.25 : 0.12));
    o.connect(g).connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + 0.3);
    o.onended = () => void ac.close();
  } catch {
    /* sem áudio */
  }
}

export function Nascimento({ aparencia, nome, aoTerminar }: { aparencia: Aparencia; nome: string; aoTerminar: () => void }) {
  const { escuro } = usePreferencias();
  const tela = useRef<HTMLCanvasElement>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const [fase, setFase] = useState<Fase>("chegada");
  const [toques, setToques] = useState(0);
  const [comSom, setComSom] = useState(false);
  const [escala, setEscala] = useState(3);
  const calmo = useMemo(() => movimentoReduzido(), []);
  const pedido = useRef<{ desde: number; ate: number; ciclo?: [number, number]; aoFim?: () => void }>({ desde: 0, ate: 22 });
  const quadro = useRef(0);
  const recursos = useRef<{ q: Quadro[]; im: Record<string, HTMLImageElement>; ovo: Record<string, HTMLImageElement>; montar: Awaited<ReturnType<typeof prepararAvatar>> } | null>(null);
  const [pronto, setPronto] = useState(false);
  const aluno = { nome, aparencia };

  useEffect(() => {
    let vivo = true;
    const f = aparencia.fato;
    const nomes: Record<string, string> = {
      voo: "nascimento/cegonha/cegonha-voo", parada: "nascimento/cegonha/cegonha-parada", falar: "nascimento/cegonha/cegonha-falar", acenar: "nascimento/cegonha/cegonha-acenar",
      pousarTrouxa: "nascimento-v2/cegonha/cegonha-pousar-trouxa", entregar: "nascimento-v2/cegonha/cegonha-entregar",
      brilho: "nascimento/efeitos/efeito-brilho", poeira: "nascimento/efeitos/efeito-poeira", coracao: "nascimento/efeitos/efeito-coracao", confetes: "nascimento/efeitos/efeito-confetes", luz: "nascimento/efeitos/efeito-luz-abertura",
      ninho: "nascimento-v2/ninho-grande", ninhoFrente: "nascimento-v2/ninho-grande-frente",
    };
    const ovos: Record<string, string> = { inteiro: `ovo-${f}`, "racha-1": `ovo-${f}-racha-1`, "racha-2": `ovo-${f}-racha-2`, "racha-3": `ovo-${f}-racha-3`, fundo: `ovo-${f}-fundo`, tampa: `ovo-${f}-tampa` };
    Promise.all([
      Promise.all(Object.entries(nomes).map(async ([k, c]) => [k, await imagem(c)] as const)),
      Promise.all(Object.entries(ovos).map(async ([k, c]) => [k, await imagem(`nascimento-v2/ovos/${f}/${c}`)] as const)),
      prepararAvatar(aparencia),
    ]).then(([a, o, montar]) => {
      if (!vivo) return;
      const im = Object.fromEntries(a);
      recursos.current = { q: coreografia(im), im, ovo: Object.fromEntries(o), montar };
      setPronto(true);
    });
    return () => {
      vivo = false;
    };
  }, [aparencia]);

  // Escala inteira que caiba na largura disponível.
  useEffect(() => {
    const cx = caixa.current;
    if (!cx) return;
    const ro = new ResizeObserver(() => setEscala(Math.max(2, Math.min(5, Math.floor(cx.clientWidth / SW)))));
    ro.observe(cx);
    return () => ro.disconnect();
  }, []);

  function desenhar(n: number) {
    const r = recursos.current;
    const c = tela.current;
    if (!r || !c) return;
    const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
    const k = escala * dpr;
    if (c.width !== SW * k) {
      c.width = SW * k;
      c.height = SH * k;
    }
    const ctx = contexto2d(c);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    // céu ao entardecer (mais escuro no tema escuro) e relva
    const de = escuro ? [92, 74, 120] : [247, 185, 143];
    const para = escuro ? [160, 120, 140] : [253, 227, 207];
    for (let b = 0; b < 8; b++) {
      const t = b / 7;
      ctx.fillStyle = `rgb(${de.map((v, i) => Math.round(v * (1 - t) + para[i] * t)).join(",")})`;
      ctx.fillRect(0, Math.floor((CHAO * b) / 8), SW, Math.ceil(CHAO / 8) + 1);
    }
    ctx.fillStyle = escuro ? "#5f8a63" : "#a9d98f";
    ctx.fillRect(0, CHAO - 6, SW, SH);
    ctx.fillStyle = escuro ? "#6f9a70" : "#c3e8a0";
    ctx.fillRect(0, CHAO - 6, SW, 1);
    ctx.fillStyle = escuro ? "#527a56" : "#8fc77a";
    for (let y = CHAO + 2; y < SH; y++) for (let x = 0; x < SW; x++) if ((x * 7 + y * 3) % 13 === 0) ctx.fillRect(x, y, 1, 1);
    const q = r.q[Math.max(0, Math.min(r.q.length - 1, n))];
    const spr = (s: Spr) => {
      if (s.modo) ctx.globalCompositeOperation = s.modo;
      ctx.drawImage(s.im, s.f * s.cw, 0, s.cw, s.ch, Math.round(s.x), Math.round(s.y), s.cw, s.ch);
      ctx.globalCompositeOperation = "source-over";
    };
    q.tras.forEach(spr);
    if (q.ceg) spr(q.ceg);
    ctx.drawImage(r.im.ninho, NX, NY);
    if (q.av?.dentro) ctx.drawImage(r.montar(q.av.anim, "se", q.av.f), Math.round(q.av.x), Math.round(q.av.y));
    if (q.ovo) {
      ctx.drawImage(r.ovo[q.ovo.im], Math.round(q.ovo.x), Math.round(q.ovo.y));
      ctx.drawImage(r.im.ninhoFrente, NX, NY);
    }
    if (q.tampa) {
      if (q.tampa.flip) {
        ctx.save();
        ctx.translate(0, Math.round(q.tampa.y) * 2 + 58);
        ctx.scale(1, -1);
        ctx.drawImage(r.ovo.tampa, Math.round(q.tampa.x), Math.round(q.tampa.y));
        ctx.restore();
      } else ctx.drawImage(r.ovo.tampa, Math.round(q.tampa.x), Math.round(q.tampa.y));
    }
    if (q.av && !q.av.dentro) ctx.drawImage(r.montar(q.av.anim, "se", q.av.f), Math.round(q.av.x), Math.round(q.av.y));
    q.frente.forEach(spr);
  }

  // Relógio a 12 fps: corre o segmento pedido e, se tiver ciclo, repete-o.
  useEffect(() => {
    if (!pronto) return;
    if (calmo) {
      const fixos = [SEG.espera[0], SEG["toque-3"][1] - 1, SEG.abertura[1] - 1, SEG.acenar[0]];
      desenhar(fixos[Math.min(3, toques)]);
      return;
    }
    let raf = 0;
    let ultimo = 0;
    const passo = (t: number) => {
      raf = requestAnimationFrame(passo);
      if (t - ultimo < 1000 / 12) return;
      ultimo = t;
      const p = pedido.current;
      desenhar(quadro.current);
      if (quadro.current < p.ate - 1) quadro.current++;
      else if (p.aoFim) {
        const f = p.aoFim;
        p.aoFim = undefined;
        f();
      } else if (p.ciclo) quadro.current = p.ciclo[0] + ((quadro.current + 1 - p.ciclo[0]) % (p.ciclo[1] - p.ciclo[0]));
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronto, calmo, escala, escuro, toques]);

  // Arranque: chegada e entrega correm sozinhas; depois o ovo espera em ciclo.
  useEffect(() => {
    if (!pronto || calmo) {
      if (calmo) setFase("espera");
      return;
    }
    quadro.current = 0;
    pedido.current = { desde: 0, ate: SEG.entrega[1], aoFim: () => {
      setFase("espera");
      pedido.current = { desde: SEG.espera[0], ate: SEG.espera[1], ciclo: [...SEG.espera] };
    } };
  }, [pronto, calmo]);

  function tocar() {
    if (fase === "chegada" || fase === "acenar" || toques >= 3) return;
    const n = toques + 1;
    setToques(n);
    if (comSom) som(n < 3 ? "toque" : "pop");
    if (calmo) {
      if (n === 3) setFase("acenar");
      else setFase("toques");
      return;
    }
    setFase(n < 3 ? "toques" : "abrir");
    const seg = SEG[`toque-${n}` as "toque-1"];
    quadro.current = seg[0];
    if (n < 3) pedido.current = { desde: seg[0], ate: seg[1], ciclo: [seg[1] - 1, seg[1]] };
    else pedido.current = { desde: seg[0], ate: SEG.sair[1], aoFim: () => {
      setFase("acenar");
      pedido.current = { desde: SEG.acenar[0], ate: SEG.acenar[1], ciclo: [...SEG.acenar] };
      quadro.current = SEG.acenar[0];
    } };
  }

  const T = ALDEIA.nascimento;
  const fala = fase === "chegada" ? T.chegada : fase === "acenar" ? preencherAluno(T.nasceu, aluno) : T.vaiNascer;
  const descricao = `${T.descricaoCena} ${preencherAluno(T.descricaoOvo, aluno)}`;
  return (
    <div className="aldeia-nascimento">
      <div ref={caixa} className="aldeia-nascimento__palco">
        <div className="aldeia-nascimento__moldura" style={{ width: SW * escala, height: SH * escala }}>
          <canvas
            ref={tela}
            role="img"
            aria-label={descricao}
            tabIndex={fase === "espera" || fase === "toques" ? 0 : -1}
            onPointerDown={tocar}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                tocar();
              }
            }}
            style={{ width: SW * escala, height: SH * escala, imageRendering: "pixelated", cursor: fase === "espera" || fase === "toques" ? "pointer" : "default" }}
          />
          {fase !== "chegada" && fase !== "acenar" && (
            <span className="aldeia-nascimento__etiqueta" style={{ left: (EX + 40) * escala, top: (EY + 2) * escala }}>
              {preencherAluno(T.etiqueta, aluno)}
            </span>
          )}
        </div>
      </div>
      <Dialogo
        personagem="dona-cegonha"
        expressao={fase === "acenar" ? "contente" : "neutra"}
        fala={fala}
        fixo={false}
        focar={fase !== "chegada"}
        aoContinuar={fase === "acenar" ? aoTerminar : fase === "chegada" ? undefined : tocar}
        rotuloContinuar={fase === "acenar" ? T.continuar : `${calmo ? T.abrir : T.tocar} · ${T.contador.replace("{n}", String(Math.min(3, toques + 1)))}`}
        acoes={
          <label className="opcao" style={{ minHeight: 44 }}>
            <input type="checkbox" checked={comSom} onChange={(e) => setComSom(e.target.checked)} /> {T.som}
          </label>
        }
      />
      {fase === "chegada" && (
        <div className="text-center">
          <Botao variante="discreto" onClick={() => {
            setFase("espera");
            quadro.current = SEG.espera[0];
            pedido.current = { desde: SEG.espera[0], ate: SEG.espera[1], ciclo: [...SEG.espera] };
          }}>
            {ALDEIA.tutorial.continuar}
          </Botao>
        </div>
      )}
    </div>
  );
}
