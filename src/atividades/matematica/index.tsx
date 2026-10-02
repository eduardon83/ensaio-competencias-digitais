// ─── Atividade 11 · Escrita Matemática (notação em computador) ───────────────
// Escrever expressões matemáticas num campo de texto (notação linear + paleta de símbolos) e reconhecer
// notações corretas. Mede a competência de "escrever matemática no teclado" que as provas digitais exigem.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { definir, limitar, type PropsAtividade } from "../../motor/tipos";
import { Instrucao, useTemporizador } from "../../motor/util";
import { Botao, BotaoRadio } from "../../ui";
import { corresponde } from "./normalizar";
import { amostra, baralharOpcoes } from "../../motor/aleatorio";

/** Itens extra por nível: juntam-se aos do nível e em cada tentativa sorteia-se o mesmo número de itens. */
const EXTRA: Record<1 | 2 | 3 | 4 | 5, Item[]> = {
  1: [
    { tipo: "escrever", mostrar: "15 + 6 = 21", aceita: ["15+6=21"] },
    { tipo: "escrever", mostrar: "8 × 3 = 24", aceita: ["8×3=24", "8*3=24"] },
    { tipo: "escrever", mostrar: "3,75", aceita: ["3,75"] },
    { tipo: "escrever", mostrar: "18 ÷ 3 = 6", aceita: ["18÷3=6", "18/3=6", "18:3=6"] },
    { tipo: "escolher", pergunta: "Que símbolo usas para multiplicar, se não tiveres ×?", opcoes: ["*", "x", "+"], correta: 0 },
  ],
  2: [
    { tipo: "escrever", mostrar: "frac{2}{5}", aceita: ["2/5"] },
    { tipo: "escrever", mostrar: "10^{2} = 100", aceita: ["10^2=100", "10²=100"] },
    { tipo: "escrever", mostrar: "sqrt{49} = 7", aceita: ["sqrt(49)=7", "√49=7", "√(49)=7"] },
    { tipo: "escrever", mostrar: "12,5 %", aceita: ["12,5%"] },
    { tipo: "escolher", pergunta: "Como se escreve “metade” em fração, num teclado?", opcoes: ["1/2", "1:2:", "½/"], correta: 0 },
  ],
  3: [
    { tipo: "escrever", mostrar: "3x − 7 = 2x + 1", aceita: ["3x-7=2x+1"] },
    { tipo: "escrever", mostrar: "x ≥ −2", aceita: ["x>=-2", "x≥-2"] },
    { tipo: "escrever", mostrar: "frac{x}{4} = 3", aceita: ["x/4=3"] },
    { tipo: "escrever", mostrar: "(a + b)^{2}", aceita: ["(a+b)^2", "(a+b)²"] },
    { tipo: "escolher", pergunta: "Que símbolo significa «diferente de»?", opcoes: ["≠", "≈", "≡"], correta: 0 },
  ],
  4: [
    { tipo: "escrever", mostrar: "frac{1}{x + 1}", aceita: ["1/(x+1)"] },
    { tipo: "escrever", mostrar: "2^{n + 1}", aceita: ["2^(n+1)"] },
    { tipo: "escrever", mostrar: "cos(θ) = frac{√3}{2}", aceita: ["cos(theta)=sqrt(3)/2", "cos(θ)=√3/2", "cos(theta)=√3/2", "cos(θ)=sqrt(3)/2"] },
    { tipo: "escrever", mostrar: "y_{n} = 2y_{n−1}", aceita: ["y_n=2y_(n-1)"] },
    { tipo: "escolher", pergunta: "Qual é a escrita linear de «2 elevado a n mais 1» (o expoente é n+1)?", opcoes: ["2^(n+1)", "2^n+1", "2(n+1)"], correta: 0 },
  ],
  5: [
    { tipo: "escrever", mostrar: "∑_{k=0}^{10} k^{2}", aceita: ["sum_(k=0)^10k^2", "sum(k=0,10)k^2", "∑_(k=0)^(10)k^2", "sum_{k=0}^{10}k^2"] },
    { tipo: "escrever", mostrar: "f'(x) = 2x", aceita: ["f'(x)=2x"] },
    { tipo: "escrever", mostrar: "lim_{n → ∞} frac{1}{n} = 0", aceita: ["lim_(n->inf)1/n=0", "lim(n->inf)1/n=0", "lim_(n->∞)1/n=0"] },
    { tipo: "escrever", mostrar: "x ∈ ]−1, 1[", aceita: ["x in ]-1,1[", "x∈]-1,1[", "x in (-1,1)", "x∈(-1,1)"] },
    { tipo: "escolher", pergunta: "Qual destas notações representa o intervalo aberto de 0 a 1?", opcoes: ["]0, 1[", "[0, 1]", "[0, 1["], correta: 0 },
  ],
};

