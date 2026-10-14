// ─── Aldeia Digital · alertas e resumos da turma (puros; painel, relatórios e emails) ──
import { faixaDe } from "../../motor/limiares";
import { DESAFIOS, capitulosDaTurma, missoesDaTurma, type DefMissao } from "./catalogo";
import type { AlunoPainel, TurmaDados } from "./modelo";
import { capituloAtual, estadoCapitulos, perfilCompetencias, pontuaveis } from "./regras";

const DIA = 86_400_000;

type TurmaBase = Pick<TurmaDados, "config" | "capitulosAbertos" | "semLugarEm" | "fechadaEm" | "criadoEm">;
type AlunoBase = Pick<AlunoPainel, "id" | "nome" | "progresso" | "recentes" | "criadoEm" | "lugar" | "aparencia" | "treinos" | "marcos">;

/** Data da última missão feita (ou da chegada à aldeia). */
export function ultimaAtividade(a: Pick<AlunoBase, "progresso" | "criadoEm">): number {
  let t = Date.parse(a.criadoEm) || 0;
  for (const p of Object.values(a.progresso)) t = Math.max(t, Date.parse(p.em) || 0);
  return t;
}

export function diasSemAtividade(a: Pick<AlunoBase, "progresso" | "criadoEm">, agora: Date): number {
  return Math.floor((agora.getTime() - ultimaAtividade(a)) / DIA);
}

/** A turma está a avançar: alguém fez uma missão nos últimos 7 dias. */
export function turmaAvanca(alunos: AlunoBase[], agora: Date): boolean {
  return alunos.some((a) => agora.getTime() - ultimaAtividade(a) < 7 * DIA);
}

export type MotivoApoio = "inativo" | "abaixo50" | "comecar";
/** Quem precisa de apoio: sem atividade há 7 dias (com a turma a avançar), 2 resultados abaixo de 50, ou "A começar" em 2 competências. */
export function motivosApoio(a: AlunoBase, t: TurmaBase, alunos: AlunoBase[], agora: Date): MotivoApoio[] {
  const missoes = missoesDaTurma(t.config);
  const m: MotivoApoio[] = [];
  if (diasSemAtividade(a, agora) >= 7 && turmaAvanca(alunos, agora) && !terminou(a, t)) m.push("inativo");
  if (pontuaveis(missoes).filter((x) => a.progresso[x.id] && a.progresso[x.id].melhor < 50).length >= 2) m.push("abaixo50");
  if (perfilCompetencias(a, missoes).filter((c) => faixaDe(c.melhor).min === 0).length >= 2) m.push("comecar");
  return m;
}

export function terminou(a: Pick<AlunoBase, "progresso">, t: Pick<TurmaBase, "config" | "capitulosAbertos">): boolean {
  return estadoCapitulos(t.config, t.capitulosAbertos, a).every((c) => c.concluido);
}

export type TipoAlerta = "parado" | "dificuldade" | "capitulo" | "concluida" | "fecho" | "lugares";
export interface Alerta {
  tipo: TipoAlerta;
  /** Chave estável para não repetir o mesmo alerta nos emails. */
  chave: string;
  alunos: string[]; // ids
  capitulo?: number;
  dias?: number;
}

export function alertas(t: TurmaBase, alunos: AlunoBase[], agora: Date): Alerta[] {
  const out: Alerta[] = [];
  const semana = Math.floor(agora.getTime() / (7 * DIA));
  const parados = alunos.filter((a) => diasSemAtividade(a, agora) >= 7 && turmaAvanca(alunos, agora) && !terminou(a, t));
  if (parados.length) out.push({ tipo: "parado", chave: `parado:${semana}:${parados.map((a) => a.id).sort().join(",")}`, alunos: parados.map((a) => a.id), dias: 7 });
  const dificuldade = alunos.filter((a) => a.recentes.length >= 3 && a.recentes.slice(-3).every((r) => r.p < 50));
  if (dificuldade.length) out.push({ tipo: "dificuldade", chave: `dificuldade:${dificuldade.map((a) => `${a.id}@${a.recentes[a.recentes.length - 1].em}`).sort().join(",")}`, alunos: dificuldade.map((a) => a.id) });
  const caps = capitulosDaTurma(missoesDaTurma(t.config));
  if (alunos.length) {
    for (let k = 0; k < caps.length - 1; k++) {
      const n = caps[k];
      const prox = caps[k + 1];
      const feitos = alunos.filter((a) => estadoCapitulos(t.config, t.capitulosAbertos, a).find((c) => c.n === n)?.concluido).length;
      const proxAberto = t.config.ritmo === "livre" || t.capitulosAbertos.includes(prox);
      if (feitos / alunos.length >= 0.8 && !proxAberto) out.push({ tipo: "capitulo", chave: `capitulo:${n}`, alunos: [], capitulo: n });
    }
    if (alunos.every((a) => terminou(a, t))) out.push({ tipo: "concluida", chave: "concluida", alunos: [] });
  }
  const fim = Date.parse(`${t.config.dataFim}T23:59:59Z`);
  const faltam = Math.ceil((fim - agora.getTime()) / DIA);
  if (!t.fechadaEm && faltam > 0 && faltam <= 7) out.push({ tipo: "fecho", chave: "fecho", alunos: [], dias: faltam });
  if (t.semLugarEm && agora.getTime() - Date.parse(t.semLugarEm) < 7 * DIA) out.push({ tipo: "lugares", chave: `lugares:${t.semLugarEm.slice(0, 10)}`, alunos: [] });
  return out;
}

