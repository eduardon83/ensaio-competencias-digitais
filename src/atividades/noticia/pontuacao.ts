import { limitar } from "../../motor/tipos";

export interface EntradaDactilografia {
  corretos: number; // caracteres certos
  totalFonte: number; // caracteres do texto fonte
  minutos: number; // tempo gasto
  alvoWpm: number;
}

/** score = 100 × (0.6 × precisão + 0.4 × min(1, wpm / alvo)); precisão = certos / caracteres da fonte. */
export function pontuarDactilografia(e: EntradaDactilografia) {
  const precisao = e.totalFonte > 0 ? e.corretos / e.totalFonte : 0;
  const wpm = e.minutos > 0 ? e.corretos / 5 / e.minutos : 0;
  const pontuacao = limitar(100 * (0.6 * precisao + 0.4 * Math.min(1, wpm / e.alvoWpm)));
  return { pontuacao, precisao, wpm };
}

/** Combina a ronda de texto com a ronda de teclado numérico (quando feita): 75 % texto + 25 % teclado. */
export function combinarComTeclado(pontuacaoTexto: number, teclado: { corretos: number; total: number } | null) {
  if (!teclado || teclado.total === 0) return pontuacaoTexto;
  return limitar(0.75 * pontuacaoTexto + 0.25 * 100 * (teclado.corretos / teclado.total));
}
