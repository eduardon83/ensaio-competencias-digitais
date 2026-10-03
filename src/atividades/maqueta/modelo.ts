// ─── A Maqueta: modelo puro (objetos, grupos, operações, câmara e tarefas) ───
// Sem three.js: a cena 3D (Cena.tsx) só desenha este estado. Assim as operações e a verificação das tarefas
// são testáveis e iguais para rato, toque e teclado.
import { escolher, inteiro, misturar, type Gerador } from "../../motor/aleatorio";

export type Tipo = "terreno" | "edificio" | "telhado" | "muro" | "banco" | "caixote" | "cubo";
export interface V3 {
  x: number;
  y: number;
  z: number;
}
export interface Objeto {
  id: string;
  nome: string;
  tipo: Tipo;
  pos: V3; // centro da base (y = altura da base)
  tam: V3; // largura (x), altura (y), profundidade (z)
  rot: number; // graus, em torno do eixo vertical
  grupo: string | null; // objetos colados partilham o mesmo grupo
  cor: string;
  fixo?: boolean;
}

export interface Camara {
  az: number; // azimute em graus (0 = vista de frente, a olhar para −z a partir de +z)
  el: number; // elevação em graus (90 = de cima)
  dist: number;
  alvo: V3;
  orto: boolean;
}

export type IdTarefa = "orbita" | "aproximar" | "telhado" | "colar" | "rodar" | "dividir" | "separar" | "apagar" | "criar" | "topo" | "orto";
export interface Tarefa {
  id: IdTarefa;
  texto: string;
  como: string; // ajuda para o relatório
}

export interface ConfigMaqueta {
  tarefas: IdTarefa[];
  ferramentas: Ferramenta[];
  ortografica: boolean;
  segundos: number;
  aleatorio: boolean; // ângulo de rotação e ordem das tarefas sorteados (as posições mudam sempre)
  caixoteColado: boolean;
}
export type Ferramenta = "selecionar" | "mover" | "rodar" | "orbita" | "deslocar" | "criar" | "colar" | "separar" | "dividir" | "apagar" | "desfazer";

export const CAMARA_INICIAL: Camara = { az: 35, el: 32, dist: 14, alvo: { x: 0, y: 0.5, z: 0 }, orto: false };

const r1 = (n: number) => Math.round(n * 2) / 2; // grelha de 0,5

export interface Maqueta {
  objetos: Objeto[];
  anguloRodar: 90 | 180 | 270;
  edificioRot0: number;
  seguinte: number; // contador para ids novos
}

export function criarMaqueta(cfg: ConfigMaqueta, r: Gerador = Math.random): Maqueta {
  const j = (a: number, b: number) => inteiro(a, b, r) / 2;
  const ladoTelhado = escolher([-1, 1], r);
  const objetos: Objeto[] = [
    { id: "terreno", nome: "Terreno", tipo: "terreno", pos: { x: 0, y: -0.2, z: 0 }, tam: { x: 12, y: 0.2, z: 9 }, rot: 0, grupo: null, cor: "#6f8f6a", fixo: true },
    { id: "edificio", nome: "Edifício", tipo: "edificio", pos: { x: 0, y: 0, z: 0 }, tam: { x: 3, y: 2, z: 2 }, rot: 0, grupo: null, cor: "#b5523b" },
    { id: "telhado", nome: "Telhado", tipo: "telhado", pos: { x: r1(ladoTelhado * (3.5 + j(0, 2))), y: 0, z: r1(j(2, 6)) }, tam: { x: 3, y: 1, z: 2 }, rot: 0, grupo: null, cor: "#3b4a5a" },
    { id: "muro", nome: "Muro", tipo: "muro", pos: { x: 0, y: 0, z: r1(-3 - j(0, 2)) }, tam: { x: 6, y: 0.8, z: 0.4 }, rot: 0, grupo: null, cor: "#c9c1b3" },
    { id: "banco", nome: "Banco", tipo: "banco", pos: { x: r1(-ladoTelhado * (3.5 + j(0, 2))), y: 0, z: 2 }, tam: { x: 1.5, y: 0.5, z: 0.6 }, rot: 0, grupo: cfg.caixoteColado ? "g-banco" : null, cor: "#8a6a3f" },
    { id: "caixote", nome: "Caixote", tipo: "caixote", pos: { x: r1(-ladoTelhado * (3.5 + j(0, 2))) + 1.2, y: 0, z: 2 }, tam: { x: 0.7, y: 0.7, z: 0.7 }, rot: 0, grupo: cfg.caixoteColado ? "g-banco" : null, cor: "#d29a3a" },
  ];
  // O caixote fica sempre colado ao banco, junto dele.
  const banco = objetos.find((o) => o.id === "banco")!;
  objetos.find((o) => o.id === "caixote")!.pos.x = banco.pos.x + Math.sign(banco.pos.x || 1) * -1.2;
  return { objetos, anguloRodar: cfg.aleatorio ? escolher([90, 180, 270] as const, r) : 90, edificioRot0: 0, seguinte: 1 };
}

