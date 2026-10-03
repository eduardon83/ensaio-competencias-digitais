// ─── Contratos do motor de atividades ────────────────────────────────────────
// Cada atividade é um módulo com: configuração por nível (5 níveis), uma função que deriva o item de
// prática, um componente React que corre a atividade e devolve um resultado 0..100, e uma dica.

import type { ComponentType } from "react";
import type { Contexto } from "../preferencias/preferencias";

/** Níveis de dificuldade do treino (1 a 5). Cada percurso de preparação (provas e exames) usa um destes. */
export type Nivel = 1 | 2 | 3 | 4 | 5;
export const NIVEIS: Nivel[] = [1, 2, 3, 4, 5];
export const NOME_NIVEL: Record<Nivel, string> = {
  1: "Iniciação",
  2: "Base",
  3: "Intermédio",
  4: "Avançado",
  5: "Perito",
};

/** Ciclos de ensino usados no Teste de competências. */
// Percursos de preparação, ligados às provas e exames feitos no computador. Os ids mantêm-se ("c1"…) para não
// perder o progresso já guardado nos navegadores. [conteúdo Kendir] Confirmar anos e designações em cada ano letivo.
export type Ciclo = "c1" | "c2" | "c3" | "sec" | "es";
export interface DefCiclo {
  id: Ciclo;
  nome: string; // curto: "ModA 4.º ano"
  titulo: string; // "as provas ModA do 4.º ano"
  prova: string; // o que é a prova real (uma frase)
  anos: string;
  nivel: Nivel;
  duracao: string;
  atividades: string[]; // slugs, pela ordem do percurso
}
export const CICLOS: DefCiclo[] = [
  { id: "c1", nome: "ModA 4.º ano", titulo: "as provas ModA do 4.º ano", prova: "As provas ModA (Monitorização das Aprendizagens) do 4.º ano fazem-se no computador.", anos: "1.º ciclo", nivel: 1, duracao: "≈ 20 min", atividades: ["painel", "paginacao", "noticia", "revisao", "encontra", "simulador"] },
  { id: "c2", nome: "ModA 6.º ano", titulo: "as provas ModA do 6.º ano", prova: "As provas ModA do 6.º ano fazem-se no computador, com textos, gráficos e respostas escritas.", anos: "2.º ciclo", nivel: 2, duracao: "≈ 30 min", atividades: ["painel", "noticia", "cartao", "paginacao", "teclas", "encontra", "matematica", "simulador"] },
  { id: "c3", nome: "Provas Finais 9.º ano", titulo: "as provas finais do 9.º ano", prova: "As provas finais do 9.º ano (Português e Matemática) fazem-se em formato digital.", anos: "3.º ciclo", nivel: 3, duracao: "≈ 50 min", atividades: ["noticia", "painel", "revisao", "arquivo", "cartao", "paginacao", "fecho", "teclas", "encontra", "matematica", "maqueta", "simulador"] },
  { id: "sec", nome: "Exames Nacionais", titulo: "os exames nacionais do secundário", prova: "Os exames nacionais do 11.º e 12.º ano estão a passar para o formato digital.", anos: "Ensino secundário", nivel: 4, duracao: "≈ 55 min", atividades: ["noticia", "painel", "revisao", "arquivo", "cartao", "paginacao", "fecho", "teclas", "encontra", "matematica", "maqueta", "simulador"] },
  { id: "es", nome: "Ensino Superior", titulo: "as provas e exames digitais do ensino superior", prova: "Testes, provas de acesso e exames em plataformas digitais das instituições.", anos: "Licenciatura, mestrado", nivel: 5, duracao: "≈ 60 min", atividades: ["noticia", "painel", "revisao", "arquivo", "cartao", "paginacao", "fecho", "teclas", "encontra", "matematica", "maqueta", "simulador"] },
];
export function cicloPorId(id: string): DefCiclo | undefined {
  return CICLOS.find((c) => c.id === id);
}

