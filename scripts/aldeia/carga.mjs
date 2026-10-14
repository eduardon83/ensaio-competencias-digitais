// ─── Aldeia Digital · teste de carga (Worker local) ──────────────────────────
// Uso: npx wrangler dev --port 8787 --local   e depois
//      node scripts/aldeia/carga.mjs [http://127.0.0.1:8787] [turmas=50] [alunos=32] [rondas=6]
// Cada aluno entra, abre a aldeia e envia rondas de operações (resultado, treino, roupa, casa), como numa aula,
// com intervalos de 2 a 4 s. Mede pedidos, erros, 429 (limites) e latências. Não correr contra o sítio publicado.
const BASE = (process.argv[2] ?? "http://127.0.0.1:8787") + "/api/aldeia";
const TURMAS = Number(process.argv[3] ?? 50);
const ALUNOS = Number(process.argv[4] ?? 32);
const RONDAS = Number(process.argv[5] ?? 6);
const lat = [];
const estados = new Map();
let n = 0;
async function pedir(metodo, caminho, corpo, auth, ip) {
  const t0 = performance.now();
  const h = { "content-type": "application/json", "cf-connecting-ip": ip };
  if (auth) h.authorization = auth;
  let estado = 0;
  let d = null;
  try {
    const r = await fetch(BASE + caminho, { method: metodo, headers: h, body: corpo ? JSON.stringify(corpo) : undefined });
    estado = r.status;
    d = await r.json().catch(() => null);
  } catch {
    estado = -1;
  }
  lat.push(performance.now() - t0);
  estados.set(estado, (estados.get(estado) ?? 0) + 1);
  n++;
  return { estado, d };
}
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fim = new Date(Date.now() + 40 * 86400000).toISOString().slice(0, 10);
const config = { nome: "Carga", lugares: ALUNOS, nivel: 2, extensao: "completa", escolha: [], dimensoes: ["direitos", "democracia"], identificacao: ["numero"], ritmo: "livre", tempo: 1, dataFim: fim, colecao: "atuais" };
const FATOS = ["dinossauro", "lince", "lobo", "golfinho", "esquilo", "polvo", "ourico", "coelho", "gato", "cao", "urso", "panda", "pinguim", "leao", "tigre", "elefante", "camaleao", "dragao", "andorinha", "raposa", "coruja", "tartaruga", "baleia", "abelha", "girafa", "lontra", "zebra", "ra", "foca", "joaninha", "lula", "gaivota"];

console.log(`Carga: ${TURMAS} turmas × ${ALUNOS} alunos × ${RONDAS} rondas`);
const t0 = performance.now();
const turmas = [];
for (let k = 0; k < TURMAS; k++) {
  const r = await pedir("POST", "/turmas", { config, termos: true }, undefined, `10.50.${Math.floor(k / 9)}.${k % 9}`);
  if (r.estado === 201) turmas.push(r.d.turma);
}
console.log(`turmas criadas: ${turmas.length}`);

let falhasAplicar = 0;
let recusadas = 0;
async function aluno(t, k, escola) {
  const ip = `10.60.${escola}.1`; // a turma inteira sai pelo mesmo IP da escola (NAT)
  const r = await pedir("POST", `/t/${t}/alunos`, { nome: String(k + 1), modo: "numero", fato: FATOS[k % FATOS.length] }, undefined, ip);
  if (r.estado !== 201) return;
  const auth = `Aluno ${r.d.vista.aluno.id}.${r.d.chave}`;
  await pedir("GET", `/t/${t}/eu`, undefined, auth, ip);
  const ap = r.d.vista.aluno.aparencia;
  const filas = [
    [{ op: "evento", missao: "nascimento" }, { op: "aparencia", valor: { ...ap, pele: "pele-3" } }],
    [{ op: "evento", missao: "tutorial" }],
    [{ op: "resultado", id: `${k}a`, missao: "pratica", pontuacao: 40 + (k % 60), duracaoMs: 45000 }],
    [{ op: "resultado", id: `${k}b`, missao: "painel", pontuacao: 30 + (k % 70), duracaoMs: 90000 }],
    [{ op: "treino", id: `${k}c`, missao: "pratica" }, { op: "resultado", id: `${k}d`, missao: "teclas", pontuacao: 75, duracaoMs: 60000 }],
    [{ op: "resultado", id: `${k}e`, missao: "painel", pontuacao: 95, duracaoMs: 80000 }],
  ];
  for (let ronda = 0; ronda < RONDAS; ronda++) {
    await espera(2000 + Math.random() * 2000);
    const ops = filas[ronda % filas.length];
    let tentativas = 0;
    for (;;) {
      const x = await pedir("POST", `/t/${t}/eu`, { ops }, auth, ip);
      if (x.estado === 200) {
        recusadas += x.d.recusadas;
        break;
      }
      if (x.estado === 429 && tentativas++ < 3) {
        await espera(4000);
        continue;
      }
      falhasAplicar++;
      break;
    }
  }
}
await Promise.all(turmas.flatMap((t, e) => Array.from({ length: ALUNOS }, (_, k) => espera(Math.random() * 3000).then(() => aluno(t, k, e)))));
const dur = (performance.now() - t0) / 1000;
lat.sort((a, b) => a - b);
const q = (p) => Math.round(lat[Math.min(lat.length - 1, Math.floor(lat.length * p))]);
console.log(`pedidos: ${n} em ${dur.toFixed(1)} s (${Math.round(n / dur)}/s)`);
console.log(`estados: ${[...estados.entries()].map(([k, v]) => `${k}=${v}`).join(" ")}`);
console.log(`latência: p50 ${q(0.5)} ms · p95 ${q(0.95)} ms · p99 ${q(0.99)} ms · máx ${Math.round(lat[lat.length - 1])} ms`);
console.log(`operações recusadas pelas regras: ${recusadas} · lotes que falharam: ${falhasAplicar}`);
process.exit(falhasAplicar || estados.get(500) || estados.get(-1) ? 1 : 0);
