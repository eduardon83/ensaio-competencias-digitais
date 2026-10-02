import { limitar, type LinhaRelatorio } from "../../motor/tipos";

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

// ─── Relatório: o texto, palavra a palavra ───────────────────────────────────

function semAcentos(t: string) {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Distância de edição (inserções, remoções, trocas) entre duas palavras. */
export function distancia(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** Explica um erro de uma palavra (acento, maiúscula, símbolo, letra, palavra diferente). */
export function explicarErro(certa: string, escrita: string): string {
  if (!escrita) return "Não chegaste a escrever esta palavra. Se o tempo acabou, treina primeiro a precisão e a velocidade vem depois.";
  if (semAcentos(certa) === semAcentos(escrita)) return "Falta ou sobra um acento. No teclado português, carrega primeiro na tecla do acento e só depois na letra.";
  if (certa.toLowerCase() === escrita.toLowerCase()) return "Atenção às maiúsculas: usa Shift para a letra grande.";
  if (/[@€]/.test(certa) && !/[@€]/.test(escrita)) return "O @ escreve-se com AltGr+2 e o € com AltGr+E.";
  if (/ç/i.test(certa) && !/ç/i.test(escrita)) return "O ç tem tecla própria, à direita do L.";
  if (/[.,;:()]/.test(certa) && certa.replace(/[^.,;:()]/g, "") !== escrita.replace(/[^.,;:()]/g, "")) return "Falta ou sobra um sinal de pontuação.";
  if (distancia(semAcentos(certa.toLowerCase()), semAcentos(escrita.toLowerCase())) > Math.max(2, Math.floor(certa.length / 2))) return "É uma palavra diferente da que estava no texto.";
  return "Há uma letra trocada, a mais ou em falta. Olha para o texto palavra a palavra.";
}

export function relatorioTexto(fonte: string, digitado: string, precisao: number, wpm: number, alvoWpm: number): LinhaRelatorio[] {
  const pc = Math.round(precisao * 100);
  const linhas: LinhaRelatorio[] = [
    {
      tarefa: "Copiar o texto",
      resultado: pc >= 98 ? "certo" : pc >= 85 ? "parcial" : "errado",
      resposta: `${pc}% de precisão · ${Math.round(wpm)} palavras por minuto`,
      certa: `100% de precisão · pelo menos ${alvoWpm} palavras por minuto`,
      feedback: pc < 85 ? "Escreve mais devagar e corrige logo que vês uma letra a vermelho." : wpm < alvoWpm ? "A precisão está boa. Para ganhar velocidade, treina com textos curtos sem olhar para o teclado." : "Precisão e velocidade dentro do esperado.",
    },
  ];
  const fp = fonte.split(/\s+/);
  const dp = digitado.split(/\s+/);
  const erradas: LinhaRelatorio[] = [];
  const emFalta: string[] = [];
  fp.forEach((w, i) => {
    const e = dp[i] ?? "";
    if (e === "") emFalta.push(w);
    else if (e !== w && erradas.length < 6) erradas.push({ tarefa: `Palavra “${w}”`, resultado: "errado", resposta: e, certa: w, feedback: explicarErro(w, e) });
  });
  if (emFalta.length)
    erradas.push({
      tarefa: "Texto por acabar",
      resultado: "errado",
      resposta: `Faltaram ${emFalta.length} ${emFalta.length === 1 ? "palavra" : "palavras"}`,
      certa: emFalta.slice(0, 6).join(" ") + (emFalta.length > 6 ? " …" : ""),
      feedback: "Não chegaste ao fim do texto. Treina primeiro a precisão; a velocidade vem com a prática.",
    });
  return [...linhas, ...erradas];
}
