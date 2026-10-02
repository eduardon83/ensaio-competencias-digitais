# Gera README.pdf a partir de README.txt (pip install reportlab). Uso: python scripts/gerar-readme-pdf.py
# Fontes Arial/Consolas do Windows; noutros sistemas, trocar os caminhos em F.
import io, re, os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Preformatted
from reportlab.lib.styles import ParagraphStyle
from xml.sax.saxutils import escape

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # raiz do projeto
F = r"C:\Windows\Fonts"
pdfmetrics.registerFont(TTFont("Corpo", os.path.join(F, "arial.ttf")))
pdfmetrics.registerFont(TTFont("CorpoB", os.path.join(F, "arialbd.ttf")))
pdfmetrics.registerFont(TTFont("Mono", os.path.join(F, "consola.ttf")))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily("Corpo", normal="Corpo", bold="CorpoB")

ACENTO = colors.HexColor("#0f6b73")
TINTA = colors.HexColor("#14232e")
SUAVE = colors.HexColor("#566673")
st_titulo = ParagraphStyle("t", fontName="CorpoB", fontSize=24, leading=28, textColor=TINTA, spaceAfter=4)
st_sub = ParagraphStyle("s", fontName="Corpo", fontSize=10.5, leading=14, textColor=SUAVE, spaceAfter=14)
st_h = ParagraphStyle("h", fontName="CorpoB", fontSize=13.5, leading=17, textColor=ACENTO, spaceBefore=14, spaceAfter=6)
st_p = ParagraphStyle("p", fontName="Corpo", fontSize=10.5, leading=15, textColor=TINTA, spaceAfter=6)
st_li = ParagraphStyle("li", parent=st_p, leftIndent=14, bulletIndent=2, spaceAfter=3)
st_li2 = ParagraphStyle("li2", parent=st_p, leftIndent=30, bulletIndent=18, spaceAfter=3)
st_mono = ParagraphStyle("m", fontName="Mono", fontSize=9, leading=13, textColor=TINTA, backColor=colors.HexColor("#eef2f5"), borderPadding=6, spaceBefore=4, spaceAfter=10)

linhas = io.open(os.path.join(RAIZ, "README.txt"), encoding="utf-8").read().splitlines()
story = []
i = 0
story.append(Paragraph(escape(linhas[0].title().replace("Às", "às").replace("(Ecd)", "(ECD)")), st_titulo))
story.append(Paragraph(escape(linhas[1]), st_sub))
i = 2
mono = []
def fechar_mono():
    global mono
    if mono:
        story.append(Preformatted("\n".join(l[2:] for l in mono), st_mono))
        mono = []
while i < len(linhas):
    l = linhas[i]
    i += 1
    if l.startswith("  ") and not l.strip().startswith("-") and not re.match(r"\s+\S", l) is None and not l.startswith("   "):
        mono.append(l); continue
    fechar_mono()
    if not l.strip():
        continue
    if l.isupper() and len(l) < 60:
        story.append(Paragraph(escape(l.capitalize()), st_h)); continue
    m = re.match(r"^(\d+)\. (.*)$", l)
    if m:
        story.append(Paragraph("<b>%s</b>" % escape(m.group(2)), st_li, bulletText=m.group(1) + ".")); continue
    m = re.match(r"^(\s*)- (.*)$", l)
    if m:
        story.append(Paragraph(escape(m.group(2)), st_li2 if len(m.group(1)) >= 3 else st_li, bulletText="•")); continue
    if l.startswith("   "):
        story.append(Paragraph(escape(l.strip()), st_li2)); continue
    story.append(Paragraph(escape(l), st_p))
fechar_mono()

def rodape(c, d):
    c.saveState()
    c.setFont("Corpo", 8.5); c.setFillColor(SUAVE)
    c.drawString(20 * mm, 12 * mm, "Ensaio às Competências Digitais · Kendir Studios / Worlds4Education")
    c.drawRightString(A4[0] - 20 * mm, 12 * mm, str(d.page))
    c.restoreState()

doc = SimpleDocTemplate(os.path.join(RAIZ, "README.pdf"), pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm, bottomMargin=20 * mm,
                        title="Ensaio às Competências Digitais", author="Kendir Studios", subject="Apresentação do projeto")
doc.build(story, onFirstPage=rodape, onLaterPages=rodape)
print("ok")
