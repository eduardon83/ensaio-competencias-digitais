// ─── Aldeia Digital · emails (Resend) ────────────────────────────────────────
// Modelos fixos; o único conteúdo variável são números e identificadores validados. Textos do backoffice (KV TEXTOS,
// chaves "aldeia.emails.…") por cima dos textos do código. Tudo é escapado; só **negrito** e ligações para o próprio
// sítio passam. O email lê-se com imagens bloqueadas (não há imagens obrigatórias).
import { ALDEIA_EMAILS, type TextosEmails } from "../../src/aldeia/textos-emails";
import type { Env } from "../env";

export { modeloConfirmacao, modeloResumo } from "../../src/aldeia/emails";

/** Textos dos emails com as alterações do backoffice. */
export async function textosEmails(env: Env): Promise<TextosEmails> {
  const t = structuredClone(ALDEIA_EMAILS);
  try {
    const p = await env.TEXTOS.get<{ valores: Record<string, string> }>("atual", "json");
    for (const [k, v] of Object.entries(p?.valores ?? {})) {
      if (!k.startsWith("aldeia.emails.") || typeof v !== "string") continue;
      const partes = k.slice("aldeia.emails.".length).split(".");
      let o = t as unknown as Record<string, unknown>;
      for (let i = 0; i < partes.length - 1; i++) o = (o?.[partes[i]] ?? null) as Record<string, unknown>;
      const ultima = partes[partes.length - 1];
      if (o && typeof o[ultima] === "string") o[ultima] = v;
    }
  } catch {
    /* sem KV: textos do código */
  }
  return t;
}

/** Envia pela Resend. Sem chave configurada (ou acima do teto diário), não envia e devolve falso. */
export async function enviarEmail(env: Env, m: { para: string; assunto: string; html: string; texto: string; sair?: string }): Promise<boolean> {
  if (!env.RESEND_CHAVE || !env.ALDEIA_REMETENTE || !env.REGISTO) return false;
  const teto = Number(env.ALDEIA_EMAILS_DIA) || 2000;
  const registo = env.REGISTO.get(env.REGISTO.idFromName("registo"));
  if (!(await registo.contarEmail(teto))) return false;
  const corpo: Record<string, unknown> = { from: env.ALDEIA_REMETENTE, to: [m.para], subject: m.assunto, html: m.html, text: m.texto };
  if (env.ALDEIA_RESPONDER) corpo.reply_to = env.ALDEIA_RESPONDER;
  if (m.sair) corpo.headers = { "List-Unsubscribe": `<${m.sair}>` };
  try {
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${env.RESEND_CHAVE}`, "content-type": "application/json" }, body: JSON.stringify(corpo) });
    return r.ok;
  } catch {
    return false;
  }
}
