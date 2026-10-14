// ─── Ligações e segredos do Worker ───────────────────────────────────────────
import type { Guarda } from "./aldeia/guarda";
import type { Registo } from "./aldeia/registo";
import type { Turma } from "./aldeia/turma";

export interface LimitePedidos {
  limit(o: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  ASSETS: Fetcher;
  TEXTOS: KVNamespace;
  CHAVE_ADMIN?: string;
  CHAVE_EDICAO?: string;
  LIMITE_CHAVES?: LimitePedidos;
  // Aldeia Digital (ver docs/aldeia-digital/SEGURANCA.md)
  TURMAS?: DurableObjectNamespace<Turma>;
  GUARDA?: DurableObjectNamespace<Guarda>;
  REGISTO?: DurableObjectNamespace<Registo>;
  LIMITE_ALDEIA?: LimitePedidos; // por IP, em /api/aldeia/*
  LIMITE_ALDEIA_TURMA?: LimitePedidos; // escritas por turma
  LIMITE_ALDEIA_ALUNO?: LimitePedidos; // escritas por aluno
  PIMENTA_PROFESSOR?: string; // segredo do HMAC do código do professor
  CHAVE_TOKENS?: string; // segredo dos tokens do painel e das ligações dos emails
  RESEND_CHAVE?: string; // chave da Resend (só envio, restrita ao domínio)
  ALDEIA_REMETENTE?: string; // "Aldeia Digital <aldeia@dominio>"
  ALDEIA_RESPONDER?: string; // Reply-To (contacto da Kendir)
  ALDEIA_ESTADO?: string; // "aberta" (omissão), "so-leitura" ou "fechada"; muda-se no painel sem novo deploy
  ALDEIA_TETO?: string; // teto de turmas ativas (omissão 5000)
  ALDEIA_EMAILS_DIA?: string; // teto global de emails por dia (omissão 2000)
}
