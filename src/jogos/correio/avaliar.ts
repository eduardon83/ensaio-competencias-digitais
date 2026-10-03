// ─── Correio da Redação: missões e grelha de correção do email ───────────────
// [conteúdo Kendir] Pessoas, endereços e domínios são fictícios (exemplo.pt).
import { amostra, escolher, misturar, type Gerador } from "../../motor/aleatorio";

export interface Contacto {
  nome: string;
  email: string;
  papel: string;
}

export interface PontoConteudo {
  descricao: string;
  chaves: string[]; // basta uma
}

export interface Missao {
  id: string;
  pedido: string; // quem pede e o quê
  para: Contacto;
  cc: Contacto;
  cco: Contacto;
  assunto: string[][]; // grupos de palavras: o assunto tem de ter uma de cada grupo
  exemploAssunto: string;
  conteudo: PontoConteudo[];
  anexo: string;
  outrosAnexos: string[];
  distratores: Contacto[];
}

export interface ConfigCorreio {
  cc: boolean;
  cco: boolean;
  anexo: boolean;
  informal: boolean; // penaliza linguagem informal
  conteudo: number; // pontos de conteúdo pedidos
  distratores: number; // contactos parecidos na lista
}

const ALUNOS = ["Inês Martins", "Tomás Ferreira", "Beatriz Lopes", "Rodrigo Sousa", "Matilde Gomes", "Duarte Pires", "Carolina Neves", "Afonso Cardoso"];
const TURMAS = ["7.º A", "8.º B", "9.º C", "10.º A", "11.º B", "12.º C"];

const P = (nome: string, email: string, papel: string): Contacto => ({ nome, email, papel });
const PROF_RUI = P("Prof. Rui Ribeiro", "rui.ribeiro@escola-exemplo.pt", "Professor coordenador");

