// ─── Aldeia Digital · serviço de uma turma ───────────────────────────────────
// Toda a lógica de uma turma sobre um armazenamento de chave e valor. Corre dentro do Durable Object da turma
// (Worker) e, sem Worker, no próprio navegador (modo local). Quem chama já tratou de limites de pedidos, bloqueios
// por falhas e tokens; aqui valida-se o conteúdo e aplicam-se as regras (nomes únicos, lugares, fatos, desbloqueios).
import { fatosDaColecao, missoesDaTurma, MISSAO, LUGARES_MAX, type ConfigTurma, type FrequenciaEmail, type ModoIdentificacao } from "./catalogo";
import { chaveAleatoria, idAleatorio, iguais, sha256 } from "./cripto";
import type { Op } from "./esquema";
import { lerConfig } from "./esquema";
import {
  aparenciaInicial, casaInicial, interiorInicial, LIMITE_ALUNO_BYTES, MAX_CHAVES, MAX_OPS, MAX_RECENTES,
  type Aluno, type AlunoPainel, type EstadoTurma, type TurmaDados, type VistaAluno, type VistaProfessor, type VistaPublica, type Vizinho,
} from "./modelo";
import { normalizarNome, validarNome, nomeVisivel } from "./nomes";
import { aparenciaValida, casaValida, desbloqueios, interiorValido, missaoDisponivel, objetivoColetivo, ofertaPara } from "./regras";
import { alertas, resumoTurma, ultimaAtividade, type Alerta, type ResumoTurma } from "./relatorios";

export interface Armazem {
  obter<T>(chave: string): Promise<T | undefined>;
  guardar(chave: string, valor: unknown): Promise<void>;
  apagar(chave: string): Promise<void>;
  listar<T>(prefixo: string): Promise<Map<string, T>>;
  apagarTudo(): Promise<void>;
}

export type Erro =
  | "turma" | "fechada" | "modo" | "nome-invalido" | "nome-existe" | "sem-lugar" | "fato" | "fato-ocupado"
  | "nome-desconhecido" | "pedido" | "grande" | "aluno" | "email-limite";
export type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: Erro; detalhe?: string };
const ok = <T,>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T,>(erro: Erro, detalhe?: string): Resultado<T> => ({ ok: false, erro, detalhe });

export type AcaoProfessor =
  | { acao: "abrirCapitulo"; capitulo: number }
  | { acao: "lugares"; lugares: number }
  | { acao: "renomear"; aluno: string; nome: string }
  | { acao: "apagarAluno"; aluno: string }
  | { acao: "renovarAluno"; aluno: string }
  | { acao: "configurar"; config: Partial<ConfigTurma> }
  | { acao: "fechar" };

export interface DadosResumoEmail {
  endereco: string;
  frequencia: FrequenciaEmail;
  turma: { codigo: string; nome: string; dataFim: string };
  resumo: Pick<ResumoTurma, "alunos" | "ativos7" | "missoesSemana" | "capituloMaioria" | "terminaram">;
  alertas: (Alerta & { identificadores: string[] })[];
  chaves: string[];
}

/** Tipos dos campos de cada ação (o pedido vem da rede). */
function acaoValida(a: unknown): a is AcaoProfessor {
  if (typeof a !== "object" || a === null) return false;
  const x = a as Record<string, unknown>;
  const curto = (v: unknown) => typeof v === "string" && v.length <= 40;
  switch (x.acao) {
    case "abrirCapitulo":
      return typeof x.capitulo === "number";
    case "lugares":
      return typeof x.lugares === "number";
    case "renomear":
      return curto(x.aluno) && curto(x.nome);
    case "apagarAluno":
    case "renovarAluno":
      return curto(x.aluno);
    case "configurar":
      return typeof x.config === "object" && x.config !== null;
    case "fechar":
      return true;
    default:
      return false;
  }
}

const DIA = 86_400_000;
export const DIAS_RETENCAO = 30;
export const DIAS_SEM_ALUNOS = 14;

export class ServicoTurma {
  constructor(
    private readonly a: Armazem,
    private readonly relogio: () => Date = () => new Date(),
  ) {}

  turma(): Promise<TurmaDados | undefined> {
    return this.a.obter<TurmaDados>("turma");
  }

  private async alunos(): Promise<Aluno[]> {
    return [...(await this.a.listar<Aluno>("aluno:")).values()].sort((x, y) => x.lugar - y.lugar);
  }