export const clonar = (m: Maqueta): Maqueta => ({ ...m, objetos: m.objetos.map((o) => ({ ...o, pos: { ...o.pos }, tam: { ...o.tam } })) });

/** Ids que se movem juntos com `id` (o próprio e os colados). */
export function conjunto(m: Maqueta, ids: string[]): string[] {
  const grupos = new Set(m.objetos.filter((o) => ids.includes(o.id) && o.grupo).map((o) => o.grupo));
  return m.objetos.filter((o) => !o.fixo && (ids.includes(o.id) || (o.grupo && grupos.has(o.grupo)))).map((o) => o.id);
}

export function mover(m: Maqueta, ids: string[], dx: number, dz: number, dy = 0): Maqueta {
  const n = clonar(m);
  const alvo = conjunto(n, ids);
  for (const o of n.objetos) if (alvo.includes(o.id)) {
    o.pos.x = r1(o.pos.x + dx);
    o.pos.z = r1(o.pos.z + dz);
    o.pos.y = Math.max(0, Math.round((o.pos.y + dy) * 4) / 4);
  }
  return n;
}

/** Põe os objetos selecionados a uma posição absoluta (arrastar no chão), mantendo as distâncias do grupo. */
export function moverPara(m: Maqueta, ids: string[], ref: string, x: number, z: number): Maqueta {
  const o = m.objetos.find((k) => k.id === ref);
  if (!o) return m;
  return mover(m, ids, r1(x) - o.pos.x, r1(z) - o.pos.z);
}

export function rodar(m: Maqueta, ids: string[], graus: number): Maqueta {
  const n = clonar(m);
  const alvo = n.objetos.filter((o) => conjunto(n, ids).includes(o.id));
  if (!alvo.length) return m;
  const cx = alvo.reduce((s, o) => s + o.pos.x, 0) / alvo.length;
  const cz = alvo.reduce((s, o) => s + o.pos.z, 0) / alvo.length;
  const a = (graus * Math.PI) / 180;
  for (const o of alvo) {
    const x = o.pos.x - cx;
    const z = o.pos.z - cz;
    o.pos.x = Math.round((cx + x * Math.cos(a) + z * Math.sin(a)) * 100) / 100;
    o.pos.z = Math.round((cz - x * Math.sin(a) + z * Math.cos(a)) * 100) / 100;
    o.rot = (((o.rot + graus) % 360) + 360) % 360;
  }
  return n;
}

export function colar(m: Maqueta, ids: string[]): Maqueta {
  const alvo = conjunto(m, ids);
  if (alvo.length < 2) return m;
  const n = clonar(m);
  const g = `g-${n.seguinte++}`;
  for (const o of n.objetos) if (alvo.includes(o.id)) o.grupo = g;
  return n;
}

