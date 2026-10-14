// ─── Aldeia Digital · regras da história e dos prémios (puras, testadas) ─────
// O servidor usa estas funções para calcular os desbloqueios a partir do progresso: o cliente nunca dá itens a si próprio.
// Recompensar esforço e progresso, nunca comparar alunos. Sem loja e sem moeda.
import { CARIMBO_MINIMO, estrelasDe } from "../../motor/limiares";
import {
  CASA_OPCOES, CASA_POR_CAPITULO, CABELOS, CHAOS, CORES, CORES_CABELO, CORES_INICIAIS, CORES_POR_ESTRELAS, DESAFIOS, DIMENSOES, EMBLEMAS, FESTA,
  ITEM, ITENS_SEMPRE, JARDINS, LUGARES_MOVEL, MOVEIS, OFERTAS, PADROES, PADROES_LENCO, PADROES_POR_ESTRELAS, PAPEIS, PELES, VARIANTES_MOVEL,
  capitulosDaTurma, missoesDaTurma, type CategoriaCasa, type ConfigHistoria, type DefMissao, type Dimensao,
} from "./catalogo";
import type { Aluno, Aparencia, Casa, Interior } from "./modelo";

export { estrelasDe, CARIMBO_MINIMO };

/** Missões com pontuação (atividades e cidadania), sem o item de prática. */
export function pontuaveis(missoes: DefMissao[]): DefMissao[] {
  return missoes.filter((m) => m.tipo !== "evento" && !m.pratica);
}

export function concluida(aluno: Pick<Aluno, "progresso">, id: string): boolean {
  return id in aluno.progresso;
}

/** Capítulos da turma com o estado para este aluno. */
export interface EstadoCapitulo {
  n: number;
  missoes: DefMissao[];
  feitas: number;
  aberto: boolean;
  concluido: boolean;
  /** Fechado só porque o professor ainda não o abriu (ritmo guiado). */
  aEsperaDoProfessor: boolean;
}

export function estadoCapitulos(config: ConfigHistoria, capitulosAbertos: number[], aluno: Pick<Aluno, "progresso">): EstadoCapitulo[] {
  const missoes = missoesDaTurma(config);
  const caps = capitulosDaTurma(missoes);
  const out: EstadoCapitulo[] = [];
  let anterioresFeitos = true;
  for (const n of caps) {
    const ms = missoes.filter((m) => m.capitulo === n);
    const feitas = ms.filter((m) => concluida(aluno, m.id)).length;
    const abertoProfessor = config.ritmo === "livre" || n === caps[0] || capitulosAbertos.includes(n);
    const aberto = anterioresFeitos && abertoProfessor;
    out.push({ n, missoes: ms, feitas, aberto, concluido: feitas === ms.length, aEsperaDoProfessor: anterioresFeitos && !abertoProfessor });
    anterioresFeitos = anterioresFeitos && feitas === ms.length;
  }
  return out;
}

/** Capítulo em que o aluno está: o primeiro por concluir (ou o último, se acabou tudo). */
export function capituloAtual(caps: EstadoCapitulo[]): number {
  return (caps.find((c) => !c.concluido) ?? caps[caps.length - 1])?.n ?? 0;
}

export function missaoDisponivel(config: ConfigHistoria, capitulosAbertos: number[], aluno: Pick<Aluno, "progresso">, id: string): boolean {
  return estadoCapitulos(config, capitulosAbertos, aluno).some((c) => c.aberto && c.missoes.some((m) => m.id === id));
}

export function totalEstrelas(aluno: Pick<Aluno, "progresso">, missoes: DefMissao[]): number {
  return pontuaveis(missoes).reduce((s, m) => s + (aluno.progresso[m.id] ? estrelasDe(aluno.progresso[m.id].melhor) : 0), 0);
}

/** Objetivo coletivo: 3 em cada 4 alunos acabaram o capítulo do meio da história. O Largo ganha grinaldas. */
export function objetivoColetivo(config: ConfigHistoria, capitulosAbertos: number[], alunos: Pick<Aluno, "progresso">[]): { atingido: boolean; feitos: number; precisa: number; capitulo: number } {
  const caps = capitulosDaTurma(missoesDaTurma(config));
  const capitulo = caps[Math.floor(caps.length / 2)] ?? 0;
  const feitos = alunos.filter((a) => estadoCapitulos(config, capitulosAbertos, a).find((c) => c.n === capitulo)?.concluido).length;
  const precisa = Math.max(1, Math.ceil(alunos.length * 0.75));
  return { atingido: alunos.length > 0 && feitos >= precisa, feitos, precisa, capitulo };
}

