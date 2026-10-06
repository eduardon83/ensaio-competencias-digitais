// ─── Registo de todos os textos editáveis no backoffice ──────────────────────
// Importado em main.tsx antes de desenhar a aplicação. Cada `registar` expõe as frases de um objeto de conteúdo.
// Para tornar um conteúdo novo editável: exportá-lo do seu módulo e registá-lo aqui.
import { registar } from "./sistema";
import { PAGINAS } from "./paginas";
import { CONTEXTOS } from "../contextos";
import { CICLOS, FAIXAS, NOME_DOMINIO, NOME_NIVEL } from "../motor/tipos";
import { FRASES as FRASES_RESULTADO } from "../motor/frases";
import { ATIVIDADES } from "../atividades";
import { JOGOS, META_JOGOS } from "../jogos";
import { TESTES_SEGURANCA } from "../seguranca";
import { AJUDA, TEMAS } from "../seguranca/conteudo";
import { MENSAGENS, NOME_SINAL } from "../seguranca/fraude";
import { SITUACOES } from "../seguranca/boas-praticas";
import { PUBLICACOES, SITUACOES_REDES } from "../seguranca/redes";
import { PEDIDOS, SITIOS, SITUACOES_NAVEGACAO } from "../seguranca/privacidade";
import { ACOES, LOCAIS, SITUACOES_PUBLICOS } from "../seguranca/publicos";
import { AFIRMACOES, DEFINICOES_PARENTAIS, SITUACOES_FAMILIA } from "../seguranca/familia";
import { MISSOES } from "../jogos/correio/avaliar";
import { TAREFAS as TAREFAS_MAQUETA } from "../atividades/maqueta/modelo";
import { NOME_INSTR } from "../jogos/robo/gerar";
import { EXTRA as EXTRA_ENCONTRA } from "../atividades/encontra";
import { ORDENAR_EXTRA } from "../atividades/paginacao";
import { LEGENDAS, PALAVRAS, FRASES_TEMA, UNIDADES } from "../atividades/fecho/itens";
import { NOMES as NOMES_FECHO } from "../atividades/fecho";
import { AUDIOS, CURTAS, ESCOLHAS } from "../atividades/simulador/itens";
import { EXTRA as EXTRA_MATEMATICA } from "../atividades/matematica";
import { ROTULOS as ROTULOS_PAINEL } from "../atividades/painel";
import { INFOS, PAGINAS as PAGINAS_ARQUIVO, PARAGRAFOS, POOLS, PUBLICIDADE } from "../atividades/arquivo/gerar";
import { FUNCOES, SECCOES } from "../atividades/cartao/dados";

const NOME_PAGINA: Record<string, string> = {
  geral: "Cabeçalho, menu e rodapé", inicio: "Início", treinar: "Treinar", tutorial: "Tutorial", acessibilidade: "Acessibilidade", sobre: "Sobre", privacidade: "Privacidade", licenca: "Licença",
  professor: "Professor", provas: "Provas e exames", atividades: "Atividades (listas)", jogos: "Jogos (página)", seguranca: "Segurança digital (página)", definicoes: "Definições", resultados: "Os meus resultados",
  observatorio: "Observatório", videos: "Vídeos (títulos e avisos)", atividade: "Atividade: briefing, resultado e relatório", codigo: "Entrar com código",
};
for (const [k, v] of Object.entries(PAGINAS)) registar(`paginas.${k}`, "Páginas", NOME_PAGINA[k] ?? k, v);

registar("contextos.jornal", "Cenários", "Redação do jornal", CONTEXTOS.jornal);
registar("contextos.laboratorio", "Cenários", "Laboratório de experiências", CONTEXTOS.laboratorio);

registar("geral.dominios", "Geral", "Nomes das competências", NOME_DOMINIO);
registar("geral.niveis", "Geral", "Nomes dos níveis", NOME_NIVEL);
registar("geral.faixas", "Geral", "Faixas de resultado", FAIXAS);
registar("geral.provas", "Geral", "Provas e exames (percursos)", CICLOS, { negar: ["atividades"], aviso: "Confirmar as designações oficiais das provas em cada ano letivo." });
registar("geral.frases", "Geral", "Frases da primeira página (por competência)", FRASES_RESULTADO);

