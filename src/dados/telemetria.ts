// ─── Telemetria anónima ──────────────────────────────────────────────────────
// Sem contas e sem base de dados própria: cada tentativa e cada teste concluído são enviados, se o
// utilizador não desativar, para um ponto de recolha configurado em VITE_TELEMETRIA_URL (por omissão,
// um Google Apps Script que escreve numa folha de cálculo; ver telemetria/README.md). Só vai o que
// explica o resultado: nunca nome, email, IP (não o lemos) nem impressão digital do dispositivo.
// O mesmo ponto devolve agregados: públicos (grupos com menos de 20 tentativas ocultos) ou completos
// com a chave de administração.

import { lerPreferencias } from "../preferencias/preferencias";
import { VERSAO } from "../versao";

export const URL_TELEMETRIA: string = (import.meta.env.VITE_TELEMETRIA_URL as string | undefined)?.trim() ?? "";
export const telemetriaConfigurada = URL_TELEMETRIA.length > 0;

export type Evento = "tentativa" | "teste";

export function enviar(evento: Evento, dados: Record<string, unknown>): void {
  if (!telemetriaConfigurada || !lerPreferencias().telemetria) return;
  const corpo = JSON.stringify({ evento, versao: VERSAO, enviadoEm: new Date().toISOString(), ...dados });
  // text/plain evita o preflight CORS (o Apps Script não responde a OPTIONS) e lê-se igual no servidor.
  try {
    if (typeof navigator.sendBeacon === "function" && navigator.sendBeacon(URL_TELEMETRIA, new Blob([corpo], { type: "text/plain;charset=utf-8" }))) return;
  } catch {
    /* cai para fetch */
  }
  fetch(URL_TELEMETRIA, { method: "POST", body: corpo, headers: { "Content-Type": "text/plain;charset=utf-8" }, keepalive: true, mode: "no-cors" }).catch(() => {});
}

export interface Grupo {
  n: number;
  media: number;
}
export interface Agregados {
  gerado_em: string;
  total_tentativas: number;
  total_testes: number;
  limiar: number;
  por_atividade: Record<string, Grupo>;
  por_atividade_nivel: Record<string, Grupo>; // "slug:nivel"
  por_nivel: Record<string, number>;
  por_dispositivo: Record<string, number>;
  por_contexto: Record<string, number>;
  por_formato: Record<string, number>;
  por_origem: Record<string, number>;
  por_dia: Record<string, number>; // AAAA-MM-DD → tentativas
  testes_por_ciclo: Record<string, Grupo>;
  sessoes: number;
  completo: boolean; // true quando a chave de administração foi aceite
}

/** Obtém agregados do ponto de recolha. Sem chave: versão pública. Devolve null se não configurado ou em erro. */
export async function obterAgregados(chave?: string): Promise<Agregados | { erro: string } | null> {
  if (!telemetriaConfigurada) return null;
  const url = new URL(URL_TELEMETRIA);
  if (chave) url.searchParams.set("chave", chave);
  try {
    const r = await fetch(url.toString(), { method: "GET", redirect: "follow" });
    if (!r.ok) return { erro: `HTTP ${r.status}` };
    return (await r.json()) as Agregados | { erro: string };
  } catch (e) {
    return { erro: e instanceof Error ? e.message : "falha de rede" };
  }
}
