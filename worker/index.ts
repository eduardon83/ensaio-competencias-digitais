// ─── Worker do ECD: serve a aplicação e guarda os textos editados no backoffice ──
// Rotas:
//   GET  /api/textos                      textos atuais (público; a aplicação lê-os no arranque)
//   GET  /api/sessao                      confirma a chave e diz o papel ("editor" ou "admin")
//   PUT  /api/textos                      guarda uma versão nova (editor ou admin) · corpo { valores, base }
//   GET  /api/textos/historico            lista de versões guardadas (editor ou admin)
//   GET  /api/textos/historico/:versao    uma versão antiga (editor ou admin)
//   POST /api/textos/repor                volta a uma versão antiga (cria uma versão nova) · corpo { versao }
// Tudo o resto vai para os ficheiros estáticos (dist/), com regresso a index.html (SPA).
//
// Chaves (segredos do Worker, nunca no código): CHAVE_ADMIN (super admin, fica sempre) e CHAVE_EDICAO (professor que
// adapta os textos; apagar este segredo fecha a edição). Defina-as com `npx wrangler secret put CHAVE_ADMIN`.

export interface Env {
  ASSETS: Fetcher;
  TEXTOS: KVNamespace;
  CHAVE_ADMIN?: string;
  CHAVE_EDICAO?: string;
}

interface Pacote {
  valores: Record<string, string>;
  versao: number;
  atualizadoEm: string;
  papel?: Papel;
  nota?: string;
}
interface EntradaHistorico {
  versao: number;
  atualizadoEm: string;
  papel?: Papel;
  alterados: number;
  nota?: string;
}
type Papel = "editor" | "admin";

const LIMITE_ENTRADAS = 6000;
const LIMITE_TEXTO = 20_000;
const LIMITE_TOTAL = 1_500_000; // bytes de JSON
const MAX_HISTORICO = 40;
const CHAVE_VALIDA = /^[\w.\-]{1,200}$/;

const json = (dados: unknown, estado = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(dados), { status: estado, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", ...extra } });

async function iguais(a: string, b: string): Promise<boolean> {
  // Comparação em tempo constante (resumos SHA-256 do mesmo tamanho).
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0 && a.length > 0;
}

async function papelDe(req: Request, env: Env): Promise<Papel | null> {
  const cab = req.headers.get("authorization") ?? "";
  const chave = cab.startsWith("Bearer ") ? cab.slice(7).trim() : "";
  if (!chave) return null;
  if (env.CHAVE_ADMIN && (await iguais(chave, env.CHAVE_ADMIN))) return "admin";
  if (env.CHAVE_EDICAO && (await iguais(chave, env.CHAVE_EDICAO))) return "editor";
  await new Promise((r) => setTimeout(r, 400)); // abranda tentativas
  return null;
}

async function lerAtual(env: Env): Promise<Pacote> {
  return (await env.TEXTOS.get<Pacote>("atual", "json")) ?? { valores: {}, versao: 0, atualizadoEm: "" };
}

function validar(valores: unknown): string | null {
  if (typeof valores !== "object" || valores === null || Array.isArray(valores)) return "Formato inválido: falta o objeto “valores”.";
  const entradas = Object.entries(valores as Record<string, unknown>);
  if (entradas.length > LIMITE_ENTRADAS) return "Demasiados textos.";
  for (const [k, v] of entradas) {
    if (!CHAVE_VALIDA.test(k)) return `Chave inválida: ${k.slice(0, 60)}`;
    if (typeof v !== "string") return `O texto “${k}” não é texto.`;
    if (v.length > LIMITE_TEXTO) return `O texto “${k}” é demasiado longo.`;
  }
  if (JSON.stringify(valores).length > LIMITE_TOTAL) return "O conjunto de textos é demasiado grande.";
  return null;
}

async function guardar(env: Env, valores: Record<string, string>, papel: Papel, nota?: string): Promise<Pacote> {
  const atual = await lerAtual(env);
  const novo: Pacote = { valores, versao: atual.versao + 1, atualizadoEm: new Date().toISOString(), papel, nota };
  const historico = (await env.TEXTOS.get<EntradaHistorico[]>("historico", "json")) ?? [];
  historico.unshift({ versao: novo.versao, atualizadoEm: novo.atualizadoEm, papel, alterados: Object.keys(valores).length, nota });
  const removidas = historico.splice(MAX_HISTORICO);
  await Promise.all([
    env.TEXTOS.put("atual", JSON.stringify(novo)),
    env.TEXTOS.put(`versao:${novo.versao}`, JSON.stringify(novo)),
    env.TEXTOS.put("historico", JSON.stringify(historico)),
    ...removidas.map((h) => env.TEXTOS.delete(`versao:${h.versao}`)),
  ]);
  return novo;
}

async function api(req: Request, env: Env, url: URL): Promise<Response> {
  const caminho = url.pathname.replace(/\/+$/, "");
  if (caminho === "/api/textos" && req.method === "GET") {
    const a = await lerAtual(env);
    return json({ valores: a.valores, versao: a.versao, atualizadoEm: a.atualizadoEm });
  }

  const papel = await papelDe(req, env);
  if (!papel) return json({ erro: env.CHAVE_ADMIN || env.CHAVE_EDICAO ? "chave" : "fechado" }, 401);

  if (caminho === "/api/sessao" && req.method === "GET") return json({ papel, edicaoAberta: Boolean(env.CHAVE_EDICAO) });

  if (caminho === "/api/textos" && req.method === "PUT") {
    let corpo: { valores?: unknown; base?: number; nota?: string };
    try {
      corpo = await req.json();
    } catch {
      return json({ erro: "JSON inválido." }, 400);
    }
    const erro = validar(corpo.valores);
    if (erro) return json({ erro }, 400);
    const atual = await lerAtual(env);
    if (typeof corpo.base === "number" && corpo.base !== atual.versao) return json({ erro: "conflito", versao: atual.versao }, 409);
    const novo = await guardar(env, corpo.valores as Record<string, string>, papel, typeof corpo.nota === "string" ? corpo.nota.slice(0, 200) : undefined);
    return json({ versao: novo.versao, atualizadoEm: novo.atualizadoEm });
  }

  if (caminho === "/api/textos/historico" && req.method === "GET") return json((await env.TEXTOS.get("historico", "json")) ?? []);

  const m = /^\/api\/textos\/historico\/(\d+)$/.exec(caminho);
  if (m && req.method === "GET") {
    const p = await env.TEXTOS.get<Pacote>(`versao:${m[1]}`, "json");
    return p ? json(p) : json({ erro: "Versão não encontrada." }, 404);
  }

  if (caminho === "/api/textos/repor" && req.method === "POST") {
    const { versao } = (await req.json().catch(() => ({}))) as { versao?: number };
    const p = typeof versao === "number" ? await env.TEXTOS.get<Pacote>(`versao:${versao}`, "json") : null;
    if (!p) return json({ erro: "Versão não encontrada." }, 404);
    const novo = await guardar(env, p.valores, papel, `Reposta a versão ${versao}`);
    return json({ versao: novo.versao, atualizadoEm: novo.atualizadoEm });
  }

  return json({ erro: "Rota desconhecida." }, 404);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        return await api(req, env, url);
      } catch {
        return json({ erro: "Erro no servidor." }, 500);
      }
    }
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
