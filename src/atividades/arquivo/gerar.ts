// ─── O Arquivo: geração aleatória das pastas, separadores, histórico e artigo ──
import type { Contexto } from "../../preferencias/preferencias";
import { amostra, escolher, inteiro, misturar, type Gerador } from "../../motor/aleatorio";

export interface No {
  id: string;
  nome: string; // sem extensão
  ext: string; // ".pdf", ...
  tipo: "pasta" | "ficheiro";
  data: string; // AAAA-MM-DD
  filhos: No[];
}

export const POOLS: Record<Contexto, { topo: [string, string, string[]][]; eventos: string[]; locais: string[] }> = {
  jornal: {
    topo: [
      ["Fotos", "foto", [".png", ".jpg"]],
      ["Textos", "texto", [".docx"]],
      ["Entrevistas", "entrevista", [".mp3", ".docx"]],
      ["Edições", "edicao", [".pdf"]],
      ["Rascunhos", "rascunho", [".txt", ".docx"]],
    ],
    eventos: ["Visita de estudo", "Torneio", "Feira do livro", "Concerto", "Eleições", "Corta-mato"],
    locais: ["Porto", "Lisboa", "Braga", "Coimbra", "Faro", "Aveiro"],
  },
  laboratorio: {
    topo: [
      ["Amostras", "amostra", [".csv", ".xlsx"]],
      ["Protocolos", "protocolo", [".pdf", ".docx"]],
      ["Resultados", "resultado", [".xlsx", ".csv"]],
      ["Imagens", "imagem", [".png", ".jpg"]],
      ["Relatórios", "relatorio", [".pdf", ".docx"]],
    ],
    eventos: ["Ensaio A", "Ensaio B", "Ensaio C", "Ensaio D", "Ensaio E", "Ensaio F"],
    locais: ["Bancada 1", "Bancada 2", "Bancada 3", "Bancada 4", "Estufa", "Frigorífico"],
  },
};

let contador = 0;
const novoId = () => `n${++contador}`;

function dataAleatoria(r: Gerador): string {
  return `2026-${String(inteiro(1, 9, r)).padStart(2, "0")}-${String(inteiro(1, 28, r)).padStart(2, "0")}`;
}

export interface Arvore {
  raiz: No[];
  alvo: { no: No; caminho: string[] }; // ficheiro a abrir
  mover?: { no: No; destino: No; caminhoDestino: string[] };
  renomear?: { no: No; novoNome: string };
  recente?: { pasta: No; no: No };
  pastaRecebidos: No;
}

/** Gera uma árvore com a profundidade pedida e escolhe os alvos das tarefas. */
export function gerarArvore(ctx: Contexto, profundidade: number, r: Gerador = Math.random): Arvore {
  const pool = POOLS[ctx];
  const usados = new Set<string>();
  // Nome único: tenta números ao acaso e, se estiverem quase todos usados, passa a sequencial (nunca fica preso).
  const nomeUnico = (prefixo: string) => {
    let n = "";
    for (let k = 0; k < 40; k++) {
      n = `${prefixo}_${String(inteiro(1, 99, r)).padStart(2, "0")}`;
      if (!usados.has(n)) break;
    }
    for (let k = 100; usados.has(n); k++) n = `${prefixo}_${k}`;
    usados.add(n);
    return n;
  };
  const ficheiro = (prefixo: string, exts: string[]): No => ({ id: novoId(), nome: nomeUnico(prefixo), ext: escolher(exts, r), tipo: "ficheiro", data: dataAleatoria(r), filhos: [] });
  const pasta = (nome: string, filhos: No[]): No => ({ id: novoId(), nome, ext: "", tipo: "pasta", data: dataAleatoria(r), filhos });

  // Níveis de pastas: ano → evento → local → período (até à profundidade pedida, sem contar o topo).
  const camadas = [["2025", "2026"], pool.eventos, pool.locais, ["Manhã", "Tarde"]];
  const construir = (nivel: number, prefixo: string, exts: string[]): No[] => {
    if (nivel >= profundidade - 1) return Array.from({ length: inteiro(2, 4, r) }, () => ficheiro(prefixo, exts));
    // Árvores fundas ficam estreitas (2 pastas por nível) para não ficarem gigantes.
    const largura = nivel === 0 || profundidade >= 4 ? 2 : inteiro(2, 3, r);
    const nomes = amostra(camadas[Math.min(nivel, camadas.length - 1)], largura, r);
    const sub = nomes.map((n) => pasta(n, construir(nivel + 1, prefixo, exts)));
    return r() < 0.5 ? [...sub, ficheiro(prefixo, exts)] : sub;
  };
  const topos = amostra(pool.topo, 3, r);
  const raiz = topos.map(([nome, prefixo, exts]) => pasta(nome, profundidade <= 1 ? [ficheiro(prefixo, exts), ficheiro(prefixo, exts)] : construir(0, prefixo, exts)));

  // Ficheiro alvo: o mais fundo possível, ao acaso.
  const folhas: { no: No; caminho: string[] }[] = [];
  const percorrer = (nos: No[], caminho: string[]) => {
    for (const n of nos) {
      if (n.tipo === "pasta") percorrer(n.filhos, [...caminho, n.nome]);
      else folhas.push({ no: n, caminho });
    }
  };
  percorrer(raiz, []);
  const maxProf = Math.max(...folhas.map((f) => f.caminho.length));
  const alvo = escolher(folhas.filter((f) => f.caminho.length === maxProf), r);

  // Pasta "Recebidos" com ficheiros para mover, mudar o nome e ordenar por data.
  const prefixoRec = POOLS[ctx].topo[1][1];
  const recebidos = pasta("Recebidos", Array.from({ length: 5 }, () => ficheiro(prefixoRec, POOLS[ctx].topo[1][2])));
  const datas = misturar(["2026-03-04", "2026-05-17", "2026-06-02", "2026-08-21", "2026-09-30"], r);
  recebidos.filhos.forEach((f, i) => (f.data = datas[i]));
  raiz.push(recebidos);

  const [aMover, aRenomear] = amostra(recebidos.filhos, 2, r);
  const destino = escolher(raiz.filter((p) => p !== recebidos), r);
  const maisRecente = [...recebidos.filhos].sort((a, b) => (a.data < b.data ? 1 : -1))[0];
  return {
    raiz,
    alvo,
    mover: { no: aMover, destino, caminhoDestino: [destino.nome] },
    renomear: { no: aRenomear, novoNome: nomeUnico(ctx === "jornal" ? "final" : "versao_final") },
    recente: { pasta: recebidos, no: maisRecente },
    pastaRecebidos: recebidos,
  };
}