export function separar(m: Maqueta, ids: string[]): Maqueta {
  const n = clonar(m);
  const grupos = new Set(n.objetos.filter((o) => ids.includes(o.id)).map((o) => o.grupo));
  for (const o of n.objetos) if (o.grupo && grupos.has(o.grupo)) o.grupo = null;
  return n;
}

export function apagar(m: Maqueta, ids: string[]): Maqueta {
  // Objetos colados apagam-se juntos (como numa aplicação 3D): para apagar só um, é preciso separá-lo primeiro.
  const alvo = conjunto(m, ids);
  const n = clonar(m);
  n.objetos = n.objetos.filter((o) => o.fixo || !alvo.includes(o.id));
  // Um grupo com um só objeto deixa de ser grupo.
  for (const o of n.objetos) if (o.grupo && n.objetos.filter((k) => k.grupo === o.grupo).length < 2) o.grupo = null;
  return n;
}

export function criarCubo(m: Maqueta, perto?: V3): Maqueta {
  const n = clonar(m);
  const k = n.seguinte++;
  // Procura um sítio livre (pela planta de cada objeto, com margem) em espiral à volta do ponto pedido.
  const ocupado = (x: number, z: number) => n.objetos.some((o) => {
    if (o.fixo) return false;
    const meio = Math.max(o.tam.x, o.tam.z) / 2 + 0.6;
    return Math.abs(o.pos.x - x) < meio && Math.abs(o.pos.z - z) < meio;
  });
  const x0 = r1(perto?.x ?? 2.5);
  const z0 = r1(perto?.z ?? 2.5);
  let x = x0;
  let z = z0;
  procura: for (let raio = 0; raio <= 10; raio++)
    for (let dx = -raio; dx <= raio; dx++)
      for (const dz of [-raio, raio]) {
        const cx = x0 + dx * 0.5;
        const cz = z0 + dz * 0.5;
        if (Math.abs(cx) <= 5.5 && Math.abs(cz) <= 4 && !ocupado(cx, cz)) {
          x = cx;
          z = cz;
          break procura;
        }
      }
  n.objetos.push({ id: `cubo-${k}`, nome: `Cubo ${n.objetos.filter((o) => o.tipo === "cubo").length + 1}`, tipo: "cubo", pos: { x, y: 0, z }, tam: { x: 1, y: 1, z: 1 }, rot: 0, grupo: null, cor: "#4f7fd1" });
  return n;
}

/** Divide um objeto em dois ao longo do lado mais comprido. */
export function dividir(m: Maqueta, id: string): Maqueta {
  const o = m.objetos.find((k) => k.id === id);
  if (!o || o.fixo || o.tipo === "telhado") return m;
  const n = clonar(m);
  const i = n.objetos.findIndex((k) => k.id === id);
  const base = n.objetos[i];
  const eixoX = base.tam.x >= base.tam.z;
  const metade = (eixoX ? base.tam.x : base.tam.z) / 2;
  const a = (base.rot * Math.PI) / 180;
  // deslocamento local de ±metade/2 ao longo do eixo, rodado
  const lx = eixoX ? metade / 2 : 0;
  const lz = eixoX ? 0 : metade / 2;
  const dx = lx * Math.cos(a) + lz * Math.sin(a);
  const dz = -lx * Math.sin(a) + lz * Math.cos(a);
  const tam = eixoX ? { ...base.tam, x: metade } : { ...base.tam, z: metade };
  const nomeBase = base.nome.replace(/ \(\d\)$/, "");
  const p1: Objeto = { ...base, id: `${base.id}-a${n.seguinte}`, nome: `${nomeBase} (1)`, tam: { ...tam }, pos: { ...base.pos, x: base.pos.x - dx, z: base.pos.z - dz } };
  const p2: Objeto = { ...base, id: `${base.id}-b${n.seguinte}`, nome: `${nomeBase} (2)`, tam: { ...tam }, pos: { ...base.pos, x: base.pos.x + dx, z: base.pos.z + dz } };
  n.seguinte++;
  n.objetos.splice(i, 1, p1, p2);
  return n;
}

