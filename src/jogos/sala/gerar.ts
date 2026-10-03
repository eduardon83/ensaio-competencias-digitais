// ─── A Sala Trancada: enigmas que dão os algarismos do código do cofre ───────
// Cada enigma vive numa aplicação da secretária digital e devolve um algarismo (1 a 9).
import { amostra, escolher, inteiro, misturar, type Gerador } from "../../motor/aleatorio";

export type App = "ficheiros" | "email" | "documento" | "folha" | "nota";

export interface Ficheiro {
  nome: string;
  pasta: string;
  data: string;
  tamanho: string;
}
export interface MensagemEmail {
  de: string;
  assunto: string;
  hora: string;
  anexos: number;
  corpo: string;
  etiqueta?: string;
}

export type DadosEnigma =
  | { app: "ficheiros"; ficheiros: Ficheiro[] }
  | { app: "email"; mensagens: MensagemEmail[] }
  | { app: "documento"; titulo: string; paragrafos: string[] }
  | { app: "folha"; cabecalho: [string, string]; linhas: [string, string | number][] }
  | { app: "nota"; opcoes: string[]; correta: number; porque: Record<number, string> };

export interface Enigma {
  app: App;
  pista: string; // o que diz o post-it
  ajuda: string; // pista extra (custa pontos)
  digito: number;
  dados: DadosEnigma;
}

export interface ConfigSala {
  enigmas: number; // 3 a 5
  nota: boolean; // inclui o enigma da palavra-passe
  dificil: boolean; // armadilhas (extensões duplas, palavras repetidas)
  contagemCertos: boolean; // o cofre diz quantos algarismos estão certos
}

const POR_EXTENSO = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const data = (d: number, m = 3) => `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/2026`;
const kb = (r: Gerador) => `${inteiro(12, 900, r)} KB`;

function enigmaFicheiros(cfg: ConfigSala, r: Gerador): Enigma {
  if (r() < 0.5) {
    const d = inteiro(2, 6, r);
    const nomes = misturar(["resumo_historia", "ficha_ingles", "trabalho_geografia", "teste_ciencias", "projeto_final", "guiao_visita", "apontamentos_fisica"], r);
    const fs: Ficheiro[] = nomes.slice(0, d).map((n) => ({ nome: `${n}.pdf`, pasta: "Trabalhos", data: data(inteiro(1, 28, r)), tamanho: kb(r) }));
    const outros = nomes.slice(d);
    fs.push({ nome: `${outros[0]}.docx`, pasta: "Trabalhos", data: data(inteiro(1, 28, r)), tamanho: kb(r) }, { nome: `${outros[1] ?? "notas"}.pptx`, pasta: "Trabalhos", data: data(inteiro(1, 28, r)), tamanho: kb(r) });
    if (cfg.dificil) fs.push({ nome: "fatura_pdf.docx", pasta: "Trabalhos", data: data(4), tamanho: kb(r) }, { nome: "manual.pdf.exe", pasta: "Trabalhos", data: data(9), tamanho: kb(r) });
    fs.push({ nome: "relatorio.pdf", pasta: "Transferências", data: data(2), tamanho: kb(r) }, { nome: "visita.jpg", pasta: "Fotografias", data: data(5), tamanho: kb(r) });
    return { app: "ficheiros", pista: "Quantos ficheiros PDF há na pasta Trabalhos?", ajuda: `Abre a pasta Trabalhos e conta os nomes que terminam em “.pdf”.${cfg.dificil ? " Atenção: “manual.pdf.exe” termina em .exe e não é um PDF, e “fatura_pdf.docx” é um documento de texto." : ""}`, digito: d, dados: { app: "ficheiros", ficheiros: misturar(fs, r) } };
  }
  const d = inteiro(1, 9, r);
  const dias = misturar([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== d), r);
  const fs: Ficheiro[] = [
    { nome: "chave.txt", pasta: "Documentos", data: data(d), tamanho: "1 KB" },
    { nome: "chaves_casa.jpg", pasta: "Fotografias", data: data(dias[0]), tamanho: kb(r) },
    { nome: "horario.pdf", pasta: "Documentos", data: data(dias[1]), tamanho: kb(r) },
    { nome: "lista_compras.txt", pasta: "Documentos", data: data(dias[2]), tamanho: "2 KB" },
    { nome: "chave_antiga.txt", pasta: "Transferências", data: data(dias[3]), tamanho: "1 KB" },
  ];
  if (cfg.dificil) fs.push({ nome: "chave.txt.lnk", pasta: "Documentos", data: data(dias[4]), tamanho: "1 KB" });
  return { app: "ficheiros", pista: "Em que dia do mês foi criado o ficheiro “chave.txt”?", ajuda: "Na aplicação Ficheiros, procura “chave.txt” (exatamente esse nome) e lê a coluna “Criado em”. O algarismo é o dia.", digito: d, dados: { app: "ficheiros", ficheiros: misturar(fs, r) } };
}

