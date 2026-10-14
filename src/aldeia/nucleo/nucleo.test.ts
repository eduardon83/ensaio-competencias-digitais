import { describe, expect, it } from "vitest";
import { codigoProfessorValido, codigoTurmaValido, eCodigoAldeia, formatarProfessor, formatarTurma, gerarCodigoProfessor, gerarCodigoTurma } from "./codigos";
import { ALFABETO as ALFABETO_PROVAS, descodificar } from "../../codigo/codigo";
import { ALFABETO } from "./codigos";
import { fatoDoNomeAnonimo, nomeAnonimo, nomeAnonimoValido, normalizarNome, proporNomesAnonimos, temPalavraImpropria, validarNome } from "./nomes";
import { DESAFIOS, FATOS, ITEM, MISSOES, OFERTAS, capitulosDaTurma, escolhaInicial, fimAnoLetivo, missoesDaTurma, type ConfigTurma } from "./catalogo";
import { desbloqueios, estadoCapitulos, ofertaPara, aparenciaValida } from "./regras";
import { armazemMemoria } from "./armazem";
import { ServicoTurma } from "./servico";
import { eListaOps, lerConfig } from "./esquema";
import { alertas, celulaCsv, resumoTurma } from "./relatorios";
import { assinarToken, lerToken } from "./cripto";
import { aparenciaInicial, type Aluno } from "./modelo";

const CONFIG: ConfigTurma = {
  nome: "5.º B", lugares: 4, nivel: 2, extensao: "completa", escolha: [], dimensoes: ["direitos", "democracia", "sustentabilidade", "financeira"],
  identificacao: ["numero", "nome", "anonimo"], ritmo: "livre", tempo: 1, dataFim: "2027-06-30", colecao: "atuais",
};

describe("códigos da Aldeia", () => {
  it("usam o alfabeto dos códigos de prova", () => expect(ALFABETO).toBe(ALFABETO_PROVAS));
  it("geram 7 e 13 símbolos válidos, sem colidir com os códigos de prova", () => {
    for (let i = 0; i < 200; i++) {
      const t = gerarCodigoTurma();
      expect(t).toHaveLength(7);
      expect(codigoTurmaValido(t)).toBe(t);
      expect(codigoTurmaValido(formatarTurma(t).toLowerCase())).toBe(t);
      expect(descodificar(t)).toBeNull();
      expect(eCodigoAldeia(t)).toBe(true);
      const p = gerarCodigoProfessor();
      expect(codigoProfessorValido(formatarProfessor(p))).toBe(p);
    }
  });
  it("recusam erros de escrita pelo carácter de verificação", () => {
    const t = gerarCodigoTurma();
    const errado = t.slice(0, 2) + (t[2] === "A" ? "B" : "A") + t.slice(3);
    expect(codigoTurmaValido(errado)).toBeNull();
    expect(codigoTurmaValido("ABC")).toBeNull();
  });
});

describe("nomes", () => {
  it("normalizam sem maiúsculas nem acentos", () => {
    expect(normalizarNome("  Raposa   CORAJOSA ")).toBe("raposa corajosa");
    expect(normalizarNome("Inês")).toBe(normalizarNome("ines"));
  });
  it("concordam em género e são reconhecidos", () => {
    expect(nomeAnonimo("raposa", 1)).toBe("Raposa Corajosa");
    expect(nomeAnonimo("lince", 10)).toBe("Lince Veloz");
    expect(nomeAnonimoValido("Raposa Corajosa")).toBe(true);
    expect(nomeAnonimoValido("Raposa Corajoso")).toBe(false);
    expect(fatoDoNomeAnonimo("Cabra-dos-Pirenéus Feliz")).toBe("cabra-pireneus");
    for (const n of proporNomesAnonimos(FATOS.map((f) => f.id), 3)) expect(nomeAnonimoValido(n)).toBe(true);
  });
  it("todos os nomes anónimos possíveis passam o filtro de palavras impróprias", () => {
    for (const f of FATOS) for (let a = 0; a < 15; a++) expect(temPalavraImpropria(nomeAnonimo(f.id, a))).toBe(false);
  });
  it("validam cada modo", () => {
    expect(validarNome("07", "numero")).toEqual({ nome: "7" });
    expect(validarNome("100", "numero")).toEqual({ erro: "numero" });
    expect(validarNome("Ana Maria", "nome")).toEqual({ erro: "palavras" });
    expect(validarNome("Ana\u200B", "nome")).toEqual({ nome: "Ana" });
    expect(validarNome("P0rra", "anonimo")).toEqual({ erro: "forma" });
    expect(validarNome("Porra", "nome")).toEqual({ erro: "improprio" });
    expect(temPalavraImpropria("p0rr4")).toBe(true);
    expect(validarNome("Lince Veloz", "anonimo")).toEqual({ nome: "Lince Veloz" });
    expect(validarNome("Lince <b>", "anonimo")).toEqual({ erro: "forma" });
  });
});