  estado(t: TurmaDados): EstadoTurma {
    if (t.fechadaEm) return "fechada";
    return this.relogio().getTime() > Date.parse(`${t.config.dataFim}T23:59:59Z`) ? "fechada" : "aberta";
  }

  /** Quando os dados são apagados: 30 dias depois do fecho (data de fim ou fecho antecipado pelo professor). */
  apagarEm(t: TurmaDados): number {
    const fecho = t.fechadaEm ? Date.parse(t.fechadaEm) : Date.parse(`${t.config.dataFim}T23:59:59Z`);
    return fecho + DIAS_RETENCAO * DIA;
  }

  async criar(d: { codigo: string; hashProfessor: string; config: ConfigTurma }): Promise<Resultado<TurmaDados>> {
    if (await this.turma()) return falha("pedido", "existe");
    const agora = this.relogio().toISOString();
    const t: TurmaDados = { codigo: d.codigo, hashProfessor: d.hashProfessor, config: d.config, capitulosAbertos: [0], criadoEm: agora, atualizadoEm: agora, email: null, versao: 1 };
    await this.a.guardar("turma", t);
    return ok(t);
  }

  private vistaPublica(t: TurmaDados, alunos: Aluno[]): VistaPublica {
    const { nome: _n, lugares: _l, ...config } = t.config;
    return {
      codigo: t.codigo,
      estado: this.estado(t),
      config,
      capitulosAbertos: t.capitulosAbertos,
      lugaresLivres: Math.max(0, t.config.lugares - alunos.length),
      fatosOcupados: alunos.map((a) => a.aparencia.fato),
    };
  }

  async publico(): Promise<Resultado<VistaPublica>> {
    const t = await this.turma();
    if (!t) return falha("turma");
    return ok(this.vistaPublica(t, await this.alunos()));
  }

  private vistaAluno(aluno: Aluno, t: TurmaDados, alunos: Aluno[]): VistaAluno {
    const agora = this.relogio().getTime();
    const vizinhos: Vizinho[] = alunos
      .filter((x) => x.id !== aluno.id)
      .map((x) => ({ lugar: x.lugar, nome: x.nome, aparencia: x.aparencia, casa: x.casa, ativo: agora - ultimaAtividade(x) < 7 * DIA }));
    return { aluno, turma: this.vistaPublica(t, alunos), vizinhos, objetivo: objetivoColetivo(t.config, t.capitulosAbertos, alunos) };
  }

  async vista(id: string): Promise<Resultado<VistaAluno>> {
    const t = await this.turma();
    if (!t) return falha("turma");
    const alunos = await this.alunos();
    const aluno = alunos.find((x) => x.id === id);
    if (!aluno) return falha("aluno");
    return ok(this.vistaAluno(aluno, t, alunos));
  }

  /** A chave e o resumo calculam-se antes de ler os alunos: nenhuma espera entre a verificação e a gravação. */
  private async prepararChave(): Promise<{ chave: string; h: string }> {
    const chave = chaveAleatoria();
    return { chave, h: await sha256(chave) };
  }

  private juntarChave(aluno: Aluno, c: { chave: string; h: string }): string {
    aluno.chaves.push({ h: c.h, em: this.relogio().toISOString() });
    while (aluno.chaves.length > MAX_CHAVES) aluno.chaves.shift();
    return c.chave;
  }

  /** Primeira entrada: reserva o nome e o fato, cria a casa no lote livre mais baixo e devolve a chave deste navegador. */
  async registar(p: { nome: string; modo: ModoIdentificacao; fato: string }): Promise<Resultado<{ vista: VistaAluno; chave: string }>> {
    const t = await this.turma();
    if (!t) return falha("turma");
    if (this.estado(t) === "fechada") return falha("fechada");
    if (!t.config.identificacao.includes(p.modo)) return falha("modo");
    const v = validarNome(p.nome, p.modo);
    if ("erro" in v) return falha("nome-invalido", v.erro);
    const normal = normalizarNome(v.nome);
    const nova = await this.prepararChave();
    const alunos = await this.alunos();
    if (alunos.some((a) => a.nomeNormalizado === normal)) return falha("nome-existe");
    if (alunos.length >= t.config.lugares) {
      t.semLugarEm = this.relogio().toISOString();
      await this.a.guardar("turma", t);
      return falha("sem-lugar");
    }
    if (!fatosDaColecao(t.config.colecao).some((f) => f.id === p.fato)) return falha("fato");
    if (alunos.some((a) => a.aparencia.fato === p.fato)) return falha("fato-ocupado");
    const ocupados = new Set(alunos.map((a) => a.lugar));
    let lugar = 1;
    while (ocupados.has(lugar) && lugar <= LUGARES_MAX) lugar++;
    const agora = this.relogio().toISOString();
    const aluno: Aluno = {
      id: idAleatorio(), nome: v.nome, nomeNormalizado: normal, modo: p.modo, lugar,
      aparencia: aparenciaInicial(p.fato), casa: casaInicial(lugar), interior: interiorInicial(),
      progresso: {}, recentes: [], treinos: 0, marcos: {}, chaves: [], entradas: [], ops: [], criadoEm: agora, vistoEm: agora, versao: 1,
    };
    const chave = this.juntarChave(aluno, nova);
    await this.a.guardar(`aluno:${aluno.id}`, aluno);
    alunos.push(aluno);
    return ok({ vista: this.vistaAluno(aluno, t, alunos), chave });
  }

