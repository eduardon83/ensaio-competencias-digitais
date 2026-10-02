/**
 * Ensaio às Competências Digitais · ponto de recolha (Google Apps Script)
 *
 * Sem base de dados: tudo vive numa folha de cálculo Google controlada por quem publica a aplicação.
 *
 *  POST (corpo JSON em text/plain)
 *    evento "tentativa" | "teste"  → acrescenta uma linha anónima (e envia email ao professor, se a tentativa
 *                                     vier com o código de uma sessão com email confirmado e envio "cada")
 *    evento "sessao"                → regista uma sessão de professor (código, configuração, hash do token
 *                                     privado, email opcional) e envia o email de confirmação
 *    evento "fechar"                → fecha uma sessão (com o token): deixa de aceitar tentativas e de enviar emails
 *  GET
 *    (sem parâmetros)               → agregados públicos (grupos com menos de LIMIAR tentativas ocultos)
 *    ?chave=ADMIN_CHAVE             → agregados completos (ecrã /admin)
 *    ?sessao=XXXX&token=…           → resultados de uma sessão de professor (token privado do professor)
 *    ?estado=XXXX                   → { existe, fechada } para o aluno saber se o código ainda está aberto
 *    ?confirmar=…                   → confirma o email do professor (ligação enviada por email)
 *
 * Funções para acionadores (Editar → Acionadores): resumoDiario() uma vez por dia; instalarAcionadores() cria-o.
 *
 * Instalação: ver telemetria/README.md (5 minutos).
 */

var LIMIAR = 20;
var RETENCAO_DIAS = 365; // sessões de professor: dados de contacto apagados 12 meses após a última tentativa
var COLUNAS = {
  tentativa: ["recebidoEm", "enviadoEm", "versao", "sessao", "atividade", "nivel", "pontuacao", "duracaoS", "origem", "contexto", "formato", "extensaoTempo", "dispositivo", "codigo", "aluno", "metricas"],
  teste: ["recebidoEm", "enviadoEm", "versao", "sessao", "ciclo", "pontuacaoGlobal", "faixa", "porDominio", "codigo", "aluno"],
  sessoes: ["criadoEm", "sessao", "codigo", "config", "tokenHash", "email", "frequencia", "confirmado", "tokenConfirmacao", "urlResultados", "fechada", "ultimaTentativa"],
};

// ── Utilitários ──────────────────────────────────────────────────────────────
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
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
function ler_(nome) {
  var valores = folha_(nome).getDataRange().getValues();
  var cab = valores.shift() || [];
  return valores.map(function (l, i) {
    var o = { _linha: i + 2 };
    cab.forEach(function (c, j) {
      o[c] = l[j];
    });
    return o;
  });
}
function escreverCelula_(nome, linha, coluna, valor) {
  folha_(nome).getRange(linha, COLUNAS[nome].indexOf(coluna) + 1).setValue(valor);
}
function sha256_(texto) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, texto, Utilities.Charset.UTF_8);
  return bytes
    .map(function (b) {
      var h = ((b + 256) % 256).toString(16);
      return h.length === 1 ? "0" + h : h;
    })
    .join("");
}
function emailValido_(e) {
  return typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length < 200;
}
function sessaoPor_(sessao) {
  var todas = ler_("sessoes");
  for (var i = todas.length - 1; i >= 0; i--) if (String(todas[i].sessao) === String(sessao)) return todas[i];
  return null;
}
function texto_(v, max) {
  return String(v === undefined || v === null ? "" : v).slice(0, max || 80);
}

// ── POST ─────────────────────────────────────────────────────────────────────
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var dados = JSON.parse(e.postData.contents);
    if (dados.evento === "sessao") return json_(registarSessao_(dados));
    if (dados.evento === "fechar") return json_(fecharSessao_(dados));
    return json_(registarTentativa_(dados));
  } catch (erro) {
    return json_({ ok: false, erro: String(erro) });
  } finally {
    try {
      lock.releaseLock();
    } catch (x) {}
  }
}

