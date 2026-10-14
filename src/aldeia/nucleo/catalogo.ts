// ─── Aldeia Digital · catálogo (edifícios, dimensões, capítulos, missões, prémios) ──
// Módulo puro, sem React: usado pelo navegador e pelo Worker (que valida tudo contra este catálogo).
// Só ids e regras. Os nomes e textos para pessoas estão em src/aldeia/textos.ts (editáveis no backoffice).
// Regra das chaves: ids estáveis; nunca reordenar listas cujo índice seja usado (não há nenhuma aqui).
import arte from "./catalogo-arte.json";

export type IdEdificio = "escola" | "jornal" | "laboratorio" | "biblioteca" | "arquivo" | "junta" | "seguranca" | "mercado" | "oficina" | "museu" | "largo" | "horta";
export const EDIFICIOS: { id: IdEdificio; nucleo: boolean }[] = [
  { id: "escola", nucleo: true },
  { id: "jornal", nucleo: true },
  { id: "laboratorio", nucleo: true },
  { id: "biblioteca", nucleo: false },
  { id: "arquivo", nucleo: false },
  { id: "junta", nucleo: false },
  { id: "seguranca", nucleo: false },
  { id: "mercado", nucleo: false },
  { id: "oficina", nucleo: false },
  { id: "museu", nucleo: false },
  { id: "largo", nucleo: false },
  { id: "horta", nucleo: false },
];
export const ID_EDIFICIOS = EDIFICIOS.map((e) => e.id);

/** As 8 dimensões das AE de Cidadania e Desenvolvimento (2025). Os ids coincidem com os troféus roseta-<id>. */
export type Dimensao = "direitos" | "democracia" | "sustentabilidade" | "financeira" | "pluralismo" | "media" | "saude" | "seguranca";
export const DIMENSOES: { id: Dimensao; grupo: 1 | 2 }[] = [
  { id: "direitos", grupo: 1 },
  { id: "democracia", grupo: 1 },
  { id: "sustentabilidade", grupo: 1 },
  { id: "financeira", grupo: 1 },
  { id: "pluralismo", grupo: 2 },
  { id: "media", grupo: 2 },
  { id: "saude", grupo: 2 },
  { id: "seguranca", grupo: 2 },
];
export const DIMENSOES_GRUPO_1: Dimensao[] = DIMENSOES.filter((d) => d.grupo === 1).map((d) => d.id);

/** Os 12 desafios que contam para o perfil de competências (regra atual dos carimbos). */
export const DESAFIOS = ["noticia", "painel", "revisao", "arquivo", "cartao", "paginacao", "fecho", "teclas", "encontra", "simulador", "matematica", "maqueta"] as const;

export type TipoMissao = "evento" | "atividade" | "cidadania";
export interface DefMissao {
  id: string;
  tipo: TipoMissao;
  capitulo: number;
  edificio: IdEdificio | "casa";
  /** Slug da atividade, jogo ou teste de segurança que a missão corre (tipo "atividade"). */
  slug?: string;
  /** Conta para o perfil de competências (um dos 12 desafios). */
  conta?: boolean;
  /** Item de prática: corre a atividade em modo prática e não conta (capítulo 0). */
  pratica?: boolean;
  /** Missão de cidadania: dimensão das AE. Só entra se o professor marcou a dimensão. */
  dimensao?: Dimensao;
  /** Fora da versão Completa; o professor pode ligá-la na versão Personalizada. */
  opcional?: boolean;
  /** Ilustração própria no pacote de arte (missoes/<id>). */
  arte?: string;
}

