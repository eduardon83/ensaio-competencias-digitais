import { describe, expect, it } from "vitest";
import { linhaAlerta, modeloConfirmacao, modeloResumo, ricoHtml } from "./emails";
import { ALDEIA_EMAILS } from "./textos-emails";

describe("emails da Aldeia", () => {
  it("escapam o HTML e só aceitam negrito e ligações para o próprio sítio", () => {
    const h = ricoHtml('**olá** <script>x</script> [painel](/professor) [mau](https://mau.example) "a"', "https://ecd.example");
    expect(h).toContain("<strong>olá</strong>");
    expect(h).toContain("&lt;script&gt;");
    expect(h).toContain('href="https://ecd.example/professor"');
    expect(h).not.toContain("mau.example\"");
    expect(h).toContain("&quot;a&quot;");
  });
  it("confirmação e resumo com texto alternativo e ligação para deixar de receber", () => {
    const c = modeloConfirmacao(ALDEIA_EMAILS, { turma: "5.º <B>", url: "https://ecd.example/professor/aldeia/email#confirmar=x", origem: "https://ecd.example" });
    expect(c.assunto).toContain("5.º <B>");
    expect(c.html).toContain("5.º &lt;B&gt;");
    expect(c.texto).toContain("#confirmar=x");
    const r = modeloResumo(
      ALDEIA_EMAILS,
      {
        endereco: "p@e.pt", frequencia: "semanal", turma: { codigo: "ABCDEFG", nome: "", dataFim: "2027-06-30" },
        resumo: { alunos: 20, ativos7: 18, missoesSemana: 40, capituloMaioria: 2, terminaram: 0 },
        alertas: [{ tipo: "parado", chave: "k", alunos: ["a", "b"], identificadores: ["N.º 3", "Lince Veloz"], dias: 7 }], chaves: ["k"],
      },
      { painel: "https://ecd.example/professor/aldeia/painel", sair: "https://ecd.example/professor/aldeia/email#sair=y", origem: "https://ecd.example" },
    );
    expect(r.assunto).toBe("Resumo semanal da Aldeia · ABC·DEFG");
    expect(r.html).toContain("2 alunos sem atividade há 7 dias: N.º 3, Lince Veloz.");
    expect(r.html).toContain("#sair=y");
    expect(r.texto).toContain("Deixar de receber");
    expect(r.html).not.toMatch(/<img/);
  });
  it("frase de cada tipo de alerta", () => {
    expect(linhaAlerta(ALDEIA_EMAILS, { tipo: "capitulo", chave: "", alunos: [], identificadores: [], capitulo: 3 })).toContain("capítulo 3");
    expect(linhaAlerta(ALDEIA_EMAILS, { tipo: "fecho", chave: "", alunos: [], identificadores: [], dias: 5 })).toContain("5 dias");
  });
});