const AVISO_ATIVIDADE = "Estes textos entram nas tarefas e na correção. Se mudar um texto que tem resposta (por exemplo uma data ou um número), mude também a resposta correspondente.";
// Campos que a correção usa tal e qual (atalhos esperados, notação matemática aceite): não editáveis.
const NEGAR_POR_ATIVIDADE: Record<string, string[]> = {
  teclas: ["atalhos", "opcoes", "esperado", "inicial", "botoes", "final"],
  matematica: ["mostrar", "aceita", "paleta", "opcoes", "alvo"],
};
for (const d of ATIVIDADES) registar(`atividade.${d.slug}`, "Atividades", d.titulo.jornal, d, { aviso: AVISO_ATIVIDADE, negar: NEGAR_POR_ATIVIDADE[d.slug] });
registar("atividade.encontra.extra", "Atividades", "Encontra no Texto", EXTRA_ENCONTRA, { aviso: AVISO_ATIVIDADE });
registar("atividade.paginacao.ordenar", "Atividades", "Paginação", ORDENAR_EXTRA, { aviso: AVISO_ATIVIDADE });
registar("atividade.fecho.palavras", "Atividades", "Fecho de Edição", PALAVRAS, { aviso: AVISO_ATIVIDADE });
registar("atividade.fecho.frases", "Atividades", "Fecho de Edição", FRASES_TEMA, { aviso: AVISO_ATIVIDADE });
registar("atividade.fecho.legendas", "Atividades", "Fecho de Edição", LEGENDAS, { aviso: AVISO_ATIVIDADE });
registar("atividade.fecho.unidades", "Atividades", "Fecho de Edição", UNIDADES, { aviso: AVISO_ATIVIDADE });
registar("atividade.fecho.nomes", "Atividades", "Fecho de Edição", NOMES_FECHO);
registar("atividade.simulador.escolhas", "Atividades", "Simulador de Prova", ESCOLHAS, { aviso: AVISO_ATIVIDADE });
registar("atividade.simulador.audios", "Atividades", "Simulador de Prova", AUDIOS, { aviso: AVISO_ATIVIDADE });
registar("atividade.simulador.curtas", "Atividades", "Simulador de Prova", CURTAS, { aviso: AVISO_ATIVIDADE });
registar("atividade.matematica.extra", "Atividades", "Escrita Matemática", EXTRA_MATEMATICA, { aviso: AVISO_ATIVIDADE, negar: NEGAR_POR_ATIVIDADE.matematica });
registar("atividade.painel.rotulos", "Atividades", "O Painel", ROTULOS_PAINEL);
registar("atividade.arquivo.pastas", "Atividades", "O Arquivo", POOLS);
registar("atividade.arquivo.infos", "Atividades", "O Arquivo", INFOS);
registar("atividade.arquivo.paginas", "Atividades", "O Arquivo", PAGINAS_ARQUIVO);
registar("atividade.arquivo.paragrafos", "Atividades", "O Arquivo", PARAGRAFOS);
registar("atividade.arquivo.publicidade", "Atividades", "O Arquivo", PUBLICIDADE);
registar("atividade.cartao.funcoes", "Atividades", "Cartão de Imprensa", FUNCOES);
registar("atividade.cartao.seccoes", "Atividades", "Cartão de Imprensa", SECCOES);
registar("atividade.maqueta.tarefas", "Atividades", "A Maqueta", TAREFAS_MAQUETA);

for (const d of Object.values(TESTES_SEGURANCA)) registar(`seguranca.${d.slug}`, "Segurança", d.titulo.jornal, d);
registar("seguranca.temas", "Segurança", "Informações dos temas", TEMAS);
registar("seguranca.ajuda", "Segurança", "Onde pedir ajuda", AJUDA, { aviso: "Confirmar os contactos antes de publicar." });
registar("seguranca.mensagens", "Segurança", "O Email Desconfiado", MENSAGENS);
registar("seguranca.nomesSinais", "Segurança", "O Email Desconfiado", NOME_SINAL);
registar("seguranca.situacoes", "Segurança", "Boas Práticas Online", SITUACOES, { aviso: "Em cada situação, a primeira opção é a resposta certa." });
registar("seguranca.publicacoes", "Segurança", "Verdade ou Boato?", PUBLICACOES);
registar("seguranca.situacoesRedes", "Segurança", "Verdade ou Boato?", SITUACOES_REDES, { aviso: "Em cada situação, a primeira opção é a resposta certa." });
registar("seguranca.sitios", "Segurança", "O Endereço Certo", SITIOS, { negar: ["caminho"] });
registar("seguranca.pedidos", "Segurança", "O Endereço Certo", PEDIDOS, { negar: ["endereco"] });
registar("seguranca.situacoesNavegacao", "Segurança", "O Endereço Certo", SITUACOES_NAVEGACAO, { aviso: "Em cada situação, a primeira opção é a resposta certa." });
registar("seguranca.locais", "Segurança", "Na Biblioteca", LOCAIS, { negar: ["rede"], aviso: "O nome da rede não é editável aqui: as imitações são geradas a partir dele." });
registar("seguranca.acoes", "Segurança", "Na Biblioteca", ACOES);
registar("seguranca.situacoesPublicos", "Segurança", "Na Biblioteca", SITUACOES_PUBLICOS, { aviso: "Em cada situação, a primeira opção é a resposta certa." });
registar("seguranca.afirmacoes", "Segurança", "O Acordo da Família", AFIRMACOES);
registar("seguranca.definicoesParentais", "Segurança", "O Acordo da Família", DEFINICOES_PARENTAIS);
registar("seguranca.situacoesFamilia", "Segurança", "O Acordo da Família", SITUACOES_FAMILIA, { aviso: "Em cada situação, a primeira opção é a resposta certa." });

for (const d of JOGOS) registar(`jogo.${d.slug}`, "Jogos", d.titulo.jornal, d, { negar: ["niveis"] });
registar("jogo.meta", "Jogos", "Cartões da página Jogos", META_JOGOS);
registar("jogo.correio.missoes", "Jogos", "Correio da Redação", MISSOES, { negar: ["assunto", "conteudo"], aviso: "As palavras-chave usadas na correção não são editáveis aqui: se mudar o pedido, mantenha as mesmas informações." });
registar("jogo.robo.instrucoes", "Jogos", "O Robô da Bancada", NOME_INSTR);