function registarTentativa_(dados) {
  var evento = dados.evento === "teste" ? "teste" : "tentativa";
  var sessaoProf = dados.codigo ? sessaoPor_(dados.codigo) : null;
  if (sessaoProf && sessaoProf.fechada === true) return { ok: false, erro: "fechada" };
  var linha = COLUNAS[evento].map(function (c) {
    if (c === "recebidoEm") return new Date().toISOString();
    var v = dados[c];
    if (v === undefined || v === null) return "";
    if (c === "aluno") return texto_(v, 40);
    return typeof v === "object" ? JSON.stringify(v) : v;
  });
  folha_(evento).appendRow(linha);
  if (sessaoProf) {
    escreverCelula_("sessoes", sessaoProf._linha, "ultimaTentativa", new Date().toISOString());
    if (evento === "tentativa" && sessaoProf.confirmado === true && sessaoProf.frequencia === "cada" && sessaoProf.email) {
      enviarRelatorio_(sessaoProf, [dados], "Nova tentativa");
    }
  }
  return { ok: true };
}

function registarSessao_(d) {
  if (!d.sessao || !d.tokenHash || !d.codigo) return { ok: false, erro: "dados" };
  if (sessaoPor_(d.sessao)) return { ok: false, erro: "existe" };
  var email = emailValido_(d.email) ? d.email : "";
  var frequencia = ["cada", "diario", "nenhum"].indexOf(d.frequencia) >= 0 ? d.frequencia : "diario";
  var tokenConfirmacao = email ? Utilities.getUuid() : "";
  folha_("sessoes").appendRow([new Date().toISOString(), texto_(d.sessao, 8), texto_(d.codigo, 16), JSON.stringify(d.config || {}), texto_(d.tokenHash, 64), email, frequencia, false, tokenConfirmacao, texto_(d.urlResultados, 500), false, ""]);
  if (email) {
    var ligacao = ScriptApp.getService().getUrl() + "?confirmar=" + encodeURIComponent(tokenConfirmacao);
    MailApp.sendEmail({
      to: email,
      subject: "Confirme o seu email · Ensaio às Competências Digitais",
      htmlBody:
        "<p>Criou a sessão <b>" + d.codigo + "</b> no Ensaio às Competências Digitais.</p>" +
        "<p>Para receber os resultados dos alunos neste endereço, confirme aqui:</p>" +
        '<p><a href="' + ligacao + '">Confirmar o email</a></p>' +
        "<p>Sem confirmação não enviamos nada. Se não foi você, ignore esta mensagem.</p>" +
        (d.urlResultados ? '<p>Ligação privada para ver os resultados a qualquer momento (não partilhe com os alunos):<br><a href="' + d.urlResultados + '">' + d.urlResultados + "</a></p>" : ""),
    });
  }
  return { ok: true, email: !!email };
}

function fecharSessao_(d) {
  var s = sessaoPor_(d.sessao);
  if (!s || sha256_(String(d.token || "")) !== s.tokenHash) return { ok: false, erro: "token" };
  escreverCelula_("sessoes", s._linha, "fechada", true);
  return { ok: true };
}

// ── GET ──────────────────────────────────────────────────────────────────────
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.confirmar) return confirmar_(p.confirmar);
  if (p.estado) {
    var s = sessaoPor_(p.estado);
    return json_({ existe: !!s, fechada: !!(s && s.fechada === true) });
  }
  if (p.sessao) return json_(resultadosSessao_(p.sessao, p.token || ""));
  var admin = PropertiesService.getScriptProperties().getProperty("ADMIN_CHAVE") || "";
  var chave = p.chave || "";
  var completo = chave !== "" && admin !== "" && chave === admin;
  if (chave !== "" && !completo) return json_({ erro: "chave" });
  return json_(agregar_(completo));
}

function confirmar_(token) {
  var todas = ler_("sessoes");
  for (var i = 0; i < todas.length; i++) {
    if (todas[i].tokenConfirmacao && todas[i].tokenConfirmacao === token) {
      escreverCelula_("sessoes", todas[i]._linha, "confirmado", true);
      return HtmlService.createHtmlOutput('<meta name="viewport" content="width=device-width,initial-scale=1"><div style="font-family:sans-serif;max-width:520px;margin:40px auto;padding:0 16px"><h2>Email confirmado</h2><p>Vai passar a receber os resultados da sessão <b>' + todas[i].codigo + "</b>.</p>" + (todas[i].urlResultados ? '<p><a href="' + todas[i].urlResultados + '">Ver os resultados</a></p>' : "") + "</div>");
    }
  }
  return HtmlService.createHtmlOutput('<div style="font-family:sans-serif;max-width:520px;margin:40px auto">Ligação inválida ou expirada.</div>');
}