// Ordem = ordem da história. Os ids das missões de atividade são os slugs; os de cidadania começam por "cid-".
export const MISSOES: DefMissao[] = [
  { id: "nascimento", tipo: "evento", capitulo: 0, edificio: "casa" },
  { id: "tutorial", tipo: "evento", capitulo: 0, edificio: "casa" },
  { id: "pratica", tipo: "atividade", capitulo: 0, edificio: "escola", slug: "painel", pratica: true },

  { id: "painel", tipo: "atividade", capitulo: 1, edificio: "escola", slug: "painel", conta: true },
  { id: "teclas", tipo: "atividade", capitulo: 1, edificio: "escola", slug: "teclas", conta: true },
  { id: "cid-direitos-online", tipo: "cidadania", capitulo: 1, edificio: "escola", dimensao: "direitos", arte: "direitos-online" },
  { id: "cid-regras-turma", tipo: "cidadania", capitulo: 1, edificio: "escola", dimensao: "democracia" },

  { id: "noticia", tipo: "atividade", capitulo: 2, edificio: "jornal", slug: "noticia", conta: true },
  { id: "revisao", tipo: "atividade", capitulo: 2, edificio: "jornal", slug: "revisao", conta: true },
  { id: "paginacao", tipo: "atividade", capitulo: 2, edificio: "jornal", slug: "paginacao", conta: true },
  { id: "cid-verdade-boato", tipo: "cidadania", capitulo: 2, edificio: "jornal", dimensao: "media" },

  { id: "matematica", tipo: "atividade", capitulo: 3, edificio: "laboratorio", slug: "matematica", conta: true },
  { id: "maqueta", tipo: "atividade", capitulo: 3, edificio: "laboratorio", slug: "maqueta", conta: true },
  { id: "cid-computador-velho", tipo: "cidadania", capitulo: 3, edificio: "horta", dimensao: "sustentabilidade", arte: "computador-velho" },

  { id: "encontra", tipo: "atividade", capitulo: 4, edificio: "biblioteca", slug: "encontra", conta: true },
  { id: "leitura", tipo: "atividade", capitulo: 4, edificio: "biblioteca", slug: "leitura", opcional: true },
  { id: "arquivo", tipo: "atividade", capitulo: 4, edificio: "arquivo", slug: "arquivo", conta: true },
  { id: "cid-imagem-autor", tipo: "cidadania", capitulo: 4, edificio: "biblioteca", dimensao: "media" },
  { id: "sala-trancada", tipo: "atividade", capitulo: 4, edificio: "museu", slug: "sala-trancada", opcional: true },

  { id: "cartao", tipo: "atividade", capitulo: 5, edificio: "junta", slug: "cartao", conta: true },
  { id: "correio", tipo: "atividade", capitulo: 5, edificio: "junta", slug: "correio" },
  { id: "cid-votacao-festa", tipo: "cidadania", capitulo: 5, edificio: "junta", dimensao: "democracia", arte: "votacao-festa" },
  { id: "cid-preciso-ou-quero", tipo: "cidadania", capitulo: 5, edificio: "mercado", dimensao: "financeira", arte: "preciso-ou-quero" },
  { id: "orcamento", tipo: "atividade", capitulo: 5, edificio: "mercado", slug: "orcamento", opcional: true },

  { id: "fraude", tipo: "atividade", capitulo: 6, edificio: "seguranca", slug: "fraude" },
  { id: "boas-praticas", tipo: "atividade", capitulo: 6, edificio: "seguranca", slug: "boas-praticas" },
  { id: "redes-sociais", tipo: "atividade", capitulo: 6, edificio: "seguranca", slug: "redes-sociais", opcional: true },
  { id: "privacidade", tipo: "atividade", capitulo: 6, edificio: "seguranca", slug: "privacidade", opcional: true },
  { id: "publicos", tipo: "atividade", capitulo: 6, edificio: "seguranca", slug: "publicos", opcional: true },
  { id: "familia", tipo: "atividade", capitulo: 6, edificio: "seguranca", slug: "familia", opcional: true },
  { id: "cid-pedir-ajuda", tipo: "cidadania", capitulo: 6, edificio: "seguranca", dimensao: "seguranca" },
  { id: "cid-hora-desligar", tipo: "cidadania", capitulo: 6, edificio: "casa", dimensao: "saude" },

  { id: "misterio", tipo: "atividade", capitulo: 7, edificio: "junta", slug: "misterio" },
  { id: "robo", tipo: "atividade", capitulo: 7, edificio: "oficina", slug: "robo" },
  { id: "cid-boas-maneiras", tipo: "cidadania", capitulo: 7, edificio: "largo", dimensao: "pluralismo" },

  { id: "fecho", tipo: "atividade", capitulo: 8, edificio: "escola", slug: "fecho", conta: true },
  { id: "simulador", tipo: "atividade", capitulo: 8, edificio: "escola", slug: "simulador", conta: true },
  { id: "festa", tipo: "evento", capitulo: 8, edificio: "largo" },
];
export const MISSAO = new Map(MISSOES.map((m) => [m.id, m]));
export const CAPITULOS = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
/** Missões que nunca saem (capítulos 0 e 8 fixos na Personalizada). */
export const FIXAS = new Set(MISSOES.filter((m) => m.capitulo === 0 || m.capitulo === 8).map((m) => m.id));

