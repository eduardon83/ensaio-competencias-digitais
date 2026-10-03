// ─── Avaliador de fórmulas da folha de cálculo simulada ──────────────────────
// Suporta: números (vírgula ou ponto decimal), referências (B2), intervalos (D2:D5) dentro de funções,
// + - * / , parênteses, % no fim de um valor, e as funções SOMA/SUM, MÉDIA/AVERAGE, MÁXIMO/MAX, MÍNIMO/MIN.
// Argumentos separados por ";" (como no Excel em português) ou por ",".

export type Celulas = Record<string, number | string | undefined>;

export class ErroFormula extends Error {
  constructor(public codigo: "#VALOR!" | "#DIV/0!" | "#NOME?" | "#REF!" | "#CIRC!" | "#ERRO!", mensagem: string) {
    super(mensagem);
  }
}

const semAcentos = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const FUNCOES: Record<string, (v: number[]) => number> = {
  SOMA: (v) => v.reduce((s, x) => s + x, 0),
  MEDIA: (v) => {
    if (!v.length) throw new ErroFormula("#DIV/0!", "A média de um intervalo vazio não existe.");
    return v.reduce((s, x) => s + x, 0) / v.length;
  },
  MAXIMO: (v) => (v.length ? Math.max(...v) : 0),
  MINIMO: (v) => (v.length ? Math.min(...v) : 0),
};
const SINONIMOS: Record<string, string> = { SUM: "SOMA", AVERAGE: "MEDIA", MAX: "MAXIMO", MIN: "MINIMO" };

type Token = { t: "num"; v: number } | { t: "ref"; v: string } | { t: "fn"; v: string } | { t: "op"; v: string };

function tokenizar(f: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < f.length) {
    const c = f[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    const num = /^\d+(?:[.,]\d+)?/.exec(f.slice(i));
    if (num) {
      out.push({ t: "num", v: Number(num[0].replace(",", ".")) });
      i += num[0].length;
      continue;
    }
    const pal = /^[A-Za-zÀ-ÿ]+\d*/.exec(f.slice(i));
    if (pal) {
      const p = pal[0];
      i += p.length;
      if (/^[A-Za-z]{1,2}\d+$/.test(p)) out.push({ t: "ref", v: p.toUpperCase() });
      else if (/^[A-Za-zÀ-ÿ]+$/.test(p) && f.slice(i).trimStart().startsWith("(")) out.push({ t: "fn", v: p });
      else throw new ErroFormula("#NOME?", `Não conheço “${p}”. As referências escrevem-se com a letra da coluna e o número da linha (por exemplo B2).`);
      continue;
    }
    if ("+-*/()%:;,".includes(c)) {
      out.push({ t: "op", v: c });
      i++;
      continue;
    }
    throw new ErroFormula("#ERRO!", `O símbolo “${c}” não pode ser usado numa fórmula.`);
  }
  return out;
}

function coluna(ref: string): [number, number] {
  const m = /^([A-Z]{1,2})(\d+)$/.exec(ref)!;
  const col = m[1].split("").reduce((s, ch) => s * 26 + ch.charCodeAt(0) - 64, 0);
  return [col, Number(m[2])];
}
function nomeColuna(n: number): string {
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
export function expandirIntervalo(a: string, b: string): string[] {
  const [c1, l1] = coluna(a);
  const [c2, l2] = coluna(b);
  const refs: string[] = [];
  for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) for (let l = Math.min(l1, l2); l <= Math.max(l1, l2); l++) refs.push(`${nomeColuna(c)}${l}`);
  return refs;
}

