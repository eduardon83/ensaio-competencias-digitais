// ─── Aldeia Digital · teste da API real do Worker (Durable Objects) ─────────
// Uso: npm run build && npx wrangler dev --port 8787 --local  (noutro terminal, com .dev.vars)
//      node scripts/aldeia/testar-api.mjs [http://localhost:8787]
// Verifica as rotas, as chaves de dispositivo, o token do painel, os esquemas fechados, os prémios calculados no
// servidor e os bloqueios por falhas. Não usar contra o sítio publicado (cria turmas e provoca bloqueios).
const BASE = (process.argv[2] ?? "http://localhost:8787") + "/api/aldeia";
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
async function pedir(metodo, caminho, corpo, auth, extra = {}) {
  const h = { accept: "application/json", "cf-connecting-ip": extra.ip ?? "10.0.0.1" };
  if (corpo !== undefined) h["content-type"] = extra.tipo ?? "application/json";
  if (auth) h.authorization = auth;
  const r = await fetch(BASE + caminho, { method: metodo, headers: h, body: corpo === undefined ? undefined : typeof corpo === "string" ? corpo : JSON.stringify(corpo) });
  let d = null;
  try {
    d = await r.json();
  } catch {
    /* sem JSON */
  }
  return { estado: r.status, d, cab: r.headers };
}

const fim = new Date();
fim.setUTCDate(fim.getUTCDate() + 30);
const config = {
  nome: "Teste", lugares: 3, nivel: 2, extensao: "completa", escolha: [], dimensoes: ["direitos", "democracia"], identificacao: ["anonimo", "nome"],
  ritmo: "livre", tempo: 1, dataFim: fim.toISOString().slice(0, 10), colecao: "atuais",
};

const est = await pedir("GET", "/estado");
ok(est.estado === 200 && est.d.disponivel === true, "estado: disponível");
ok(est.cab.get("cache-control") === "no-store" && est.cab.get("x-content-type-options") === "nosniff", "cabeçalhos no-store e nosniff");

ok((await pedir("POST", "/turmas", { config })).estado === 400, "criar sem aceitar os termos: 400");
ok((await pedir("POST", "/turmas", { config: { ...config, extra: 1 }, termos: true })).estado === 400, "campos desconhecidos na configuração: 400");
ok((await pedir("POST", "/turmas", "x", undefined, { tipo: "text/plain" })).estado === 400, "corpo que não é JSON: 400");
ok((await pedir("POST", "/turmas", { config, termos: true, enchimento: "x".repeat(20000) })).estado === 400, "corpo acima de 16 kB: 400");
ok((await pedir("PUT", "/turmas", {})).estado === 405, "método fora da lista: 405");
const c = await pedir("POST", "/turmas", { config, termos: true });
ok(c.estado === 201 && /^[A-Z0-9]{7}$/.test(c.d.turma) && /^[A-Z0-9]{13}$/.test(c.d.professor), "turma criada com código e código do professor");
const turma = c.d.turma;

const pub = await pedir("GET", `/t/${turma}`);
ok(pub.estado === 200 && pub.d.lugaresLivres === 3 && !("nome" in pub.d.config), "vista pública sem o nome da turma");
const outra = turma.slice(0, 6) + (turma[6] === "A" ? "B" : "A");
const inv = await pedir("GET", `/t/${outra}`);
ok(inv.estado === 404 && inv.d.erro === "turma", "código com verificação errada: 404 igual a turma inexistente");

const r1 = await pedir("POST", `/t/${turma}/alunos`, { nome: "Raposa Corajosa", modo: "anonimo", fato: "raposa" });
ok(r1.estado === 201 && r1.d.chave && r1.d.vista.aluno.id, "aluno registado e chave devolvida");
ok(!JSON.stringify(r1.d).includes('"chaves"') || !JSON.stringify(r1.d.vista.aluno.chaves).includes(r1.d.chave), "a chave em claro não fica guardada");
const id = r1.d.vista.aluno.id;
const auth = `Aluno ${id}.${r1.d.chave}`;
ok((await pedir("POST", `/t/${turma}/alunos`, { nome: "raposa corajosa", modo: "anonimo", fato: "lince" })).d.erro === "nome-existe", "nome repetido (sem maiúsculas): recusado");
ok((await pedir("POST", `/t/${turma}/alunos`, { nome: "Leo", modo: "numero", fato: "lince" })).d.erro === "modo", "modo de identificação não permitido: recusado");
ok((await pedir("GET", `/t/${turma}/eu`, undefined, `Aluno ${id}.${"x".repeat(22)}`)).estado === 401, "chave errada: 401");
const eu = await pedir("GET", `/t/${turma}/eu`, undefined, auth);
ok(eu.estado === 200 && eu.d.aluno.nome === "Raposa Corajosa", "a minha aldeia com a chave");