// ── Configuração da turma ────────────────────────────────────────────────────
export type Extensao = "essencial" | "completa" | "personalizada";
export type ModoIdentificacao = "numero" | "nome" | "anonimo";
export type Ritmo = "livre" | "guiado";
export type Colecao = "atuais" | "extintos" | "escolha";
export type Tempo = 1 | 1.25 | 1.5 | 2;
export type FrequenciaEmail = "nenhum" | "semanal" | "diario" | "marcos";

export interface ConfigTurma {
  nome: string; // só para o professor ("5.º B"), pode ficar vazio
  lugares: number; // 1 a 32
  nivel: 1 | 2 | 3 | 4 | 5;
  extensao: Extensao;
  /** Personalizada: ids das missões ligadas (as fixas entram sempre). */
  escolha: string[];
  dimensoes: Dimensao[];
  identificacao: ModoIdentificacao[];
  ritmo: Ritmo;
  tempo: Tempo;
  dataFim: string; // AAAA-MM-DD
  colecao: Colecao;
}

/** O que as regras da história usam da configuração (também disponível para o aluno). */
export type ConfigHistoria = Pick<ConfigTurma, "extensao" | "escolha" | "dimensoes" | "ritmo">;

export const LUGARES_MAX = 32;

/** Fim do ano letivo atual (31 de agosto), em AAAA-MM-DD. */
export function fimAnoLetivo(agora = new Date()): string {
  const ano = agora.getUTCMonth() >= 8 ? agora.getUTCFullYear() + 1 : agora.getUTCFullYear();
  return `${ano}-08-31`;
}

/** Ciclo do texto das missões de cidadania a partir do nível (1.º ciclo, 2.º e 3.º ciclos, secundário). */
export type CicloTexto = "c1" | "c23" | "sec";
export function cicloDoNivel(nivel: number): CicloTexto {
  return nivel <= 1 ? "c1" : nivel <= 3 ? "c23" : "sec";
}

/** Missões que a turma faz, pela ordem da história (extensão, dimensões e escolha da Personalizada). */
export function missoesDaTurma(c: Pick<ConfigTurma, "extensao" | "escolha" | "dimensoes">): DefMissao[] {
  return MISSOES.filter((m) => {
    if (FIXAS.has(m.id)) return true;
    if (m.tipo === "cidadania" && (!m.dimensao || !c.dimensoes.includes(m.dimensao))) return false;
    if (c.extensao === "essencial") return Boolean(m.conta);
    if (c.extensao === "personalizada") return c.escolha.includes(m.id);
    return !m.opcional;
  });
}

/** Capítulos com pelo menos uma missão (os vazios desaparecem). */
export function capitulosDaTurma(missoes: DefMissao[]): number[] {
  return [...new Set(missoes.map((m) => m.capitulo))].sort((a, b) => a - b);
}

/** Missões que o professor pode ligar e desligar na Personalizada (por capítulo). */
export function missoesEscolhiveis(dimensoes: Dimensao[]): DefMissao[] {
  return MISSOES.filter((m) => !FIXAS.has(m.id) && (m.tipo !== "cidadania" || (m.dimensao && dimensoes.includes(m.dimensao))));
}
/** Escolha inicial da Personalizada: o mesmo que a Completa. */
export function escolhaInicial(dimensoes: Dimensao[]): string[] {
  return missoesEscolhiveis(dimensoes).filter((m) => !m.opcional).map((m) => m.id);
}