  /** Outro computador: código da turma + nome. Recebe uma chave nova; a entrada fica registada (só a data). */
  async entrar(p: { nome: string; modo: ModoIdentificacao }): Promise<Resultado<{ vista: VistaAluno; chave: string }>> {
    const t = await this.turma();
    if (!t) return falha("turma");
    if (this.estado(t) === "fechada") return falha("fechada");
    const v = validarNome(p.nome, p.modo);
    if ("erro" in v) return falha("nome-desconhecido");
    const normal = normalizarNome(v.nome);
    const nova = await this.prepararChave();
    const alunos = await this.alunos();
    const aluno = alunos.find((a) => a.nomeNormalizado === normal);
    if (!aluno) return falha("nome-desconhecido");
    const chave = this.juntarChave(aluno, nova);
    aluno.entradas = [...aluno.entradas, this.relogio().toISOString()].slice(-10);
    await this.a.guardar(`aluno:${aluno.id}`, aluno);
    return ok({ vista: this.vistaAluno(aluno, t, alunos), chave });
  }

  async autenticar(id: string, chave: string): Promise<Aluno | null> {
    if (typeof id !== "string" || typeof chave !== "string" || id.length > 40 || chave.length > 60) return null;
    const aluno = await this.a.obter<Aluno>(`aluno:${id}`);
    if (!aluno) return null;
    const h = await sha256(chave);
    let certo = false;
    for (const c of aluno.chaves) if (await iguais(c.h, h)) certo = true;
    return certo ? aluno : null;
  }

  /** "Sair deste computador": a chave deste navegador deixa de servir. */
  async sair(id: string, chave: string): Promise<void> {
    const h = await sha256(chave);
    if (!(await this.autenticar(id, chave))) return;
    // Lido de novo depois das esperas: entre a leitura e a gravação só há acesso ao armazém.
    const aluno = await this.a.obter<Aluno>(`aluno:${id}`);
    if (!aluno) return;
    aluno.chaves = aluno.chaves.filter((c) => c.h !== h);
    await this.a.guardar(`aluno:${aluno.id}`, aluno);
  }

  /** Aplica as operações do aluno. As inválidas (não ganhas, fora do capítulo, repetidas) são ignoradas e contadas. */
  async aplicar(id: string, ops: Op[]): Promise<Resultado<{ vista: VistaAluno; recusadas: number }>> {
    const t = await this.turma();
    if (!t) return falha("turma");
    if (this.estado(t) === "fechada") return falha("fechada");
    const alunos = await this.alunos();
    const aluno = alunos.find((x) => x.id === id);
    if (!aluno) return falha("aluno");
    const agora = this.relogio().toISOString();
    const missoes = missoesDaTurma(t.config);
    const naTurma = new Set(missoes.map((m) => m.id));
    let recusadas = 0;
    const objetivo = () => objetivoColetivo(t.config, t.capitulosAbertos, alunos).atingido;
    for (const op of ops) {
      const aceite = this.aplicarUma(aluno, op, t, naTurma, objetivo, agora);
      if (!aceite) recusadas++;
    }
    aluno.vistoEm = agora;
    aluno.versao++;
    if (JSON.stringify(aluno).length > LIMITE_ALUNO_BYTES) return falha("grande");
    await this.a.guardar(`aluno:${aluno.id}`, aluno);
    return ok({ vista: this.vistaAluno(aluno, t, alunos), recusadas });
  }

