// ─── Escrita matemática: normalização da notação linear ──────────────────────
// O aluno pode escrever com símbolos Unicode (×, ², √, ≤…) ou em ASCII (*, ^2, sqrt, <=…).
// Normalizamos ambos para uma forma canónica antes de comparar com as respostas aceites.

const SUBSTITUICOES: [RegExp, string][] = [
  [/\s+/g, ""],
  [/[×·⋅]/g, "*"],
  [/÷/g, "/"],
  [/[−–—]/g, "-"],
  [/²/g, "^2"],
  [/³/g, "^3"],
  [/¹/g, "^1"],
  [/⁰/g, "^0"],
  [/≤/g, "<="],
  [/≥/g, ">="],
  [/≠/g, "!="],
  [/≈/g, "~="],
  [/√/g, "sqrt"],
  [/π/g, "pi"],
  [/θ/g, "theta"],
  [/α/g, "alfa"],
  [/β/g, "beta"],
  [/∞/g, "inf"],
  [/∑/g, "sum"],
  [/∫/g, "int"],
  [/→/g, "->"],
  [/∈/g, "in"],
  [/ℝ/g, "R"],
  [/ℕ/g, "N"],
  [/ℤ/g, "Z"],
  [/ℚ/g, "Q"],
  [/\{/g, "("],
  [/\}/g, ")"],
  [/(\d),(\d)/g, "$1.$2"], // vírgula decimal → ponto (só entre dígitos)
  [/\*\*/g, "^"],
  [/(\d)\*([a-z(])/gi, "$1$2"], // 3*x → 3x ; 2*(x+1) → 2(x+1)
  [/([a-z)])\*([a-z(])/gi, "$1$2"], // a*b → ab ; (a)*(b) → (a)(b)
  [/sen\(/gi, "sin("],
  [/tg\(/gi, "tan("],
  [/\^\(([a-z0-9.-]+)\)/gi, "^$1"], // ^(2) → ^2 ; ^(-3) → ^-3 (parênteses mantêm-se quando há operadores dentro)
  [/_\(([a-z0-9.-]+)\)/gi, "_$1"],
];

export function normalizar(entrada: string): string {
  let s = entrada.trim();
  for (const [re, sub] of SUBSTITUICOES) s = s.replace(re, sub);
  return s.toLowerCase();
}

/** Verdadeiro se a resposta escrita corresponde a uma das formas aceites. */
export function corresponde(escrito: string, aceites: string[]): boolean {
  const e = normalizar(escrito);
  if (!e) return false;
  return aceites.some((a) => normalizar(a) === e);
}