// ─── Câmara ──────────────────────────────────────────────────────────────────
export const VISTAS = {
  "3d": { az: 35, el: 32 },
  frente: { az: 0, el: 0 },
  lado: { az: 90, el: 0 },
  topo: { az: 0, el: 90 },
} as const;
export type Vista = keyof typeof VISTAS;

export function orbitar(c: Camara, daz: number, del = 0): Camara {
  return { ...c, az: (((c.az + daz) % 360) + 360) % 360, el: Math.max(0, Math.min(90, c.el + del)) };
}
export function aproximar(c: Camara, fator: number): Camara {
  return { ...c, dist: Math.max(4, Math.min(30, c.dist * fator)) };
}
export function deslocar(c: Camara, dx: number, dz: number): Camara {
  const a = (c.az * Math.PI) / 180;
  return { ...c, alvo: { ...c.alvo, x: c.alvo.x + dx * Math.cos(a) + dz * Math.sin(a), z: c.alvo.z - dx * Math.sin(a) + dz * Math.cos(a) } };
}

// ─── Tarefas ─────────────────────────────────────────────────────────────────
export const TAREFAS: Record<IdTarefa, { texto: string | ((m: Maqueta) => string); como: string }> = {
  orbita: { texto: "Roda a câmara até veres a parte de trás do edifício.", como: "Usa a Órbita (O) e arrasta, ou os botões ↺ ↻ da câmara, até a câmara ficar atrás do edifício." },
  aproximar: { texto: "Aproxima a câmara da maqueta.", como: "Usa a roda do rato, o botão + da câmara ou a tecla +." },
  telhado: { texto: "Põe o telhado em cima do edifício.", como: "Seleciona o telhado, usa Mover (G) e leva-o até ao edifício; ele encaixa em cima quando está alinhado." },
  colar: { texto: "Cola o telhado ao edifício.", como: "Seleciona o telhado e o edifício (Shift + clique) e usa Colar (J)." },
  rodar: { texto: (m) => `Roda o edifício ${m.anguloRodar} graus.`, como: "Seleciona o edifício e usa Rodar (R): cada vez roda 90 graus." },
  dividir: { texto: "Divide o muro em duas partes.", como: "Seleciona o muro e usa Dividir (K)." },
  separar: { texto: "O caixote está colado ao banco por engano. Separa-os.", como: "Seleciona o caixote ou o banco e usa Separar (P)." },
  apagar: { texto: "Apaga o caixote.", como: "Seleciona só o caixote (depois de o separar, se for preciso) e usa Apagar (Del)." },
  criar: { texto: "Cria um cubo novo para o quiosque.", como: "Usa Criar (N)." },
  topo: { texto: "Vê a maqueta de cima.", como: "Na câmara, escolhe Topo (tecla 7)." },
  orto: { texto: "Vê de frente em projeção ortográfica.", como: "Escolhe a vista Frente (1) e liga a projeção Ortográfica (5)." },
};

export const textoTarefa = (id: IdTarefa, m: Maqueta) => {
  const t = TAREFAS[id].texto;
  return typeof t === "function" ? t(m) : t;
};

export interface Sinais {
  viuTras: boolean;
  aproximou: boolean;
  viuTopo: boolean;
  viuOrtoFrente: boolean;
}

/** Telhado encaixado no edifício: alinhado em planta e na altura certa. */
export function telhadoNoSitio(m: Maqueta): boolean {
  const e = m.objetos.find((o) => o.id === "edificio");
  const t = m.objetos.find((o) => o.id === "telhado");
  if (!e || !t) return false;
  return Math.abs(e.pos.x - t.pos.x) <= 0.5 && Math.abs(e.pos.z - t.pos.z) <= 0.5 && Math.abs(t.pos.y - (e.pos.y + e.tam.y)) < 0.3;
}