type Item =
  | { tipo: "escrever"; mostrar: string; aceita: string[]; ajuda?: string }
  | { tipo: "escolher"; pergunta: string; opcoes: string[]; correta: number };

export interface ConfigMatematica {
  itens: Item[];
  tempoReferenciaSeg: number;
  paleta: string[];
}

const PALETA_BASE = ["×", "÷", "−", "=", ",", "(", ")"];
const PALETA_2 = [...PALETA_BASE, "/", "^", "²", "³", "√", "%"];
const PALETA_3 = [...PALETA_2, "≤", "≥", "≠", "π", "|"];
const PALETA_4 = [...PALETA_3, "_", "θ", "∞", "→"];
const PALETA_5 = [...PALETA_4, "∑", "∫", "∈", "ℝ", "[", "]"];

// `mostrar` usa uma marcação mínima: ^{…} expoente, _{…} índice, frac{a}{b} fração, sqrt{…} raiz. O resto é literal.
const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigMatematica> = {
  1: {
    tempoReferenciaSeg: 120,
    paleta: PALETA_BASE,
    itens: [
      { tipo: "escrever", mostrar: "3 + 4 = 7", aceita: ["3+4=7"] },
      { tipo: "escrever", mostrar: "12,5", aceita: ["12,5"], ajuda: "Em Portugal a parte decimal separa-se com vírgula." },
      { tipo: "escrever", mostrar: "7 × 8 = 56", aceita: ["7×8=56", "7*8=56"], ajuda: "Podes usar × da paleta ou o asterisco *." },
      { tipo: "escrever", mostrar: "20 ÷ 4 = 5", aceita: ["20÷4=5", "20/4=5", "20:4=5"] },
      { tipo: "escolher", pergunta: "Como se escreve “doze e meio” com algarismos, em Portugal?", opcoes: ["12,5", "12.5", "12;5"], correta: 0 },
      { tipo: "escrever", mostrar: "9 − 3 = 6", aceita: ["9-3=6"] },
    ],
  },
  2: {
    tempoReferenciaSeg: 150,
    paleta: PALETA_2,
    itens: [
      { tipo: "escrever", mostrar: "frac{3}{4}", aceita: ["3/4"], ajuda: "Uma fração escreve-se com a barra: numerador / denominador." },
      { tipo: "escrever", mostrar: "2^{3} = 8", aceita: ["2^3=8", "2³=8"], ajuda: "O expoente escreve-se com ^ (acento circunflexo): 2^3." },
      { tipo: "escrever", mostrar: "25 %", aceita: ["25%"] },
      { tipo: "escrever", mostrar: "sqrt{16} = 4", aceita: ["sqrt(16)=4", "√16=4", "sqrt16=4", "√(16)=4"], ajuda: "A raiz quadrada escreve-se √ (paleta) ou sqrt( )." },
      { tipo: "escrever", mostrar: "1,5 kg", aceita: ["1,5kg"] },
      { tipo: "escolher", pergunta: "Qual destas é a forma correta de escrever “três ao quadrado” num teclado?", opcoes: ["3^2", "3*2", "3_2"], correta: 0 },
      { tipo: "escrever", mostrar: "5^{2} + 1 = 26", aceita: ["5^2+1=26", "5²+1=26"] },
    ],
  },
  3: {
    tempoReferenciaSeg: 180,
    paleta: PALETA_3,
    itens: [
      { tipo: "escrever", mostrar: "x^{2} − 5x + 6 = 0", aceita: ["x^2-5x+6=0"] },
      { tipo: "escrever", mostrar: "2(x + 3) = 10", aceita: ["2(x+3)=10"] },
      { tipo: "escrever", mostrar: "x ≤ 4", aceita: ["x<=4", "x≤4"], ajuda: "“Menor ou igual” escreve-se ≤ (paleta) ou <= ." },
      { tipo: "escrever", mostrar: "y ≠ 0", aceita: ["y!=0", "y≠0", "y<>0"] },
      { tipo: "escrever", mostrar: "f(x) = 3x + 1", aceita: ["f(x)=3x+1"] },
      { tipo: "escrever", mostrar: "frac{a}{b} + frac{1}{2}", aceita: ["a/b+1/2"] },
      { tipo: "escolher", pergunta: "Que símbolo significa “menor ou igual”?", opcoes: ["≤", "≥", "≠"], correta: 0 },
      { tipo: "escolher", pergunta: "Qual é a escrita correta de “x ao cubo”?", opcoes: ["x^3", "x3", "x*3"], correta: 0 },
    ],
  },
  4: {
    tempoReferenciaSeg: 240,
    paleta: PALETA_4,
    itens: [
      { tipo: "escrever", mostrar: "frac{a + b}{2}", aceita: ["(a+b)/2"], ajuda: "Quando o numerador tem uma soma, vai entre parênteses." },
      { tipo: "escrever", mostrar: "sqrt{x^{2} + 1}", aceita: ["sqrt(x^2+1)", "√(x^2+1)"] },
      { tipo: "escrever", mostrar: "|x − 2| < 3", aceita: ["|x-2|<3", "abs(x-2)<3"] },
      { tipo: "escrever", mostrar: "π r^{2}", aceita: ["pir^2", "pi*r^2", "πr^2", "pi×r^2"] },
      { tipo: "escrever", mostrar: "sen(θ) = frac{1}{2}", aceita: ["sin(theta)=1/2", "sen(θ)=1/2", "sen(theta)=1/2"] },
      { tipo: "escrever", mostrar: "x_{1} + x_{2} = 5", aceita: ["x_1+x_2=5"], ajuda: "Um índice (número em baixo) escreve-se com _ (underscore): x_1." },
      { tipo: "escrever", mostrar: "10^{−3}", aceita: ["10^-3", "10^(-3)"] },
      { tipo: "escolher", pergunta: "Qual é a escrita linear da fração com numerador a+b e denominador 2?", opcoes: ["(a+b)/2", "a+b/2", "a+(b/2)"], correta: 0 },
    ],
  },
  5: {
    tempoReferenciaSeg: 300,
    paleta: PALETA_5,
    itens: [
      { tipo: "escrever", mostrar: "∑_{i=1}^{n} i", aceita: ["sum_(i=1)^n i", "sum_{i=1}^{n}i", "sum(i=1,n)i", "∑_(i=1)^(n)i"], ajuda: "Somatório: sum_(i=1)^n i, ou sum(i=1,n) i." },
      { tipo: "escrever", mostrar: "lim_{x → 0} f(x)", aceita: ["lim_(x->0)f(x)", "lim(x->0)f(x)", "lim_{x→0}f(x)"] },
      { tipo: "escrever", mostrar: "∫_{0}^{1} x^{2} dx", aceita: ["int_0^1x^2dx", "int(0,1)x^2dx", "∫_0^1x^2dx"] },
      { tipo: "escrever", mostrar: "sqrt{a^{2} + b^{2}}", aceita: ["sqrt(a^2+b^2)", "√(a^2+b^2)"] },
      { tipo: "escrever", mostrar: "e^{iπ} + 1 = 0", aceita: ["e^(ipi)+1=0", "e^(iπ)+1=0", "e^{iπ}+1=0", "e^(i*pi)+1=0"] },
      { tipo: "escrever", mostrar: "x ∈ [0, 1[", aceita: ["x in [0,1[", "x∈[0,1[", "x in [0,1)", "x∈[0,1)"] },
      { tipo: "escolher", pergunta: "Qual destas notações indica “x pertence aos números reais”?", opcoes: ["x ∈ ℝ", "x ⊂ ℝ", "x ∉ ℝ"], correta: 0 },
      { tipo: "escolher", pergunta: "Em notação linear, como se escreve a fração com numerador 1 e denominador x+1?", opcoes: ["1/(x+1)", "1/x+1", "(1/x)+1"], correta: 0 },
    ],
  },
};

