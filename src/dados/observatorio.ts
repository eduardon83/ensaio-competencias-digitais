// ─── Observatório: períodos, filtros, agregação e exportação CSV (funções puras) ──
// A mesma agregação corre no navegador (dados deste navegador, quando não há ponto de recolha) e no Apps Script
// (telemetria/apps-script.gs, função agregar_), para o ecrã ser igual nos dois casos. Grupos com menos de `limiar`
// tentativas ficam ocultos (privacidade); o ecrã de administração usa limiar 1.

export interface Grupo {
  n: number;
  media: number;
}

export interface Agregados {
  gerado_em: string;
  total_tentativas: number;
  total_testes: number;
  limiar: number;
  media_geral: number | null;
  por_atividade: Record<string, Grupo>;
  por_atividade_nivel: Record<string, Grupo>; // "slug:nivel"
  por_nivel: Record<string, number>;
  por_dispositivo: Record<string, number>;
  por_contexto: Record<string, number>;
  por_formato: Record<string, number>;
  por_origem: Record<string, number>;
  por_dia: Record<string, number>; // AAAA-MM-DD → tentativas
  por_mes: Record<string, number>; // AAAA-MM → tentativas
  testes_por_ciclo: Record<string, Grupo>;
  sessoes: number;
  completo: boolean; // true quando a chave de administração foi aceite
  /** Modo público com menos tentativas do que o limiar: totais ocultos (a 0), para não revelar números pequenos. */
  abaixo_limiar: boolean;
}

export interface Filtros {
  periodo: string; // id de PERIODOS
  atividade: string; // slug ou ""
  nivel: string; // "1".."5" ou ""
  dispositivo: string;
  contexto: string;
  origem: string;
}

export const FILTROS_INICIAIS: Filtros = { periodo: "tudo", atividade: "", nivel: "", dispositivo: "", contexto: "", origem: "" };

export interface Periodo {
  id: string;
  nome: string;
  desde: string | null; // AAAA-MM-DD, inclusivo
  ate: string | null; // AAAA-MM-DD, inclusivo
}

const dia = (d: Date) => d.toISOString().slice(0, 10);
function menosMeses(d: Date, m: number): Date {
  const r = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - m, d.getUTCDate()));
  return r;
}

/** Ano letivo de uma data: começa a 1 de setembro (convenção de dados; o calendário oficial varia por ano). */
export function inicioAnoLetivo(d: Date): number {
  return d.getUTCMonth() >= 8 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
}

/** Períodos disponíveis: tudo, últimos 3, 6 e 12 meses, o ano letivo atual e os 10 anteriores. */
export function periodos(hoje = new Date()): Periodo[] {
  const h = dia(hoje);
  const lista: Periodo[] = [
    { id: "tudo", nome: "Todo o período", desde: null, ate: null },
    { id: "3m", nome: "Últimos 3 meses", desde: dia(menosMeses(hoje, 3)), ate: h },
    { id: "6m", nome: "Últimos 6 meses", desde: dia(menosMeses(hoje, 6)), ate: h },
    { id: "12m", nome: "Último ano (12 meses)", desde: dia(menosMeses(hoje, 12)), ate: h },
  ];
  const atual = inicioAnoLetivo(hoje);
  for (let k = 0; k <= 10; k++) {
    const a = atual - k;
    lista.push({ id: `letivo-${a}`, nome: `Ano letivo ${a}/${a + 1}${k === 0 ? " (atual)" : ""}`, desde: `${a}-09-01`, ate: k === 0 ? h : `${a + 1}-08-31` });
  }
  return lista;
}

export function periodoPorId(id: string, hoje = new Date()): Periodo {
  return periodos(hoje).find((p) => p.id === id) ?? periodos(hoje)[0];
}

/** Parâmetros para o ponto de recolha (só os filtros preenchidos). */
export function parametros(f: Filtros, hoje = new Date()): Record<string, string> {
  const p = periodoPorId(f.periodo, hoje);
  const r: Record<string, string> = {};
  if (p.desde) r.desde = p.desde;
  if (p.ate) r.ate = p.ate;
  for (const k of ["atividade", "nivel", "dispositivo", "contexto", "origem"] as const) if (f[k]) r[k] = f[k];
  return r;
}

export interface LinhaTentativa {
  data: string; // ISO
  sessao: string;
  atividade: string;
  nivel: number;
  pontuacao: number;
  dispositivo: string;
  contexto: string;
  formato: string;
  origem: string;
}
export interface LinhaTeste {
  data: string;
  ciclo: string;
  pontuacao: number;
}