export type Dominio = "teclado" | "interface" | "atencao" | "navegacao" | "formularios" | "arrastar" | "tempo" | "atalhos" | "leitura" | "matematica" | "seguranca" | "comunicacao" | "folhas" | "pensamento" | "programacao" | "tresd" | "todas";
export const NOME_DOMINIO: Record<Dominio, string> = {
  teclado: "Escrita no teclado",
  interface: "Leitura de interfaces",
  atencao: "Atenção ao detalhe",
  navegacao: "Navegação",
  formularios: "Formulários",
  arrastar: "Arrastar e largar",
  tempo: "Gestão do tempo",
  atalhos: "Atalhos de teclado",
  leitura: "Leitura em ecrã",
  matematica: "Escrita matemática",
  seguranca: "Segurança digital",
  comunicacao: "Comunicação digital",
  folhas: "Folhas de cálculo",
  pensamento: "Pensamento crítico",
  programacao: "Pensamento computacional",
  tresd: "Manipulação 3D",
  todas: "Todas as competências",
};

export type Metricas = Record<string, number | string | boolean>;

/** Uma linha do relatório da atividade (uma por tarefa/pergunta). Fica só no ecrã: não é enviada na telemetria. */
export type EstadoLinha = "certo" | "parcial" | "errado" | "saltado";
export interface LinhaRelatorio {
  tarefa: string; // o que era pedido
  resultado: EstadoLinha;
  resposta?: string; // o que o aluno fez/escreveu
  certa?: string; // resposta ou caminho certo
  feedback?: string; // indicação concreta para melhorar
}

export interface ResultadoAtividade {
  pontuacao: number; // inteiro 0..100
  duracaoMs: number;
  metricas: Metricas;
  relatorio?: LinhaRelatorio[];
}

export type Modo = "pratica" | "avaliacao";

export interface PropsAtividade<C> {
  config: C;
  modo: Modo;
  nivel: Nivel;
  contexto: Contexto;
  /** Multiplicador de tempo (acomodação): 1, 1.25, 1.5 ou 2. */
  extensaoTempo: number;
  aoTerminar: (resultado: ResultadoAtividade) => void;
}

export interface DefinicaoAtividade<C = unknown> {
  slug: string;
  numero: number;
  dominio: Dominio;
  /** Título por contexto narrativo. */
  titulo: Record<Contexto, string>;
  descricao: string;
  duracao: string;
  disponivel: boolean;
  niveis: Record<Nivel, C>;
  /** Deriva a configuração do item de prática (curto, não pontuado) a partir do nível. */
  pratica: (config: C) => C;
  Componente: ComponentType<PropsAtividade<C>>;
  /** Dica concreta a mostrar no resultado, a partir das métricas. */
  dica: (metricas: Metricas, pontuacao: number) => string;
}

export function definir<C>(d: DefinicaoAtividade<C>): DefinicaoAtividade<C> {
  return d;
}

/** Arredonda e limita a pontuação a 0..100. */
export function limitar(p: number): number {
  if (!Number.isFinite(p)) return 0;
  return Math.max(0, Math.min(100, Math.round(p)));
}

export interface Faixa {
  nome: string;
  min: number;
  max: number;
}
export const FAIXAS: Faixa[] = [
  { nome: "A começar", min: 0, max: 39 },
  { nome: "Em progresso", min: 40, max: 64 },
  { nome: "Confiante", min: 65, max: 84 },
  { nome: "Autónomo", min: 85, max: 100 },
];
export function faixaDe(p: number): Faixa {
  return FAIXAS.find((f) => p >= f.min && p <= f.max) ?? FAIXAS[0];
}
/** Estrelas: abaixo de 50 tentar novamente; 50 a 74 uma; 75 a 90 duas; 91 a 100 três. */
export const LIMIARES_ESTRELAS = [50, 75, 91] as const;
export function estrelasDe(p: number): 0 | 1 | 2 | 3 {
  if (p >= LIMIARES_ESTRELAS[2]) return 3;
  if (p >= LIMIARES_ESTRELAS[1]) return 2;
  if (p >= LIMIARES_ESTRELAS[0]) return 1;
  return 0;
}
export const CARIMBO_MINIMO = 85;

/** Baralha de forma determinista (semente) para que a prática e a avaliação não sejam idênticas entre si. */
export function baralhar<T>(lista: T[], semente: number): T[] {
  const r = [...lista];
  let s = semente >>> 0 || 1;
  for (let i = r.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