  private aplicarUma(aluno: Aluno, op: Op, t: TurmaDados, naTurma: Set<string>, objetivo: () => boolean, agora: string): boolean {
    const d = () => desbloqueios(aluno, t.config, t.capitulosAbertos, objetivo());
    const registarOp = (opId: string) => {
      aluno.ops = [...aluno.ops, opId].slice(-MAX_OPS);
    };
    switch (op.op) {
      case "resultado": {
        if (aluno.ops.includes(op.id)) return true; // repetição da fila: já aplicada
        const m = MISSAO.get(op.missao);
        if (!m || !naTurma.has(m.id) || m.tipo === "evento") return false;
        if (!missaoDisponivel(t.config, t.capitulosAbertos, aluno, m.id)) return false;
        if (op.duracaoMs < 2000) return false;
        const p = aluno.progresso[m.id];
        if (!p) aluno.progresso[m.id] = { primeira: op.pontuacao, melhor: op.pontuacao, ultima: op.pontuacao, tentativas: 1, duracaoMs: op.duracaoMs, primeiraEm: agora, em: agora };
        else {
          if (op.pontuacao > p.melhor) {
            p.melhor = op.pontuacao;
            p.duracaoMs = op.duracaoMs;
          }
          p.ultima = op.pontuacao;
          p.tentativas = Math.min(999, p.tentativas + 1);
          p.em = agora;
        }
        if (!m.pratica) aluno.recentes = [...aluno.recentes, { m: m.id, p: op.pontuacao, em: agora }].slice(-MAX_RECENTES);
        registarOp(op.id);
        return true;
      }
      case "treino": {
        if (aluno.ops.includes(op.id)) return true;
        if (!naTurma.has(op.missao) || !aluno.progresso[op.missao]) return false;
        aluno.treinos = Math.min(9999, aluno.treinos + 1);
        registarOp(op.id);
        return true;
      }
      case "evento": {
        if (!naTurma.has(op.missao) || aluno.progresso[op.missao]) return Boolean(aluno.progresso[op.missao]);
        if (!missaoDisponivel(t.config, t.capitulosAbertos, aluno, op.missao)) return false;
        if (op.missao === "festa") {
          const outras = missoesDaTurma(t.config).filter((m) => m.id !== "festa");
          if (!outras.every((m) => aluno.progresso[m.id])) return false;
        }
        aluno.progresso[op.missao] = { primeira: 100, melhor: 100, ultima: 100, tentativas: 1, duracaoMs: 0, primeiraEm: agora, em: agora };
        if (op.missao === "tutorial") aluno.marcos.tutorial = agora;
        return true;
      }
      case "premio": {
        const p = aluno.progresso[op.missao];
        if (!p || p.premio || !naTurma.has(op.missao)) return false;
        if (!ofertaPara(op.missao, d()).includes(op.item)) return false;
        p.premio = op.item;
        return true;
      }
      case "aparencia": {
        if (!aparenciaValida(op.valor, aluno.aparencia, d())) return false;
        aluno.aparencia = { ...op.valor };
        return true;
      }
      case "casa": {
        if (!casaValida(op.valor, aluno.casa, d())) return false;
        aluno.casa = { ...op.valor };
        return true;
      }
      case "interior": {
        if (!interiorValido(op.valor, aluno.interior, d())) return false;
        aluno.interior = structuredClone(op.valor);
        return true;
      }
      case "jornal": {
        if (!d().festa) return false;
        aluno.marcos.jornal = aluno.marcos.jornal ?? agora;
        return true;
      }
    }
  }

  // ── Professor ──────────────────────────────────────────────────────────────
  async hashProfessor(): Promise<string | undefined> {
    return (await this.turma())?.hashProfessor;
  }

  async painel(): Promise<Resultado<VistaProfessor>> {
    const t = await this.turma();
    if (!t) return falha("turma");
    const alunos = await this.alunos();
    const { hashProfessor: _h, email, ...resto } = t;
    const vistaEmail = email ? { endereco: email.endereco, confirmado: email.confirmado, frequencia: email.frequencia, autorizarNome: email.autorizarNome, ultimoEnvio: email.ultimoEnvio } : null;
    return ok({ turma: { ...resto, email: vistaEmail }, alunos: alunos.map(({ chaves: _c, ops: _o, ...a }) => a as AlunoPainel) });
  }