// ── Avatares e cosmética (ids do pacote de arte) ─────────────────────────────
export interface DefFato {
  id: string;
  nome: string;
  genero: "m" | "f";
  colecao: "atuais" | "extintos";
  nota?: string;
}
export const FATOS: DefFato[] = arte.fatos as DefFato[];
export const FATO = new Map(FATOS.map((f) => [f.id, f]));
export function fatosDaColecao(c: Colecao): DefFato[] {
  return c === "escolha" ? FATOS : FATOS.filter((f) => f.colecao === c);
}
export const CORES: string[] = arte.cores;
export const PELES: string[] = arte.peles;
export const CABELOS: string[] = arte.cabelos;
export const CORES_CABELO: string[] = arte.coresCabelo;
/** O lenço tem 4 padrões em vez de cores de cabelo. */
export const PADROES_LENCO = ["amarelo", "azul", "rosa", "verde"];
export const PADROES: string[] = arte.padroes;
export type CategoriaItem = "chapeu" | "oculos" | "ver" | "mochila" | "objeto" | "calcado";
export interface DefItem {
  id: string;
  cat: CategoriaItem;
  nome: string;
}
export const ITENS: DefItem[] = arte.cosmetica as DefItem[];
export const ITEM = new Map(ITENS.map((i) => [i.id, i]));
export const EMBLEMAS: string[] = arte.emblemas.map((e) => e.id);
export interface DefTrofeu {
  id: string;
  nome: string;
  familia: "taca" | "estatueta" | "roseta" | "especial";
  regra: string;
}
export const TROFEUS: DefTrofeu[] = arte.trofeus as DefTrofeu[];
export const CASA_OPCOES = arte.casa as { paredes: string[]; telhados: string[]; portas: string[] };

/** Disponíveis desde o nascimento: cores iniciais e os óculos de ver (identidade, não prémio). */
export const CORES_INICIAIS = ["original", "menta", "ceu", "rosa"];
export const ITENS_SEMPRE = ITENS.filter((i) => i.cat === "ver").map((i) => i.id);
/** Cores e padrões ganhos com estrelas (total acumulado na história). */
export const CORES_POR_ESTRELAS: [number, string][] = [
  [6, "lilas"],
  [12, "pessego"],
  [18, "limao"],
  [24, "areia"],
  [30, "nuvem"],
];
export const PADROES_POR_ESTRELAS: [number, string][] = [
  [9, "riscas"],
  [15, "pintas"],
  [21, "estrelas"],
  [27, "xadrez"],
];
/** Fato da festa: dado no fim da história. */
export const FESTA = { item: "chapeu-festa", padrao: "confetes", cor: "limao" };

/** Pequena seleção de itens oferecida em cada missão (o aluno escolhe um). Temática do edifício. */
export const OFERTAS: Record<string, string[]> = {
  pratica: ["mochila-escolar", "tenis", "gorro-la"],
  painel: ["capacete-obra", "lupa", "oculos-coloridos"],
  teclas: ["lapis-gigante", "mochila-estrelas", "oculos-estrela"],
  "cid-direitos-online": ["laco", "mochila-livros", "livro"],
  "cid-regras-turma": ["coroa-papel", "botas-chuva", "mochila-escolar"],
  noticia: ["bone-reporter", "microfone", "mochila-antena"],
  revisao: ["lupa", "oculos-sol", "lapis-gigante"],
  paginacao: ["bone-reporter", "mochila-cartao-asas", "livro"],
  "cid-verdade-boato": ["microfone", "oculos-estrela", "laco"],
  matematica: ["oculos-laboratorio", "tubo-ensaio", "pantufas"],
  maqueta: ["capacete-obra", "mochila-desporto", "tubo-ensaio"],
  "cid-computador-velho": ["regador", "chapeu-palha", "botas-chuva"],
  encontra: ["livro", "oculos-sol", "mochila-livros"],
  leitura: ["livro", "gorro-la", "pantufas"],
  arquivo: ["explorador", "lupa", "botas-caminhada"],
  "cid-imagem-autor": ["lapis-gigante", "coroa-papel", "mochila-estrelas"],
  "sala-trancada": ["explorador", "oculos-coloridos", "botas-caminhada"],
  cartao: ["bone-reporter", "mochila-antena", "tenis"],
  correio: ["mochila-cartao-asas", "capacete-bicicleta", "microfone"],
  "cid-votacao-festa": ["coroa-papel", "laco", "oculos-estrela"],
  "cid-preciso-ou-quero": ["mochila-desporto", "chapeu-palha", "tenis"],
  orcamento: ["chapeu-palha", "regador", "oculos-sol"],
  fraude: ["capacete-bicicleta", "oculos-sol", "botas-caminhada"],
  "boas-praticas": ["capacete-bicicleta", "mochila-escolar", "pantufas"],
  "redes-sociais": ["microfone", "oculos-coloridos", "gorro-la"],
  privacidade: ["oculos-sol", "mochila-estrelas", "botas-chuva"],
  publicos: ["capacete-bicicleta", "mochila-livros", "tenis"],
  familia: ["pantufas", "gorro-la", "livro"],
  "cid-pedir-ajuda": ["laco", "mochila-escolar", "botas-chuva"],
  "cid-hora-desligar": ["pantufas", "gorro-la", "livro"],
  misterio: ["explorador", "lupa", "oculos-coloridos"],
  robo: ["capacete-obra", "tubo-ensaio", "mochila-antena"],
  "cid-boas-maneiras": ["laco", "regador", "mochila-cartao-asas"],
  fecho: ["oculos-estrela", "lapis-gigante", "botas-caminhada"],
  simulador: ["coroa-papel", "mochila-estrelas", "tenis"],
};