function enigmaEmail(_cfg: ConfigSala, r: Gerador): Enigma {
  const base: MensagemEmail[] = [
    { de: "Biblioteca", assunto: "Livros em atraso", hora: "08h12", anexos: 0, corpo: "Lembramos que tens um livro para devolver até sexta-feira." },
    { de: "Clube de Xadrez", assunto: "Torneio da escola", hora: "09h40", anexos: 1, corpo: "As inscrições para o torneio estão abertas. Segue o regulamento em anexo." },
    { de: "Marta (turma)", assunto: "Trabalho de grupo", hora: "11h05", anexos: 2, corpo: "Envio as duas partes que faltavam do trabalho." },
    { de: "Cantina", assunto: "Ementa da semana", hora: "12h30", anexos: 1, corpo: "Consulta a ementa em anexo." },
  ];
  if (r() < 0.5) {
    const d = inteiro(1, 6, r);
    const msgs = [...base, { de: "Direção da Escola", assunto: "Documentos da visita", hora: "10h15", anexos: d, corpo: "Seguem em anexo os documentos para a visita de estudo." }];
    return { app: "email", pista: "Quantos anexos tem o email enviado pela Direção da Escola?", ajuda: "Na caixa de entrada, procura o email cujo remetente é “Direção da Escola”: o número ao lado do clipe 📎 é a quantidade de anexos.", digito: d, dados: { app: "email", mensagens: misturar(msgs, r) } };
  }
  const d = inteiro(1, 9, r);
  const falso = escolher([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== d), r);
  const msgs = [...base, { de: "Prof. Rui Ribeiro", assunto: "Código", hora: "10h20", anexos: 0, corpo: `O algarismo que procuras é o ${POR_EXTENSO[d]}. Não digas a ninguém!`, etiqueta: "Importante" }, { de: "promo@premios-exemplo.com", assunto: "Código do teu prémio!!!", hora: "10h22", anexos: 0, corpo: `Ganhaste! O teu código é ${falso}. Clica aqui para receber.` }];
  return { app: "email", pista: "Lê o email com a etiqueta “Importante”: tem um algarismo.", ajuda: "Há dois emails sobre “código”. O certo é o que tem a etiqueta Importante, enviado pelo professor. O outro é spam.", digito: d, dados: { app: "email", mensagens: misturar(msgs, r) } };
}

const PARAGRAFOS = [
  "A equipa reuniu-se na segunda-feira para planear o trabalho da semana. Cada pessoa ficou responsável por uma parte e combinou-se uma data para juntar tudo.",
  "Durante a manhã foram recolhidas informações na biblioteca e na internet. As fontes foram registadas numa lista, com o endereço e a data de consulta.",
  "À tarde, os textos foram revistos por duas pessoas diferentes. Encontraram-se alguns erros de pontuação e duas datas trocadas, que foram corrigidos.",
  "No fim do dia, os ficheiros foram guardados na pasta partilhada, com nomes claros, para que todos os pudessem encontrar sem dificuldade.",
  "Na reunião seguinte, a equipa avaliou o que correu bem e o que pode melhorar. Ficou decidido usar uma lista de tarefas com prazos.",
  "Os resultados foram apresentados à turma com diapositivos simples, poucas palavras e imagens com a fonte indicada.",
];

function enigmaDocumento(cfg: ConfigSala, r: Gerador): Enigma {
  const d = inteiro(1, 9, r);
  const paragrafos = misturar(PARAGRAFOS, r);
  const palavra = escolher(["cofre", "segredo"], r);
  const frase = `O algarismo do ${palavra} vem a seguir: ${POR_EXTENSO[d]}.`;
  const pos = inteiro(2, paragrafos.length - 1, r);
  paragrafos[pos] = `${paragrafos[pos]} ${frase}`;
  if (cfg.dificil) {
    const falso = escolher([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== d), r);
    paragrafos[0] = `${paragrafos[0]} O antigo algarismo do ${palavra} era o ${POR_EXTENSO[falso]}, mas já não serve.`;
  }
  return { app: "documento", pista: `No documento, procura a palavra “${palavra}”${cfg.dificil ? " (o algarismo que ainda serve)" : ""}. O algarismo está escrito por extenso.`, ajuda: `Usa a caixa “Procurar no documento” (ou Ctrl+F) e escreve “${palavra}”. ${cfg.dificil ? "Aparece duas vezes: uma delas é o algarismo antigo." : ""}`.trim(), digito: d, dados: { app: "documento", titulo: "Ata da reunião da equipa", paragrafos } };
}