export const MISSOES: Missao[] = [
  {
    id: "entrevista",
    pedido: "O professor coordenador pediu-te que convides a vereadora Helena Costa para uma entrevista sobre a nova ciclovia, na quinta-feira, dia 14, às 15h.",
    para: P("Dra. Helena Costa", "helena.costa@cm-exemplo.pt", "Vereadora da Câmara Municipal"),
    cc: PROF_RUI,
    cco: P("Equipa do jornal", "jornal@escola-exemplo.pt", "Lista da equipa"),
    assunto: [["entrevista"], ["ciclovia"]],
    exemploAssunto: "Pedido de entrevista sobre a nova ciclovia",
    conteudo: [
      { descricao: "Pedir a entrevista", chaves: ["entrevista", "entrevistar"] },
      { descricao: "Dizer o tema (a nova ciclovia)", chaves: ["ciclovia"] },
      { descricao: "Propor a data e a hora (quinta-feira, dia 14, às 15h)", chaves: ["14", "quinta"] },
      { descricao: "Referir o anexo com as perguntas", chaves: ["anexo", "perguntas", "guião", "guiao"] },
    ],
    anexo: "guiao_entrevista.pdf",
    outrosAnexos: ["guiao_entrevista_rascunho.docx", "foto_turma.jpg", "horario.pdf"],
    distratores: [P("Helena Correia", "helena.correia@escola-exemplo.pt", "Assistente operacional"), P("Dra. Helena Costa", "helena.costa@cm-exemplo-pt.com", "Endereço antigo (já não usado)"), P("Prof. Rui Rebelo", "rui.rebelo@escola-exemplo.pt", "Professor de Educação Física"), P("Câmara Municipal", "geral@cm-exemplo.pt", "Endereço geral"), P("Prof. Rita Ribeiro", "rita.ribeiro@escola-exemplo.pt", "Professora de Inglês")],
  },
  {
    id: "material",
    pedido: "A professora de Ciências pediu-te que reserves 6 microscópios na técnica de laboratório para terça-feira, dia 9, na sala L2.",
    para: P("Eng.ª Sofia Lopes", "sofia.lopes@escola-exemplo.pt", "Técnica de laboratório"),
    cc: P("Prof.ª Marta Silva", "marta.silva@escola-exemplo.pt", "Professora de Ciências"),
    cco: P("Grupo de trabalho", "grupo3@escola-exemplo.pt", "Lista do teu grupo"),
    assunto: [["reserva", "requisição", "requisicao", "pedido"], ["microscópio", "microscopio", "microscópios", "microscopios", "material"]],
    exemploAssunto: "Reserva de microscópios para dia 9",
    conteudo: [
      { descricao: "Pedir a reserva do material", chaves: ["reserva", "reservar", "requisitar", "requisição", "requisicao"] },
      { descricao: "Indicar a quantidade (6 microscópios)", chaves: ["6", "seis"] },
      { descricao: "Indicar o dia (terça-feira, dia 9)", chaves: ["9", "terça", "terca"] },
      { descricao: "Indicar a sala (L2)", chaves: ["l2"] },
    ],
    anexo: "lista_material.xlsx",
    outrosAnexos: ["lista_material_antiga.xlsx", "relatorio_grupo3.pdf", "jogo.exe"],
    distratores: [P("Sofia Lobo", "sofia.lobo@escola-exemplo.pt", "Aluna do 12.º ano"), P("Eng.ª Sofia Lopes", "sofia.lopes@escola-exemplo.com", "Endereço desconhecido"), P("Prof.ª Marta Sousa", "marta.sousa@escola-exemplo.pt", "Professora de Matemática"), P("Secretaria", "secretaria@escola-exemplo.pt", "Serviços administrativos"), P("Laboratório", "lab@escola-exemplo.pt", "Endereço partilhado")],
  },
  {
    id: "relatorio",
    pedido: "Tens de entregar ao professor Rui Ribeiro o relatório da experiência do grupo 3 sobre a germinação de feijões e pedir que confirme que o recebeu.",
    para: PROF_RUI,
    cc: P("Leonor Matos", "leonor.matos@aluno-exemplo.pt", "Colega do grupo 3"),
    cco: P("Encarregado de educação", "ee.familia@correio-exemplo.pt", "Encarregado de educação"),
    assunto: [["relatório", "relatorio"], ["grupo 3", "germinação", "germinacao", "feijão", "feijao", "feijões", "feijoes"]],
    exemploAssunto: "Relatório do grupo 3: germinação de feijões",
    conteudo: [
      { descricao: "Dizer que envias o relatório", chaves: ["relatório", "relatorio"] },
      { descricao: "Identificar o grupo (grupo 3)", chaves: ["grupo 3", "grupo três", "grupo tres"] },
      { descricao: "Dizer o tema (germinação de feijões)", chaves: ["germinação", "germinacao", "feijão", "feijao", "feijões", "feijoes"] },
      { descricao: "Pedir confirmação de receção", chaves: ["confirm", "receção", "rececao", "recebeu", "recebido"] },
    ],
    anexo: "relatorio_grupo3.pdf",
    outrosAnexos: ["relatorio_grupo3_rascunho.docx", "relatorio_grupo2.pdf", "musica.mp3"],
    distratores: [P("Prof. Rui Ribeiro", "rui.ribeiro@escola-exemplo.com", "Endereço desconhecido"), P("Leonor Martins", "leonor.martins@aluno-exemplo.pt", "Aluna de outra turma"), P("Prof. Rui Rebelo", "rui.rebelo@escola-exemplo.pt", "Professor de Educação Física"), P("Turma", "turma@escola-exemplo.pt", "Lista da turma inteira"), P("Leonor Matos", "leonor.matos@correio-exemplo.pt", "Endereço pessoal antigo")],
  },
  {
    id: "falta",
    pedido: "Faltaste às aulas na segunda-feira, dia 6, por causa de uma consulta médica. Tens de enviar a justificação à diretora de turma, com a declaração da consulta.",
    para: P("Prof.ª Ana Matos", "ana.matos@escola-exemplo.pt", "Diretora de turma"),
    cc: P("Encarregado de educação", "ee.familia@correio-exemplo.pt", "Encarregado de educação"),
    cco: P("Secretaria", "secretaria@escola-exemplo.pt", "Serviços administrativos"),
    assunto: [["justificação", "justificacao", "falta", "faltas"]],
    exemploAssunto: "Justificação de falta do dia 6",
    conteudo: [
      { descricao: "Pedir a justificação da falta", chaves: ["justific", "falta"] },
      { descricao: "Indicar o dia (segunda-feira, dia 6)", chaves: ["6", "segunda"] },
      { descricao: "Explicar o motivo (consulta médica)", chaves: ["consulta", "médic", "medic"] },
      { descricao: "Referir a declaração em anexo", chaves: ["anexo", "declaração", "declaracao"] },
    ],
    anexo: "declaracao_consulta.pdf",
    outrosAnexos: ["declaracao_consulta.jpg.exe", "foto_ferias.jpg", "teste_matematica.pdf"],
    distratores: [P("Prof.ª Ana Mota", "ana.mota@escola-exemplo.pt", "Professora de Português"), P("Prof.ª Ana Matos", "ana.matos@escola-exemplo.com", "Endereço desconhecido"), P("Direção", "direcao@escola-exemplo.pt", "Direção da escola"), P("Ana Matias", "ana.matias@aluno-exemplo.pt", "Colega de turma"), P("Turma", "turma@escola-exemplo.pt", "Lista da turma inteira")],
  },
  {
    id: "convite",
    pedido: "A direção pediu-te que convides o investigador Paulo Nunes para dar uma palestra sobre robótica na Semana da Ciência, no dia 21, às 10h, no auditório.",
    para: P("Dr. Paulo Nunes", "paulo.nunes@universidade-exemplo.pt", "Investigador"),
    cc: P("Prof.ª Teresa Alves", "direcao@escola-exemplo.pt", "Diretora da escola"),
    cco: P("Associação de pais", "pais@escola-exemplo.pt", "Associação de pais"),
    assunto: [["convite", "palestra"], ["ciência", "ciencia", "robótica", "robotica"]],
    exemploAssunto: "Convite para palestra na Semana da Ciência",
    conteudo: [
      { descricao: "Fazer o convite para a palestra", chaves: ["convid", "convite", "palestra"] },
      { descricao: "Dizer o tema (robótica)", chaves: ["robótica", "robotica", "robô", "robo"] },
      { descricao: "Indicar o dia e a hora (dia 21, às 10h)", chaves: ["21"] },
      { descricao: "Indicar o local (auditório)", chaves: ["auditório", "auditorio"] },
    ],
    anexo: "programa_semana_ciencia.pdf",
    outrosAnexos: ["programa_semana_ciencia_2019.pdf", "cartaz_baile.png", "lista_alunos.xlsx"],
    distratores: [P("Paulo Nunes", "paulo.nunes@aluno-exemplo.pt", "Aluno do 10.º ano"), P("Dr. Paulo Neves", "paulo.neves@universidade-exemplo.pt", "Investigador de outra área"), P("Dr. Paulo Nunes", "paulo.nunes@universidade-exemplo.com", "Endereço desconhecido"), P("Universidade", "geral@universidade-exemplo.pt", "Endereço geral"), P("Prof.ª Teresa Alves", "teresa.alves@aluno-exemplo.pt", "Aluna com o mesmo nome")],
  },
];