/** Quando o telhado é largado sobre o edifício, encaixa no topo (como na prova: "snap"). */
export function encaixar(m: Maqueta): Maqueta {
  const e = m.objetos.find((o) => o.id === "edificio");
  const t = m.objetos.find((o) => o.id === "telhado");
  if (!e || !t) return m;
  const perto = Math.abs(e.pos.x - t.pos.x) <= 1 && Math.abs(e.pos.z - t.pos.z) <= 1;
  const altura = perto ? e.pos.y + e.tam.y : 0;
  if (t.grupo && t.grupo === e.grupo) return m;
  if (Math.abs(t.pos.y - altura) < 0.01 && (!perto || (t.pos.x === e.pos.x && t.pos.z === e.pos.z))) return m;
  const n = clonar(m);
  const tt = n.objetos.find((o) => o.id === "telhado")!;
  tt.pos.y = altura;
  if (perto) {
    tt.pos.x = e.pos.x;
    tt.pos.z = e.pos.z;
    tt.rot = e.rot;
  }
  return n;
}

export function verificar(id: IdTarefa, m: Maqueta, s: Sinais): boolean {
  const ob = (k: string) => m.objetos.find((o) => o.id === k);
  switch (id) {
    case "orbita":
      return s.viuTras;
    case "aproximar":
      return s.aproximou;
    case "telhado":
      return telhadoNoSitio(m);
    case "colar": {
      const e = ob("edificio");
      const t = ob("telhado");
      return !!e && !!t && !!e.grupo && e.grupo === t.grupo && telhadoNoSitio(m);
    }
    case "rodar": {
      const e = ob("edificio");
      return !!e && (((e.rot - m.edificioRot0) % 360) + 360) % 360 === m.anguloRodar;
    }
    case "dividir":
      return !ob("muro") && m.objetos.filter((o) => o.tipo === "muro").length >= 2;
    case "separar": {
      const b = ob("banco");
      const c = ob("caixote");
      return !!b && (!c || !c.grupo || c.grupo !== b.grupo);
    }
    case "apagar":
      return !ob("caixote") && !!ob("banco");
    case "criar":
      return m.objetos.some((o) => o.tipo === "cubo");
    case "topo":
      return s.viuTopo;
    case "orto":
      return s.viuOrtoFrente;
  }
}

/** Sinais da câmara (ficam ligados depois de alcançados). */
export function sinaisDaCamara(c: Camara, antes: Sinais): Sinais {
  const tras = c.el < 70 && Math.abs(((c.az % 360) + 360) % 360 - 180) <= 50;
  return {
    viuTras: antes.viuTras || tras,
    aproximou: antes.aproximou || c.dist <= CAMARA_INICIAL.dist * 0.7,
    viuTopo: antes.viuTopo || c.el >= 80,
    viuOrtoFrente: antes.viuOrtoFrente || (c.orto && c.el <= 10 && (c.az <= 10 || c.az >= 350)),
  };
}

export const SINAIS_INICIAIS: Sinais = { viuTras: false, aproximou: false, viuTopo: false, viuOrtoFrente: false };

export function ordemTarefas(cfg: ConfigMaqueta, r: Gerador = Math.random): IdTarefa[] {
  // As tarefas de câmara primeiro (como no protótipo); as restantes por ordem sorteada nos níveis altos.
  const camara: IdTarefa[] = ["orbita", "aproximar"];
  const fim: IdTarefa[] = ["topo", "orto"];
  const meio = cfg.tarefas.filter((t) => !camara.includes(t) && !fim.includes(t));
  return [...camara.filter((t) => cfg.tarefas.includes(t)), ...(cfg.aleatorio ? misturar(meio, r) : meio), ...fim.filter((t) => cfg.tarefas.includes(t))];
}