function enigmaFolha(_cfg: ConfigSala, r: Gerador): Enigma {
  const nomes = amostra(["Ana", "Bruno", "Carla", "Diogo", "Eva", "Filipe", "Inês", "João"], 6, r);
  if (r() < 0.5) {
    let valores = nomes.slice(0, 4).map(() => inteiro(0, 3, r));
    while (valores.reduce((s, x) => s + x, 0) < 1 || valores.reduce((s, x) => s + x, 0) > 9) valores = valores.map(() => inteiro(0, 2, r));
    const d = valores.reduce((s, x) => s + x, 0);
    return { app: "folha", pista: "Qual é a soma da coluna “Livros requisitados”?", ajuda: "Soma todos os números da coluna B, linha a linha.", digito: d, dados: { app: "folha", cabecalho: ["Aluno", "Livros requisitados"], linhas: nomes.slice(0, 4).map((n, i) => [n, valores[i]]) } };
  }
  const d = inteiro(1, 5, r);
  const sins = misturar(nomes.map((_, i) => (i < d ? "Sim" : "Não")), r);
  return { app: "folha", pista: "Quantos alunos têm “Sim” na coluna “Autorização”?", ajuda: "Conta as linhas da coluna B que dizem “Sim”.", digito: d, dados: { app: "folha", cabecalho: ["Aluno", "Autorização"], linhas: nomes.map((n, i) => [n, sins[i]]) } };
}

function enigmaNota(_cfg: ConfigSala, r: Gerador): Enigma {
  const d = inteiro(1, 9, r);
  const forte = escolher(["comboio-verde-salta-29", "Lua!Cheia-sobre-o-Tejo", "girafa_azul_toca_piano_7", "Tres#Gatos#Na#Escada"], r);
  const fracas: [string, string][] = [
    ["123456", "É das palavras-passe mais usadas do mundo: descobre-se em segundos."],
    [`joana${inteiro(2008, 2014, r)}`, "Um nome e um ano são fáceis de adivinhar por quem te conhece."],
    ["Sol!", "É muito curta: tem só 4 caracteres."],
    ["password", "É uma palavra do dicionário, das primeiras a ser experimentadas."],
  ];
  const escolhidas = amostra(fracas, 3, r);
  const opcoes = misturar([forte, ...escolhidas.map((f) => f[0])], r);
  const porque: Record<number, string> = {};
  escolhidas.forEach(([s, p]) => (porque[opcoes.indexOf(s)] = p));
  return { app: "nota", pista: "A nota bloqueada abre com a palavra-passe mais forte da lista. Lá dentro está o algarismo.", ajuda: "A mais forte é a mais longa e difícil de adivinhar: várias palavras, com símbolos ou números, sem nomes nem datas.", digito: d, dados: { app: "nota", opcoes, correta: opcoes.indexOf(forte), porque } };
}

export function gerarSala(cfg: ConfigSala, r: Gerador = Math.random): Enigma[] {
  const base: App[] = ["ficheiros", "email", "documento", "folha"];
  const nBase = cfg.enigmas - (cfg.nota ? 1 : 0);
  const apps = misturar([...amostra(base, nBase, r), ...(cfg.nota ? (["nota"] as App[]) : [])], r);
  const gerar: Record<App, (c: ConfigSala, r: Gerador) => Enigma> = { ficheiros: enigmaFicheiros, email: enigmaEmail, documento: enigmaDocumento, folha: enigmaFolha, nota: enigmaNota };
  return apps.map((a) => gerar[a](cfg, r));
}

/** Pontuação: cofre aberto = 100 − 10 por ajuda − 10 por tentativa falhada − 5 por erro na nota (mínimo 50).
 *  Cofre fechado = até 45, proporcional aos algarismos certos da última tentativa, menos as ajudas. */
export function pontuarSala(aberto: boolean, certos: number, total: number, ajudas: number, falhadas: number, errosNota: number): number {
  if (aberto) return Math.max(50, 100 - 10 * ajudas - 10 * falhadas - 5 * errosNota);
  return Math.max(0, Math.round((45 * certos) / total) - 5 * ajudas);
}