/** Separadores de um navegador: um tem a informação pedida, outro é publicidade. */
export interface Separador {
  id: string;
  titulo: string;
  conteudo: string;
  publicidade?: boolean;
}
export const INFOS: Record<Contexto, [string, string, string][]> = {
  jornal: [
    ["o horário da biblioteca", "Biblioteca escolar", "Horário da biblioteca: das 8h30 às 17h30, de segunda a sexta."],
    ["o resultado do torneio", "Desporto escolar", "Resultado do torneio de andebol: 6.º A 14, 6.º B 11."],
    ["a ementa de quarta-feira", "Cantina", "Ementa de quarta-feira: sopa de legumes, arroz de pato e fruta."],
    ["o prazo das entregas", "Redação", "Prazo das entregas da edição de maio: quinta-feira, às 17h00."],
  ],
  laboratorio: [
    ["a temperatura da estufa", "Estufa", "Temperatura da estufa: 24 °C, humidade 68%."],
    ["o horário do laboratório", "Laboratório 3", "Horário do laboratório: das 9h00 às 18h00, de segunda a sexta."],
    ["a validade do reagente R-12", "Reagentes", "Reagente R-12: lote 4471-B, validade novembro de 2027."],
    ["a próxima sessão de segurança", "Formação", "Próxima sessão de segurança: terça-feira, às 14h30, sala 2."],
  ],
};
export const PUBLICIDADE = ["Promoção! Ganha um tablet", "Oferta imperdível: clica já", "Parabéns, foste selecionado!"];

export function gerarSeparadores(ctx: Contexto, n: number, r: Gerador = Math.random) {
  const infos = amostra(INFOS[ctx], Math.max(1, n - 1), r);
  const [procurado, ...outros] = infos;
  const seps: Separador[] = [
    { id: "s0", titulo: procurado[1], conteudo: procurado[2] },
    ...outros.slice(0, Math.max(0, n - 2)).map((o, i) => ({ id: `s${i + 1}`, titulo: o[1], conteudo: o[2] })),
    { id: "pub", titulo: escolher(PUBLICIDADE, r), conteudo: "Publicidade. Este separador abriu-se sozinho.", publicidade: true },
  ].slice(0, Math.max(2, n));
  return { separadores: misturar(seps, r), alvo: "s0", pedido: procurado[0] };
}