/** Categorias da casa abertas ao concluir cada capítulo ("nova categoria"). */
export type CategoriaCasa = "paredes" | "portas" | "telhados" | "jardim" | "papel" | "chao" | "vitrine" | "moldura";
export const CASA_POR_CAPITULO: Record<number, CategoriaCasa> = { 0: "paredes", 1: "portas", 2: "telhados", 3: "jardim", 4: "papel", 5: "chao", 6: "vitrine", 8: "moldura" };

export const JARDINS = ["flores", "horta", "baloico", "arvore"] as const;
export const PAPEIS = ["liso-pessego", "riscas-menta", "pintas-rosa", "nuvens-lilas", "xadrez-limao", "estrelas-ceu"] as const;
export const CHAOS = ["madeira", "madeira-escura", "tijoleira", "alcatifa-azul"] as const;
/** Mobília da sala (6 × 6 mosaicos). Variantes de cor com sufixo. */
export const MOVEIS = ["cama", "secretaria", "cadeira", "estante", "tapete", "candeeiro", "planta"] as const;
export type Movel = (typeof MOVEIS)[number];
export const VARIANTES_MOVEL: Record<string, string[]> = { cama: ["cama", "cama-f6a5b4"], cadeira: ["cadeira", "cadeira-6fa8e8"], tapete: ["tapete", "tapete-bfe3c9"] };
/** Lugares possíveis de cada móvel na sala 6 × 6: (i, j) do canto norte da pegada; o primeiro é o lugar por omissão.
 *  A parede esquerda (i = 0, j de 1 a 4,6) tem as prateleiras dos troféus: nada alto à frente delas. */
export const LUGARES_MOVEL: Record<Movel, { id: string; i: number; j: number }[]> = {
  cama: [{ id: "canto-esquerdo", i: 0.2, j: 4.6 }, { id: "junto-janela", i: 3.8, j: 0.3 }, { id: "lado-direito", i: 3.8, j: 4.6 }],
  secretaria: [{ id: "parede-fundo", i: 2.5, j: 0.1 }, { id: "lado-direito", i: 4.4, j: 2.2 }, { id: "a-frente", i: 2.0, j: 4.9 }],
  cadeira: [{ id: "a-secretaria", i: 3.0, j: 1.0 }, { id: "lado-direito", i: 4.9, j: 3.4 }, { id: "a-frente", i: 2.6, j: 5.1 }],
  estante: [{ id: "canto-fundo", i: 0.1, j: 0.1 }, { id: "canto-direito", i: 5.0, j: 0.1 }, { id: "canto-esquerdo", i: 0.1, j: 5.4 }],
  tapete: [{ id: "no-meio", i: 2.0, j: 2.0 }, { id: "a-frente", i: 3.5, j: 3.5 }, { id: "junto-janela", i: 3.4, j: 0.9 }],
  candeeiro: [{ id: "ao-lado-cama", i: 0.3, j: 4.0 }, { id: "canto", i: 5.4, j: 5.4 }, { id: "junto-estante", i: 1.6, j: 0.2 }],
  planta: [{ id: "canto-direito", i: 5.3, j: 0.2 }, { id: "canto-da-frente", i: 5.3, j: 5.3 }, { id: "a-porta", i: 2.8, j: 5.3 }],
};
