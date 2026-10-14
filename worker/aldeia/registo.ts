// ─── Aldeia Digital · registo global (Durable Object único) ──────────────────
// Conta as turmas ativas (teto configurável), guarda o índice HMAC do código do professor → código da turma (para o
// painel abrir só com o código do professor) e o teto global de emails por dia. Nada de dados de alunos.
import { DurableObject } from "cloudflare:workers";
import type { Env } from "../env";

export class Registo extends DurableObject<Env> {
  async ativas(): Promise<number> {
    return (await this.ctx.storage.get<number>("ativas")) ?? 0;
  }

  /** Reserva um lugar para uma turma nova. Ao passar 80 % do teto, avisa nos registos do Worker (sem dados pessoais). */
  async reservar(teto: number): Promise<boolean> {
    const n = await this.ativas();
    if (n >= teto) return false;
    await this.ctx.storage.put("ativas", n + 1);
    if (n + 1 >= Math.floor(teto * 0.8) && n < Math.floor(teto * 0.8)) console.warn(`aldeia: 80 % do teto de turmas (${n + 1}/${teto})`);
    return true;
  }

  async indexar(hmacProfessor: string, turma: string): Promise<void> {
    await this.ctx.storage.put(`p:${hmacProfessor}`, turma);
  }

  async procurar(hmacProfessor: string): Promise<string | null> {
    return (await this.ctx.storage.get<string>(`p:${hmacProfessor}`)) ?? null;
  }

  /** Uma turma foi apagada (pelo professor ou pelo alarme): liberta o lugar e o índice. */
  async libertar(hmacProfessor: string): Promise<void> {
    const existia = await this.ctx.storage.get<string>(`p:${hmacProfessor}`);
    if (!existia) return;
    await this.ctx.storage.delete(`p:${hmacProfessor}`);
    await this.ctx.storage.put("ativas", Math.max(0, (await this.ativas()) - 1));
  }

  /** Teto global de emails por dia (protege a reputação do domínio de envio). */
  async contarEmail(limiteDia: number): Promise<boolean> {
    const dia = new Date().toISOString().slice(0, 10);
    const c = (await this.ctx.storage.get<{ dia: string; n: number }>("emails")) ?? { dia, n: 0 };
    const atual = c.dia === dia ? c : { dia, n: 0 };
    if (atual.n >= limiteDia) return false;
    await this.ctx.storage.put("emails", { dia, n: atual.n + 1 });
    return true;
  }
}
