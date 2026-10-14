// ─── Aldeia Digital · modelos dos emails (puros; o Worker envia-os pela Resend) ──
// Modelos fixos; o único conteúdo variável são números e identificadores validados. Tudo é escapado; só **negrito**
// e ligações para o próprio sítio passam. O email lê-se com imagens bloqueadas (não há imagens obrigatórias).
import { ALDEIA_EMAILS, type TextosEmails } from "./textos-emails";
import type { DadosResumoEmail } from "./nucleo/servico";

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const preencher = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));

/** Texto do backoffice para HTML: escapa e aceita **negrito** e [texto](/rota) do próprio sítio. */
export function ricoHtml(t: string, origem: string): string {
  return esc(t)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, (_m, txt: string, rota: string) => `<a href="${origem}${rota}" style="color:#034ad8">${txt}</a>`);
}
const simples = (t: string) => t.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, "$1");

function moldura(titulo: string, corpo: string, rodape: string): string {
  return `<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(titulo)}</title></head>
<body style="margin:0;background:#eef1f6;font-family:'Noto Sans',Segoe UI,Arial,sans-serif;color:#2b363c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e1e4ea;border-radius:8px">
<tr><td style="background:#021c51;color:#ffffff;padding:16px 20px;font-weight:700;font-size:16px;border-radius:8px 8px 0 0">${esc(ALDEIA_EMAILS.cabecalho)}</td></tr>
<tr><td style="padding:20px">${corpo}</td></tr>
<tr><td style="padding:0 20px 20px;font-size:13px;color:#4f5b70">${rodape}</td></tr>
</table></td></tr></table></body></html>`;
}
const botao = (url: string, texto: string) =>
  `<p style="margin:20px 0"><a href="${esc(url)}" style="display:inline-block;background:#034ad8;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px">${esc(texto)}</a></p>`;

export function modeloConfirmacao(t: TextosEmails, d: { turma: string; url: string; origem: string }) {
  const v = { turma: d.turma };
  const assunto = preencher(t.confirmar.assunto, v);
  const corpo = `<h1 style="font-size:22px;margin:0 0 12px">${esc(preencher(t.confirmar.titulo, v))}</h1><p style="margin:0">${ricoHtml(preencher(t.confirmar.corpo, v), d.origem)}</p>${botao(d.url, t.confirmar.botao)}<p style="margin:0;font-size:13px;color:#4f5b70">${ricoHtml(t.confirmar.nota, d.origem)}</p>`;
  const texto = `${preencher(t.confirmar.titulo, v)}\n\n${simples(preencher(t.confirmar.corpo, v))}\n\n${t.confirmar.botao}: ${d.url}\n\n${simples(t.confirmar.nota)}`;
  return { assunto, html: moldura(assunto, corpo, ""), texto };
}

export function linhaAlerta(t: TextosEmails, a: DadosResumoEmail["alertas"][number]): string {
  const n = a.identificadores.length;
  const quantos = n === 1 ? t.alertas.alunos.um : preencher(t.alertas.alunos.varios, { n });
  const v = { n: quantos, quem: a.identificadores.join(", "), capitulo: a.capitulo ?? "", dias: a.dias ?? "" };
  return preencher(t.alertas[a.tipo], v);
}

export function modeloResumo(t: TextosEmails, d: DadosResumoEmail, ligacoes: { painel: string; sair: string; origem: string }) {
  const nomeTurma = d.turma.nome || d.turma.codigo.replace(/^(...)/, "$1·");
  const v = { turma: nomeTurma };
  const f = d.frequencia === "nenhum" ? "semanal" : d.frequencia;
  const assunto = preencher(t.resumo.assunto[f], v);
  const numeros: [number, string][] = [[d.resumo.ativos7, t.resumo.numeros.ativos], [d.resumo.missoesSemana, t.resumo.numeros.missoes], [d.resumo.capituloMaioria, t.resumo.numeros.capitulo]];
  const celulas = numeros.map(([n, r]) => `<td align="center" style="padding:8px"><div style="font-size:30px;font-weight:800;color:#034ad8">${n}</div><div style="font-size:14px">${esc(r)}</div></td>`).join("");
  const linhas = d.alertas.map((a) => linhaAlerta(t, a));
  const lista = linhas.length ? `<ul style="margin:0;padding-left:20px">${linhas.map((l) => `<li style="margin:4px 0">${ricoHtml(l, ligacoes.origem)}</li>`).join("")}</ul>` : `<p style="margin:0">${esc(t.resumo.semAlertas)}</p>`;
  const corpo = `<h1 style="font-size:22px;margin:0 0 12px">${esc(preencher(t.resumo.titulo[f], v))}</h1>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${celulas}</tr></table>
<h2 style="font-size:16px;margin:16px 0 8px">${esc(t.resumo.alertasTitulo)}</h2>${lista}${botao(ligacoes.painel, t.resumo.botao)}<p style="margin:0;font-size:14px">${ricoHtml(t.resumo.detalhe, ligacoes.origem)}</p>`;
  const rodape = `${ricoHtml(preencher(t.resumo.rodape, v), ligacoes.origem)} <a href="${esc(ligacoes.sair)}" style="color:#034ad8">${esc(t.resumo.sair)}</a>.`;
  const texto = [preencher(t.resumo.titulo[f], v), "", ...numeros.map(([n, r]) => `${n} ${r}`), "", t.resumo.alertasTitulo, ...(linhas.length ? linhas.map((l) => `- ${simples(l)}`) : [t.resumo.semAlertas]), "", `${t.resumo.botao}: ${ligacoes.painel}`, "", simples(preencher(t.resumo.rodape, v)), `${t.resumo.sair}: ${ligacoes.sair}`].join("\n");
  return { assunto, html: moldura(assunto, corpo, rodape), texto };
}