/** Renderiza a marcação mínima de `mostrar` para HTML legível (sup, sub, fração, raiz). */
export function Formula({ texto }: { texto: string }) {
  return (
    <span className="formula" aria-label={texto.replace(/frac\{([^}]*)\}\{([^}]*)\}/g, "($1) a dividir por ($2)").replace(/sqrt\{([^}]*)\}/g, "raiz quadrada de $1").replace(/\^\{([^}]*)\}/g, " elevado a $1").replace(/_\{([^}]*)\}/g, " índice $1")}>
      {render(texto)}
    </span>
  );
}

function render(s: string): ReactNode[] {
  const saida: ReactNode[] = [];
  let i = 0;
  let k = 0;
  const grupo = (de: number): [string, number] => {
    // s[de] === "{" → devolve conteúdo e índice após "}"
    let prof = 0;
    for (let j = de; j < s.length; j++) {
      if (s[j] === "{") prof++;
      else if (s[j] === "}") {
        prof--;
        if (prof === 0) return [s.slice(de + 1, j), j + 1];
      }
    }
    return [s.slice(de + 1), s.length];
  };
  while (i < s.length) {
    if (s.startsWith("frac{", i)) {
      const [a, p1] = grupo(i + 4);
      const [b, p2] = grupo(p1);
      saida.push(
        <span className="frac" key={k++}>
          <span>{render(a)}</span>
          <span>{render(b)}</span>
        </span>,
      );
      i = p2;
    } else if (s.startsWith("sqrt{", i)) {
      const [a, p1] = grupo(i + 4);
      saida.push(
        <span key={k++}>
          √<span className="sqrt">{render(a)}</span>
        </span>,
      );
      i = p1;
    } else if (s[i] === "^" && s[i + 1] === "{") {
      const [a, p1] = grupo(i + 1);
      saida.push(<sup key={k++}>{render(a)}</sup>);
      i = p1;
    } else if (s[i] === "_" && s[i + 1] === "{") {
      const [a, p1] = grupo(i + 1);
      saida.push(<sub key={k++}>{render(a)}</sub>);
      i = p1;
    } else {
      let j = i;
      while (j < s.length && !s.startsWith("frac{", j) && !s.startsWith("sqrt{", j) && !(s[j] === "^" && s[j + 1] === "{") && !(s[j] === "_" && s[j + 1] === "{")) j++;
      saida.push(<span key={k++}>{s.slice(i, j)}</span>);
      i = j;
    }
  }
  return saida;
}