export interface Desbloqueios {
  estrelas: number;
  cores: string[];
  padroes: string[];
  itens: string[];
  emblemas: string[];
  trofeus: string[];
  casa: CategoriaCasa[];
  capitulosConcluidos: number[];
  festa: boolean;
  /** Missões concluídas cujo prémio ainda não foi escolhido (e com algum item por ganhar). */
  ofertasPendentes: string[];
}

export function desbloqueios(aluno: Pick<Aluno, "progresso" | "treinos" | "marcos">, config: ConfigHistoria, capitulosAbertos: number[], objetivo: boolean): Desbloqueios {
  const missoes = missoesDaTurma(config);
  const caps = estadoCapitulos(config, capitulosAbertos, aluno);
  const capitulosConcluidos = caps.filter((c) => c.concluido).map((c) => c.n);
  const festa = caps.length > 0 && caps.every((c) => c.concluido);
  const estrelas = totalEstrelas(aluno, missoes);
  const cores = [...CORES_INICIAIS, ...CORES_POR_ESTRELAS.filter(([e]) => estrelas >= e).map(([, c]) => c)];
  const padroes = PADROES_POR_ESTRELAS.filter(([e]) => estrelas >= e).map(([, p]) => p);
  const premios = Object.values(aluno.progresso).map((p) => p.premio).filter((x): x is string => Boolean(x));
  const itens = [...ITENS_SEMPRE, ...premios];
  if (festa) {
    if (!cores.includes(FESTA.cor)) cores.push(FESTA.cor);
    padroes.push(FESTA.padrao);
    itens.push(FESTA.item);
  }
  // Carimbos (85 ou mais): emblema e taça. Contam os 12 desafios e a Biblioteca Viva (13 emblemas).
  const emblemas = EMBLEMAS.filter((e) => missoes.some((m) => m.slug === e && !m.pratica && (aluno.progresso[m.id]?.melhor ?? 0) >= CARIMBO_MINIMO));
  const trofeus = emblemas.map((e) => `taca-${e}`);
  for (const n of capitulosConcluidos) trofeus.push(`estatueta-cap-${n}`);
  for (const d of DIMENSOES) {
    const ms = missoes.filter((m) => m.dimensao === d.id);
    if (ms.length && ms.every((m) => concluida(aluno, m.id))) trofeus.push(`roseta-${d.id}`);
  }
  const pont = pontuaveis(missoes).filter((m) => aluno.progresso[m.id]);
  if (pont.length > 0) trofeus.push("especial-primeira-missao");
  if (Object.values(aluno.progresso).some((p) => p.tentativas > 1 && p.melhor > p.primeira)) trofeus.push("especial-outra-vez");
  if (aluno.treinos >= 3) trofeus.push("especial-treino-casa");
  if (pont.filter((m) => estrelasDe(aluno.progresso[m.id].melhor) === 3).length >= 5) trofeus.push("especial-todas-estrelas");
  if (objetivo) trofeus.push("especial-ajudante-aldeia");
  if (festa) trofeus.push("especial-jornal-aldeia");
  const casa = capitulosConcluidos.map((n) => CASA_POR_CAPITULO[n]).filter((c): c is CategoriaCasa => Boolean(c));
  const tem = new Set(itens);
  const ofertasPendentes = missoes
    .filter((m) => aluno.progresso[m.id] && !aluno.progresso[m.id].premio && (OFERTAS[m.id] ?? []).some((i) => !tem.has(i)))
    .map((m) => m.id);
  return { estrelas, cores, padroes, itens: [...new Set(itens)], emblemas, trofeus, casa, capitulosConcluidos, festa, ofertasPendentes };
}

/** A pequena seleção de uma missão, sem os itens que o aluno já tem. */
export function ofertaPara(missao: string, d: Pick<Desbloqueios, "itens">): string[] {
  return (OFERTAS[missao] ?? []).filter((i) => !d.itens.includes(i));
}

// ── Validação das escolhas do aluno (o servidor recusa o que não foi ganho) ──
const NULAVEL = ["padrao", "ver", "chapeu", "oculos", "mochila", "objeto", "calcado", "emblema"] as const;

