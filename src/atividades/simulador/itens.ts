// ─── Simulador de Prova: itens fáceis gerados ao acaso ───────────────────────
// O conteúdo é propositadamente fácil: a pontuação deve refletir o domínio da interface, não da matéria.
import type { Contexto } from "../../preferencias/preferencias";
import { amostra, baralharOpcoes, escolher, inteiro, misturar, type Gerador } from "../../motor/aleatorio";

export type ItemProva =
  | { tipo: "escolha"; enunciado: string; opcoes: string[]; correta: number }
  | { tipo: "audio"; enunciado: string; fala: string; opcoes: string[]; correta: number }
  | { tipo: "curta"; enunciado: string; aceita: string[] }
  | { tipo: "ordenar"; enunciado: string; itens: string[] } // itens pela ordem certa
  | { tipo: "calculo"; enunciado: string; resultado: number }
  | { tipo: "tabela"; enunciado: string; cabecalho: string[]; linhas: string[][]; opcoes: string[]; correta: number };

const ESCOLHAS: [string, string, string[]][] = [
  ["Qual é a capital de Portugal?", "Lisboa", ["Porto", "Coimbra"]],
  ["Quantos dias tem uma semana?", "7", ["5", "10"]],
  ["Qual destes animais é um mamífero?", "Golfinho", ["Tubarão", "Sardinha"]],
  ["Em que estação do ano caem as folhas das árvores?", "Outono", ["Verão", "Primavera"]],
  ["Qual é o maior planeta do sistema solar?", "Júpiter", ["Marte", "Vénus"]],
  ["Quantos minutos tem uma hora?", "60", ["100", "30"]],
  ["Que cor resulta de misturar azul e amarelo?", "Verde", ["Roxo", "Laranja"]],
  ["Qual é o oceano que banha Portugal?", "Atlântico", ["Pacífico", "Índico"]],
  ["Quantos lados tem um triângulo?", "3", ["4", "5"]],
  ["Qual destes é um instrumento de sopro?", "Flauta", ["Violino", "Tambor"]],
  ["A água ferve a quantos graus Celsius, ao nível do mar?", "100", ["50", "0"]],
  ["Qual é o plural de “pão”?", "pães", ["pãos", "pões"]],
];

const AUDIOS: [string, string, string, string[]][] = [
  ["O comboio para Coimbra parte às dez e meia.", "A que horas parte o comboio?", "10h30", ["10h00", "11h30"]],
  ["A reunião foi mudada para a sala doze, no segundo piso.", "Em que sala é a reunião?", "Sala 12", ["Sala 2", "Sala 20"]],
  ["Amanhã a escola abre mais tarde, às nove e um quarto.", "A que horas abre a escola amanhã?", "9h15", ["9h45", "8h15"]],
  ["O autocarro da visita sai do portão principal, junto ao ginásio.", "De onde sai o autocarro?", "Do portão principal", ["Do parque de estacionamento", "Da biblioteca"]],
  ["A biblioteca vai estar fechada na quarta-feira à tarde.", "Quando está fechada a biblioteca?", "Quarta-feira à tarde", ["Quarta-feira de manhã", "Quinta-feira à tarde"]],
];

const CURTAS: [string, string[]][] = [
  ["Escreve, por extenso, o número 3.", ["três", "tres"]],
  ["Completa: o céu é ___ (cor).", ["azul"]],
  ["Escreve o dia da semana que vem depois de segunda-feira.", ["terça-feira", "terça", "terca-feira", "terca"]],
  ["Escreve o resultado de 7 + 5, com algarismos.", ["12"]],
  ["Escreve o nome do mês que vem depois de março.", ["abril"]],
  ["Escreve o contrário de “quente”.", ["frio"]],
];

const ORDENS: [string, string[]][] = [
  ["Ordena os números do mais pequeno para o maior.", ["3", "8", "15", "42"]],
  ["Ordena os dias da semana, começando na segunda-feira.", ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira"]],
  ["Ordena as estações do ano, começando na primavera.", ["primavera", "verão", "outono", "inverno"]],
  ["Ordena as palavras por ordem alfabética.", ["abelha", "barco", "casa", "dado"]],
];

function tabela(ctx: Contexto, r: Gerador): ItemProva {
  const nomes = ctx === "jornal" ? ["Desporto", "Cultura", "Escola", "Opinião"] : ["Amostra A", "Amostra B", "Amostra C", "Amostra D"];
  const valores = nomes.map(() => inteiro(10, 99, r));
  const alvo = inteiro(0, nomes.length - 1, r);
  const unidade = ctx === "jornal" ? "artigos" : "ml";
  return {
    tipo: "tabela",
    enunciado: `Lê a tabela (podes usar o zoom). Qual é o valor de ${nomes[alvo]}?`,
    cabecalho: [ctx === "jornal" ? "Secção" : "Amostra", ctx === "jornal" ? "Artigos" : "Volume (ml)"],
    linhas: nomes.map((n, i) => [n, String(valores[i])]),
    ...baralharOpcoes([`${valores[alvo]} ${unidade}`, `${valores[(alvo + 1) % 4]} ${unidade}`, `${valores[(alvo + 2) % 4]} ${unidade}`], 0, r),
  };
}

export function gerarProva(ctx: Contexto, n: number, calculadora: boolean, r: Gerador = Math.random): ItemProva[] {
  const itens: ItemProva[] = [];
  const [fala, perg, certa, erradas] = escolher(AUDIOS, r);
  itens.push({ tipo: "audio", enunciado: perg, fala, ...baralharOpcoes([certa, ...erradas], 0, r) });
  const [enunc, aceita] = escolher(CURTAS, r);
  itens.push({ tipo: "curta", enunciado: enunc, aceita });
  const [eo, ordem] = escolher(ORDENS, r);
  itens.push({ tipo: "ordenar", enunciado: eo, itens: ordem });
  itens.push(tabela(ctx, r));
  if (calculadora) {
    const a = inteiro(23, 89, r), b = inteiro(12, 48, r);
    itens.push({ tipo: "calculo", enunciado: `Calcula ${a} × ${b}. Podes usar a calculadora.`, resultado: a * b });
  }
  for (const [e, c, w] of amostra(ESCOLHAS, Math.max(0, n - itens.length), r)) itens.push({ tipo: "escolha", enunciado: e, ...baralharOpcoes([c, ...w], 0, r) });
  return misturar(itens.slice(0, n), r);
}
