// ─── Frases do resultado final ("primeira página"): uma por competência e por faixa ──
// [conteúdo Kendir] Terceira pessoa, como numa notícia. Faixas: ≥ 85 alta, ≥ 65 média, abaixo baixa.
import type { Dominio } from "./tipos";

type Tres = [alta: string, media: string, baixa: string];

export const FRASES: Record<Dominio, Tres> = {
  teclado: ["Escreveu o texto sem perder acentos.", "Escreve bem, mas ainda falha alguns acentos e sinais.", "Precisa de treinar acentos, maiúsculas e sinais."],
  interface: ["Mudou as definições do sítio sem ajuda.", "Encontrou quase tudo nos menus e separadores.", "Ainda se perde nos menus e separadores."],
  atencao: ["Encontrou todas as diferenças.", "Encontrou a maior parte das diferenças.", "Deixou escapar várias diferenças."],
  navegacao: ["Encontrou ficheiros, separadores e páginas sem se perder.", "Navegou bem, com alguns passos a mais.", "Ainda se perde entre pastas e separadores."],
  formularios: ["Preencheu o formulário e corrigiu os erros à primeira.", "Corrigiu os erros do formulário à segunda.", "Ainda tem dificuldade com formatos e erros de validação."],
  arrastar: ["Arrumou tudo com poucos movimentos.", "Arrumou quase tudo, com alguns movimentos a mais.", "Precisa de treinar arrastar e largar."],
  tempo: ["Geriu bem o relógio em todas as secções.", "Chegou ao fim, mas demorou demasiado numa secção.", "Ficou sem tempo antes do fim."],
  atalhos: ["Copiou, colou e desfez só com o teclado.", "Conhece alguns atalhos, mas ainda usa o rato.", "Ainda usa o rato para copiar e colar."],
  leitura: ["Encontrou as respostas num texto longo.", "Encontrou quase todas as respostas no texto.", "Ainda tem dificuldade em procurar num texto longo."],
  matematica: ["Escreveu as fórmulas sem enganos.", "Escreveu quase todas as fórmulas bem.", "Precisa de treinar a escrita de fórmulas."],
  tresd: ["Arrumou a maqueta 3D sem ajuda.", "Arrumou a maqueta, com alguns passos a mais.", "Ainda tem dificuldade em mexer em objetos 3D."],
  seguranca: ["Reconheceu os riscos e escolheu sempre o mais seguro.", "Reconheceu a maior parte dos riscos.", "Ainda confunde mensagens falsas com verdadeiras."],
  comunicacao: ["Escreveu um email formal completo.", "Escreveu um email quase completo.", "Precisa de treinar a estrutura de um email formal."],
  folhas: ["Fez as contas com fórmulas certas.", "Acertou a maior parte das fórmulas.", "Precisa de treinar fórmulas numa folha de cálculo."],
  pensamento: ["Juntou as provas certas para chegar à conclusão.", "Chegou perto da conclusão, com algumas provas a mais ou a menos.", "Ainda se deixa enganar por pistas falsas."],
  programacao: ["Programou o robô com poucas instruções.", "Programou o robô, com instruções a mais.", "Precisa de treinar sequências e repetições."],
  todas: ["Fez a prova simulada com segurança.", "Fez a prova simulada, com algumas hesitações.", "A prova simulada ainda causa dificuldades."],
};

export function frase(d: Dominio, p: number): string {
  const f = FRASES[d] ?? FRASES.todas;
  return p >= 85 ? f[0] : p >= 65 ? f[1] : f[2];
}