function resultadosSessao_(sessao, token) {
  var s = sessaoPor_(sessao);
  if (!s) return { erro: "sessao" };
  if (sha256_(String(token)) !== s.tokenHash) return { erro: "token" };
  var linhas = ler_("tentativa").filter(function (t) {
    return String(t.codigo) === String(sessao);
  });
  var testes = ler_("teste").filter(function (t) {
    return String(t.codigo) === String(sessao);
  });
  return {
    sessao: s.sessao,
    codigo: s.codigo,
    config: JSON.parse(s.config || "{}"),
    email: s.email ? String(s.email).replace(/^(.).*(@.*)$/, "$1…$2") : "",
    confirmado: s.confirmado === true,
    frequencia: s.frequencia,
    fechada: s.fechada === true,
    criadoEm: s.criadoEm,
    tentativas: linhas.map(function (t) {
      return { recebidoEm: t.recebidoEm, aluno: t.aluno, atividade: t.atividade, nivel: t.nivel, pontuacao: Number(t.pontuacao), duracaoS: Number(t.duracaoS), dispositivo: t.dispositivo, contexto: t.contexto };
    }),
    testes: testes.map(function (t) {
      return { recebidoEm: t.recebidoEm, aluno: t.aluno, pontuacaoGlobal: Number(t.pontuacaoGlobal), faixa: t.faixa };
    }),
  };
}

// ── Emails ao professor ──────────────────────────────────────────────────────
function enviarRelatorio_(s, tentativas, titulo) {
  if (!tentativas.length) return;
  var linhas = tentativas
    .map(function (t) {
      return "<tr><td>" + (t.aluno || "—") + "</td><td>" + t.atividade + "</td><td>" + t.nivel + "</td><td><b>" + t.pontuacao + "</b></td><td>" + (t.duracaoS || "") + " s</td></tr>";
    })
    .join("");
  MailApp.sendEmail({
    to: s.email,
    subject: titulo + " · sessão " + s.codigo + " · Ensaio às Competências Digitais",
    htmlBody:
      "<p>Sessão <b>" + s.codigo + "</b>.</p>" +
      '<table border="1" cellpadding="6" style="border-collapse:collapse"><tr><th>Aluno</th><th>Atividade</th><th>Nível</th><th>Pontuação</th><th>Tempo</th></tr>' + linhas + "</table>" +
      (s.urlResultados ? '<p><a href="' + s.urlResultados + '">Ver todos os resultados e exportar CSV</a></p>' : "") +
      "<p style=\"color:#666;font-size:12px\">Para deixar de receber, feche a sessão na página de resultados.</p>",
  });
}

/** Acionador diário: resumo das últimas 24 h para sessões com envio "diario"; limpeza de contactos antigos. */
function resumoDiario() {
  var agora = new Date();
  var desde = new Date(agora.getTime() - 24 * 3600 * 1000);
  var sessoes = ler_("sessoes");
  var tentativas = ler_("tentativa");
  sessoes.forEach(function (s) {
    var ultima = s.ultimaTentativa ? new Date(s.ultimaTentativa) : new Date(s.criadoEm);
    if (s.email && agora.getTime() - ultima.getTime() > RETENCAO_DIAS * 24 * 3600 * 1000) {
      escreverCelula_("sessoes", s._linha, "email", "");
      return;
    }
    if (s.fechada === true || s.confirmado !== true || s.frequencia !== "diario" || !s.email) return;
    var doDia = tentativas.filter(function (t) {
      return String(t.codigo) === String(s.sessao) && new Date(t.recebidoEm) >= desde;
    });
    enviarRelatorio_(s, doDia, "Resumo diário");
  });
}

function instalarAcionadores() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "resumoDiario") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("resumoDiario").timeBased().everyDays(1).atHour(19).create();
}

// ── Agregados (Observatório e /admin) ────────────────────────────────────────
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
    sessoes_professor: completo ? ler_("sessoes").length : undefined,
    completo: completo,
  };
}
