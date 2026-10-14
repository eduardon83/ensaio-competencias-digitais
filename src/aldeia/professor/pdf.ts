// ─── Aldeia Digital · PDF para o professor (carregado só ao exportar) ────────
// Código do professor, cartões de entrada (um por lugar), carta aos encarregados de educação e relatórios.
// Texto vetorial com o jsPDF, sem imagens pesadas. As fontes base só têm Latin-1: os textos passam por `limpo`.
import { jsPDF } from "jspdf";
import { AUTORIA } from "../../versao";
import { formatarProfessor, formatarTurma } from "../nucleo/codigos";
import { ALDEIA } from "../textos";

const AZUL: [number, number, number] = [3, 74, 216];
const TINTA: [number, number, number] = [43, 54, 60];
const SUAVE: [number, number, number] = [79, 91, 112];
const limpo = (s: string) => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, "-").replace(/…/g, "...").replace(/·/g, "-").replace(/[^\x20-\xFF\n]/g, "");

class Folha {
  doc = new jsPDF({ unit: "mm", format: "a4" });
  y = 15;
  M = 15;
  L = 180;
  novaPagina(precisa: number) {
    if (this.y + precisa > 282) {
      this.doc.addPage();
      this.y = 15;
    }
  }
  texto(s: string, tam = 11, cor = TINTA, negrito = false) {
    this.doc.setFont("helvetica", negrito ? "bold" : "normal");
    this.doc.setFontSize(tam);
    this.doc.setTextColor(...cor);
    const linhas = this.doc.splitTextToSize(limpo(s), this.L) as string[];
    this.novaPagina(linhas.length * tam * 0.42);
    this.doc.text(linhas, this.M, this.y + tam * 0.35);
    this.y += linhas.length * tam * 0.42 + 2;
  }
  barra(rotulo: string, valor: number, max = 100) {
    this.novaPagina(9);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    this.doc.setTextColor(...TINTA);
    this.doc.text(limpo(rotulo), this.M, this.y + 3.5);
    this.doc.text(String(valor), this.M + this.L, this.y + 3.5, { align: "right" });
    this.doc.setFillColor(225, 228, 234);
    this.doc.rect(this.M, this.y + 5, this.L, 2.2, "F");
    this.doc.setFillColor(...AZUL);
    this.doc.rect(this.M, this.y + 5, (this.L * Math.max(0, Math.min(valor, max))) / max, 2.2, "F");
    this.y += 10;
  }
  rodape() {
    const n = this.doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(...SUAVE);
      this.doc.text(limpo(`${ALDEIA.nome} · Ensaio às Competências Digitais · ${AUTORIA}`), this.M, 290, { maxWidth: 160 });
      this.doc.text(`${i}/${n}`, 195, 290, { align: "right" });
    }
  }
  guardar(nome: string) {
    this.rodape();
    this.doc.save(nome);
  }
}

export function pdfCodigoProfessor(turma: string, professor: string, nome: string) {
  const f = new Folha();
  const C = ALDEIA.professor.criada;
  f.texto(ALDEIA.nome, 20, AZUL, true);
  if (nome) f.texto(nome, 14, TINTA, true);
  f.y += 4;
  f.texto(C.codigoTurma, 11, SUAVE);
  f.texto(formatarTurma(turma), 26, TINTA, true);
  f.y += 4;
  f.texto(C.codigoProfessor, 11, SUAVE);
  f.texto(formatarProfessor(professor), 26, TINTA, true);
  f.y += 2;
  f.texto(C.codigoProfessorAviso, 11);
  f.texto(`${window.location.origin}/professor/aldeia/painel`, 10, SUAVE);
  f.guardar(`aldeia-${turma}-codigo-professor.pdf`);
}

/** Uma folha com cartões recortáveis (um por lugar): código da turma, ligação e espaço para o nome escolhido. */
export function pdfCartoes(turma: string, lugares: number) {
  const f = new Folha();
  const d = f.doc;
  const G = ALDEIA.guardaNome;
  const w = 85;
  const h = 52;
  for (let k = 0; k < lugares; k++) {
    const pos = k % 10;
    if (k && pos === 0) d.addPage();
    const x = 15 + (pos % 2) * (w + 10);
    const y = 12 + Math.floor(pos / 2) * (h + 4);
    d.setDrawColor(150);
    d.setLineDashPattern([1.5, 1.5], 0);
    d.rect(x, y, w, h);
    d.setLineDashPattern([], 0);
    d.setFont("helvetica", "bold");
    d.setFontSize(12);
    d.setTextColor(...AZUL);
    d.text(limpo(ALDEIA.nome), x + 4, y + 8);
    d.setFont("helvetica", "normal");
    d.setFontSize(8);
    d.setTextColor(...SUAVE);
    d.text(limpo(G.codigo), x + 4, y + 15);
    d.setFont("helvetica", "bold");
    d.setFontSize(18);
    d.setTextColor(...TINTA);
    d.text(limpo(formatarTurma(turma)), x + 4, y + 24);
    d.setFont("helvetica", "normal");
    d.setFontSize(8);
    d.setTextColor(...SUAVE);
    d.text(limpo(G.nome), x + 4, y + 32);
    d.line(x + 4, y + 41, x + w - 4, y + 41);
    d.text(limpo(`${window.location.host}/aldeia`), x + 4, y + 48);
  }
  f.guardar(`aldeia-${turma}-cartoes.pdf`);
}

export function pdfCarta(turma: string, nome: string) {
  const f = new Folha();
  const C = ALDEIA.documentos.carta;
  f.texto(C.titulo, 16, AZUL, true);
  if (nome) f.texto(nome, 11, SUAVE);
  f.y += 4;
  f.texto(C.saudacao, 11);
  for (const p of Object.values(C.paragrafos)) f.texto(p, 11);
  f.texto(C.codigo.replace("{codigo}", formatarTurma(turma)), 11, TINTA, true);
  f.y += 4;
  f.texto(C.despedida, 11);
  f.texto(C.assinatura, 11);
  f.guardar(`aldeia-${turma}-carta-encarregados.pdf`);
}

export interface SeccaoRelatorio {
  titulo: string;
  barras?: { rotulo: string; valor: number }[];
  linhas?: string[];
}
export function pdfRelatorio(titulo: string, subtitulo: string, seccoes: SeccaoRelatorio[], ficheiro: string) {
  const f = new Folha();
  f.texto(titulo, 18, AZUL, true);
  f.texto(subtitulo, 10, SUAVE);
  for (const s of seccoes) {
    f.y += 3;
    f.texto(s.titulo, 13, TINTA, true);
    for (const b of s.barras ?? []) f.barra(b.rotulo, b.valor);
    for (const l of s.linhas ?? []) f.texto(l, 10);
  }
  f.y += 4;
  f.texto(ALDEIA.professor.relatorios.aviso, 9, SUAVE);
  f.guardar(ficheiro);
}
