import { describe, expect, it } from "vitest";
import { semente } from "../motor/aleatorio";
import { MENSAGENS, sortearMensagens } from "./fraude";
import { avaliarSenha, SITUACOES } from "./boas-praticas";
import { PUBLICACOES, SITUACOES_REDES } from "./redes";
import { TEMAS } from "./conteudo";
import { dominioPrincipal, enganadores, gerarEnderecos, PEDIDOS, SITIOS, SITUACOES_NAVEGACAO } from "./privacidade";
import { ACOES, gerarRedes, LOCAIS, pontuarAcoes, SITUACOES_PUBLICOS } from "./publicos";
import { AFIRMACOES, gerarPainel, pegiParaIdade, SITUACOES_FAMILIA } from "./familia";
import { TESTES_SEGURANCA } from ".";

const MARCAS_REAIS = /\b(cgd|millennium|novo banco|santander|bpi|ctt|mbway|mb way|netflix|amazon|paypal|worten|fnac|google|microsoft|apple|facebook|instagram|tiktok|whatsapp business)\b/i;

describe("Segurança: conteúdos", () => {
  it("seis temas, cada um com um teste registado", () => {
    // Ordem fixa: as chaves dos textos editados no backoffice usam índices.
    expect(TEMAS.map((t) => t.id)).toEqual(["boas-praticas", "fraude", "redes-sociais", "privacidade", "publicos", "familia"]);
    for (const t of TEMAS) expect(TESTES_SEGURANCA[t.id].slug).toBe(t.teste.slug);
    for (const d of Object.values(TESTES_SEGURANCA)) expect(d.numero).toBeGreaterThanOrEqual(200);
  });
  it("os exemplos não usam marcas reais", () => {
    for (const m of MENSAGENS) expect(`${m.de} ${m.assunto ?? ""} ${m.corpo}`, m.id).not.toMatch(MARCAS_REAIS);
    for (const p of PUBLICACOES) expect(`${p.autor} ${p.texto}`, p.id).not.toMatch(MARCAS_REAIS);
    for (const t of [...SITIOS.map((x) => `${x.nome} ${x.dominio}`), ...PEDIDOS.map((x) => `${x.sitio} ${x.endereco}`), ...LOCAIS.map((x) => `${x.local} ${x.rede}`)]) expect(t).not.toMatch(MARCAS_REAIS);
    for (const t of TEMAS) for (const sec of t.secoes) for (const p of sec.pontos) expect(p).not.toMatch(MARCAS_REAIS);
  });
});

describe("O Email Desconfiado", () => {
  it("cada fraude tem sinais e as legítimas não", () => {
    for (const m of MENSAGENS) expect(m.sinais.length > 0, m.id).toBe(m.fraude);
  });
  it("o sorteio mistura legítimas e fraudes e não repete", () => {
    for (let s = 1; s <= 30; s++) {
      const ms = sortearMensagens(6, semente(s));
      expect(new Set(ms.map((m) => m.id)).size).toBe(6);
      expect(ms.some((m) => m.fraude)).toBe(true);
      expect(ms.some((m) => !m.fraude)).toBe(true);
    }
  });
});

describe("Boas práticas", () => {
  const cfg = { minimo: 12, exigeTipos: 3, proibeNome: true };
  it("a palavra-passe forte cumpre todas as regras e as fracas não", () => {
    expect(avaliarSenha("Bicicleta-azul-come-7", cfg, "Rita").every((r) => r.ok)).toBe(true);
    expect(avaliarSenha("123456", cfg, "Rita").every((r) => r.ok)).toBe(false);
    expect(avaliarSenha("Rita-2012-Rita!", cfg, "Rita").every((r) => r.ok)).toBe(false);
  });
  it("as situações têm a resposta certa distinta das outras", () => {
    for (const s of [...SITUACOES, ...SITUACOES_REDES, ...SITUACOES_NAVEGACAO, ...SITUACOES_PUBLICOS, ...SITUACOES_FAMILIA]) expect(new Set(s.opcoes).size).toBe(s.opcoes.length);
  });
});