/** Uma tentativa passa nos filtros? (datas comparadas pelo dia, em UTC, como no ponto de recolha) */
export function passa(t: LinhaTentativa, q: Record<string, string>): boolean {
  const d = t.data.slice(0, 10);
  if (q.desde && d < q.desde) return false;
  if (q.ate && d > q.ate) return false;
  if (q.atividade && t.atividade !== q.atividade) return false;
  if (q.nivel && String(t.nivel) !== q.nivel) return false;
  if (q.dispositivo && t.dispositivo !== q.dispositivo) return false;
  if (q.contexto && t.contexto !== q.contexto) return false;
  if (q.origem && t.origem !== q.origem) return false;
  return true;
}

function somar(m: Record<string, { n: number; soma: number }>, k: string, v: number) {
  (m[k] ??= { n: 0, soma: 0 }).n += 1;
  m[k].soma += v;
}
function contar(m: Record<string, number>, k: string) {
  m[k] = (m[k] ?? 0) + 1;
}
function medias(m: Record<string, { n: number; soma: number }>, limiar: number): Record<string, Grupo> {
  const r: Record<string, Grupo> = {};
  for (const [k, g] of Object.entries(m)) if (g.n >= limiar) r[k] = { n: g.n, media: Math.round(g.soma / g.n) };
  return r;
}
function contagens(m: Record<string, number>, limiar: number): Record<string, number> {
  const r: Record<string, number> = {};
  for (const [k, v] of Object.entries(m)) if (v >= limiar) r[k] = v;
  return r;
}

/** Agrega tentativas e testes com os filtros dados. Os testes só são filtrados pelo período. */
export function agregar(tentativas: LinhaTentativa[], testes: LinhaTeste[], q: Record<string, string>, limiar: number, completo = false, agora = new Date()): Agregados {
  const ts = tentativas.filter((t) => passa(t, q));
  const xs = testes.filter((t) => passa({ data: t.data } as LinhaTentativa, { desde: q.desde ?? "", ate: q.ate ?? "" }));
  type Somas = Record<string, { n: number; soma: number }>;
  const porAtividade: Somas = {}, porAtividadeNivel: Somas = {}, porCiclo: Somas = {};
  const porNivel: Record<string, number> = {}, porDispositivo: Record<string, number> = {}, porContexto: Record<string, number> = {};
  const porFormato: Record<string, number> = {}, porOrigem: Record<string, number> = {}, porDia: Record<string, number> = {}, porMes: Record<string, number> = {};
  const sessoes = new Set<string>();
  let soma = 0;
  for (const t of ts) {
    somar(porAtividade, t.atividade, t.pontuacao);
    somar(porAtividadeNivel, `${t.atividade}:${t.nivel}`, t.pontuacao);
    contar(porNivel, String(t.nivel));
    contar(porDispositivo, t.dispositivo || "?");
    contar(porContexto, t.contexto || "?");
    contar(porFormato, t.formato || "?");
    contar(porOrigem, t.origem || "?");
    contar(porDia, t.data.slice(0, 10));
    contar(porMes, t.data.slice(0, 7));
    if (t.sessao) sessoes.add(t.sessao);
    soma += t.pontuacao;
  }
  for (const t of xs) somar(porCiclo, t.ciclo, t.pontuacao);
  const oculto = !completo && ts.length < limiar;
  return {
    gerado_em: agora.toISOString(),
    total_tentativas: oculto ? 0 : ts.length,
    total_testes: !completo && xs.length < limiar ? 0 : xs.length,
    limiar,
    media_geral: ts.length >= limiar && ts.length > 0 ? Math.round(soma / ts.length) : null,
    por_atividade: medias(porAtividade, limiar),
    por_atividade_nivel: medias(porAtividadeNivel, limiar),
    por_nivel: contagens(porNivel, limiar),
    por_dispositivo: contagens(porDispositivo, limiar),
    por_contexto: contagens(porContexto, limiar),
    por_formato: contagens(porFormato, limiar),
    por_origem: contagens(porOrigem, limiar),
    por_dia: completo ? porDia : contagens(porDia, limiar),
    por_mes: contagens(porMes, limiar),
    testes_por_ciclo: medias(porCiclo, limiar),
    sessoes: oculto ? 0 : sessoes.size,
    completo,
    abaixo_limiar: oculto,
  };
}

