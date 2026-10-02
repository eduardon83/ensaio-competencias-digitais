// ─── Contextos de aprendizagem (narrativa) ───────────────────────────────────
// "jornal": o jogador é repórter da redação do jornal da escola ("O Recreio"; no Ensino Superior "Gazeta do Campus").
// "laboratorio": o jogador é aluno num laboratório de experiências ("Laboratório 3"; no superior "Laboratório de Investigação").
// Os textos ficam aqui para serem substituídos sem tocar no código das atividades.

import type { Contexto } from "../preferencias/preferencias";
import type { Nivel } from "../motor/tipos";

export interface Personagens {
  responsavel: string; // dá os briefings
  ficheiros: string; // desorganizado com pastas (Navegação)
  revisao: string; // atenção e leitura
  relogio: string; // aparece nas atividades com tempo
}

export interface DefContexto {
  id: Contexto;
  nome: string;
  descricao: string;
  personagens: Personagens;
  /** Nome da publicação/relatório onde aparece o resultado. */
  publicacao: (nivel: Nivel) => string;
  /** Nome do papel do jogador. */
  papel: string;
  papelAnonimo: string;
  /** Resultado: título do ecrã final e nome dos "carimbos". */
  resultado: { titulo: string; carimbo: string; cartao: string };
  /** Briefing de abertura, por atividade (slug). */
  briefs: Record<string, string>;
}

const JORNAL: DefContexto = {
  id: "jornal",
  nome: "Redação do jornal",
  descricao: "És repórter do jornal da escola. Cada atividade é uma tarefa para a próxima edição.",
  personagens: { responsavel: "Diretora Graça", ficheiros: "Tomé", revisao: "Lia", relogio: "Sr. Prazo" },
  publicacao: (nivel) => (nivel >= 4 ? "Gazeta do Campus" : "O Recreio"),
  papel: "Repórter",
  papelAnonimo: "Repórter anónimo",
  resultado: { titulo: "Primeira página", carimbo: "carimbo", cartao: "cartão de imprensa" },
  briefs: {
    noticia: "Temos a notícia escrita à mão. Passa-a para o computador antes de a gráfica abrir.",
    painel: "Este é o sítio do jornal. A Diretora Graça precisa que mudes umas definições.",
    revisao: "A Lia copiou os dados do papel para o computador. Há erros. Encontra-os antes de imprimirmos.",
    arquivo: "O Tomé guardou as fotos em sítios estranhos. Ajuda-o a encontrar o que precisamos.",
    cartao: "Para entrares no evento precisas de um cartão de imprensa. Preenche o pedido com os dados desta ficha.",
    paginacao: "A página da edição está desarrumada. Põe tudo no sítio certo.",
    fecho: "A gráfica fecha às 18h00. Faltam poucos minutos. O Sr. Prazo está a olhar para ti.",
    teclas: "Há truques que os jornalistas usam para trabalhar mais depressa. Aprende-os.",
    encontra: "Chegou um texto enorme. A Diretora Graça só precisa de algumas respostas. Depressa!",
    simulador: "Último desafio: o exame de entrada na redação.",
    matematica: "A infografia da próxima edição tem números e fórmulas. Escreve-os no computador sem enganos.",
    leitura: "A próxima edição tem uma página literária. Lê o texto, percebe-o bem e ajuda-nos a passá-lo para o computador sem erros.",
  },
};

const LABORATORIO: DefContexto = {
  id: "laboratorio",
  nome: "Laboratório de experiências",
  descricao: "És aluno num laboratório. Cada atividade é um passo de uma experiência que tem de ficar registada.",
  personagens: { responsavel: "Doutora Inês", ficheiros: "Rui", revisao: "Marta", relogio: "O Cronómetro" },
  publicacao: (nivel) => (nivel >= 4 ? "Relatório de Investigação" : "Caderno de Laboratório"),
  papel: "Investigador",
  papelAnonimo: "Investigador anónimo",
  resultado: { titulo: "Relatório da experiência", carimbo: "selo", cartao: "cartão de acesso ao laboratório" },
  briefs: {
    noticia: "O protocolo da experiência está escrito à mão no caderno. Passa-o para o computador antes da sessão começar.",
    painel: "Esta é a consola do laboratório. A Doutora Inês precisa que ajustes umas definições.",
    revisao: "A Marta copiou as medições do caderno para o computador. Há erros. Encontra-os antes de fecharmos o registo.",
    arquivo: "O Rui guardou os ficheiros das amostras em pastas estranhas. Ajuda-o a encontrar o que precisamos.",
    cartao: "Para usares a bancada precisas de um cartão de acesso. Preenche o pedido com os dados desta ficha.",
    paginacao: "A bancada está desarrumada. Põe cada material e cada passo no sítio certo.",
    fecho: "A sessão termina em poucos minutos. O Cronómetro está a contar.",
    teclas: "Há atalhos que os investigadores usam para registar dados mais depressa. Aprende-os.",
    encontra: "Chegou o manual do equipamento. A Doutora Inês só precisa de algumas respostas. Depressa!",
    simulador: "Último desafio: a prova de acesso ao laboratório.",
    matematica: "O caderno de cálculos tem fórmulas e medições. Escreve-as no computador sem enganos.",
    leitura: "Hoje há clube de leitura no laboratório. Lê o texto, percebe-o bem e regista-o no computador sem erros.",
  },
};

export const CONTEXTOS: Record<Contexto, DefContexto> = { jornal: JORNAL, laboratorio: LABORATORIO };

export function contexto(id: Contexto): DefContexto {
  return CONTEXTOS[id];
}
