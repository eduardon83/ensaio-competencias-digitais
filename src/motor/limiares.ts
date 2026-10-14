// ─── Limiares de resultado: faixas, estrelas e carimbo ─────────────────────────
// Módulo puro, sem dependências: usado pelo motor (via tipos.ts) e pelo núcleo da Aldeia Digital (Worker).

export interface Faixa {
  nome: string;
  min: number;
  max: number;
}
export const FAIXAS: Faixa[] = [
  { nome: "A começar", min: 0, max: 39 },
  { nome: "Em progresso", min: 40, max: 64 },
  { nome: "Confiante", min: 65, max: 84 },
  { nome: "Autónomo", min: 85, max: 100 },
];
export function faixaDe(p: number): Faixa {
  return FAIXAS.find((f) => p >= f.min && p <= f.max) ?? FAIXAS[0];
}
/** Estrelas: abaixo de 50 tentar novamente; 50 a 74 uma; 75 a 90 duas; 91 a 100 três. */
export const LIMIARES_ESTRELAS = [50, 75, 91] as const;
export function estrelasDe(p: number): 0 | 1 | 2 | 3 {
  if (p >= LIMIARES_ESTRELAS[2]) return 3;
  if (p >= LIMIARES_ESTRELAS[1]) return 2;
  if (p >= LIMIARES_ESTRELAS[0]) return 1;
  return 0;
}
export const CARIMBO_MINIMO = 85;