function Matematica({ config, nivel, modo, extensaoTempo, aoTerminar }: PropsAtividade<ConfigMatematica>) {
  // Na avaliação, sorteia o mesmo número de itens do nível a partir dos itens do nível + extra, por ordem aleatória.
  const [itens] = useState<Item[]>(() => {
    const pool = modo === "avaliacao" ? [...config.itens, ...(EXTRA[nivel] ?? [])] : config.itens;
    return amostra(pool, config.itens.length).map((it) => (it.tipo === "escolher" ? { ...it, ...baralharOpcoes(it.opcoes, it.correta) } : it));
  });
  const [indice, setIndice] = useState(0);
  const [valor, setValor] = useState("");
  const [escolha, setEscolha] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"certo" | "errado" | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const certos = useRef(0);
  const usouPaleta = useRef(false);
  const [terminou, setTerminou] = useState(false);
  const campo = useRef<HTMLInputElement>(null);
  const { decorridoExato } = useTemporizador(!terminou, null);
  const item = itens[indice];
  const [mostrarAjuda, setMostrarAjuda] = useState(false);

  useEffect(() => {
    campo.current?.focus();
  }, [indice]);

  function avancar(certo: boolean) {
    if (certo) certos.current++;
    setFeedback(certo ? "certo" : "errado");
    window.setTimeout(() => {
      setFeedback(null);
      setValor("");
      setEscolha(null);
      setTentativa(0);
      const prox = indice + 1;
      if (prox >= itens.length) {
        setTerminou(true);
        const ms = decorridoExato();
        const fator = Math.min(1, (config.tempoReferenciaSeg * 1000 * extensaoTempo) / Math.max(1, ms));
        aoTerminar({ pontuacao: limitar(100 * (0.8 * (certos.current / itens.length) + 0.2 * fator)), duracaoMs: ms, metricas: { certos: certos.current, itens: itens.length, usouPaleta: usouPaleta.current, segundos: Math.round(ms / 1000) } });
        return;
      }
      setIndice(prox);
    }, 900);
  }

  function verificarEscrita() {
    if (item.tipo !== "escrever") return;
    if (corresponde(valor, item.aceita)) avancar(true);
    else if (tentativa === 0) {
      setTentativa(1);
      setFeedback("errado");
      window.setTimeout(() => setFeedback(null), 900);
    } else avancar(false);
  }

  function inserir(simbolo: string) {
    usouPaleta.current = true;
    const el = campo.current;
    const ini = el?.selectionStart ?? valor.length;
    const fim = el?.selectionEnd ?? valor.length;
    const novo = valor.slice(0, ini) + simbolo + valor.slice(fim);
    setValor(novo);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(ini + simbolo.length, ini + simbolo.length);
    });
  }

  const legenda = useMemo(
    () => [
      ["^", "expoente: x^2"],
      ["_", "índice: x_1"],
      ["/", "fração: (a+b)/2"],
      ["sqrt( )", "raiz: sqrt(16) ou √16"],
      ["*", "vezes: 3*x ou 3x"],
      ["<=  >=  !=", "≤  ≥  ≠"],
      ["sum_(i=1)^n", "somatório"],
      ["int_0^1", "integral"],
      ["lim_(x->0)", "limite"],
    ],
    [],
  );

  return (
    <div className="grid gap-4">
      <Instrucao numero={indice + 1} total={itens.length}>
        {feedback === "certo" ? "Certo." : feedback === "errado" && tentativa === 1 && item.tipo === "escrever" ? "Ainda não. Tens mais uma tentativa." : feedback === "errado" ? "Errado. Passamos ao seguinte." : item.tipo === "escrever" ? "Escreve esta expressão no campo, em notação de teclado." : item.pergunta}
      </Instrucao>

      {item.tipo === "escrever" ? (
        <div className="grid gap-3">
          <div className="cartao p-6 text-center">
            <Formula texto={item.mostrar} />
          </div>
          {item.ajuda && (
            <p className="text-sm" style={{ color: "var(--suave)" }}>
              {item.ajuda}
            </p>
          )}
          <div className="paleta" aria-label="Paleta de símbolos">
            {config.paleta.map((s) => (
              <button key={s} type="button" onClick={() => inserir(s)} aria-label={`Inserir ${s}`} disabled={feedback !== null}>
                {s}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2 flex-wrap items-end"
            onSubmit={(e) => {
              e.preventDefault();
              verificarEscrita();
            }}
          >
            <div className="campo flex-1 min-w-48">
              <label htmlFor="mat-campo">A tua escrita</label>
              <input id="mat-campo" ref={campo} value={valor} onChange={(e) => setValor(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} disabled={feedback !== null} style={{ fontFamily: "var(--fonte-mono)", fontSize: "1.2rem" }} />
            </div>
            <Botao type="submit" disabled={feedback !== null || !valor.trim()}>
              Verificar
            </Botao>
          </form>
        </div>
      ) : (
        <div className="grid gap-3">
          <fieldset className="cartao p-4 grid gap-1 border-0">
            <legend className="sr-only">Opções</legend>
            {item.opcoes.map((o, i) => (
              <BotaoRadio key={i} id={`mat-op-${i}`} name="mat-op" rotulo={o} checked={escolha === i} disabled={feedback !== null} onChange={() => setEscolha(i)} />
            ))}
          </fieldset>
          <div>
            <Botao disabled={escolha === null || feedback !== null} onClick={() => avancar(escolha === item.correta)}>
              Responder
            </Botao>
          </div>
        </div>
      )}

      <details className="cartao p-3" open={mostrarAjuda} onToggle={(e) => setMostrarAjuda((e.target as HTMLDetailsElement).open)}>
        <summary className="cursor-pointer font-bold">Como se escreve matemática no teclado</summary>
        <dl className="grid gap-1 mt-2 text-sm" style={{ gridTemplateColumns: "auto 1fr" }}>
          {legenda.map(([k, v]) => (
            <div key={k} className="contents">
              <dt style={{ fontFamily: "var(--fonte-mono)" }}>{k}</dt>
              <dd className="m-0">{v}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}

export const definicao = definir<ConfigMatematica>({
  slug: "matematica",
  numero: 11,
  dominio: "matematica",
  titulo: { jornal: "Infografia", laboratorio: "Caderno de Cálculos" },
  descricao: "Escrever expressões matemáticas no computador: frações, potências, raízes, desigualdades, índices, somatórios. E reconhecer notações.",
  duracao: "3 a 6 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ tempoReferenciaSeg: 30, paleta: PALETA_2, itens: [{ tipo: "escrever", mostrar: "2 + 2 = 4", aceita: ["2+2=4"] }] }),
  Componente: Matematica,
  dica: (m) => {
    if (Number(m.certos) < Number(m.itens) * 0.6) return "Abre a legenda “Como se escreve matemática no teclado” antes de começar: ^ para expoente, / para fração, sqrt( ) para raiz.";
    if (!m.usouPaleta) return "Usaste só o teclado. Boa. Nota que as provas digitais também costumam ter uma paleta de símbolos: vale a pena conhecer as duas vias.";
    return "Já escreves fórmulas com à-vontade. Treina agora as formas sem paleta: <= para ≤, sqrt( ) para √, pi para π.";
  },
});
