// ─── Aldeia Digital · funções criptográficas (WebCrypto: navegador e Worker) ──
const enc = new TextEncoder();

export function base64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function deBase64url(s: string): Uint8Array {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}
const hex = (b: ArrayBuffer) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join("");

/** Chave aleatória (128 bits por omissão), em base64url. */
export function chaveAleatoria(bytes = 16): string {
  const b = new Uint8Array(bytes);
  crypto.getRandomValues(b);
  return base64url(b);
}

export function idAleatorio(): string {
  return chaveAleatoria(9);
}

export async function sha256(texto: string): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(texto)));
}

async function chaveHmac(segredo: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}
export async function hmac(segredo: string, texto: string): Promise<string> {
  return hex(await crypto.subtle.sign("HMAC", await chaveHmac(segredo), enc.encode(texto)));
}

/** Comparação em tempo constante (resumos SHA-256 do mesmo tamanho, como `iguais()` do Worker). */
export async function iguais(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0 && a.length > 0;
}

// ── Tokens assinados de curta duração (painel do professor, ligações dos emails) ──
export interface DadosToken {
  t: string; // código da turma
  p: "painel" | "confirmar" | "sair";
  exp: number; // ms desde 1970
  e?: string; // resumo do email (confirmação)
}

export async function assinarToken(segredo: string, dados: DadosToken): Promise<string> {
  const corpo = base64url(enc.encode(JSON.stringify(dados)));
  const assinatura = await hmac(segredo, corpo);
  return `${corpo}.${assinatura}`;
}

export async function lerToken(segredo: string, token: string, proposito: DadosToken["p"], agora = Date.now()): Promise<DadosToken | null> {
  const [corpo, assinatura] = token.split(".");
  if (!corpo || !assinatura || token.length > 600) return null;
  if (!(await iguais(await hmac(segredo, corpo), assinatura))) return null;
  try {
    const d = JSON.parse(new TextDecoder().decode(deBase64url(corpo))) as DadosToken;
    if (d.p !== proposito || typeof d.t !== "string" || typeof d.exp !== "number" || d.exp < agora) return null;
    return d;
  } catch {
    return null;
  }
}