describe("catálogo e história", () => {
  it("os 12 desafios estão todos na história, uma vez", () => {
    for (const s of DESAFIOS) expect(MISSOES.filter((m) => m.conta && m.slug === s)).toHaveLength(1);
  });
  it("as ofertas só usam itens que existem", () => {
    for (const [m, itens] of Object.entries(OFERTAS)) {
      expect(MISSOES.some((x) => x.id === m)).toBe(true);
      for (const i of itens) expect(ITEM.has(i)).toBe(true);
    }
  });
  it("a versão Essencial tem só os 12 desafios e os capítulos fixos", () => {
    const ms = missoesDaTurma({ ...CONFIG, extensao: "essencial" });
    expect(ms.filter((m) => m.tipo === "atividade" && !m.pratica).map((m) => m.slug).sort()).toEqual([...DESAFIOS].sort());
    expect(capitulosDaTurma(ms)).not.toContain(7);
  });
  it("a Personalizada começa igual à Completa e as cidadanias seguem as dimensões", () => {
    const completa = missoesDaTurma(CONFIG).map((m) => m.id);
    const pers = missoesDaTurma({ ...CONFIG, extensao: "personalizada", escolha: escolhaInicial(CONFIG.dimensoes) }).map((m) => m.id);
    expect(pers).toEqual(completa);
    expect(completa).not.toContain("cid-verdade-boato");
    expect(missoesDaTurma({ ...CONFIG, dimensoes: ["media"] }).map((m) => m.id)).toContain("cid-verdade-boato");
  });
  it("o fim do ano letivo é 31 de agosto", () => {
    expect(fimAnoLetivo(new Date("2026-10-13"))).toBe("2027-08-31");
    expect(fimAnoLetivo(new Date("2027-03-01"))).toBe("2027-08-31");
  });
});

describe("regras", () => {
  const vazio = { progresso: {}, treinos: 0, marcos: {} } as Pick<Aluno, "progresso" | "treinos" | "marcos">;
  it("capítulos abrem em sequência (livre) ou pelo professor (guiado)", () => {
    const e = estadoCapitulos(CONFIG, [0], vazio);
    expect(e[0].aberto).toBe(true);
    expect(e[1].aberto).toBe(false);
    const feito = { progresso: Object.fromEntries(e[0].missoes.map((m) => [m.id, { primeira: 80, melhor: 80, ultima: 80, tentativas: 1, duracaoMs: 1, primeiraEm: "", em: "" }])) };
    expect(estadoCapitulos(CONFIG, [0], feito)[1].aberto).toBe(true);
    const guiado = { ...CONFIG, ritmo: "guiado" as const };
    expect(estadoCapitulos(guiado, [0], feito)[1].aberto).toBe(false);
    expect(estadoCapitulos(guiado, [0], feito)[1].aEsperaDoProfessor).toBe(true);
    expect(estadoCapitulos(guiado, [0, 1], feito)[1].aberto).toBe(true);
  });
  it("prémios: só itens da oferta, carimbos com 85, nada dado pelo cliente", () => {
    const p = { primeira: 90, melhor: 90, ultima: 90, tentativas: 1, duracaoMs: 1, primeiraEm: "", em: "" };
    const a = { progresso: { painel: p }, treinos: 0, marcos: {} };
    const d = desbloqueios(a, CONFIG, [0], false);
    expect(d.emblemas).toContain("painel");
    expect(d.trofeus).toContain("taca-painel");
    expect(d.ofertasPendentes).toContain("painel");
    expect(ofertaPara("painel", d)).toEqual(OFERTAS.painel);
    const ap = aparenciaInicial("dinossauro");
    expect(aparenciaValida({ ...ap, chapeu: "bone-reporter" }, ap, d)).toBe(false);
    expect(aparenciaValida({ ...ap, ver: "ver-redondos", emblema: "painel" }, ap, d)).toBe(true);
    expect(aparenciaValida({ ...ap, fato: "lince" }, ap, d)).toBe(false);
  });
});