const ops = await pedir("POST", `/t/${turma}/eu`, { ops: [{ op: "evento", missao: "nascimento" }, { op: "evento", missao: "tutorial" }, { op: "resultado", id: "a1", missao: "pratica", pontuacao: 88, duracaoMs: 40000 }, { op: "premio", missao: "pratica", item: "chapeu-festa" }] }, auth);
ok(ops.estado === 200 && ops.d.recusadas === 1 && ops.d.vista.aluno.progresso.pratica.melhor === 88, "operações aplicadas; prémio não oferecido recusado");
ok((await pedir("POST", `/t/${turma}/eu`, { ops: [{ op: "resultado", id: "a2", missao: "pratica", pontuacao: 120, duracaoMs: 4000 }] }, auth)).estado === 400, "pontuação fora de 0 a 100: 400");
const ap = { ...eu.d.aluno.aparencia, chapeu: "bone-reporter" };
const vest = await pedir("POST", `/t/${turma}/eu`, { ops: [{ op: "aparencia", valor: ap }] }, auth);
ok(vest.d.recusadas === 1, "vestir um item não ganho: recusado");

// Outro computador: código + nome
const e2 = await pedir("POST", `/t/${turma}/entrar`, { nome: "RAPOSA corajosa", modo: "anonimo" });
ok(e2.estado === 200 && e2.d.chave !== r1.d.chave, "entrar noutro computador dá chave nova");
let bloq = false;
for (let k = 0; k < 11; k++) {
  const r = await pedir("POST", `/t/${turma}/entrar`, { nome: `Lince Veloz`, modo: "anonimo" }, undefined, { ip: "10.0.0.9" });
  if (r.estado === 429) bloq = true;
}
ok(bloq, "10 nomes errados no mesmo IP: bloqueio");

// Professor
let p = await pedir("POST", "/professor/entrar", { codigo: c.d.professor });
ok(p.estado === 200 && p.d.token && p.d.turma === turma, "entrar no painel com o código do professor");
const tok = `Bearer ${p.d.token}`;
const painel = await pedir("GET", "/professor", undefined, tok);
ok(painel.estado === 200 && painel.d.alunos.length === 1 && !JSON.stringify(painel.d).includes('"chaves"') && !JSON.stringify(painel.d).includes("hashProfessor"), "painel sem resumos de chaves nem HMAC");
ok((await pedir("GET", "/professor", undefined, "Bearer abc.def")).estado === 401, "token inválido: 401");
const ren = await pedir("POST", "/professor/acao", { acao: "renovarAluno", aluno: id }, tok);
ok(ren.estado === 200 && (await pedir("GET", `/t/${turma}/eu`, undefined, auth)).estado === 401, "renovar o aluno invalida as chaves");
let bp = false;
for (let k = 0; k < 11; k++) if ((await pedir("POST", "/professor/entrar", { codigo: "2222-2222-2222-2" }, undefined, { ip: "10.0.0.7" })).estado === 429) bp = true;
ok(bp, "10 códigos de professor errados: bloqueio");
ok((await pedir("POST", "/professor/apagar", { confirmar: "XXXXXXX" }, tok)).estado === 400, "apagar exige o código da turma");
ok((await pedir("POST", "/professor/apagar", { confirmar: turma }, tok)).estado === 200, "apagar tudo");
ok((await pedir("GET", `/t/${turma}`)).estado === 404, "turma apagada: 404");
p = await pedir("POST", "/professor/entrar", { codigo: c.d.professor });
ok(p.estado === 401, "o código do professor deixa de servir depois de apagar");

let quota = false;
for (let k = 0; k < 6; k++) if ((await pedir("POST", "/turmas", { config, termos: true }, undefined, { ip: "10.0.0.5" })).estado === 429) quota = true;
ok(quota, "mais de 5 turmas por hora no mesmo IP: recusado");

console.log(falhas ? `\n${falhas} falhas` : "\nTudo certo.");
process.exit(falhas ? 1 : 0);
