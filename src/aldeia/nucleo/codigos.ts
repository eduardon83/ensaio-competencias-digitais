// ─── Aldeia Digital · códigos da turma e do professor ────────────────────────
// Código da turma: 6 símbolos aleatórios + 1 de verificação, mostrado XXX·XXXX. Não colide com os códigos de prova
// (10 a 12 símbolos). Código do professor: 12 símbolos + 1 de verificação, mostrado XXXX-XXXX-XXXX-X; o servidor
// guarda só o HMAC. A configuração nunca vai dentro do código: é só um identificador.
// Mesmo alfabeto do ECD, sem caracteres que se confundam (0/O, 1/I/L).
/** O mesmo alfabeto de src/codigo/codigo.ts (31 símbolos). Repetido aqui para o Worker não importar o resto. */
export const ALFABETO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function verificacao(s: string): string {
  let soma = 0;
  for (let i = 0; i < s.length; i++) soma += (i + 1) * ALFABETO.indexOf(s[i]);
  return ALFABETO[soma % ALFABETO.length];
}

function aleatorios(n: number): string {
  // Rejeição para não enviesar (256 não é múltiplo de 31).
  const limite = 256 - (256 % ALFABETO.length);
  let s = "";
  while (s.length < n) {
    const b = new Uint8Array(n * 2);
    crypto.getRandomValues(b);
    for (const x of b) if (x < limite && s.length < n) s += ALFABETO[x % ALFABETO.length];
  }
  return s;
}

/** Só os símbolos do alfabeto, em maiúsculas (aceita minúsculas, espaços, ponto e hífen). */
export function limparCodigo(texto: string): string {
  return texto.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function gerarCodigoTurma(): string {
  const corpo = aleatorios(6);
  return corpo + verificacao(corpo);
}
export function gerarCodigoProfessor(): string {
  const corpo = aleatorios(12);
  return corpo + verificacao(corpo);
}

/** Código da turma válido (7 símbolos do alfabeto, verificação certa). Recusa erros de escrita sem consultar nada. */
export function codigoTurmaValido(texto: string): string | null {
  const c = limparCodigo(texto);
  if (c.length !== 7 || [...c].some((x) => !ALFABETO.includes(x))) return null;
  return verificacao(c.slice(0, 6)) === c[6] ? c : null;
}
export function codigoProfessorValido(texto: string): string | null {
  const c = limparCodigo(texto);
  if (c.length !== 13 || [...c].some((x) => !ALFABETO.includes(x))) return null;
  return verificacao(c.slice(0, 12)) === c[12] ? c : null;
}

export function formatarTurma(c: string): string {
  const l = limparCodigo(c);
  return l.length > 3 ? `${l.slice(0, 3)}·${l.slice(3)}` : l;
}
export function formatarProfessor(c: string): string {
  const l = limparCodigo(c);
  return [l.slice(0, 4), l.slice(4, 8), l.slice(8, 12), l.slice(12)].filter(Boolean).join("-");
}

/** Distingue um código da Aldeia (7 símbolos) de um código de prova (10 a 12). */
export function eCodigoAldeia(texto: string): boolean {
  return limparCodigo(texto).length === 7;
}