describe("serviço da turma", () => {
  async function nova(config = CONFIG, agora = new Date("2026-10-13T10:00:00Z")) {
    let relogio = agora;
    const s = new ServicoTurma(armazemMemoria(), () => relogio);
    await s.criar({ codigo: "ABCDEFG", hashProfessor: "h", config });
    return { s, avancar: (ms: number) => (relogio = new Date(relogio.getTime() + ms)) };
  }

  it("nomes únicos sem acentos, fatos únicos, lugares contados", async () => {
    const { s } = await nova();
    const r1 = await s.registar({ nome: "Inês", modo: "nome", fato: "raposa" });
    expect(r1.ok).toBe(true);
    expect((await s.registar({ nome: "ines", modo: "nome", fato: "lince" })).ok).toBe(false);
    expect(await s.registar({ nome: "Rui", modo: "nome", fato: "raposa" })).toMatchObject({ ok: false, erro: "fato-ocupado" });
    await s.registar({ nome: "2", modo: "numero", fato: "lince" });
    await s.registar({ nome: "Lobo Sábio", modo: "anonimo", fato: "lobo" });
    await s.registar({ nome: "Rui", modo: "nome", fato: "gato" });
    expect(await s.registar({ nome: "Ana", modo: "nome", fato: "cao" })).toMatchObject({ ok: false, erro: "sem-lugar" });
    expect((await s.turma())!.semLugarEm).toBeTruthy();
    const pub = await s.publico();
    expect(pub.ok && pub.valor.lugaresLivres).toBe(0);
    expect(JSON.stringify(pub)).not.toContain("Inês");
  });

  it("chave de dispositivo: autentica, outro computador recebe chave nova, sair invalida", async () => {
    const { s } = await nova();
    const r = await s.registar({ nome: "Ana", modo: "nome", fato: "raposa" });
    if (!r.ok) throw new Error();
    const id = r.valor.vista.aluno.id;
    expect(await s.autenticar(id, r.valor.chave)).toBeTruthy();
    expect(await s.autenticar(id, "errada")).toBeNull();
    const e = await s.entrar({ nome: "ANA", modo: "nome" });
    if (!e.ok) throw new Error();
    expect(await s.autenticar(id, e.valor.chave)).toBeTruthy();
    expect((await s.vista(id)).ok && (await s.vista(id) as { ok: true; valor: { aluno: Aluno } }).valor.aluno.entradas).toHaveLength(1);
    await s.sair(id, r.valor.chave);
    expect(await s.autenticar(id, r.valor.chave)).toBeNull();
    expect(await s.autenticar(id, e.valor.chave)).toBeTruthy();
    expect((await s.entrar({ nome: "Zé", modo: "nome" })).ok).toBe(false);
  });

  it("progresso monótono, repetições da fila ignoradas, capítulos fechados recusados", async () => {
    const { s } = await nova();
    const r = await s.registar({ nome: "Ana", modo: "nome", fato: "raposa" });
    if (!r.ok) throw new Error();
    const id = r.valor.vista.aluno.id;
    let v = await s.aplicar(id, [{ op: "resultado", id: "x1", missao: "painel", pontuacao: 90, duracaoMs: 60000 }]);
    expect(v.ok && v.valor.recusadas).toBe(1); // capítulo 1 ainda fechado
    v = await s.aplicar(id, [
      { op: "evento", missao: "nascimento" },
      { op: "evento", missao: "tutorial" },
      { op: "resultado", id: "p1", missao: "pratica", pontuacao: 40, duracaoMs: 30000 },
      { op: "resultado", id: "a1", missao: "painel", pontuacao: 60, duracaoMs: 60000 },
      { op: "resultado", id: "a2", missao: "painel", pontuacao: 90, duracaoMs: 50000 },
      { op: "resultado", id: "a2", missao: "painel", pontuacao: 90, duracaoMs: 50000 },
      { op: "resultado", id: "a3", missao: "painel", pontuacao: 30, duracaoMs: 50000 },
      { op: "resultado", id: "a4", missao: "painel", pontuacao: 99, duracaoMs: 500 },
    ]);
    if (!v.ok) throw new Error(v.erro);
    const p = v.valor.vista.aluno.progresso.painel;
    expect(p).toMatchObject({ primeira: 60, melhor: 90, ultima: 30, tentativas: 3 });
    expect(v.valor.recusadas).toBe(1); // duração impossível
    // prémio: só um item da oferta, uma vez
    const fora = await s.aplicar(id, [{ op: "premio", missao: "painel", item: "chapeu-festa" }]);
    expect(fora.ok && fora.valor.recusadas).toBe(1);
    const certo = await s.aplicar(id, [{ op: "premio", missao: "painel", item: OFERTAS.painel[0] }, { op: "premio", missao: "painel", item: OFERTAS.painel[1] }]);
    expect(certo.ok && certo.valor.recusadas).toBe(1);
    const ap = { ...aparenciaInicial("raposa"), chapeu: OFERTAS.painel[0] };
    const vest = await s.aplicar(id, [{ op: "aparencia", valor: ap }]);
    expect(vest.ok && vest.valor.vista.aluno.aparencia.chapeu).toBe(OFERTAS.painel[0]);
  });

  it("professor: renomear, renovar, apagar, abrir capítulo, aumentar lugares", async () => {
    const { s } = await nova({ ...CONFIG, ritmo: "guiado" });
    const r = await s.registar({ nome: "Ana", modo: "nome", fato: "raposa" });
    if (!r.ok) throw new Error();
    const id = r.valor.vista.aluno.id;
    expect((await s.acao({ acao: "renomear", aluno: id, nome: "Bia" })).ok).toBe(true);
    expect((await s.entrar({ nome: "Bia", modo: "nome" })).ok).toBe(true);
    await s.acao({ acao: "renovarAluno", aluno: id });
    expect(await s.autenticar(id, r.valor.chave)).toBeNull();
    expect((await s.acao({ acao: "lugares", lugares: 2 })).ok).toBe(false);
    expect((await s.acao({ acao: "lugares", lugares: 10 })).ok).toBe(true);
    const ab = await s.acao({ acao: "abrirCapitulo", capitulo: 1 });
    expect(ab.ok && ab.valor.turma.capitulosAbertos).toEqual([0, 1]);
    const painel = await s.painel();
    expect(JSON.stringify(painel)).not.toContain('"chaves"');
    await s.acao({ acao: "apagarAluno", aluno: id });
    expect((await s.painel()).ok && ((await s.painel()) as { ok: true; valor: { alunos: unknown[] } }).valor.alunos).toHaveLength(0);
  });

  it("apaga a turma 30 dias depois do fim e sem alunos ao fim de 14 dias", async () => {
    const { s, avancar } = await nova({ ...CONFIG, dataFim: "2026-10-20" });
    avancar(15 * 86400000);
    expect((await s.aoAlarme()).apagada).toBe(true);
    const outra = await nova({ ...CONFIG, dataFim: "2026-10-20" });
    await outra.s.registar({ nome: "Ana", modo: "nome", fato: "raposa" });
    outra.avancar(20 * 86400000);
    expect((await outra.s.aoAlarme()).apagada).toBe(false);
    expect((await outra.s.publico()).ok && ((await outra.s.publico()) as { ok: true; valor: { estado: string } }).valor.estado).toBe("fechada");
    outra.avancar(30 * 86400000);
    expect((await outra.s.aoAlarme()).apagada).toBe(true);
  });

  it("email: 3 pedidos de confirmação por dia, resumo semanal só confirmado, 1 por dia", async () => {
    const { s, avancar } = await nova();
    await s.registar({ nome: "Ana", modo: "nome", fato: "raposa" });
    expect((await s.definirEmail("prof@escola.pt", "semanal", false)).ok).toBe(true);
    await s.definirEmail("prof@escola.pt", "semanal", false);
    await s.definirEmail("prof@escola.pt", "semanal", false);
    const quarto = await s.definirEmail("prof@escola.pt", "semanal", false);
    expect(quarto.ok && quarto.valor.enviarConfirmacao).toBe(false);
    avancar(8 * 86400000);
    expect((await s.aoAlarme()).resumo).toBeNull(); // por confirmar
    const { sha256 } = await import("./cripto");
    expect(await s.confirmarEmail(await sha256("prof@escola.pt"))).toBe(true);
    const r = await s.aoAlarme();
    expect(r.resumo?.endereco).toBe("prof@escola.pt");
    expect(JSON.stringify(r.resumo)).not.toContain("Ana"); // primeiro nome só com autorização
    await s.registarEnvio(r.resumo!.chaves);
    expect((await s.aoAlarme()).resumo).toBeNull();
  });
});