export interface ResumoTurma {
  alunos: number;
  ativos7: number;
  inativos7: number;
  missoesSemana: number;
  capituloMaioria: number;
  porCapitulo: { n: number; pct: number; feitos: number }[];
  competencias: { slug: string; media: number; n: number; primeira: number }[];
  dificeis: { missao: string; media: number; n: number }[];
  apoio: { id: string; motivos: MotivoApoio[] }[];
  terminaram: number;
}

export function resumoTurma(t: TurmaBase, alunos: AlunoBase[], agora: Date): ResumoTurma {
  const missoes = missoesDaTurma(t.config);
  const caps = capitulosDaTurma(missoes);
  const estados = alunos.map((a) => estadoCapitulos(t.config, t.capitulosAbertos, a));
  const porCapitulo = caps.map((n) => {
    const feitos = estados.filter((e) => e.find((c) => c.n === n)?.concluido).length;
    return { n, feitos, pct: alunos.length ? Math.round((feitos / alunos.length) * 100) : 0 };
  });
  const atual = estados.map((e) => capituloAtual(e));
  const contagem = new Map<number, number>();
  for (const n of atual) contagem.set(n, (contagem.get(n) ?? 0) + 1);
  const capituloMaioria = [...contagem.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0] ?? caps[0] ?? 0;
  const competencias = DESAFIOS.flatMap((slug) => {
    const m = missoes.find((x) => x.slug === slug && x.conta);
    if (!m) return [];
    const ps = alunos.map((a) => a.progresso[m.id]).filter(Boolean);
    if (!ps.length) return [{ slug, media: 0, n: 0, primeira: 0 }];
    return [{ slug, media: Math.round(ps.reduce((s, p) => s + p.melhor, 0) / ps.length), n: ps.length, primeira: Math.round(ps.reduce((s, p) => s + p.primeira, 0) / ps.length) }];
  });
  const dificeis = pontuaveis(missoes)
    .map((m) => {
      const ps = alunos.map((a) => a.progresso[m.id]).filter(Boolean);
      return { missao: m.id, n: ps.length, media: ps.length ? Math.round(ps.reduce((s, p) => s + p.melhor, 0) / ps.length) : 0 };
    })
    .filter((d) => d.n >= 1)
    .sort((a, b) => a.media - b.media)
    .slice(0, 3);
  const semana = agora.getTime() - 7 * DIA;
  const ativos7 = alunos.filter((a) => ultimaAtividade(a) >= semana).length;
  const missoesSemana = alunos.reduce((s, a) => s + Object.values(a.progresso).filter((p) => Date.parse(p.em) >= semana).length, 0);
  const apoio = alunos.map((a) => ({ id: a.id, motivos: motivosApoio(a, t, alunos, agora) })).filter((x) => x.motivos.length);
  const terminaram = alunos.filter((a) => terminou(a, t)).length;
  return { alunos: alunos.length, ativos7, inativos7: alunos.length - ativos7, missoesSemana, capituloMaioria, porCapitulo, competencias, dificeis, apoio, terminaram };
}

/** Estado de uma célula da grelha "feito e por fazer" (forma e ícone no painel, nunca só cor). */
export type EstadoCelula = "estrela" | "visto" | "repetir" | "curso" | "vazio";
export function estadoCelula(a: Pick<AlunoBase, "progresso">, m: DefMissao, emCurso: boolean): EstadoCelula {
  const p = a.progresso[m.id];
  if (!p) return emCurso ? "curso" : "vazio";
  if (m.tipo === "evento" || m.pratica) return "visto";
  if (p.melhor >= 85) return "estrela";
  if (p.melhor >= 50) return "visto";
  return "repetir";
}

/** Célula de CSV sem quebras nem separadores; texto que começa por = + - @ leva um apóstrofo (fórmulas nas folhas). */
export function celulaCsv(x: unknown): string {
  const s = String(x).replace(/[;\n\r]/g, " ");
  return typeof x === "string" && /^[=+\-@]/.test(s) ? `'${s}` : s;
}

/** Linhas CSV (separador ;) com uma linha por aluno e missão feita. Identificadores como no painel. */
export function csvTurma(t: TurmaBase, alunos: AlunoBase[], nomeMissao: (id: string) => string): string {
  const missoes = missoesDaTurma(t.config);
  const cab = ["aluno", "lugar", "capitulo_atual", "missao", "primeira", "melhor", "tentativas", "duracao_s", "ultima_data"];
  const linhas = [cab.join(";")];
  for (const a of alunos) {
    const cap = capituloAtual(estadoCapitulos(t.config, t.capitulosAbertos, a));
    for (const m of missoes) {
      const p = a.progresso[m.id];
      if (!p) continue;
      linhas.push([a.nome, a.lugar, cap, nomeMissao(m.id), p.primeira, p.melhor, p.tentativas, Math.round(p.duracaoMs / 1000), p.em.slice(0, 10)].map(celulaCsv).join(";"));
    }
  }
  return linhas.join("\n");
}
