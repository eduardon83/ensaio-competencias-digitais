// ─── Observatório: relatório em PDF (carregado só ao exportar) ────────────────
// Texto e gráficos vetoriais com o jsPDF (sem imagens do ecrã): o PDF fica leve, pesquisável e legível por leitores.
// As fontes base do PDF só têm Latin-1: os textos passam por `limpo` para trocar caracteres que não existem nelas.
import { jsPDF } from "jspdf";
import type { Agregados } from "./observatorio";
import { AUTORIA, VERSAO } from "../versao";

const AZUL: [number, number, number] = [3, 74, 216];
const TINTA: [number, number, number] = [43, 54, 60];
const SUAVE: [number, number, number] = [79, 91, 112];

const limpo = (s: string) => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, "-").replace(/…/g, "...").replace(/→/g, "->").replace(/≈/g, "~");

export interface SeccaoPdf {
  titulo: string;
  linhas: { rotulo: string; valor: number; nota?: string }[];
  max?: number;
}

export function gerarRelatorioPdf(a: Agregados, filtros: string[], seccoes: SeccaoPdf[], tempo: { titulo: string; pontos: { rotulo: string; valor: number }[] }): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const M = 15;
  const L = 210 - 2 * M;
  let y = M;
  const novaPagina = (precisa: number) => {
    if (y + precisa > 282) {
      doc.addPage();
      y = M;
    }
  };
  const texto = (s: string, tam: number, cor = TINTA, negrito = false, x = M, largura = L) => {
    doc.setFont("helvetica", negrito ? "bold" : "normal");
    doc.setFontSize(tam);
    doc.setTextColor(...cor);
    const linhas = doc.splitTextToSize(limpo(s), largura) as string[];
    novaPagina(linhas.length * tam * 0.42);
    doc.text(linhas, x, y + tam * 0.35);
    y += linhas.length * tam * 0.42 + 1;
  };

  // Cabeçalho
  doc.setFillColor(...AZUL);
  doc.rect(0, 0, 210, 8, "F");
  y = 16;
  texto("Ensaio às Competências Digitais", 18, TINTA, true);
  texto("Observatório · relatório de estatísticas anónimas", 12, SUAVE);
  y += 2;
  texto(`Gerado em ${new Date(a.gerado_em).toLocaleString("pt-PT")} · versão ${VERSAO} · ${a.limiar > 1 ? `grupos com menos de ${a.limiar} tentativas ocultos` : "sem limiar de ocultação"}`, 9, SUAVE);
  for (const f of filtros) texto(f, 9, SUAVE);
  y += 3;

  // Resumo em caixas
  const caixas: [string, string][] = [
    ["Tentativas", a.abaixo_limiar && a.limiar > 1 ? `< ${a.limiar}` : String(a.total_tentativas)],
    ["Testes completos", String(a.total_testes)],
    ["Navegadores", a.abaixo_limiar && a.limiar > 1 ? "-" : String(a.sessoes)],
    ["Média geral", a.media_geral === null ? "-" : String(a.media_geral)],
  ];
  const lc = (L - 9) / 4;
  caixas.forEach(([r, v], i) => {
    const x = M + i * (lc + 3);
    doc.setDrawColor(225, 228, 234);
    doc.roundedRect(x, y, lc, 18, 2, 2, "S");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...SUAVE);
    doc.text(r, x + 3, y + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...TINTA);
    doc.text(v, x + 3, y + 14);
  });
  y += 25;

  // Secções com barras horizontais
  for (const s of seccoes) {
    if (!s.linhas.length) continue;
    novaPagina(14 + Math.min(s.linhas.length, 4) * 7);
    texto(s.titulo, 12, TINTA, true);
    y += 1;
    const max = s.max ?? Math.max(1, ...s.linhas.map((l) => l.valor));
    const xr = M + 62;
    const lb = L - 62 - 26;
    for (const l of s.linhas) {
      novaPagina(7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...TINTA);
      const rot = limpo(l.rotulo);
      doc.text(rot.length > 38 ? rot.slice(0, 37) + "..." : rot, M, y + 4);
      doc.setFillColor(...AZUL);
      doc.rect(xr, y + 0.8, Math.max(0.6, (lb * l.valor) / max), 4, "F");
      doc.setFont("helvetica", "bold");
      doc.text(String(l.valor), xr + Math.max(0.6, (lb * l.valor) / max) + 2, y + 4);
      if (l.nota) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...SUAVE);
        doc.text(limpo(l.nota), M + L, y + 4, { align: "right" });
      }
      y += 6.5;
    }
    y += 4;
  }

  // Colunas ao longo do tempo
  if (tempo.pontos.length) {
    novaPagina(70);
    texto(tempo.titulo, 12, TINTA, true);
    const ps = tempo.pontos.slice(-36);
    const max = Math.max(1, ...ps.map((p) => p.valor));
    const h = 45;
    const base = y + h + 2;
    const passo = L / ps.length;
    const lcol = Math.max(1, Math.min(10, passo - 1.5));
    doc.setDrawColor(225, 228, 234);
    doc.line(M, base, M + L, base);
    const cada = Math.max(1, Math.ceil(ps.length / 12));
    ps.forEach((p, i) => {
      const hh = Math.max(0.4, (h * p.valor) / max);
      const x = M + i * passo + (passo - lcol) / 2;
      doc.setFillColor(...AZUL);
      doc.rect(x, base - hh, lcol, hh, "F");
      doc.setFontSize(7);
      doc.setTextColor(...SUAVE);
      if (i % cada === 0) doc.text(p.rotulo, x + lcol / 2, base + 4, { align: "center" });
      if (ps.length <= 16) {
        doc.setTextColor(...TINTA);
        doc.text(String(p.valor), x + lcol / 2, base - hh - 1, { align: "center" });
      }
    });
    y = base + 10;
  }

  // Rodapé em todas as páginas
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...SUAVE);
    doc.text(limpo(`Ensaio às Competências Digitais, desenvolvido por ${AUTORIA}. Dados anónimos; as pontuações descrevem o desempenho no ECD e não são uma certificação.`), M, 290, { maxWidth: L - 20 });
    doc.text(`${i}/${n}`, M + L, 290, { align: "right" });
  }
  return doc.output("blob");
}