describe("esquemas, tokens e relatórios", () => {
  it("recusam campos desconhecidos e valores fora do intervalo", () => {
    expect(eListaOps([{ op: "resultado", id: "a", missao: "painel", pontuacao: 101, duracaoMs: 5000 }])).toBe(false);
    expect(eListaOps([{ op: "resultado", id: "a", missao: "painel", pontuacao: 50, duracaoMs: 5000, extra: 1 }])).toBe(false);
    expect(eListaOps([{ op: "jornal" }])).toBe(true);
    expect(lerConfig({ ...CONFIG, lugares: 33 })).toBeNull();
    expect(lerConfig({ ...CONFIG, dataFim: "2030-01-01" }, false, new Date("2026-10-13"))).toBeNull();
    expect(lerConfig(CONFIG, false, new Date("2026-10-13"))).toEqual(CONFIG);
  });
  it("tokens assinados expiram e não servem para outro fim", async () => {
    const tk = await assinarToken("segredo", { t: "ABCDEFG", p: "painel", exp: Date.now() + 1000 });
    expect(await lerToken("segredo", tk, "painel")).toMatchObject({ t: "ABCDEFG" });
    expect(await lerToken("outro", tk, "painel")).toBeNull();
    expect(await lerToken("segredo", tk, "sair")).toBeNull();
    expect(await lerToken("segredo", tk, "painel", Date.now() + 5000)).toBeNull();
  });
  it("alertas e resumo da turma", () => {
    const agora = new Date("2026-11-01T10:00:00Z");
    const t = { config: CONFIG, capitulosAbertos: [0], criadoEm: "2026-10-01T10:00:00Z" };
    const base = { nome: "x", lugar: 1, aparencia: aparenciaInicial("raposa"), treinos: 0, marcos: {} };
    const ativo = { ...base, id: "a", criadoEm: "2026-10-01T10:00:00Z", progresso: { nascimento: { primeira: 100, melhor: 100, ultima: 100, tentativas: 1, duracaoMs: 0, primeiraEm: "", em: "2026-10-31T10:00:00Z" } }, recentes: [] };
    const parado = { ...base, id: "b", criadoEm: "2026-10-01T10:00:00Z", progresso: {}, recentes: [{ m: "a", p: 10, em: "1" }, { m: "b", p: 20, em: "2" }, { m: "c", p: 30, em: "3" }] };
    const al = alertas(t, [ativo, parado], agora);
    expect(al.find((x) => x.tipo === "parado")?.alunos).toEqual(["b"]);
    expect(al.find((x) => x.tipo === "dificuldade")?.alunos).toEqual(["b"]);
    const r = resumoTurma(t, [ativo, parado], agora);
    expect(r.ativos7).toBe(1);
    expect(r.apoio.map((x) => x.id)).toEqual(["b"]);
    expect(celulaCsv("=SOMA(1)")).toBe("'=SOMA(1)");
  });
});
