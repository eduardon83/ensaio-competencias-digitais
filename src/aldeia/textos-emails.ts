// ─── Aldeia Digital · textos dos emails (editáveis no backoffice: Aldeia Digital › Emails) ──
// Módulo puro: o Worker lê-o para montar os emails e escreve por cima os textos guardados no KV TEXTOS
// (chaves "aldeia.emails.…"). Só texto simples com **negrito** e [ligações](/rota) para o próprio sítio; o Worker
// escapa tudo o resto. Variáveis entre chavetas: {turma}, {n}, {quem}, {capitulo}, {dias}.
export const ALDEIA_EMAILS = {
  cabecalho: "ECD · Aldeia Digital",
  confirmar: {
    assunto: "Confirme o email da Aldeia Digital · {turma}",
    titulo: "Confirme o seu email",
    corpo: "Pediu para receber resumos da Aldeia Digital da turma **{turma}**. Carregue no botão para confirmar. Se não foi o seu pedido, ignore este email: não voltamos a escrever.",
    botao: "Confirmar o email",
    nota: "A ligação vale 3 dias. O email nunca leva o código do professor.",
  },
  resumo: {
    assunto: { semanal: "Resumo semanal da Aldeia · {turma}", diario: "Resumo do dia da Aldeia · {turma}", marcos: "Novidades da Aldeia · {turma}" },
    titulo: { semanal: "Resumo semanal da Aldeia · {turma}", diario: "Resumo do dia da Aldeia · {turma}", marcos: "Novidades da Aldeia · {turma}" },
    numeros: { ativos: "alunos ativos", missoes: "missões feitas", capitulo: "capítulo da turma" },
    alertasTitulo: "Alertas",
    semAlertas: "Sem alertas novos.",
    botao: "Abrir o painel",
    detalhe: "O detalhe por aluno está no painel, com o código do professor.",
    rodape: "Recebe este email porque criou a turma {turma}. Os resultados são apagados 30 dias depois da data de fim.",
    sair: "Deixar de receber",
  },
  alertas: {
    parado: "{n} sem atividade há 7 dias: {quem}.",
    dificuldade: "{n} abaixo de 50 em 3 missões seguidas: {quem}.",
    capitulo: "80 % da turma terminou o capítulo {capitulo}. Pode abrir o seguinte no painel.",
    concluida: "A turma terminou a história. O relatório de conclusão está pronto.",
    fecho: "Faltam {dias} dias para a data de fim. Exporte os relatórios antes de os dados serem apagados.",
    lugares: "Alguém tentou entrar sem lugar livre. Pode aumentar os lugares no painel.",
    alunos: { um: "1 aluno", varios: "{n} alunos" },
  },
};
export type TextosEmails = typeof ALDEIA_EMAILS;