describe("Verdade ou Boato?", () => {
  it("há publicações dos três tipos, todas com fontes e explicação", () => {
    for (const v of ["verdadeiro", "falso", "enganador"]) expect(PUBLICACOES.filter((p) => p.veredicto === v).length).toBeGreaterThanOrEqual(2);
    for (const p of PUBLICACOES) {
      expect(p.fontes.length).toBeGreaterThan(0);
      if (p.chave === "imagem") expect(p.imagem).toBeDefined();
    }
  });
});

describe("O Endereço Certo", () => {
  it("lê o domínio principal", () => {
    expect(dominioPrincipal("https://www.bancohorizonte.pt/entrar")).toBe("bancohorizonte.pt");
    expect(dominioPrincipal("https://bancohorizonte.pt.verificar-conta.com/entrar")).toBe("verificar-conta.com");
    expect(dominioPrincipal("http://user@loja.exemplo.com.pt:8080/a?b=c")).toBe("exemplo.com.pt");
  });
  it("nenhum enganador leva ao domínio oficial", () => {
    for (const s of SITIOS) for (const e of enganadores(s.dominio, s.caminho, true)) expect(dominioPrincipal(e), e).not.toBe(s.dominio);
  });
  it("cada pergunta tem exatamente uma ligação oficial, sem repetições, em todos os níveis", () => {
    for (let k = 1; k <= 30; k++)
      for (const cfg of [{ enderecos: 3, opcoes: 3, subdominios: false, permissoes: 0, situacoes: 0 }, { enderecos: 5, opcoes: 4, subdominios: true, permissoes: 0, situacoes: 0 }]) {
        const qs = gerarEnderecos(cfg, semente(k));
        expect(qs.length).toBe(cfg.enderecos);
        for (const q of qs) {
          expect(q.opcoes.length).toBe(cfg.opcoes);
          expect(new Set(q.opcoes).size).toBe(q.opcoes.length);
          expect(q.opcoes.filter((o) => dominioPrincipal(o) === q.dominio)).toEqual([q.opcoes[q.certa]]);
        }
      }
  });
  it("há pedidos a permitir e a bloquear", () => {
    expect(PEDIDOS.some((p) => p.permitir) && PEDIDOS.some((p) => !p.permitir)).toBe(true);
  });
});

describe("Na Biblioteca", () => {
  it("cada lista de redes tem uma só oficial, com o nome do cartaz, e nomes distintos", () => {
    for (let k = 1; k <= 30; k++)
      for (const l of LOCAIS)
        for (const n of [3, 6]) {
          const rs = gerarRedes(l, n, semente(k));
          expect(rs.length).toBe(n);
          expect(rs.filter((w) => w.oficial).map((w) => w.nome)).toEqual([l.rede]);
          expect(rs.filter((w) => w.nome === l.rede).length).toBe(1);
          expect(new Set(rs.map((w) => w.nome)).size).toBe(n);
        }
  });
  it("antes de sair: tudo certo dá 100 %, marcar errado desconta", () => {
    expect(pontuarAcoes(ACOES, ACOES.map((a) => a.certo))).toBe(1);
    expect(pontuarAcoes(ACOES, ACOES.map(() => true))).toBeLessThan(1);
    expect(pontuarAcoes(ACOES, ACOES.map(() => false))).toBe(0);
    expect(ACOES.filter((a) => a.certo).length).toBeGreaterThanOrEqual(6);
    expect(ACOES.filter((a) => !a.certo).length).toBeGreaterThanOrEqual(3);
  });
});

describe("O Acordo da Família", () => {
  it("PEGI máximo pela idade", () => {
    expect([6, 7, 11, 12, 15, 16, 18].map(pegiParaIdade)).toEqual([3, 7, 7, 12, 12, 16, 18]);
  });
  it("o painel nunca começa cumprido e há mitos e factos", () => {
    for (let k = 1; k <= 30; k++) {
      const p = gerarPainel(4, semente(k));
      expect(p.defs.some((d) => p.inicial[d.id] !== d.ligado)).toBe(true);
      expect(p.idade).toBeGreaterThanOrEqual(6);
      expect(p.idade).toBeLessThanOrEqual(15);
    }
    expect(AFIRMACOES.some((a) => a.facto) && AFIRMACOES.some((a) => !a.facto)).toBe(true);
  });
});
