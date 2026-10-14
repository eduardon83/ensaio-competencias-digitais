// ─── Aldeia Digital · rotas da API (/api/aldeia/…) ────────────────────────────
//   GET  /api/aldeia/estado                       a Aldeia está disponível? (a aplicação decide entre servidor e modo local)
//   POST /api/aldeia/turmas                       criar turma (professor) · { config, termos: true }
//   GET  /api/aldeia/t/:turma                     o que o aluno vê antes de entrar (sem nomes)
//   POST /api/aldeia/t/:turma/alunos              primeira entrada · { nome, modo, fato }
//   POST /api/aldeia/t/:turma/entrar              outro computador · { nome, modo }
//   GET  /api/aldeia/t/:turma/eu                  a minha aldeia (cabeçalho Authorization: Aluno <id>.<chave>)
//   POST /api/aldeia/t/:turma/eu                  operações · { ops: [...] }
//   POST /api/aldeia/t/:turma/sair                sair deste computador
//   POST /api/aldeia/professor/entrar             código do professor → token de 2 horas · { codigo }
//   GET  /api/aldeia/professor                    painel (Authorization: Bearer <token>)
//   POST /api/aldeia/professor/acao               ações do painel · { acao, … }
//   POST /api/aldeia/professor/email              email e alertas · { endereco|null, frequencia, autorizarNome }
//   POST /api/aldeia/professor/apagar             apagar tudo · { confirmar: <código da turma> }
//   POST /api/aldeia/email/confirmar              ligação do email de confirmação · { token }
//   POST /api/aldeia/email/sair                   ligação "deixar de receber" · { token }
// Controlos (docs/aldeia-digital/SEGURANCA.md): limites por IP, turma e aluno; bloqueio por falhas; corpo até 16 kB,
// só JSON; erros curtos e iguais; código do professor só como HMAC; tokens assinados; registos sem corpos nem nomes.
import { codigoProfessorValido, codigoTurmaValido, gerarCodigoProfessor, gerarCodigoTurma } from "../../src/aldeia/nucleo/codigos";
import { assinarToken, hmac, lerToken, sha256 } from "../../src/aldeia/nucleo/cripto";
import { eFrequencia, eListaOps, emailValido, lerConfig } from "../../src/aldeia/nucleo/esquema";
import type { ConfigTurma, ModoIdentificacao } from "../../src/aldeia/nucleo/catalogo";
import type { AcaoProfessor } from "../../src/aldeia/nucleo/servico";
import type { Env } from "../env";
import { enviarEmail, modeloConfirmacao, textosEmails } from "./email";

const MIN = 60_000;
const CORPO_MAX = 16 * 1024;
const TOKEN_PAINEL_MS = 2 * 3600_000;

const json = (dados: unknown, estado = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(dados), {
    status: estado,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "content-security-policy": "default-src 'none'; frame-ancestors 'none'", "referrer-policy": "no-referrer", ...extra },
  });
const erro = (codigo: string, estado: number, extra: Record<string, string> = {}) => json({ erro: codigo }, estado, extra);

const MODOS: ModoIdentificacao[] = ["numero", "nome", "anonimo"];

