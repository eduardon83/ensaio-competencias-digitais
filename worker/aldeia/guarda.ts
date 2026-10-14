// ─── Aldeia Digital · guarda de falhas e quotas (Durable Object, repartido por IP) ──
// Conta falhas (códigos errados, nomes errados, código do professor) e bloqueia por um tempo; conta quotas
// (turmas criadas por hora e por dia). As chaves já vêm resumidas (nunca o IP em claro) e apagam-se sozinhas.
import { DurableObject } from "cloudflare:workers";
import type { Env } from "../env";

interface Contagem {
  marcas: number[]; // instantes (ms)
  bloqueadoAte?: number;
}

const LIMPEZA_MS = 24 * 3600_000;

export class Guarda extends DurableObject<Env> {
  private async ler(chave: string): Promise<Contagem> {
    return (await this.ctx.storage.get<Contagem>(chave)) ?? { marcas: [] };
  }

  private async escrever(chave: string, c: Contagem): Promise<void> {
    await this.ctx.storage.put(chave, c);
    if ((await this.ctx.storage.getAlarm()) === null) await this.ctx.storage.setAlarm(Date.now() + LIMPEZA_MS);
  }

  async bloqueado(chave: string): Promise<boolean> {
    const c = await this.ler(chave);
    return Boolean(c.bloqueadoAte && c.bloqueadoAte > Date.now());
  }

  /** Regista uma falha. Ao chegar ao limite dentro da janela, bloqueia. Devolve se ficou (ou já estava) bloqueado. */
  async falha(chave: string, limite: number, janelaMs: number, bloqueioMs: number): Promise<boolean> {
    const agora = Date.now();
    const c = await this.ler(chave);
    if (c.bloqueadoAte && c.bloqueadoAte > agora) return true;
    c.marcas = [...c.marcas.filter((t) => agora - t < janelaMs), agora].slice(-limite);
    if (c.marcas.length >= limite) {
      c.bloqueadoAte = agora + bloqueioMs;
      c.marcas = [];
    }
    await this.escrever(chave, c);
    return Boolean(c.bloqueadoAte && c.bloqueadoAte > agora);
  }

  /** Consome uma unidade se todas as janelas tiverem espaço. Ex.: [[5, 1 h], [20, 24 h]]. */
  async quota(chave: string, limites: [number, number][]): Promise<boolean> {
    const agora = Date.now();
    const c = await this.ler(chave);
    const maior = Math.max(...limites.map(([, j]) => j));
    c.marcas = c.marcas.filter((t) => agora - t < maior);
    if (limites.some(([n, j]) => c.marcas.filter((t) => agora - t < j).length >= n)) {
      await this.escrever(chave, c);
      return false;
    }
    c.marcas.push(agora);
    await this.escrever(chave, c);
    return true;
  }

  async alarm(): Promise<void> {
    const agora = Date.now();
    const todas = await this.ctx.storage.list<Contagem>();
    const apagar: string[] = [];
    for (const [k, c] of todas) {
      const ultima = Math.max(0, ...c.marcas);
      if ((!c.bloqueadoAte || c.bloqueadoAte < agora) && agora - ultima > LIMPEZA_MS) apagar.push(k);
    }
    for (let i = 0; i < apagar.length; i += 128) await this.ctx.storage.delete(apagar.slice(i, i + 128));
    if (todas.size > apagar.length) await this.ctx.storage.setAlarm(agora + LIMPEZA_MS);
  }
}
