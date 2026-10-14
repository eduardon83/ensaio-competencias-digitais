// ─── Aldeia Digital · Durable Object de uma turma ────────────────────────────
// Um objeto por turma (nome = código da turma): consistência forte (nomes únicos, lugares, fatos), dados separados
// das outras turmas e apagados juntos. Alarme diário: fecho na data de fim, resumos por email e apagamento automático
// (30 dias depois do fim; 14 dias sem alunos). Os métodos são chamados por RPC a partir de worker/aldeia/rotas.ts.
import { DurableObject } from "cloudflare:workers";
import type { ConfigTurma, FrequenciaEmail, ModoIdentificacao } from "../../src/aldeia/nucleo/catalogo";
import { assinarToken, iguais } from "../../src/aldeia/nucleo/cripto";
import type { Op } from "../../src/aldeia/nucleo/esquema";
import { ServicoTurma, type AcaoProfessor, type Armazem } from "../../src/aldeia/nucleo/servico";
import type { Env } from "../env";
import { enviarEmail, modeloResumo, textosEmails } from "./email";

function armazemDO(s: DurableObjectStorage): Armazem {
  return {
    obter: (k) => s.get(k),
    guardar: (k, v) => s.put(k, v),
    apagar: async (k) => {
      await s.delete(k);
    },
    listar: (p) => s.list({ prefix: p }),
    apagarTudo: () => s.deleteAll(),
  };
}

interface Meta {
  origem: string; // endereço do sítio, para as ligações dos emails
  hmacProfessor: string;
}

export class Turma extends DurableObject<Env> {
  private readonly s: ServicoTurma;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.s = new ServicoTurma(armazemDO(ctx.storage));
  }

  async existe(): Promise<boolean> {
    return Boolean(await this.s.turma());
  }

  async criar(d: { codigo: string; hashProfessor: string; config: ConfigTurma; origem: string }) {
    const r = await this.s.criar(d);
    if (r.ok) {
      await this.ctx.storage.put<Meta>("meta", { origem: d.origem, hmacProfessor: d.hashProfessor });
      await this.ctx.storage.setAlarm(this.s.proximoAlarme());
    }
    return r.ok ? { ok: true as const } : r;
  }

  publico() {
    return this.s.publico();
  }

  registar(p: { nome: string; modo: ModoIdentificacao; fato: string }) {
    return this.s.registar(p);
  }

  entrar(p: { nome: string; modo: ModoIdentificacao }) {
    return this.s.entrar(p);
  }

  async vista(id: string, chave: string) {
    if (!(await this.s.autenticar(id, chave))) return { ok: false as const, erro: "chave" as const };
    return this.s.vista(id);
  }

  async aplicar(id: string, chave: string, ops: Op[]) {
    if (!(await this.s.autenticar(id, chave))) return { ok: false as const, erro: "chave" as const };
    return this.s.aplicar(id, ops);
  }

  sair(id: string, chave: string) {
    return this.s.sair(id, chave);
  }

  async professorCerto(hmacProfessor: string): Promise<boolean> {
    const h = await this.s.hashProfessor();
    return Boolean(h) && iguais(h!, hmacProfessor);
  }

  painel() {
    return this.s.painel();
  }

  acao(a: AcaoProfessor) {
    return this.s.acao(a);
  }

  async apagarTudo(): Promise<void> {
    const meta = await this.ctx.storage.get<Meta>("meta");
    await this.s.apagarTudo();
    await this.ctx.storage.deleteAlarm();
    if (meta && this.env.REGISTO) await this.env.REGISTO.get(this.env.REGISTO.idFromName("registo")).libertar(meta.hmacProfessor);
  }

  definirEmail(endereco: string | null, frequencia: FrequenciaEmail, autorizarNome: boolean) {
    return this.s.definirEmail(endereco, frequencia, autorizarNome);
  }

  confirmarEmail(resumoEndereco: string) {
    return this.s.confirmarEmail(resumoEndereco);
  }

  deixarDeReceber() {
    return this.s.deixarDeReceber();
  }

  async alarm(): Promise<void> {
    const meta = await this.ctx.storage.get<Meta>("meta");
    const r = await this.s.aoAlarme();
    if (r.apagada) {
      await this.ctx.storage.deleteAll();
      if (meta && this.env.REGISTO) await this.env.REGISTO.get(this.env.REGISTO.idFromName("registo")).libertar(meta.hmacProfessor);
      return;
    }
    if (r.resumo && meta && this.env.CHAVE_TOKENS) {
      const t = await this.s.turma();
      const sairToken = await assinarToken(this.env.CHAVE_TOKENS, { t: r.resumo.turma.codigo, p: "sair", exp: t ? this.s.apagarEm(t) : Date.now() + 365 * 86400_000 });
      const ligacoes = { painel: `${meta.origem}/professor/aldeia/painel`, sair: `${meta.origem}/professor/aldeia/email#sair=${sairToken}`, origem: meta.origem };
      const m = modeloResumo(await textosEmails(this.env), r.resumo, ligacoes);
      if (await enviarEmail(this.env, { para: r.resumo.endereco, assunto: m.assunto, html: m.html, texto: m.texto, sair: ligacoes.sair })) await this.s.registarEnvio(r.resumo.chaves);
    }
    await this.ctx.storage.setAlarm(this.s.proximoAlarme());
  }
}