async function corpo(req: Request): Promise<Record<string, unknown> | null> {
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return null;
  const tamanho = Number(req.headers.get("content-length") ?? "0");
  if (tamanho > CORPO_MAX) return null;
  const texto = await req.text();
  if (texto.length > CORPO_MAX) return null;
  try {
    const v = JSON.parse(texto);
    return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const atraso = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function aldeia(req: Request, env: Env, url: URL): Promise<Response> {
  const caminho = url.pathname.replace(/\/+$/, "");
  const estado = env.ALDEIA_ESTADO ?? "aberta";
  const configurada = Boolean(env.TURMAS && env.GUARDA && env.REGISTO && env.PIMENTA_PROFESSOR && env.CHAVE_TOKENS);
  if (caminho === "/api/aldeia/estado" && req.method === "GET") {
    return json({ disponivel: configurada && estado !== "fechada", estado: configurada ? estado : "fechada", email: Boolean(env.RESEND_CHAVE && env.ALDEIA_REMETENTE) });
  }
  if (!configurada || estado === "fechada") return erro("fechada", 503);
  if (!["GET", "POST"].includes(req.method)) return erro("metodo", 405, { allow: "GET, POST" });
  if (req.method === "POST" && estado === "so-leitura") return erro("so-leitura", 503);

  const ip = req.headers.get("cf-connecting-ip") ?? "desconhecido";
  if (env.LIMITE_ALDEIA && !(await env.LIMITE_ALDEIA.limit({ key: ip })).success) return erro("limite", 429, { "retry-after": "60" });
  // A guarda guarda só resumos do IP (nunca o IP em claro), repartida em 16 objetos.
  const ipH = (await sha256(`aldeia:${ip}`)).slice(0, 32);
  const guarda = env.GUARDA!.get(env.GUARDA!.idFromName(`guarda-${parseInt(ipH.slice(0, 2), 16) % 16}`));
  const registo = env.REGISTO!.get(env.REGISTO!.idFromName("registo"));
  const turmaDO = (codigo: string) => env.TURMAS!.get(env.TURMAS!.idFromName(codigo));
  const hmacProfessor = (codigo: string) => hmac(env.PIMENTA_PROFESSOR!, codigo);

  // ── Professor: criar turma ─────────────────────────────────────────────────
  if (caminho === "/api/aldeia/turmas") {
    if (req.method !== "POST") return erro("metodo", 405, { allow: "POST" });
    const c = await corpo(req);
    if (!c || c.termos !== true) return erro("pedido", 400);
    const config = lerConfig(c.config) as ConfigTurma | null;
    if (!config) return erro("pedido", 400);
    if (!(await guarda.quota(`criar:${ipH}`, [[5, 60 * MIN], [20, 24 * 60 * MIN]]))) return erro("limite", 429, { "retry-after": "3600" });
    if (!(await registo.reservar(Number(env.ALDEIA_TETO) || 5000))) return erro("teto", 503);
    for (let tentativa = 0; tentativa < 6; tentativa++) {
      const codigo = gerarCodigoTurma();
      const objeto = turmaDO(codigo);
      if (await objeto.existe()) continue;
      const professor = gerarCodigoProfessor();
      const h = await hmacProfessor(professor);
      const r = await objeto.criar({ codigo, hashProfessor: h, config, origem: url.origin });
      if (!r.ok) continue;
      await registo.indexar(h, codigo);
      const token = await assinarToken(env.CHAVE_TOKENS!, { t: codigo, p: "painel", exp: Date.now() + TOKEN_PAINEL_MS });
      return json({ turma: codigo, professor, token }, 201);
    }
    return erro("servidor", 500);
  }

  // ── Professor: entrar no painel com o código do professor ─────────────────
  if (caminho === "/api/aldeia/professor/entrar" && req.method === "POST") {
    if (await guarda.bloqueado(`prof:${ipH}`)) return erro("bloqueado", 429, { "retry-after": "900" });
    const c = await corpo(req);
    const codigo = typeof c?.codigo === "string" ? codigoProfessorValido(c.codigo) : null;
    const turma = codigo ? await registo.procurar(await hmacProfessor(codigo)) : null;
    const certo = turma && codigo ? await turmaDO(turma).professorCerto(await hmacProfessor(codigo)) : false;
    if (!turma || !certo) {
      await guarda.falha(`prof:${ipH}`, 10, 15 * MIN, 15 * MIN);
      await atraso(300);
      return erro("codigo", 401);
    }
    const token = await assinarToken(env.CHAVE_TOKENS!, { t: turma, p: "painel", exp: Date.now() + TOKEN_PAINEL_MS });
    return json({ turma, token });
  }

  // ── Professor: painel (token) ──────────────────────────────────────────────
  if (caminho.startsWith("/api/aldeia/professor")) {
    const cab = req.headers.get("authorization") ?? "";
    const dados = cab.startsWith("Bearer ") ? await lerToken(env.CHAVE_TOKENS!, cab.slice(7).trim(), "painel") : null;
    if (!dados) return erro("token", 401);
    const objeto = turmaDO(dados.t);
    if (caminho === "/api/aldeia/professor" && req.method === "GET") {
      const r = await objeto.painel();
      return r.ok ? json(r.valor) : erro(r.erro, 404);
    }
    if (req.method !== "POST") return erro("metodo", 405, { allow: "POST" });
    if (env.LIMITE_ALDEIA_TURMA && !(await env.LIMITE_ALDEIA_TURMA.limit({ key: dados.t })).success) return erro("limite", 429, { "retry-after": "60" });
    const c = await corpo(req);
    if (!c) return erro("pedido", 400);
    if (caminho === "/api/aldeia/professor/acao") {
      const r = await objeto.acao(c as unknown as AcaoProfessor);
      return r.ok ? json(r.valor) : json({ erro: r.erro, detalhe: r.detalhe }, 400);
    }
    if (caminho === "/api/aldeia/professor/apagar") {
      if (c.confirmar !== dados.t) return erro("pedido", 400);
      await objeto.apagarTudo();
      return json({ ok: true });
    }
    if (caminho === "/api/aldeia/professor/email") {
      const endereco = c.endereco === null ? null : emailValido(c.endereco) ? (c.endereco as string).trim() : undefined;
      if (endereco === undefined || !eFrequencia(c.frequencia) || typeof c.autorizarNome !== "boolean") return erro("pedido", 400);
      const r = await objeto.definirEmail(endereco, c.frequencia, c.autorizarNome);
      if (!r.ok) return erro(r.erro, 429);
      let enviado = false;
      if (r.valor.enviarConfirmacao && endereco) {
        const painel = await objeto.painel();
        const nome = painel.ok ? painel.valor.turma.config.nome || dados.t : dados.t;
        const token = await assinarToken(env.CHAVE_TOKENS!, { t: dados.t, p: "confirmar", e: await sha256(endereco.toLowerCase()), exp: Date.now() + 3 * 24 * 60 * MIN });
        const m = modeloConfirmacao(await textosEmails(env), { turma: nome, url: `${url.origin}/professor/aldeia/email#confirmar=${token}`, origem: url.origin });
        enviado = await enviarEmail(env, { para: endereco, assunto: m.assunto, html: m.html, texto: m.texto });
      }
      return json({ ok: true, confirmacaoEnviada: enviado });
    }
    return erro("rota", 404);
  }

  // ── Ligações dos emails (sem código do professor) ─────────────────────────
  if ((caminho === "/api/aldeia/email/confirmar" || caminho === "/api/aldeia/email/sair") && req.method === "POST") {
    const c = await corpo(req);
    const proposito = caminho.endsWith("confirmar") ? "confirmar" : "sair";
    const d = typeof c?.token === "string" ? await lerToken(env.CHAVE_TOKENS!, c.token, proposito) : null;
    if (!d) return erro("token", 400);
    const objeto = turmaDO(d.t);
    if (proposito === "confirmar") return (await objeto.confirmarEmail(d.e ?? "")) ? json({ ok: true }) : erro("token", 400);
    await objeto.deixarDeReceber();
    return json({ ok: true });
  }

  // ── Alunos ─────────────────────────────────────────────────────────────────
  const m = /^\/api\/aldeia\/t\/([^/]+)(?:\/(alunos|entrar|eu|sair))?$/.exec(caminho);
  if (!m) return erro("rota", 404);
  const codigo = codigoTurmaValido(decodeURIComponent(m[1]));
  const parte = m[2] ?? "";
  // Códigos inválidos e turmas inexistentes respondem igual (forma e tempo); 20 falhas em 10 minutos bloqueiam 15.
  if (await guarda.bloqueado(`turma:${ipH}`)) return erro("bloqueado", 429, { "retry-after": "900" });
  const semTurma = async () => {
    await guarda.falha(`turma:${ipH}`, 20, 10 * MIN, 15 * MIN);
    await atraso(150);
    return erro("turma", 404);
  };
  if (!codigo) return semTurma();
  const objeto = turmaDO(codigo);

  if (parte === "" && req.method === "GET") {
    const r = await objeto.publico();
    if (!r.ok || r.valor.estado === "fechada") return semTurma();
    return json(r.valor);
  }

  if (req.method === "POST" && env.LIMITE_ALDEIA_TURMA && !(await env.LIMITE_ALDEIA_TURMA.limit({ key: codigo })).success) return erro("limite", 429, { "retry-after": "60" });

  if (parte === "alunos" && req.method === "POST") {
    const c = await corpo(req);
    if (!c || typeof c.nome !== "string" || typeof c.fato !== "string" || !MODOS.includes(c.modo as ModoIdentificacao) || Object.keys(c).length !== 3) return erro("pedido", 400);
    const r = await objeto.registar({ nome: c.nome, modo: c.modo as ModoIdentificacao, fato: c.fato });
    if (!r.ok) return r.erro === "turma" || r.erro === "fechada" ? semTurma() : json({ erro: r.erro, detalhe: r.detalhe }, 409);
    return json(r.valor, 201);
  }

  if (parte === "entrar" && req.method === "POST") {
    const chaveFalhas = `nome:${ipH}:${codigo}`;
    if (await guarda.bloqueado(chaveFalhas)) return erro("bloqueado", 429, { "retry-after": "900" });
    const c = await corpo(req);
    if (!c || typeof c.nome !== "string" || !MODOS.includes(c.modo as ModoIdentificacao) || Object.keys(c).length !== 2) return erro("pedido", 400);
    const r = await objeto.entrar({ nome: c.nome, modo: c.modo as ModoIdentificacao });
    if (!r.ok) {
      if (r.erro === "turma" || r.erro === "fechada") return semTurma();
      await guarda.falha(chaveFalhas, 10, 10 * MIN, 15 * MIN);
      await atraso(300);
      return erro("nome-desconhecido", 404);
    }
    return json(r.valor);
  }

  // Pedidos com a chave do dispositivo.
  const cab = req.headers.get("authorization") ?? "";
  const am = /^Aluno ([A-Za-z0-9_-]{1,40})\.([A-Za-z0-9_-]{16,60})$/.exec(cab);
  if (!am) return erro("chave", 401);
  const [, id, chave] = am;

  if (parte === "eu" && req.method === "GET") {
    const r = await objeto.vista(id, chave);
    return r.ok ? json(r.valor) : erro(r.erro === "chave" ? "chave" : "turma", r.erro === "chave" ? 401 : 404);
  }
  if (parte === "eu" && req.method === "POST") {
    if (env.LIMITE_ALDEIA_ALUNO && !(await env.LIMITE_ALDEIA_ALUNO.limit({ key: `${codigo}:${id}` })).success) return erro("limite", 429, { "retry-after": "10" });
    const c = await corpo(req);
    if (!c || !eListaOps(c.ops) || Object.keys(c).length !== 1) return erro("pedido", 400);
    const r = await objeto.aplicar(id, chave, c.ops);
    if (!r.ok) return erro(r.erro, r.erro === "chave" ? 401 : r.erro === "grande" ? 413 : 409);
    return json(r.valor);
  }
  if (parte === "sair" && req.method === "POST") {
    await objeto.sair(id, chave);
    return json({ ok: true });
  }
  return erro("metodo", 405);
}
