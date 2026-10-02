// ─── Fecho de Edição: geradores de itens curtos e fáceis ─────────────────────
// O que se mede é o ritmo (ver o relógio, avançar, chegar a todas as secções), não a dificuldade.
// Cada item tem um tema; numa mesma tentativa nenhum tema se repete (nem entre secções nem entre tipos).
import type { Contexto } from "../../preferencias/preferencias";
import { baralharOpcoes, escolher, inteiro, misturar, type Gerador } from "../../motor/aleatorio";
import { gerarCopia } from "../revisao/pontuacao";

export interface Item {
  pergunta: string;
  opcoes: string[];
  correta: number;
  tema: string;
}

const PALAVRAS: [string, string, string][] = [
  ["exceção", "excessão", "esceção"], ["atrás", "atraz", "àtras"], ["conseguir", "consegir", "comseguir"], ["também", "tambem", "tanbém"],
  ["através", "atravéz", "atraves"], ["necessário", "nessessário", "necesário"], ["obrigado", "obrigádo", "obrigato"], ["experiência", "experiençia", "esperiência"],
  ["próximo", "proximo", "prossimo"], ["infelizmente", "enfelizmente", "infelismente"], ["beneficente", "beneficiente", "benefiscente"], ["intervalo", "entrevalo", "intrevalo"],
  ["paralisar", "paralizar", "parallisar"], ["análise", "analize", "análize"], ["frequência", "frequençia", "freqência"], ["cabeleireiro", "cabelereiro", "cabeleleiro"],
];

// Frases completas (artigo, verbo e ponto final): a versão certa tem de estar irrepreensível. [tema, frase]
const FRASES_TEMA: Record<Contexto, [string, string][]> = {
  jornal: [
    ["andebol", "A turma do 6.º A venceu o torneio de andebol."], ["livros", "A biblioteca recebeu trinta livros novos."], ["concerto", "O concerto de primavera esgotou em dois dias."],
    ["horta", "A horta da escola deu a primeira colheita."], ["praia", "Os alunos limpam a praia no fim de semana."], ["cantina", "A nova cantina abre na segunda-feira."],
    ["xadrez", "O clube de xadrez procura novos jogadores."], ["pintura", "A exposição de pintura chegou ao átrio da escola."],
  ],
  laboratorio: [
    ["feijoes", "Os feijões do ensaio B crescem mais depressa."], ["microscopio", "O microscópio voltou a funcionar na bancada três."], ["agua", "As amostras de água foram analisadas esta semana."],
    ["estufa", "A estufa atingiu a temperatura ideal."], ["reagentes", "A equipa terminou o inventário dos reagentes."], ["oculos", "Os novos óculos de proteção chegaram ao laboratório."],
    ["ph", "O ensaio de pH confirmou os resultados."], ["relatorio", "O relatório mensal foi entregue a tempo."],
  ],
};
export const FRASES: Record<Contexto, string[]> = { jornal: FRASES_TEMA.jornal.map((f) => f[1]), laboratorio: FRASES_TEMA.laboratorio.map((f) => f[1]) };

// Legendas: [tema, emoji, o que a fotografia mostra, legenda]
const LEGENDAS: Record<Contexto, [string, string, string, string][]> = {
  jornal: [
    ["futebol", "⚽", "uma bola a entrar na baliza", "Golo decisivo na final do torneio de futebol."], ["leitura", "📖", "uma criança a ler", "Hora do conto na biblioteca da escola."],
    ["violino", "🎻", "um violino", "Ensaio da orquestra da escola."], ["arvores", "🌳", "uma árvore acabada de plantar", "Dia da árvore no recreio."],
    ["bicicleta", "🚲", "uma bicicleta", "Passeio de bicicleta pela cidade."], ["teatro", "🎭", "duas máscaras de teatro", "Estreia da peça do clube de teatro."],
  ],
  laboratorio: [
    ["celulas", "🔬", "um microscópio", "Observação das células da cebola."], ["temperatura", "🌡️", "um termómetro", "Medição da temperatura da água."],
    ["solucoes", "🧪", "tubos de ensaio", "Preparação das soluções do ensaio."], ["solo", "⚖️", "uma balança", "Pesagem das amostras de solo."],
    ["iman", "🧲", "um íman", "Experiência com materiais magnéticos."], ["lupa", "🔍", "uma lupa", "Observação de insetos com a lupa."],
  ],
};