export interface Encomenda {
  missao: Missao;
  assinatura: string; // nome e turma a usar na assinatura
  contactos: Contacto[];
  anexos: string[];
}

export function gerarEncomenda(cfg: ConfigCorreio, r: Gerador = Math.random): Encomenda {
  const missao = escolher(MISSOES, r);
  const nome = escolher(ALUNOS, r);
  const certos = [missao.para, ...(cfg.cc ? [missao.cc] : []), ...(cfg.cco ? [missao.cco] : [])];
  const contactos = misturar([...certos, ...amostra(missao.distratores, cfg.distratores, r)], r);
  return { missao, assinatura: `${nome}, ${escolher(TURMAS, r)}`, contactos, anexos: misturar([missao.anexo, ...missao.outrosAnexos], r) };
}

export interface Email {
  para: string;
  cc: string;
  cco: string;
  assunto: string;
  corpo: string;
  anexos: string[];
}

export interface Criterio {
  criterio: string;
  ok: boolean;
  resposta: string;
  certa: string;
  feedback: string;
}

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export const enderecos = (s: string) => s.split(/[\s,;]+/).map((x) => x.trim().toLowerCase()).filter(Boolean);
const mesmoConjunto = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

const SAUDACAO_FORMAL = /^(exm[oa]s?\.?|ex\.?m[oa]|excelent|car[oa]s?\b|estimad|bom dia|boa tarde|boa noite|senhor|senhora|sr\.|sra\.|prezad)/i;
const DESPEDIDA = /(cumprimentos|atenciosamente|atentamente|com estima|obrigad[oa]|grat[oa]|agradeço|agradeco)/i;
export const INFORMAL = /(^|[^\p{L}])(bjs|bj|beijinhos|beijos|xau|tchau|fixe|obg|pls|plz|tb|tbm|vc|bué|bue|lol|ya|olá|ola|oi|ei|abraço|abraços)(?=$|[^\p{L}])/iu;

