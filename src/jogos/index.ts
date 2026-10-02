// ─── Jogos de desenvolvimento de competências digitais ───────────────────────
// Usam o mesmo motor das atividades (briefing, prática, níveis, resultado com relatório), mas ficam fora do
// teste por ciclo, dos códigos de professor e dos carimbos: são treino livre.
import type { DefinicaoAtividade } from "../motor/tipos";
import { definicao as leitura } from "./leitura";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const JOGOS: DefinicaoAtividade<any>[] = [leitura];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function jogoPorSlug(slug: string): DefinicaoAtividade<any> | undefined {
  return JOGOS.find((j) => j.slug === slug);
}

/** Jogos propostos (ainda não desenvolvidos). Descrição completa em docs/JOGOS.md. */
export interface JogoProposto {
  titulo: string;
  icone: string;
  competencias: string[];
  descricao: string;
}

export const PROPOSTOS: JogoProposto[] = [
  {
    titulo: "A Sala Trancada",
    icone: "🔐",
    competencias: ["Navegação", "Atenção ao detalhe", "Segurança digital"],
    descricao: "Escape room numa secretária digital: o código da porta está escondido em ficheiros, propriedades de documentos, separadores e emails. Cada enigma exige uma competência diferente.",
  },
  {
    titulo: "Quem Apagou o Ficheiro?",
    icone: "🕵️",
    competencias: ["Literacia da informação", "Pensamento crítico", "Leitura em ecrã"],
    descricao: "Mistério na redação (ou no laboratório): cruzar pistas em emails, registos de acesso, datas de ficheiros e mensagens para descobrir o culpado e justificar com provas.",
  },
  {
    titulo: "Verdade ou Boato?",
    icone: "📰",
    competencias: ["Verificação de factos", "Avaliação de fontes"],
    descricao: "Notícias, publicações e imagens para classificar: ver o endereço, a data, a fonte, a imagem original e o que dizem outras fontes antes de partilhar.",
  },
  {
    titulo: "O Email Desconfiado",
    icone: "🎣",
    competencias: ["Segurança digital", "Privacidade"],
    descricao: "Caixa de correio com mensagens verdadeiras e tentativas de burla (phishing): reconhecer remetentes falsos, ligações enganadoras e pedidos de dados, e criar palavras-passe fortes.",
  },
  {
    titulo: "Orçamento da Visita de Estudo",
    icone: "📊",
    competencias: ["Folhas de cálculo", "Matemática aplicada"],
    descricao: "Organizar uma visita numa folha de cálculo simulada: somas, médias, percentagens, ordenar e filtrar dados, e fazer um gráfico para apresentar à turma.",
  },
  {
    titulo: "O Robô da Bancada",
    icone: "🤖",
    competencias: ["Pensamento computacional", "Resolução de problemas"],
    descricao: "Dar instruções em sequência, com repetições e condições, para um robô cumprir uma tarefa no laboratório ou na redação, com o menor número de passos.",
  },
  {
    titulo: "Correio da Redação",
    icone: "✉️",
    competencias: ["Comunicação digital", "Escrita"],
    descricao: "Escrever e responder a emails formais: assunto, saudação, anexos, destinatários em CC, tom adequado e revisão antes de enviar.",
  },
];