/** Páginas visitadas (histórico) para os botões Retroceder / Avançar. */
export interface Pagina {
  id: string;
  titulo: string;
  texto: string;
}
export const PAGINAS: Record<Contexto, Pagina[]> = {
  jornal: [
    { id: "inicio", titulo: "Início", texto: "Bem-vindo ao sítio do jornal da escola." },
    { id: "desporto", titulo: "Desporto", texto: "Resultados e calendário dos torneios." },
    { id: "horario", titulo: "Horário", texto: "A redação abre às 13h30." },
    { id: "contactos", titulo: "Contactos", texto: "Escreve-nos para redacao@escola.pt." },
    { id: "arquivo", titulo: "Arquivo", texto: "Edições anteriores do jornal." },
    { id: "cultura", titulo: "Cultura", texto: "Teatro, música e cinema na escola." },
  ],
  laboratorio: [
    { id: "inicio", titulo: "Início", texto: "Consola do Laboratório 3." },
    { id: "amostras", titulo: "Amostras", texto: "Lista das amostras em análise." },
    { id: "horario", titulo: "Horário", texto: "O laboratório abre às 9h00." },
    { id: "contactos", titulo: "Contactos", texto: "Técnico de serviço: Rui, extensão 214." },
    { id: "inventario", titulo: "Inventário", texto: "Material disponível na bancada." },
    { id: "seguranca", titulo: "Segurança", texto: "Regras e fichas de segurança." },
  ],
};

export function gerarHistorico(ctx: Contexto, n: number, r: Gerador = Math.random) {
  const pags = amostra(PAGINAS[ctx], n, r);
  const atual = pags.length - 1;
  const recuar = inteiro(1, Math.min(3, pags.length - 1), r);
  const alvoAtras = atual - recuar;
  const alvoFrente = Math.min(atual, alvoAtras + inteiro(1, Math.max(1, recuar), r));
  return { paginas: pags, todas: PAGINAS[ctx], alvoAtras, alvoFrente };
}

/** Artigo longo para a tarefa "fim da página". */
export const PARAGRAFOS: Record<Contexto, string[]> = {
  jornal: [
    "A redação do jornal reuniu-se na segunda-feira para planear a edição de maio. Em cima da mesa estavam três temas: o torneio de andebol, a feira do livro e a reciclagem.",
    "O Tomé apresentou as fotografias da visita de estudo ao Porto. A Diretora Graça escolheu cinco para a página central e pediu legendas curtas.",
    "A Lia lembrou que todos os textos precisam de ser revistos duas vezes antes de seguirem para a gráfica, e que os nomes têm de ser confirmados.",
    "Ficou decidido que a entrevista ao novo treinador sairia na página quatro, com uma caixa sobre a história do clube desde a sua fundação.",
    "Na secção de cultura, a turma do 8.º B vai escrever sobre o concerto de primavera e sobre a exposição de pintura que abriu na biblioteca.",
    "Houve ainda tempo para discutir o inquérito aos leitores: mais de metade lê o jornal no telemóvel, e muitos pedem mais notícias de desporto.",
    "No fim da reunião, cada repórter recebeu a sua tarefa e um prazo. O Sr. Prazo, o relógio da parede, marcava seis horas menos um quarto.",
    "A edição foi fechada na quinta-feira, com todas as páginas revistas, as fotografias legendadas e o índice atualizado na primeira página.",
  ],
  laboratorio: [
    "A equipa do laboratório reuniu-se na segunda-feira para planear os ensaios do mês. Havia três prioridades: o pH das amostras, a estufa e o inventário.",
    "O Rui mostrou as fotografias das culturas da semana anterior. A Doutora Inês escolheu as melhores para o relatório e pediu legendas com a data.",
    "A Marta lembrou que todas as medições devem ser repetidas três vezes e registadas no caderno antes de passarem para a folha de cálculo.",
    "Ficou decidido que o microscópio MX-200 seria calibrado na quarta-feira, com uma nota no livro de ocorrências sobre a última avaria.",
    "Na estufa, os feijões do ensaio B cresceram mais do que os do ensaio A, o que levou a equipa a rever a quantidade de luz em cada bancada.",
    "Houve ainda tempo para discutir a segurança: as batas novas chegaram e os óculos antigos vão ser substituídos até ao fim do mês.",
    "No fim da reunião, cada investigador recebeu a sua tarefa e um prazo. O Cronómetro, pendurado na parede, marcava seis horas menos um quarto.",
    "O relatório foi fechado na quinta-feira, com todos os dados verificados, as imagens legendadas e as conclusões revistas pela equipa.",
  ],
};

export function gerarArtigo(ctx: Contexto, paragrafos: number, r: Gerador = Math.random) {
  const base = PARAGRAFOS[ctx];
  const lista = Array.from({ length: paragrafos }, (_, i) => base[(i + inteiro(0, base.length - 1, r)) % base.length]);
  const ultimaFrase = lista[lista.length - 1];
  const ultima = ultimaFrase.replace(/[.!?]+$/, "").split(/\s+/).pop()!;
  // Distratores: últimas palavras de outros parágrafos (do artigo e do banco), todas diferentes da certa.
  const candidatas = [...new Set([...lista, ...base].map((p) => p.replace(/[.!?]+$/, "").split(/\s+/).pop()!).filter((w) => w !== ultima))];
  const distratores = amostra(candidatas, 2, r);
  return { paragrafos: lista, opcoes: misturar([ultima, ...distratores], r), correta: ultima };
}