/** Valor de uma célula: número, texto (devolvido como string) ou resultado da fórmula. */
export function valorCelula(ref: string, cel: Celulas, pilha: string[] = []): number | string {
  if (pilha.includes(ref)) throw new ErroFormula("#CIRC!", `A fórmula refere-se a si própria (referência circular em ${ref}).`);
  const v = cel[ref];
  if (v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  if (v.trim().startsWith("=")) return avaliarFormula(v, cel, [...pilha, ref]);
  const n = Number(v.trim().replace(",", "."));
  return v.trim() !== "" && Number.isFinite(n) ? n : v;
}

export function avaliarFormula(formula: string, cel: Celulas, pilha: string[] = []): number {
  const f = formula.trim();
  if (!f.startsWith("=")) throw new ErroFormula("#ERRO!", "Uma fórmula começa sempre pelo sinal =.");
  const tk = tokenizar(f.slice(1));
  if (!tk.length) throw new ErroFormula("#ERRO!", "A fórmula está vazia.");
  let p = 0;
  const ver = () => tk[p];
  const op = (v: string) => ver()?.t === "op" && ver().v === v;
  const numero = (x: number | string, ref: string): number => {
    if (typeof x === "string") throw new ErroFormula("#VALOR!", `${ref} tem texto (“${x}”), não um número.`);
    return x;
  };

  function expr(): number {
    let v = termo();
    while (op("+") || op("-")) {
      const o = tk[p++].v;
      const d = termo();
      v = o === "+" ? v + d : v - d;
    }
    return v;
  }
  function termo(): number {
    let v = unario();
    while (op("*") || op("/")) {
      const o = tk[p++].v;
      const d = unario();
      if (o === "/" && d === 0) throw new ErroFormula("#DIV/0!", "Divisão por zero.");
      v = o === "*" ? v * d : v / d;
    }
    return v;
  }
  function unario(): number {
    if (op("-")) {
      p++;
      return -unario();
    }
    if (op("+")) {
      p++;
      return unario();
    }
    let v = primario();
    while (op("%")) {
      p++;
      v /= 100;
    }
    return v;
  }
  function primario(): number {
    const t = ver();
    if (!t) throw new ErroFormula("#ERRO!", "A fórmula acaba a meio: falta um valor.");
    if (t.t === "num") {
      p++;
      return t.v;
    }
    if (t.t === "ref") {
      p++;
      if (op(":")) throw new ErroFormula("#VALOR!", "Um intervalo (como D2:D5) só pode ser usado dentro de uma função, por exemplo =SOMA(D2:D5).");
      return numero(valorCelula(t.v, cel, pilha), t.v);
    }
    if (t.t === "fn") {
      p++;
      const nome = semAcentos(t.v.toUpperCase());
      const fn = FUNCOES[SINONIMOS[nome] ?? nome];
      if (!fn) throw new ErroFormula("#NOME?", `A função “${t.v}” não existe nesta folha. Usa SOMA, MÉDIA, MÁXIMO ou MÍNIMO.`);
      if (!op("(")) throw new ErroFormula("#ERRO!", "Depois do nome da função vem um parêntese.");
      p++;
      const valores: number[] = [];
      while (!op(")")) {
        const a = ver();
        if (a?.t === "ref" && tk[p + 1]?.t === "op" && tk[p + 1].v === ":") {
          const b = tk[p + 2];
          if (b?.t !== "ref") throw new ErroFormula("#REF!", "Um intervalo escreve-se com duas referências, por exemplo D2:D5.");
          p += 3;
          for (const r of expandirIntervalo(a.v, b.v)) {
            const x = valorCelula(r, cel, pilha);
            if (typeof x === "number") valores.push(x);
          }
        } else valores.push(expr());
        if (op(";") || op(",")) p++;
        else if (!op(")")) throw new ErroFormula("#ERRO!", "Separa os argumentos da função com ponto e vírgula (;) e fecha o parêntese.");
      }
      p++;
      return fn(valores);
    }
    if (op("(")) {
      p++;
      const v = expr();
      if (!op(")")) throw new ErroFormula("#ERRO!", "Falta fechar um parêntese.");
      p++;
      return v;
    }
    throw new ErroFormula("#ERRO!", `“${t.v}” não está no sítio certo.`);
  }

  const v = expr();
  if (p < tk.length) throw new ErroFormula("#ERRO!", `Sobra “${tk[p].v}” no fim da fórmula.`);
  return v;
}

/** Formata um número à portuguesa (vírgula decimal; até 2 casas). */
export function formatar(n: number): string {
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? String(r) : r.toFixed(2).replace(".", ",");
}