/** Completa respostas de versões antigas do ponto de recolha (sem por_mes nem media_geral). */
export function normalizar(a: Partial<Agregados> & Pick<Agregados, "por_dia">): Agregados {
  const porMes: Record<string, number> = { ...(a.por_mes ?? {}) };
  if (!a.por_mes) for (const [d, v] of Object.entries(a.por_dia ?? {})) porMes[d.slice(0, 7)] = (porMes[d.slice(0, 7)] ?? 0) + v;
  return {
    gerado_em: a.gerado_em ?? new Date().toISOString(),
    total_tentativas: a.total_tentativas ?? 0,
    total_testes: a.total_testes ?? 0,
    limiar: a.limiar ?? 1,
    media_geral: a.media_geral ?? null,
    por_atividade: a.por_atividade ?? {},
    por_atividade_nivel: a.por_atividade_nivel ?? {},
    por_nivel: a.por_nivel ?? {},
    por_dispositivo: a.por_dispositivo ?? {},
    por_contexto: a.por_contexto ?? {},
    por_formato: a.por_formato ?? {},
    por_origem: a.por_origem ?? {},
    por_dia: a.por_dia ?? {},
    por_mes: porMes,
    testes_por_ciclo: a.testes_por_ciclo ?? {},
    sessoes: a.sessoes ?? 0,
    completo: a.completo ?? false,
    abaixo_limiar: a.abaixo_limiar ?? false,
  };
}

// ─── Exportação CSV ──────────────────────────────────────────────────────────
const celula = (v: unknown) => {
  const s = String(v ?? "");
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Relatório em CSV (separador ;, para abrir diretamente no Excel em português), por secções. */
export function paraCsv(a: Agregados, descricaoFiltros: string[], nome: (slug: string) => string, rotulo: (campo: string, valor: string) => string): string {
  const L: string[][] = [];
  L.push(["Ensaio às Competências Digitais · Observatório"]);
  L.push(["Gerado em", new Date(a.gerado_em).toLocaleString("pt-PT")]);
  for (const f of descricaoFiltros) L.push(["Filtro", f]);
  L.push(["Limiar de privacidade (grupos com menos tentativas ocultos)", String(a.limiar)]);
  L.push([]);
  L.push(["Resumo"]);
  L.push(["Tentativas", a.abaixo_limiar ? `menos de ${a.limiar}` : String(a.total_tentativas)]);
  L.push(["Testes completos", String(a.total_testes)]);
  L.push(["Navegadores (sessões anónimas)", a.abaixo_limiar ? "" : String(a.sessoes)]);
  L.push(["Média geral", a.media_geral === null ? "" : String(a.media_geral)]);
  L.push([]);
  L.push(["Desafio, teste ou jogo", "Tentativas", "Média", "N1 (n)", "N1 média", "N2 (n)", "N2 média", "N3 (n)", "N3 média", "N4 (n)", "N4 média", "N5 (n)", "N5 média"]);
  for (const [slug, g] of Object.entries(a.por_atividade).sort((x, y) => y[1].n - x[1].n)) {
    const niveis = [1, 2, 3, 4, 5].flatMap((n) => {
      const k = a.por_atividade_nivel[`${slug}:${n}`];
      return k ? [String(k.n), String(k.media)] : ["", ""];
    });
    L.push([nome(slug), String(g.n), String(g.media), ...niveis]);
  }
  const seccao = (titulo: string, campo: string, m: Record<string, number>) => {
    L.push([]);
    L.push([titulo, "Tentativas"]);
    for (const [k, v] of Object.entries(m).sort((x, y) => (campo === "mes" || campo === "dia" ? (x[0] < y[0] ? -1 : 1) : y[1] - x[1]))) L.push([rotulo(campo, k), String(v)]);
  };
  seccao("Nível", "nivel", a.por_nivel);
  seccao("Dispositivo", "dispositivo", a.por_dispositivo);
  seccao("Cenário", "contexto", a.por_contexto);
  seccao("Aspeto", "formato", a.por_formato);
  seccao("Origem", "origem", a.por_origem);
  seccao("Mês", "mes", a.por_mes);
  L.push([]);
  L.push(["Preparação para provas", "Testes", "Média"]);
  for (const [k, g] of Object.entries(a.testes_por_ciclo)) L.push([rotulo("ciclo", k), String(g.n), String(g.media)]);
  return "﻿" + L.map((l) => l.map(celula).join(";")).join("\r\n") + "\r\n";
}
