/**
 * Ensaio às Competências Digitais · ponto de recolha de telemetria anónima (Google Apps Script)
 *
 * O que faz
 *  - doPost: recebe um JSON por tentativa/teste e acrescenta uma linha à folha "tentativa" ou "teste".
 *  - doGet:  devolve agregados em JSON. Sem chave → versão pública (grupos com menos de LIMIAR tentativas ocultos).
 *            Com ?chave=<ADMIN_CHAVE> → versão completa, para o ecrã /admin da aplicação.
 *
 * Instalação (5 minutos, sem base de dados, custo zero): ver telemetria/README.md.
 *  1. Cria uma folha de cálculo Google vazia. Extensões → Apps Script. Cola este ficheiro.
 *  2. Definições do projeto → Propriedades do script → adiciona ADMIN_CHAVE com uma frase longa secreta.
 *  3. Implementar → Nova implementação → Aplicação Web · Executar como: eu · Quem tem acesso: Qualquer pessoa.
 *  4. Copia o URL ".../exec" para VITE_TELEMETRIA_URL no .env da aplicação e faz o build.
 */

var LIMIAR = 20; // mínimo de tentativas para um grupo aparecer nos agregados públicos
var COLUNAS = {
  tentativa: ["recebidoEm", "enviadoEm", "versao", "sessao", "atividade", "nivel", "pontuacao", "duracaoS", "origem", "contexto", "formato", "extensaoTempo", "dispositivo", "codigo", "metricas"],
  teste: ["recebidoEm", "enviadoEm", "versao", "sessao", "ciclo", "pontuacaoGlobal", "faixa", "porDominio"],
};

function folha_(nome) {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var f = doc.getSheetByName(nome);
  if (!f) {
    f = doc.insertSheet(nome);
    f.appendRow(COLUNAS[nome]);
    f.setFrozenRows(1);
  }
  return f;
}

function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);
    var evento = dados.evento === "teste" ? "teste" : "tentativa";
    var linha = COLUNAS[evento].map(function (c) {
      if (c === "recebidoEm") return new Date().toISOString();
      var v = dados[c];
      if (v === undefined || v === null) return "";
      return typeof v === "object" ? JSON.stringify(v) : v;
    });
    // Nunca guardamos IP: o Apps Script não o expõe e não o pedimos. Só os campos listados.
    folha_(evento).appendRow(linha);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (erro) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, erro: String(erro) })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var chave = (e && e.parameter && e.parameter.chave) || "";
  var admin = PropertiesService.getScriptProperties().getProperty("ADMIN_CHAVE") || "";
  var completo = chave !== "" && admin !== "" && chave === admin;
  if (chave !== "" && !completo) {
    return ContentService.createTextOutput(JSON.stringify({ erro: "chave" })).setMimeType(ContentService.MimeType.JSON);
  }
  var saida = agregar_(completo);
  return ContentService.createTextOutput(JSON.stringify(saida)).setMimeType(ContentService.MimeType.JSON);
}

function ler_(nome) {
  var f = folha_(nome);
  var valores = f.getDataRange().getValues();
  var cab = valores.shift() || [];
  return valores.map(function (l) {
    var o = {};
    cab.forEach(function (c, i) {
      o[c] = l[i];
    });
    return o;
  });
}

function contar_(mapa, chave) {
  mapa[chave] = (mapa[chave] || 0) + 1;
}
function somar_(mapa, chave, valor) {
  if (!mapa[chave]) mapa[chave] = { n: 0, soma: 0 };
  mapa[chave].n += 1;
  mapa[chave].soma += Number(valor) || 0;
}
function fecharMedias_(mapa, limiar) {
  var saida = {};
  Object.keys(mapa).forEach(function (k) {
    if (mapa[k].n >= limiar) saida[k] = { n: mapa[k].n, media: Math.round(mapa[k].soma / mapa[k].n) };
  });
  return saida;
}
function fecharContagens_(mapa, limiar) {
  var saida = {};
  Object.keys(mapa).forEach(function (k) {
    if (mapa[k] >= limiar) saida[k] = mapa[k];
  });
  return saida;
}

function agregar_(completo) {
  var limiar = completo ? 1 : LIMIAR;
  var tentativas = ler_("tentativa");
  var testes = ler_("teste");
  var porAtividade = {}, porAtividadeNivel = {}, porNivel = {}, porDispositivo = {}, porContexto = {}, porFormato = {}, porOrigem = {}, porDia = {}, sessoes = {};
  tentativas.forEach(function (t) {
    somar_(porAtividade, t.atividade, t.pontuacao);
    somar_(porAtividadeNivel, t.atividade + ":" + t.nivel, t.pontuacao);
    contar_(porNivel, String(t.nivel));
    contar_(porDispositivo, t.dispositivo || "?");
    contar_(porContexto, t.contexto || "?");
    contar_(porFormato, t.formato || "?");
    contar_(porOrigem, t.origem || "?");
    contar_(porDia, String(t.recebidoEm).slice(0, 10));
    if (t.sessao) sessoes[t.sessao] = true;
  });
  var testesPorCiclo = {};
  testes.forEach(function (t) {
    somar_(testesPorCiclo, t.ciclo, t.pontuacaoGlobal);
  });
  return {
    gerado_em: new Date().toISOString(),
    total_tentativas: tentativas.length,
    total_testes: testes.length,
    limiar: limiar,
    por_atividade: fecharMedias_(porAtividade, limiar),
    por_atividade_nivel: fecharMedias_(porAtividadeNivel, limiar),
    por_nivel: fecharContagens_(porNivel, limiar),
    por_dispositivo: fecharContagens_(porDispositivo, limiar),
    por_contexto: fecharContagens_(porContexto, limiar),
    por_formato: fecharContagens_(porFormato, limiar),
    por_origem: fecharContagens_(porOrigem, limiar),
    por_dia: completo ? porDia : fecharContagens_(porDia, limiar),
    testes_por_ciclo: fecharMedias_(testesPorCiclo, limiar),
    sessoes: Object.keys(sessoes).length,
    completo: completo,
  };
}
