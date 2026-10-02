// ─── Fecho de Edição: geradores de itens curtos e fáceis ─────────────────────
// O que se mede é o ritmo (ver o relógio, avançar, chegar a todas as secções), não a dificuldade.
import type { Contexto } from "../../preferencias/preferencias";
import { amostra, baralharOpcoes, escolher, inteiro, misturar, type Gerador } from "../../motor/aleatorio";
import { gerarCopia } from "../revisao/pontuacao";

export interface Item {
  pergunta: string;
  opcoes: string[];
  correta: number;
}

const PALAVRAS: [string, string, string][] = [
  ["exceção", "excessão", "esceção"], ["atrás", "atraz", "àtras"], ["conseguir", "consegir", "comseguir"], ["também", "tambem", "tanbém"],
  ["através", "atravéz", "atraves"], ["necessário", "nessessário", "necesário"], ["obrigado", "obrigádo", "obrigato"], ["experiência", "experiençia", "esperiência"],
  ["próximo", "proximo", "prossimo"], ["há pouco", "à pouco", "a pouco"], ["infelizmente", "enfelizmente", "infelismente"], ["beneficente", "beneficiente", "benefiscente"],
  ["intervalo", "entrevalo", "intrevalo"], ["paralisar", "paralizar", "parallisar"], ["análise", "analize", "análize"], ["frequência", "frequençia", "freqência"],
];

// Frases completas (artigo, verbo e ponto final): a versão certa tem de estar irrepreensível.
const FRASES: Record<Contexto, string[]> = {
  jornal: [
    "A turma do 6.º A venceu o torneio de andebol.", "A biblioteca recebeu trinta livros novos.", "O concerto de primavera esgotou em dois dias.", "A horta da escola deu a primeira colheita.",
    "Os alunos limpam a praia no fim de semana.", "A nova cantina abre na segunda-feira.", "O clube de xadrez procura novos jogadores.", "A exposição de pintura chegou ao átrio da escola.",
  ],
  laboratorio: [
    "Os feijões do ensaio B crescem mais depressa.", "O microscópio voltou a funcionar na bancada três.", "As amostras de água foram analisadas esta semana.", "A estufa atingiu a temperatura ideal.",
    "A equipa terminou o inventário dos reagentes.", "Os novos óculos de proteção chegaram ao laboratório.", "O ensaio de pH confirmou os resultados.", "O relatório mensal foi entregue a tempo.",
  ],
};

const LEGENDAS: Record<Contexto, [string, string][]> = {
  jornal: [
    ["⚽ uma bola na baliza", "Golo decisivo na final do torneio."], ["📚 uma pilha de livros", "Livros novos na biblioteca."], ["🎻 um violino", "Ensaio para o concerto de primavera."],
    ["🌱 um canteiro", "A horta deu a primeira colheita."], ["🏖️ uma praia", "Voluntários na limpeza da praia."], ["♟️ um tabuleiro", "Final do torneio de xadrez."],
  ],
  laboratorio: [
    ["🔬 um microscópio", "Observação das células da cebola."], ["🌡️ um termómetro", "Medição da temperatura da estufa."], ["🧪 tubos de ensaio", "Preparação das soluções do ensaio."],
    ["🌱 uma planta", "Crescimento dos feijões do ensaio B."], ["⚖️ uma balança", "Pesagem das amostras de solo."], ["🧲 um íman", "Experiência com materiais magnéticos."],
  ],
};

const UNIDADES: [string, string, string[]][] = [
  ["a massa", "grama (g)", ["litro (l)", "metro (m)"]], ["o volume", "mililitro (ml)", ["grama (g)", "segundo (s)"]], ["a temperatura", "grau Celsius (°C)", ["quilómetro (km)", "litro (l)"]],
  ["o tempo", "segundo (s)", ["grama (g)", "metro (m)"]], ["o comprimento", "metro (m)", ["litro (l)", "grau Celsius (°C)"]],
];

function itemPalavra(r: Gerador): Item {
  const [certa, ...erradas] = escolher(PALAVRAS, r);
  return { pergunta: "Qual destas palavras está bem escrita?", ...baralharOpcoes([certa, ...erradas], 0, r) };
}
function itemFrase(ctx: Contexto, r: Gerador): Item {
  const certo = escolher(FRASES[ctx], r);
  const errados = new Set<string>();
  for (let k = 0; errados.size < 2 && k < 20; k++) errados.add(gerarCopia(certo, 1, false, r));
  errados.delete(certo);
  return { pergunta: "Escolhe a frase que está escrita sem erros.", ...baralharOpcoes([certo, ...[...errados].slice(0, 2)], 0, r) };
}
function itemLegenda(ctx: Contexto, r: Gerador): Item {
  const [certa, ...outras] = amostra(LEGENDAS[ctx], 3, r);
  return { pergunta: `A fotografia mostra ${certa[0]}. Que legenda lhe serve?`, ...baralharOpcoes([certa[1], ...outras.map((o) => o[1])], 0, r) };
}
function itemConta(ctx: Contexto, r: Gerador): Item {
  const a = inteiro(4, 16, r);
  const b = inteiro(2, 9, r);
  const certo = a + b;
  const pergunta = ctx === "jornal" ? `A edição tem ${a} páginas e juntámos mais ${b}. Quantas páginas tem agora?` : `O frasco tinha ${a} ml e juntámos ${b} ml. Quantos mililitros tem agora?`;
  const opcoes = misturar([certo, certo + 1, certo - 1].map(String), r);
  return { pergunta, opcoes, correta: opcoes.indexOf(String(certo)) };
}
function itemUnidade(r: Gerador): Item {
  const [grandeza, certa, erradas] = escolher(UNIDADES, r);
  return { pergunta: `Em que unidade se mede ${grandeza}?`, ...baralharOpcoes([certa, ...erradas], 0, r) };
}

export { FRASES };

export function gerarItem(ctx: Contexto, r: Gerador = Math.random): Item {
  const tipos = ctx === "jornal" ? [itemPalavra, itemFrase, itemLegenda, itemConta] : [itemPalavra, itemFrase, itemLegenda, itemConta, itemUnidade];
  const f = escolher(tipos, r);
  return f === itemPalavra || f === itemUnidade ? (f as (r: Gerador) => Item)(r) : (f as (c: Contexto, r: Gerador) => Item)(ctx, r);
}

/** Itens de uma secção, sem perguntas repetidas. */
export function gerarSecao(ctx: Contexto, n: number, r: Gerador = Math.random): Item[] {
  const vistos = new Set<string>();
  const itens: Item[] = [];
  for (let k = 0; itens.length < n && k < n * 20; k++) {
    const it = gerarItem(ctx, r);
    const chave = it.pergunta + it.opcoes.join("|");
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    itens.push(it);
  }
  return itens;
}
