// ─── Orçamento da Visita de Estudo: geração da folha e correção das tarefas ──
import { escolher, inteiro, type Gerador } from "../../motor/aleatorio";
import { avaliarFormula, ErroFormula, formatar, valorCelula, type Celulas } from "./formula";

export interface Tarefa {
  celula: string;
  rotulo: string; // texto na coluna A
  pedido: string;
  solucao: string; // fórmula de referência
  exemplo?: string;
}

export interface Folha {
  destino: string;
  alunos: number;
  fixas: Celulas; // cabeçalhos, dados e células já preenchidas
  tarefas: Tarefa[];
  linhas: number;
}

export interface ConfigOrcamento {
  despesas: 3 | 4;
  porAluno: boolean;
  desconto: boolean;
  restante: boolean;
  estatisticas: boolean; // MÁXIMO e MÉDIA
  exemplos: boolean;
  exemploFeito: boolean; // a primeira linha já vem com a fórmula
}

const DESTINOS = ["ao Centro de Ciência", "ao Museu de Arte Antiga", "ao Jardim Botânico", "ao Planetário", "à Fábrica do Papel", "ao Museu dos Transportes"];

export function gerarFolha(cfg: ConfigOrcamento, r: Gerador = Math.random): Folha {
  const alunos = inteiro(18, 28, r);
  const desconto = escolher([5, 10, 15, 20], r);
  const despesas: [string, number, number][] = [
    ["Bilhete de entrada", inteiro(6, 16, r) / 2, alunos],
    ["Almoço", inteiro(8, 15, r) / 2, alunos],
    ["Autocarro", inteiro(15, 30, r) * 10, 1],
  ];
  if (cfg.despesas === 4) despesas.splice(2, 0, ["Seguro", inteiro(2, 4, r) / 2, alunos]);
  const fixas: Celulas = { A1: "Despesa", B1: "Preço (€)", C1: "Quantidade", D1: "Total (€)", F1: "Dados", F2: "Alunos", G2: alunos, F3: "Orçamento (€)", F4: "Desconto (%)", G4: desconto };
  const tarefas: Tarefa[] = [];
  despesas.forEach(([nome, preco, qtd], i) => {
    const l = i + 2;
    fixas[`A${l}`] = nome;
    fixas[`B${l}`] = preco;
    fixas[`C${l}`] = qtd;
    const t: Tarefa = { celula: `D${l}`, rotulo: nome, pedido: `Calcula o total de “${nome.toLowerCase()}” (preço × quantidade).`, solucao: `=B${l}*C${l}`, exemplo: `=B${l}*C${l}` };
    if (i === 0 && cfg.exemploFeito) fixas[t.celula] = t.solucao;
    else tarefas.push(t);
  });
  const ultima = despesas.length + 1;
  let l = ultima + 1;
  const total = `D${l}`;
  fixas[`A${l}`] = "Total";
  tarefas.push({ celula: total, rotulo: "Total", pedido: "Soma todas as despesas.", solucao: `=SOMA(D2:D${ultima})`, exemplo: `=SOMA(D2:D${ultima})` });
  if (cfg.porAluno) {
    l++;
    fixas[`A${l}`] = "Custo por aluno";
    tarefas.push({ celula: `D${l}`, rotulo: "Custo por aluno", pedido: "Divide o total pelo número de alunos (está em G2).", solucao: `=${total}/G2`, exemplo: `=${total}/G2` });
  }
  let comDesconto = total;
  if (cfg.desconto) {
    l++;
    comDesconto = `D${l}`;
    fixas[`A${l}`] = "Total com desconto";
    tarefas.push({ celula: comDesconto, rotulo: "Total com desconto", pedido: `A escola tem um desconto (em G4) sobre o total. Calcula o total já com o desconto.`, solucao: `=${total}*(1-G4/100)`, exemplo: `=${total}*(1-G4/100)` });
  }
  if (cfg.restante) {
    l++;
    fixas[`A${l}`] = "Fica do orçamento";
    tarefas.push({ celula: `D${l}`, rotulo: "Fica do orçamento", pedido: `Quanto dinheiro sobra do orçamento (G3) depois de pagar ${cfg.desconto ? "o total com desconto" : "o total"}?`, solucao: `=G3-${comDesconto}`, exemplo: `=G3-${comDesconto}` });
  }
  if (cfg.estatisticas) {
    l++;
    fixas[`A${l}`] = "Despesa mais cara";
    tarefas.push({ celula: `D${l}`, rotulo: "Despesa mais cara", pedido: "Qual é a maior das despesas? Usa uma função.", solucao: `=MÁXIMO(D2:D${ultima})`, exemplo: `=MÁXIMO(D2:D${ultima})` });
    l++;
    fixas[`A${l}`] = "Média das despesas";
    tarefas.push({ celula: `D${l}`, rotulo: "Média das despesas", pedido: "Calcula a média das despesas.", solucao: `=MÉDIA(D2:D${ultima})`, exemplo: `=MÉDIA(D2:D${ultima})` });
  }
  // Orçamento: um pouco acima do necessário, arredondado a 50 €.
  const comSolucoes = { ...fixas, ...Object.fromEntries(tarefas.map((t) => [t.celula, t.solucao])) };
  const necessario = Number(valorCelula(comDesconto, { ...comSolucoes, G3: 0 }));
  fixas.G3 = Math.ceil(necessario / 50) * 50 + 50 * inteiro(1, 3, r);
  return { destino: escolher(DESTINOS, r), alunos, fixas, tarefas, linhas: l };
}

/** Folha com as soluções em todas as células de tarefa (para corrigir sem penalizar erros em cadeia). */
export function folhaResolvida(f: Folha): Celulas {
  return { ...f.fixas, ...Object.fromEntries(f.tarefas.map((t) => [t.celula, t.solucao])) };
}

export interface Correcao {
  estado: "certo" | "parcial" | "errado";
  valor?: number;
  esperado: number;
  mensagem: string;
}

export function corrigir(t: Tarefa, escrito: string, f: Folha): Correcao {
  const resolvida = folhaResolvida(f);
  const esperado = Number(valorCelula(t.celula, resolvida));
  const s = escrito.trim();
  if (!s) return { estado: "errado", esperado, mensagem: "Ficou vazia." };
  const perto = (v: number) => Math.abs(v - esperado) < 0.005;
  if (!s.startsWith("=")) {
    const n = Number(s.replace(/\s|€/g, "").replace(",", "."));
    if (Number.isFinite(n) && perto(n)) return { estado: "parcial", valor: n, esperado, mensagem: "O valor está certo, mas foi escrito à mão. Com uma fórmula, a folha atualiza-se sozinha quando os dados mudam." };
    return { estado: "errado", valor: Number.isFinite(n) ? n : undefined, esperado, mensagem: "Uma fórmula começa sempre pelo sinal =." };
  }
  try {
    const v = avaliarFormula(s, { ...resolvida, [t.celula]: s }, [t.celula]);
    if (perto(v)) return { estado: "certo", valor: v, esperado, mensagem: "Certo." };
    return { estado: "errado", valor: v, esperado, mensagem: `A fórmula dá ${formatar(v)} e devia dar ${formatar(esperado)}. Confirma as células e as operações.` };
  } catch (e) {
    return { estado: "errado", esperado, mensagem: e instanceof ErroFormula ? `${e.codigo} ${e.message}` : "A fórmula tem um erro." };
  }
}