  async acao(a: AcaoProfessor): Promise<Resultado<VistaProfessor>> {
    const t = await this.turma();
    if (!t) return falha("turma");
    if (!acaoValida(a)) return falha("pedido");
    const agora = this.relogio();
    switch (a.acao) {
      case "abrirCapitulo": {
        if (!Number.isInteger(a.capitulo) || a.capitulo < 0 || a.capitulo > 8) return falha("pedido");
        if (!t.capitulosAbertos.includes(a.capitulo)) t.capitulosAbertos = [...t.capitulosAbertos, a.capitulo].sort((x, y) => x - y);
        break;
      }
      case "lugares": {
        if (!Number.isInteger(a.lugares) || a.lugares < t.config.lugares || a.lugares > LUGARES_MAX) return falha("pedido");
        t.config = { ...t.config, lugares: a.lugares };
        break;
      }
      case "renomear": {
        const aluno = await this.a.obter<Aluno>(`aluno:${a.aluno}`);
        if (!aluno) return falha("aluno");
        const v = validarNome(a.nome, aluno.modo);
        if ("erro" in v) return falha("nome-invalido", v.erro);
        const normal = normalizarNome(v.nome);
        const alunos = await this.alunos();
        if (alunos.some((x) => x.id !== aluno.id && x.nomeNormalizado === normal)) return falha("nome-existe");
        aluno.nome = v.nome;
        aluno.nomeNormalizado = normal;
        await this.a.guardar(`aluno:${aluno.id}`, aluno);
        break;
      }
      case "apagarAluno": {
        if (!(await this.a.obter(`aluno:${a.aluno}`))) return falha("aluno");
        await this.a.apagar(`aluno:${a.aluno}`);
        break;
      }
      case "renovarAluno": {
        const aluno = await this.a.obter<Aluno>(`aluno:${a.aluno}`);
        if (!aluno) return falha("aluno");
        aluno.chaves = [];
        await this.a.guardar(`aluno:${aluno.id}`, aluno);
        break;
      }
      case "configurar": {
        const c = lerConfig(a.config, true, agora);
        if (!c || "lugares" in c || "nivel" in c || "colecao" in c || "identificacao" in c) return falha("pedido");
        t.config = { ...t.config, ...c };
        break;
      }
      case "fechar": {
        t.fechadaEm = t.fechadaEm ?? agora.toISOString();
        break;
      }
      default:
        return falha("pedido");
    }
    t.atualizadoEm = agora.toISOString();
    t.versao++;
    await this.a.guardar("turma", t);
    return this.painel();
  }

  async apagarTudo(): Promise<void> {
    await this.a.apagarTudo();
  }

  // ── Email do professor ─────────────────────────────────────────────────────
  /** Novo endereço (por confirmar) ou só a frequência. Máximo 3 pedidos de confirmação por dia. */
  async definirEmail(endereco: string | null, frequencia: FrequenciaEmail, autorizarNome: boolean): Promise<Resultado<{ enviarConfirmacao: boolean }>> {
    const t = await this.turma();
    if (!t) return falha("turma");
    const agora = this.relogio();
    if (!endereco) {
      t.email = null;
      await this.a.guardar("turma", t);
      return ok({ enviarConfirmacao: false });
    }
    const mesmo = t.email?.endereco.toLowerCase() === endereco.toLowerCase();
    if (mesmo && t.email) {
      t.email = { ...t.email, frequencia, autorizarNome };
      const enviarConfirmacao = !t.email.confirmado && this.marcarPedido(t, agora);
      await this.a.guardar("turma", t);
      return ok({ enviarConfirmacao });
    }
    t.email = { endereco, confirmado: false, frequencia, autorizarNome, pedidos: [], alertasEnviados: [], marcosEnviados: [] };
    const pode = this.marcarPedido(t, agora);
    await this.a.guardar("turma", t);
    return pode ? ok({ enviarConfirmacao: true }) : falha("email-limite");
  }

  private podePedirConfirmacao(t: TurmaDados, agora: Date): boolean {
    return (t.email?.pedidos ?? []).filter((d) => agora.getTime() - Date.parse(d) < DIA).length < 3;
  }
  private marcarPedido(t: TurmaDados, agora: Date): boolean {
    if (!t.email || !this.podePedirConfirmacao(t, agora)) return false;
    t.email.pedidos = [...t.email.pedidos, agora.toISOString()].slice(-6);
    return true;
  }

