// ─── Jogos de desenvolvimento de competências digitais ───────────────────────
// Usam o mesmo motor das atividades (briefing, prática, níveis, resultado com relatório), mas ficam fora do
// teste por ciclo, dos códigos de professor e dos carimbos: são treino livre.
import type { DefinicaoAtividade } from "../motor/tipos";
import { definicao as leitura } from "./leitura";
import { definicao as sala } from "./sala";
import { definicao as misterio } from "./misterio";
import { definicao as orcamento } from "./orcamento";
import { definicao as correio } from "./correio";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const JOGOS: DefinicaoAtividade<any>[] = [leitura, sala, misterio, orcamento, correio];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function jogoPorSlug(slug: string): DefinicaoAtividade<any> | undefined {
  return JOGOS.find((j) => j.slug === slug);
}

/** Apresentação de cada jogo na página Jogos. */
export const META_JOGOS: Record<string, { icone: string; etiquetas: string[]; nota?: string }> = {
  leitura: { icone: "📚", etiquetas: ["Leitura", "Escrita", "Literatura portuguesa"] },
  "sala-trancada": { icone: "🔐", etiquetas: ["Navegação", "Atenção ao detalhe", "Segurança"], nota: "Enigmas em ficheiros, emails, documentos e folhas. Mais enigmas e armadilhas a cada nível." },
  misterio: { icone: "🕵️", etiquetas: ["Pensamento crítico", "Literacia da informação"], nota: "Registos, reservas, mensagens e fotografias. Trocas de lugar e pistas falsas nos níveis altos." },
  orcamento: { icone: "📊", etiquetas: ["Folhas de cálculo", "Matemática aplicada"], nota: "Fórmulas, SOMA, custo por aluno, descontos, MÁXIMO e MÉDIA." },
  correio: { icone: "✉️", etiquetas: ["Comunicação digital", "Escrita"], nota: "Para, CC e CCO, assunto, tom formal e anexos." },
};

/** Jogos propostos (ainda não desenvolvidos). Descrição completa em docs/JOGOS.md. */
export interface JogoProposto {
  titulo: string;
  icone: string;
  competencias: string[];
  descricao: string;
}

export const PROPOSTOS: JogoProposto[] = [
  {
    titulo: "O Robô da Bancada",
    icone: "🤖",
    competencias: ["Pensamento computacional", "Resolução de problemas"],
    descricao: "Dar instruções em sequência, com repetições e condições, para um robô cumprir uma tarefa no laboratório ou na redação, com o menor número de passos.",
  },
];