export function avaliarEmail(e: Email, enc: Encomenda, cfg: ConfigCorreio): Criterio[] {
  const { missao } = enc;
  const out: Criterio[] = [];
  const linhas = e.corpo.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const para = enderecos(e.para);
  out.push({ criterio: "Destinatário (Para)", ok: mesmoConjunto(para, [missao.para.email]), resposta: e.para || "—", certa: missao.para.email, feedback: para.length > 1 ? "No campo Para fica só a pessoa a quem escreves. Os outros vão em CC ou CCO." : "Confirma o endereço na lista de contactos: há nomes e domínios parecidos." });
  if (cfg.cc) {
    const cc = enderecos(e.cc);
    out.push({ criterio: "Com conhecimento (CC)", ok: mesmoConjunto(cc, [missao.cc.email]), resposta: e.cc || "—", certa: missao.cc.email, feedback: "Em CC vai quem deve saber do email, mas não é o destinatário principal." });
  }
  if (cfg.cco) {
    const cco = enderecos(e.cco);
    out.push({ criterio: "Cópia oculta (CCO)", ok: mesmoConjunto(cco, [missao.cco.email]), resposta: e.cco || "—", certa: missao.cco.email, feedback: "Em CCO ficam endereços que os outros destinatários não veem (por exemplo, listas)." });
  }

  const a = norm(e.assunto.trim());
  const assuntoOk = a.length > 0 && a.length <= 80 && missao.assunto.every((g) => g.some((k) => a.includes(norm(k))));
  out.push({ criterio: "Assunto claro", ok: assuntoOk, resposta: e.assunto || "—", certa: missao.exemploAssunto, feedback: a.length > 80 ? "O assunto deve ser curto (até 80 caracteres)." : "O assunto deve dizer o tema em poucas palavras, para quem recebe perceber logo do que se trata." });

  const primeira = linhas[0] ?? "";
  const saudacaoOk = SAUDACAO_FORMAL.test(primeira);
  out.push({ criterio: "Saudação formal", ok: saudacaoOk, resposta: primeira || "—", certa: `Ex.ma Senhora / Caro Professor / Bom dia, ${missao.para.nome}`, feedback: /^(olá|ola|oi|ei)/i.test(primeira) ? "“Olá” é informal. Num email a um adulto ou a uma entidade usa “Ex.mo(a) Senhor(a)”, “Caro(a)” ou “Bom dia”." : "Começa o email com uma saudação formal, numa linha própria." });

  const corpo = norm(e.corpo);
  missao.conteudo.slice(0, cfg.conteudo).forEach((p) => {
    const tem = (k: string) => (/^\d+$/.test(k) ? new RegExp(`(^|\\D)${k}(\\D|$)`).test(corpo) : corpo.includes(norm(k)));
    out.push({ criterio: `Conteúdo: ${p.descricao}`, ok: p.chaves.some(tem), resposta: "", certa: p.descricao, feedback: "Esta informação foi pedida e não aparece no texto do email." });
  });

  const fim = linhas.slice(-4).join(" ");
  out.push({ criterio: "Despedida", ok: DESPEDIDA.test(fim), resposta: linhas.slice(-3, -1).join(" / ") || "—", certa: "Com os melhores cumprimentos,", feedback: "Antes da assinatura, despede-te com uma fórmula formal: “Com os melhores cumprimentos” ou “Atenciosamente”." });

  const nome = norm(enc.assinatura.split(",")[0]);
  const ultimas = norm(linhas.slice(-2).join(" "));
  out.push({ criterio: "Assinatura", ok: ultimas.includes(nome), resposta: linhas.slice(-1)[0] ?? "—", certa: enc.assinatura, feedback: `Termina com o teu nome (e turma): ${enc.assinatura}.` });

  if (cfg.anexo) out.push({ criterio: "Anexo", ok: mesmoConjunto(e.anexos, [missao.anexo]), resposta: e.anexos.join(", ") || "nenhum", certa: missao.anexo, feedback: e.anexos.length === 0 ? "Esqueceste o anexo. Antes de enviar, confirma se o ficheiro está anexado." : "Escolhe só o ficheiro certo: atenção a versões antigas, rascunhos e ficheiros perigosos (.exe)." });

  if (cfg.informal) {
    const m = INFORMAL.exec(e.corpo) ?? INFORMAL.exec(e.assunto);
    const emoji = /\p{Extended_Pictographic}/u.test(e.corpo + e.assunto);
    const exclam = /[!?]{2,}/.test(e.corpo + e.assunto);
    out.push({ criterio: "Linguagem adequada", ok: !m && !emoji && !exclam, resposta: m ? `“${m[2]}”` : emoji ? "emojis" : exclam ? "!! ou ??" : "—", certa: "Sem abreviaturas, emojis nem calão", feedback: "Num email formal evita abreviaturas (tb, obg), calão, emojis e pontuação repetida." });
  }
  return out;
}