  async confirmarEmail(resumoEndereco: string): Promise<boolean> {
    const t = await this.turma();
    if (!t?.email || (await sha256(t.email.endereco.toLowerCase())) !== resumoEndereco) return false;
    t.email.confirmado = true;
    await this.a.guardar("turma", t);
    return true;
  }

  async deixarDeReceber(): Promise<void> {
    const t = await this.turma();
    if (!t) return;
    t.email = null;
    await this.a.guardar("turma", t);
  }

  // ── Alarme diário: fecho, apagamento e resumos ─────────────────────────────
  /** Próximo alarme: todos os dias às 17h00 UTC (resumos, fecho e apagamento automático). */
  proximoAlarme(agora = this.relogio()): number {
    const d = new Date(agora);
    d.setUTCHours(17, 0, 0, 0);
    if (d.getTime() <= agora.getTime()) d.setUTCDate(d.getUTCDate() + 1);
    return d.getTime();
  }

  /** Corre no alarme. Apaga a turma quando chega a altura; senão devolve o resumo a enviar (se houver). */
  async aoAlarme(): Promise<{ apagada: boolean; resumo: DadosResumoEmail | null }> {
    const t = await this.turma();
    if (!t) return { apagada: true, resumo: null };
    const agora = this.relogio();
    const alunos = await this.alunos();
    if (agora.getTime() >= this.apagarEm(t) || (alunos.length === 0 && agora.getTime() >= Date.parse(t.criadoEm) + DIAS_SEM_ALUNOS * DIA)) {
      await this.a.apagarTudo();
      return { apagada: true, resumo: null };
    }
    if (!t.fechadaEm && this.estado(t) === "fechada") {
      t.fechadaEm = new Date(Date.parse(`${t.config.dataFim}T23:59:59Z`)).toISOString();
      await this.a.guardar("turma", t);
    }
    return { apagada: false, resumo: this.prepararResumo(t, alunos, agora) };
  }

  private prepararResumo(t: TurmaDados, alunos: Aluno[], agora: Date): DadosResumoEmail | null {
    const e = t.email;
    if (!e || !e.confirmado || e.frequencia === "nenhum") return null;
    const desde = e.ultimoEnvio ? agora.getTime() - Date.parse(e.ultimoEnvio) : Infinity;
    if (desde < 20 * 3600_000) return null; // nunca mais de 1 email por dia por turma
    const todos = alertas(t, alunos, agora);
    const novos = todos.filter((x) => !e.alertasEnviados.includes(x.chave));
    const marcos = novos.filter((x) => x.tipo === "capitulo" || x.tipo === "concluida" || x.tipo === "fecho");
    const r = resumoTurma(t, alunos, agora);
    let enviar = false;
    if (e.frequencia === "semanal") enviar = desde >= 7 * DIA - 3600_000 || (!e.ultimoEnvio && agora.getTime() - Date.parse(t.criadoEm) >= 7 * DIA - 3600_000);
    else if (e.frequencia === "diario") enviar = r.missoesSemana > 0 && (alunos.some((a) => agora.getTime() - ultimaAtividade(a) < DIA) || novos.length > 0);
    else if (e.frequencia === "marcos") enviar = marcos.length > 0;
    if (!enviar) return null;
    const porId = new Map(alunos.map((a) => [a.id, a]));
    const ident = (id: string) => {
      const a = porId.get(id);
      if (!a) return "";
      return a.modo === "nome" && !e.autorizarNome ? `Lugar ${a.lugar}` : nomeVisivel(a.nome);
    };
    const lista = (e.frequencia === "marcos" ? marcos : novos).map((x) => ({ ...x, identificadores: x.alunos.map(ident).filter(Boolean) }));
    return {
      endereco: e.endereco,
      frequencia: e.frequencia,
      turma: { codigo: t.codigo, nome: t.config.nome, dataFim: t.config.dataFim },
      resumo: { alunos: r.alunos, ativos7: r.ativos7, missoesSemana: r.missoesSemana, capituloMaioria: r.capituloMaioria, terminaram: r.terminaram },
      alertas: lista,
      chaves: lista.map((x) => x.chave),
    };
  }

  async registarEnvio(chaves: string[]): Promise<void> {
    const t = await this.turma();
    if (!t?.email) return;
    t.email.ultimoEnvio = this.relogio().toISOString();
    t.email.alertasEnviados = [...t.email.alertasEnviados, ...chaves].slice(-200);
    await this.a.guardar("turma", t);
  }
}