export function aparenciaValida(a: Aparencia, atual: Aparencia, d: Desbloqueios): boolean {
  if (a.fato !== atual.fato) return false; // o fato é o lugar do aluno na turma
  if (!d.cores.includes(a.cor) || (a.cor !== "original" && !CORES.includes(a.cor))) return false;
  if (!PELES.includes(a.pele) || !CABELOS.includes(a.cabelo)) return false;
  if (!(a.cabelo === "lenco" ? PADROES_LENCO : CORES_CABELO).includes(a.corCabelo)) return false;
  for (const k of NULAVEL) if (a[k] !== null && typeof a[k] !== "string") return false;
  if (a.padrao !== null && (!PADROES.includes(a.padrao) || !d.padroes.includes(a.padrao))) return false;
  if (a.emblema !== null && !d.emblemas.includes(a.emblema)) return false;
  const itens: [keyof Aparencia, string][] = [["ver", "ver"], ["chapeu", "chapeu"], ["oculos", "oculos"], ["mochila", "mochila"], ["objeto", "objeto"], ["calcado", "calcado"]];
  for (const [campo, cat] of itens) {
    const v = a[campo];
    if (v === null) continue;
    const it = ITEM.get(v as string);
    if (!it || it.cat !== cat || !d.itens.includes(it.id)) return false;
  }
  return true;
}

export function casaValida(c: Casa, atual: Casa, d: Desbloqueios): boolean {
  const pode = (cat: CategoriaCasa) => d.casa.includes(cat);
  if (!CASA_OPCOES.paredes.includes(c.paredes) || (c.paredes !== atual.paredes && !pode("paredes"))) return false;
  if (!CASA_OPCOES.portas.includes(c.porta) || (c.porta !== atual.porta && !pode("portas"))) return false;
  if (!CASA_OPCOES.telhados.includes(c.telhado) || (c.telhado !== atual.telhado && !pode("telhados"))) return false;
  if (c.jardim !== null && (!(JARDINS as readonly string[]).includes(c.jardim) || (c.jardim !== atual.jardim && !pode("jardim")))) return false;
  return true;
}

export function interiorValido(i: Interior, atual: Interior, d: Desbloqueios): boolean {
  if (!(PAPEIS as readonly string[]).includes(i.papel) || (i.papel !== atual.papel && !d.casa.includes("papel"))) return false;
  if (!(CHAOS as readonly string[]).includes(i.chao) || (i.chao !== atual.chao && !d.casa.includes("chao"))) return false;
  if (typeof i.moveis !== "object" || i.moveis === null) return false;
  for (const [m, v] of Object.entries(i.moveis)) {
    if (!(MOVEIS as readonly string[]).includes(m) || !v || typeof v.lugar !== "string") return false;
    if (!LUGARES_MOVEL[m as (typeof MOVEIS)[number]].some((l) => l.id === v.lugar)) return false;
    if (v.variante !== undefined && !(VARIANTES_MOVEL[m] ?? []).includes(v.variante)) return false;
  }
  if (i.trofeus !== null) {
    const lugares = 18 + (d.casa.includes("vitrine") ? 12 : 0);
    if (!Array.isArray(i.trofeus) || i.trofeus.length > lugares || new Set(i.trofeus).size !== i.trofeus.length) return false;
    if (i.trofeus.some((t) => typeof t !== "string" || !d.trofeus.includes(t))) return false;
  }
  if (typeof i.moldura !== "boolean" || (i.moldura && !d.casa.includes("moldura"))) return false;
  return true;
}

/** Os desafios que contam para o perfil de competências, com a melhor e a primeira pontuação. */
export function perfilCompetencias(aluno: Pick<Aluno, "progresso">, missoes: DefMissao[]): { slug: string; melhor: number; primeira: number }[] {
  return missoes
    .filter((m) => m.conta && m.slug && (DESAFIOS as readonly string[]).includes(m.slug) && aluno.progresso[m.id])
    .map((m) => ({ slug: m.slug!, melhor: aluno.progresso[m.id].melhor, primeira: aluno.progresso[m.id].primeira }));
}

/** Perfil de cidadania: média das missões de cada dimensão trabalhada (só as concluídas). */
export function perfilCidadania(aluno: Pick<Aluno, "progresso">, missoes: DefMissao[]): { dimensao: Dimensao; media: number; feitas: number; total: number }[] {
  const out: { dimensao: Dimensao; media: number; feitas: number; total: number }[] = [];
  for (const d of DIMENSOES) {
    const ms = missoes.filter((m) => m.tipo === "cidadania" && m.dimensao === d.id);
    if (!ms.length) continue;
    const feitas = ms.filter((m) => aluno.progresso[m.id]);
    out.push({ dimensao: d.id, media: feitas.length ? Math.round(feitas.reduce((s, m) => s + aluno.progresso[m.id].melhor, 0) / feitas.length) : 0, feitas: feitas.length, total: ms.length });
  }
  return out;
}