const UNIDADES: [string, string, string[]][] = [
  ["a massa", "grama (g)", ["litro (l)", "metro (m)"]], ["o volume", "mililitro (ml)", ["grama (g)", "segundo (s)"]], ["a temperatura", "grau Celsius (°C)", ["quilómetro (km)", "litro (l)"]],
  ["o tempo", "segundo (s)", ["grama (g)", "metro (m)"]], ["o comprimento", "metro (m)", ["litro (l)", "grau Celsius (°C)"]],
];

type Gerar = (ctx: Contexto, r: Gerador, usados: Set<string>) => Item | null;

function livre<T>(lista: T[], tema: (x: T) => string, usados: Set<string>, r: Gerador): T | null {
  const possiveis = lista.filter((x) => !usados.has(tema(x)));
  return possiveis.length ? escolher(possiveis, r) : null;
}

const itemPalavra: Gerar = (_ctx, r, usados) => {
  const p = livre(PALAVRAS, (x) => `palavra:${x[0]}`, usados, r);
  if (!p) return null;
  return { pergunta: "Qual destas palavras está bem escrita?", ...baralharOpcoes([...p], 0, r), tema: `palavra:${p[0]}` };
};
const itemFrase: Gerar = (ctx, r, usados) => {
  const f = livre(FRASES_TEMA[ctx], (x) => x[0], usados, r);
  if (!f) return null;
  const certo = f[1];
  const errados = new Set<string>();
  for (let k = 0; errados.size < 2 && k < 30; k++) {
    const e = gerarCopia(certo, 1, false, r, true);
    if (e !== certo) errados.add(e);
  }
  if (errados.size < 2) return null;
  return { pergunta: "Escolhe a frase que está escrita sem erros.", ...baralharOpcoes([certo, ...errados], 0, r), tema: f[0] };
};
const itemLegenda: Gerar = (ctx, r, usados) => {
  const l = livre(LEGENDAS[ctx], (x) => x[0], usados, r);
  if (!l) return null;
  const outras = misturar(LEGENDAS[ctx].filter((x) => x !== l), r).slice(0, 2);
  return { pergunta: `${l[1]} A fotografia mostra ${l[2]}. Qual é a legenda certa?`, ...baralharOpcoes([l[3], ...outras.map((o) => o[3])], 0, r), tema: l[0] };
};
const itemConta: Gerar = (ctx, r, usados) => {
  for (let k = 0; k < 20; k++) {
    const a = inteiro(4, 16, r);
    const b = inteiro(2, 9, r);
    const tema = `conta:${a + b}`;
    if (usados.has(tema)) continue;
    const certo = a + b;
    const pergunta = ctx === "jornal" ? `A edição tem ${a} páginas e juntámos mais ${b}. Quantas páginas tem agora?` : `O frasco tinha ${a} ml e juntámos ${b} ml. Quantos mililitros tem agora?`;
    const opcoes = misturar([certo, certo + 1, certo - 1].map(String), r);
    return { pergunta, opcoes, correta: opcoes.indexOf(String(certo)), tema };
  }
  return null;
};
const itemUnidade: Gerar = (_ctx, r, usados) => {
  const u = livre(UNIDADES, (x) => `unidade:${x[0]}`, usados, r);
  if (!u) return null;
  return { pergunta: `Em que unidade se mede ${u[0]}?`, ...baralharOpcoes([u[1], ...u[2]], 0, r), tema: `unidade:${u[0]}` };
};

/** Itens de uma secção. Os tipos alternam e os temas não se repetem dentro do conjunto `usados` (partilhado entre secções). */
export function gerarSecao(ctx: Contexto, n: number, r: Gerador = Math.random, usados: Set<string> = new Set()): Item[] {
  const tipos: Gerar[] = ctx === "jornal" ? [itemPalavra, itemFrase, itemLegenda, itemConta] : [itemPalavra, itemFrase, itemLegenda, itemConta, itemUnidade];
  const itens: Item[] = [];
  let ordem = misturar(tipos, r);
  for (let k = 0; itens.length < n && k < n * 10; k++) {
    if (k % ordem.length === 0 && k > 0) ordem = misturar(tipos, r);
    const it = ordem[k % ordem.length](ctx, r, usados);
    if (!it) continue;
    usados.add(it.tema);
    itens.push(it);
  }
  return itens;
}
