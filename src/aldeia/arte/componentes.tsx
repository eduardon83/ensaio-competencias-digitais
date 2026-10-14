// ─── Aldeia Digital · componentes de arte (pixel em janelas de ilustração) ───
// A interface fica vetorial e nítida; o pixel vive só em janelas bem delimitadas (avatar, retrato, cena). Escala
// sempre por números inteiros, nunca texto em pixel. Animações a 12 fps, paradas no modo calmo.
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { usePreferencias } from "../../preferencias/preferencias";
import type { Aparencia } from "../nucleo/modelo";
import { FATO } from "../nucleo/catalogo";
import { ALDEIA } from "../textos";
import { CELULA, prepararAvatar, type Anim, type Direcao } from "./avatar";
import { contexto2d, movimentoReduzido, urlArte } from "./imagens";
import { Espera as EsperaLeve } from "./espera";

const pixelado: CSSProperties = { imageRendering: "pixelated" };

/** Descrição do avatar em texto (leitor de ecrã): “Fato de lince, cor céu, boné de repórter, mochila de livros”. */
export function descricaoAvatar(a: Aparencia): string {
  const T = ALDEIA.interface.descricaoAvatar;
  const nomeFato = (FATO.get(a.fato)?.nome ?? a.fato).toLowerCase();
  const partes = [T.fato.replace("{animal}", nomeFato)];
  if (a.cor !== "original") partes.push(T.cor.replace("{cor}", (ALDEIA.interface.cores as Record<string, string>)[a.cor]?.toLowerCase() ?? a.cor));
  if (a.padrao) partes.push(T.padrao.replace("{padrao}", (ALDEIA.interface.padroes as Record<string, string>)[a.padrao]?.toLowerCase() ?? a.padrao));
  for (const k of ["chapeu", "oculos", "ver", "mochila", "objeto", "calcado"] as const) {
    const id = a[k];
    if (id) partes.push((ALDEIA.premios.itens[id] ?? id).toLowerCase());
  }
  if (a.emblema) partes.push(`alfinete ${ALDEIA.premios.emblemas[a.emblema] ?? a.emblema}`);
  const t = partes.join(", ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Avatar desenhado num canvas, animado a 12 fps (fotograma 0 no modo calmo). */
export function Avatar({ aparencia, anim = "parado", dir = "se", escala = 2, rotulo, animar = true, className, style, aoTerminarCiclo }: {
  aparencia: Aparencia;
  anim?: Anim;
  dir?: Direcao;
  escala?: number;
  /** Texto alternativo; omissão = descrição do avatar. "" = decorativo. */
  rotulo?: string;
  animar?: boolean;
  className?: string;
  style?: CSSProperties;
  aoTerminarCiclo?: () => void;
}) {
  const tela = useRef<HTMLCanvasElement>(null);
  const chave = JSON.stringify(aparencia);
  const [montar, setMontar] = useState<((a: Anim, d: Direcao, f: number) => HTMLCanvasElement) | null>(null);
  const { prefs } = usePreferencias();
  useEffect(() => {
    let vivo = true;
    prepararAvatar(JSON.parse(chave) as Aparencia).then((m) => vivo && setMontar(() => m)).catch(() => {});
    return () => {
      vivo = false;
    };
  }, [chave]);
  const fim = useRef(aoTerminarCiclo);
  fim.current = aoTerminarCiclo;
  useEffect(() => {
    const c = tela.current;
    if (!c || !montar) return;
    const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
    c.width = CELULA.w * escala * dpr;
    c.height = CELULA.h * escala * dpr;
    const ctx = contexto2d(c);
    const desenhar = (f: number) => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(montar(anim, dir, f), 0, 0, c.width, c.height);
    };
    const parado = !animar || movimentoReduzido();
    if (parado) {
      desenhar(0);
      return;
    }
    let f = 0;
    let ultimo = performance.now();
    let pedido = 0;
    const passo = 1000 / 12;
    const frames = { parado: 8, andar: 8, acenar: 8, celebrar: 10, pensar: 6, "outra-vez": 6, dormir: 6, vestir: 8 }[anim];
    desenhar(0);
    const ciclo = (t: number) => {
      if (t - ultimo >= passo) {
        ultimo = t;
        f++;
        if (f % frames === 0) fim.current?.();
        desenhar(f);
      }
      pedido = requestAnimationFrame(ciclo);
    };
    pedido = requestAnimationFrame(ciclo);
    return () => cancelAnimationFrame(pedido);
  }, [montar, anim, dir, escala, animar, prefs.calmo]);
  const descricao = rotulo ?? descricaoAvatar(aparencia);
  return (
    <canvas
      ref={tela}
      className={className}
      role={descricao ? "img" : undefined}
      aria-label={descricao || undefined}
      aria-hidden={descricao ? undefined : true}
      style={{ width: CELULA.w * escala, height: CELULA.h * escala, ...pixelado, ...style }}
    />
  );
}

/** Imagem do pacote, escalada por número inteiro a partir do tamanho nativo. */
export function Pixel({ caminho, escala = 2, alt = "", className, style, largura, altura }: { caminho: string; escala?: number; alt?: string; className?: string; style?: CSSProperties; largura?: number; altura?: number }) {
  const [tam, setTam] = useState<[number, number] | null>(largura && altura ? [largura, altura] : null);
  return (
    <img
      src={urlArte(caminho)}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={className}
      draggable={false}
      onLoad={(e) => !tam && setTam([e.currentTarget.naturalWidth, e.currentTarget.naturalHeight])}
      style={{ ...pixelado, width: tam ? tam[0] * escala : undefined, height: tam ? tam[1] * escala : undefined, ...style }}
    />
  );
}

/** Cabeça do fato (painel do professor, HUD, listas). 32 × 32 nativo. */
export function Cabeca({ fato, tamanho = 32, alt = "" }: { fato: string; tamanho?: number; alt?: string }) {
  return <img src={urlArte(`ui/cabecas/cabeca-${fato}`)} alt={alt} aria-hidden={alt ? undefined : true} width={tamanho} height={tamanho} draggable={false} style={{ ...pixelado, flex: "none" }} />;
}

export { Moldura, Retrato, EstrelasPixel, caminhoRetrato, type Expressao } from "./pixel";

/** Espera com o avatar a andar (versão leve, partilhada com o resto do ECD). */
export function Espera({ texto }: { texto?: string; aparencia?: Aparencia }) {
  return <EsperaLeve texto={texto ?? ALDEIA.interface.a_carregar} />;
}

// O avatar da última sessão da Aldeia neste navegador aparece nos ecrãs de resultado do ECD (ou a raposa, por omissão).
const CHAVE_AVATAR = "ecd.aldeia.avatar.v1";
export function guardarAvatarLocal(a: Aparencia) {
  try {
    localStorage.setItem(CHAVE_AVATAR, JSON.stringify({ ...a, pasta: FATO.get(a.fato)?.colecao === "extintos" ? "avatares/fatos-extintos" : "avatares/fatos" }));
  } catch {
    /* sem armazenamento */
  }
}
export function esquecerAvatarLocal() {
  try {
    localStorage.removeItem(CHAVE_AVATAR);
  } catch {
    /* nada */
  }
}
export function avatarGuardado(): Aparencia {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE_AVATAR) ?? "null") as (Aparencia & { pasta?: string }) | null;
    if (v && typeof v.fato === "string" && FATO.has(v.fato)) {
      const { pasta: _p, ...a } = v;
      return a;
    }
  } catch {
    /* nada */
  }
  return { fato: "raposa", cor: "original", padrao: null, pele: "pele-3", cabelo: "curto", corCabelo: "castanho", ver: null, chapeu: null, oculos: null, mochila: null, objeto: null, calcado: null, emblema: null };
}

/** Avatar do ecrã de resultado das atividades: celebra (50 ou mais) ou faz “Vamos outra vez”, um gesto leve. */
export function AvatarResultado({ pontuacao, aparencia }: { pontuacao: number; aparencia?: Aparencia }) {
  const a = useMemo(() => aparencia ?? avatarGuardado(), [aparencia]);
  const [anim, setAnim] = useState<Anim>(pontuacao >= 50 ? "celebrar" : "outra-vez");
  return <Avatar aparencia={a} anim={anim} escala={3} rotulo="" aoTerminarCiclo={() => setAnim("parado")} />;
}
