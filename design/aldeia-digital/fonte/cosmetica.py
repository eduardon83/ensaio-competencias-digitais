"""Cosmética desbloqueável. Cada item é um sprite pequeno com pivô, colado numa âncora do avatar.

Âncoras (ver avatar.anchors): chapeu, olhos, mao_e, mao_d, mochila, peito, pe_e, pe_d.
Cada item tem versão 'f' (frente) e, quando muda, 'c' (costas).
"""
from __future__ import annotations
import math
from engine import Canvas, Ramp, hx, dilate4
import avatar as A
import numpy as np


def _cv(w, h):
    return Canvas(w, h)


ITENS = {}


def item(cat, id_, nome, anchor, pivot, size):
    def deco(fn):
        ITENS[id_] = dict(cat=cat, id=id_, nome=nome, anchor=anchor, pivot=pivot, size=size, fn=fn)
        return fn
    return deco


# ---------------------------------------------------------------- chapéus (pivô = base central)
@item('chapeu', 'bone-reporter', 'Boné de repórter', 'chapeu', (11, 11), (24, 13))
def _(cv, back):
    m = cv.m; R = Ramp('#5f8fe0')
    cv.part(m.ellipse(11, 8, 8, 5) & m.rect(0, 0, 30, 9), R, shade=1)
    cv.part(m.ellipse(17 if not back else 4, 10, 6, 1.5), Ramp('#3f6cbf'), shade=0)
    cv.put(m.pts([(11, 3)]), Ramp('#ffd25c').base)
    if not back:
        cv.part(m.rect(9, 6, 12, 7), Ramp('#ffd25c'), outline=False, shade=0)


@item('chapeu', 'explorador', 'Chapéu de explorador', 'chapeu', (11, 11), (24, 13))
def _(cv, back):
    m = cv.m; R = Ramp('#d9b77c')
    cv.part(m.ellipse(11, 10, 11, 2), R, shade=0)
    cv.part(m.ellipse(11, 6, 6, 5) & m.rect(0, 0, 30, 9), R, shade=1)
    cv.put(m.rect(5, 7, 17, 8) & m.ellipse(11, 6, 6, 5), hx('#7c5a3a'))


@item('chapeu', 'coroa-papel', 'Coroa de papel', 'chapeu', (11, 11), (24, 13))
def _(cv, back):
    m = cv.m; R = Ramp('#ffd65c')
    cv.part(m.poly([(3, 10), (3, 4), (6, 7), (9, 2), (11, 6), (14, 2), (16, 7), (19, 4), (19, 10)]), R, shade=1)
    for x, c in ((7, '#f5788f'), (11, '#6ec3e8'), (15, '#8fd18a')):
        cv.put(m.pts([(x, 8)]), hx(c))


@item('chapeu', 'capacete-obra', 'Capacete de obra', 'chapeu', (11, 11), (24, 13))
def _(cv, back):
    m = cv.m; R = Ramp('#ffc94a')
    cv.part(m.ellipse(11, 9, 9, 7) & m.rect(0, 0, 30, 9), R, shade=1, glint=True)
    cv.part(m.rect(1, 9, 21, 10), R, shade=0)
    cv.put(m.rect(10, 3, 12, 8), R.light)


@item('chapeu', 'gorro-la', 'Gorro de lã', 'chapeu', (11, 11), (24, 15))
def _(cv, back):
    m = cv.m; R = Ramp('#ef7b8f')
    cv.part(m.ellipse(11, 10, 9, 6) & m.rect(0, 0, 30, 11), R, shade=1)
    cv.part(m.rect(2, 9, 20, 11), Ramp('#fbe0e5'), shade=0)
    cv.part(m.circle(11, 3, 2.5), Ramp('#fbe0e5'), shade=0)


@item('chapeu', 'chapeu-palha', 'Chapéu de palha', 'chapeu', (11, 11), (24, 13))
def _(cv, back):
    m = cv.m; R = Ramp('#f1d38a')
    cv.part(m.ellipse(11, 10, 11, 2.5), R, shade=0)
    cv.part(m.ellipse(11, 7, 6, 4) & m.rect(0, 0, 30, 9), R, shade=1)
    cv.put(m.rect(5, 7, 17, 8) & m.ellipse(11, 7, 6, 4), hx('#e46f5c'))
    cv.part(m.circle(16, 7, 1.5), Ramp('#ffffff'), shade=0)


@item('chapeu', 'laco', 'Laço grande', 'chapeu', (11, 11), (24, 13))
def _(cv, back):
    m = cv.m; R = Ramp('#ff8fb1')
    cv.part(m.tri((11, 8), (3, 3), (3, 12)), R, shade=0)
    cv.part(m.tri((11, 8), (19, 3), (19, 12)), R, shade=0)
    cv.part(m.circle(11, 8, 2), R, shade=0)


@item('chapeu', 'capacete-bicicleta', 'Capacete de bicicleta', 'chapeu', (11, 11), (24, 13))
def _(cv, back):
    m = cv.m; R = Ramp('#6fd0b8')
    cv.part(m.ellipse(11, 10, 10, 7) & m.rect(0, 0, 30, 10), R, shade=1, glint=True)
    for x in (7, 11, 15):
        cv.put(m.rect(x, 4, x, 6), R.dark)


@item('chapeu', 'chapeu-festa', 'Chapéu da festa', 'chapeu', (11, 11), (24, 16))
def _(cv, back):
    m = cv.m; R = Ramp('#9c7bf0')
    cv.part(m.tri((5, 13), (17, 13), (11, 1)), R, shade=1)
    cv.put(m.line([(7, 10), (14, 7)]), hx('#ffd65c'))
    cv.put(m.line([(8, 12), (16, 11)]), hx('#6ec3e8'))
    cv.part(m.circle(11, 1, 1.6), Ramp('#ffd65c'), shade=0)


# ---------------------------------------------------------------- óculos (pivô = centro dos olhos)
@item('oculos', 'oculos-sol', 'Óculos de sol', 'olhos', (8, 2), (17, 6))
def _(cv, back):
    m = cv.m
    if back: return
    D = Ramp('#3d3a4a')
    cv.put(m.rect(4, 1, 12, 1), D.base)
    cv.part(m.rect(3, 1, 6, 3), D, outline=False, shade=0)
    cv.part(m.rect(9, 1, 12, 3), D, outline=False, shade=0)
    cv.put(m.pts([(4, 2), (10, 2)]), (255, 255, 255))


@item('oculos', 'oculos-laboratorio', 'Óculos de laboratório', 'olhos', (8, 2), (17, 6))
def _(cv, back):
    m = cv.m
    if back: return
    G = Ramp('#bfe8f6')
    cv.put(m.rect(1, 1, 15, 1), hx('#5aa0c8'))
    for x in (5, 11):
        o = m.ellipse(x, 2, 2.5, 2)
        cv.put(dilate4(o) & ~o, hx('#5aa0c8'))
        cv.put(o, (*G.light, 255))
        cv.put(m.pts([(x - 1, 1)]), (255, 255, 255))


@item('oculos', 'oculos-estrela', 'Óculos estrela', 'olhos', (8, 2), (17, 6))
def _(cv, back):
    m = cv.m
    if back: return
    S = Ramp('#ffcf4d')
    for x in (5, 11):
        st = m.poly([(x, -1), (x + 1, 1), (x + 3, 1), (x + 1, 3), (x + 2, 5), (x, 4), (x - 2, 5), (x - 1, 3), (x - 3, 1), (x - 1, 1)])
        cv.put(dilate4(st) & ~st, S.dark)
    cv.put(m.pts([(8, 1)]), S.dark)


@item('oculos', 'oculos-coloridos', 'Óculos coloridos', 'olhos', (8, 2), (17, 6))
def _(cv, back):
    m = cv.m
    if back: return
    for x, c in ((5, '#ef6f8f'), (11, '#6f9ff0')):
        o = m.ellipse(x, 2, 2.5, 2)
        cv.put(dilate4(o) & ~o, hx(c))
    cv.put(m.pts([(8, 1)]), hx('#ef6f8f'))


# óculos de ver: identidade, não prémio (camada da cara)
@item('ver', 'ver-redondos', 'Óculos de ver redondos', 'olhos', (8, 2), (17, 6))
def _(cv, back):
    m = cv.m
    if back: return
    for x in (5, 11):
        o = m.ellipse(x, 2, 2.5, 2)
        cv.put(dilate4(o) & ~o, hx('#7a5fd6'))
    cv.put(m.pts([(8, 1)]), hx('#7a5fd6'))


@item('ver', 'ver-retangulares', 'Óculos de ver retangulares', 'olhos', (8, 2), (17, 6))
def _(cv, back):
    m = cv.m
    if back: return
    for x in (5, 11):
        o = m.rect(x - 2, 1, x + 2, 3)
        cv.put(dilate4(o) & ~o, hx('#e0605a'))
    cv.put(m.pts([(8, 1)]), hx('#e0605a'))


# ---------------------------------------------------------------- mochilas (pivô = centro das costas)
def _bag(cv, back, col, deco=None):
    m = cv.m; R = Ramp(col)
    if back:
        cv.part(m.ellipse(9, 9, 7, 8), R, shade=2, glint=True)
        cv.part(m.ellipse(9, 13, 5, 3), R, shade=1)
        if deco: deco(cv, m, R)
    else:
        # só as alças à frente
        cv.put(m.line([(4, 2), (5, 10)], 2), R.dark)
        cv.put(m.line([(14, 2), (13, 10)], 2), R.dark)


@item('mochila', 'mochila-escolar', 'Mochila escolar', 'mochila', (9, 9), (19, 19))
def _(cv, back):
    _bag(cv, back, '#f2885a', lambda cv, m, R: cv.put(m.rect(7, 4, 11, 5), R.light))


@item('mochila', 'mochila-cartao-asas', 'Mochila de cartão com asas', 'mochila', (13, 9), (27, 19))
def _(cv, back):
    m = cv.m; R = Ramp('#d9b07a')
    if back:
        for sgn in (-1, 1):
            cv.part(m.poly([(13 + sgn * 4, 6), (13 + sgn * 13, 2), (13 + sgn * 12, 9), (13 + sgn * 4, 11)]), Ramp('#f4f1ea'), shade=0)
        cv.part(m.rect(7, 3, 19, 16), R, shade=1)
        cv.put(m.line([(9, 6), (17, 6)]), R.shade)
    else:
        cv.put(m.line([(8, 2), (9, 10)], 2), R.dark)
        cv.put(m.line([(18, 2), (17, 10)], 2), R.dark)


@item('mochila', 'mochila-livros', 'Mochila de livros', 'mochila', (9, 9), (19, 19))
def _(cv, back):
    def d(cv, m, R):
        for i, c in enumerate(('#6fa8e8', '#f5d35b', '#ef7b8f')):
            cv.part(m.rect(4 + i * 4, 0, 6 + i * 4, 5), Ramp(c), shade=0)
    _bag(cv, back, '#7bb58a', d)


@item('mochila', 'mochila-antena', 'Mochila rádio de repórter', 'mochila', (9, 12), (19, 22))
def _(cv, back):
    m = cv.m; R = Ramp('#8a92b8')
    if back:
        cv.put(m.line([(13, 6), (16, 0)]), R.dark)
        cv.part(m.circle(16, 0, 1.2), Ramp('#ef6f6f'), shade=0)
        cv.part(m.rect(3, 6, 15, 20), R, shade=1)
        cv.put(m.rect(6, 9, 12, 12), hx('#3d3a4a'))
        cv.put(m.pts([(7, 10), (9, 10), (11, 10)]), hx('#9ef0c0'))
    else:
        cv.put(m.line([(4, 5), (5, 13)], 2), R.dark)
        cv.put(m.line([(14, 5), (13, 13)], 2), R.dark)


@item('mochila', 'mochila-estrelas', 'Mochila das estrelas', 'mochila', (9, 9), (19, 19))
def _(cv, back):
    def d(cv, m, R):
        for (x, y) in ((6, 6), (12, 9), (8, 12)):
            cv.put(m.pts([(x, y - 1), (x - 1, y), (x, y), (x + 1, y), (x, y + 1)]), hx('#ffe36e'))
    _bag(cv, back, '#6b6fc9', d)


@item('mochila', 'mochila-desporto', 'Saco de desporto', 'mochila', (9, 9), (19, 19))
def _(cv, back):
    m = cv.m; R = Ramp('#ef6f6f')
    if back:
        cv.part(m.ellipse(9, 10, 8, 5), R, shade=1, glint=True)
        cv.put(m.rect(2, 9, 16, 9), R.light)
    else:
        cv.put(m.line([(4, 2), (14, 12)], 2), R.dark)


# ---------------------------------------------------------------- objeto na mão (pivô = punho)
@item('objeto', 'microfone', 'Microfone de repórter', 'mao_d', (3, 9), (9, 13))
def _(cv, back):
    m = cv.m
    cv.part(m.rect(2, 5, 4, 11), Ramp('#5a5f73'), shade=0)
    cv.part(m.circle(3, 3, 2.6), Ramp('#c9cfdc'), shade=0, glint=True)


@item('objeto', 'lupa', 'Lupa', 'mao_d', (2, 10), (12, 13))
def _(cv, back):
    m = cv.m
    cv.put(m.line([(2, 10), (5, 7)], 2), hx('#8a5a3a'))
    o = m.circle(7, 4, 3.4)
    cv.put(o & ~m.circle(7, 4, 2.2), hx('#ffc94a'))
    cv.put(dilate4(o) & ~o, hx('#7a5a1a'))
    cv.put(m.circle(7, 4, 2.2), (220, 240, 252, 255))
    cv.put(m.pts([(6, 3)]), (255, 255, 255))


@item('objeto', 'tubo-ensaio', 'Tubo de ensaio', 'mao_d', (3, 9), (8, 13))
def _(cv, back):
    m = cv.m
    t = m.capsule(3, 1, 3, 9, 1.6)
    cv.put(dilate4(t) & ~t, hx('#5a7d8c'))
    cv.put(t, (226, 244, 250, 255))
    cv.put(t & m.rect(0, 6, 9, 12), hx('#8fe0a8'))
    cv.put(m.pts([(2, 2)]), (255, 255, 255))


@item('objeto', 'lapis-gigante', 'Lápis gigante', 'mao_d', (3, 12), (9, 18))
def _(cv, back):
    m = cv.m
    cv.part(m.rect(2, 4, 5, 14), Ramp('#ffcf4d'), shade=1)
    cv.part(m.tri((2, 4), (5, 4), (3.5, 0)), Ramp('#f2d6b0'), shade=0)
    cv.part(m.rect(2, 14, 5, 16), Ramp('#f5a0b5'), shade=0)


@item('objeto', 'livro', 'Livro', 'mao_d', (4, 7), (11, 11))
def _(cv, back):
    m = cv.m
    cv.part(m.rect(1, 1, 8, 8), Ramp('#5fa0e0'), shade=1)
    cv.put(m.rect(2, 2, 2, 7), hx('#ffffff'))
    cv.put(m.rect(4, 3, 7, 3), Ramp('#5fa0e0').light)


@item('objeto', 'regador', 'Regador', 'mao_d', (4, 6), (14, 11))
def _(cv, back):
    m = cv.m; R = Ramp('#7fc9a0')
    cv.part(m.rect(2, 3, 8, 9), R, shade=1)
    cv.part(m.poly([(8, 5), (13, 1), (13, 3), (9, 7)]), R, shade=0)
    cv.put(m.line([(3, 2), (7, 2)]), R.dark)


# ---------------------------------------------------------------- calçado (pivô = centro do pé)
def _shoe(cv, back, col, sole='#f4f1ea', extra=None):
    m = cv.m
    R = Ramp(col)
    cv.part(m.ellipse(4, 3, 3.4, 2.2), R, shade=1)
    cv.put(m.rect(1, 5, 7, 5) & dilate4(m.ellipse(4, 3, 3.4, 2.2)), hx(sole))
    if extra: extra(cv, m, R)


@item('calcado', 'botas-chuva', 'Botas de chuva', 'pe', (4, 4), (9, 7))
def _(cv, back):
    m = cv.m; R = Ramp('#ffd04a')
    cv.part(m.rect(1, 0, 6, 4) | m.ellipse(4, 4, 3.4, 1.6), R, shade=1, glint=True)


@item('calcado', 'tenis', 'Ténis', 'pe', (4, 4), (9, 7))
def _(cv, back):
    _shoe(cv, back, '#6f9ff0', extra=lambda cv, m, R: cv.put(m.pts([(3, 2), (5, 2)]), (255, 255, 255)))


@item('calcado', 'pantufas', 'Pantufas', 'pe', (4, 4), (9, 7))
def _(cv, back):
    _shoe(cv, back, '#f6b7c8', extra=lambda cv, m, R: cv.part(m.circle(4, 1, 1.3), Ramp('#ffffff'), shade=0))


@item('calcado', 'botas-caminhada', 'Botas de caminhada', 'pe', (4, 4), (9, 7))
def _(cv, back):
    _shoe(cv, back, '#a8794f', sole='#5a4a3e', extra=lambda cv, m, R: cv.put(m.pts([(3, 1), (5, 1)]), hx('#e46f5c')))


# ---------------------------------------------------------------- emblemas (13, um por competência) 9x9
EMBLEMAS = [
    ('noticia', 'A Notícia', '#6f9ff0', 'tecla'),
    ('painel', 'O Painel', '#7fc9a0', 'interruptor'),
    ('revisao', 'Revisão', '#f5a54a', 'lupa'),
    ('arquivo', 'O Arquivo', '#c9a27e', 'pasta'),
    ('cartao', 'Cartão de Imprensa', '#ef7b8f', 'cartao'),
    ('paginacao', 'Paginação', '#9c7bf0', 'blocos'),
    ('fecho', 'Fecho de Edição', '#f2c94c', 'relogio'),
    ('teclas', 'Teclas Mágicas', '#6fd0d8', 'estrela'),
    ('encontra', 'Encontra no Texto', '#8fd18a', 'livro'),
    ('simulador', 'Simulador de Prova', '#5f8fe0', 'visto'),
    ('matematica', 'Matemática no Ecrã', '#f08a6f', 'mais'),
    ('maqueta', 'A Maqueta', '#b5926f', 'cubo'),
    ('leitura', 'Biblioteca Viva', '#c79be6', 'coracao'),
]


def emblema(id_, cor, icone):
    cv = Canvas(11, 11)
    m = cv.m
    R = Ramp(cor)
    cv.part(m.circle(5, 5, 4.5), R, shade=1)
    W_ = (255, 255, 255)
    c = 5
    ic = {
        'tecla': m.rect(3, 3, 7, 6),
        'interruptor': m.rect(2, 4, 8, 6) & ~m.rect(6, 4, 8, 6),
        'lupa': (m.circle(4, 4, 2) & ~m.circle(4, 4, 1)) | m.pts([(6, 6), (7, 7)]),
        'pasta': m.rect(2, 4, 8, 7) | m.rect(2, 3, 4, 3),
        'cartao': m.rect(2, 3, 8, 7) & ~m.rect(3, 4, 4, 5),
        'blocos': m.rect(2, 3, 4, 5) | m.rect(6, 5, 8, 7),
        'relogio': (m.circle(5, 5, 3) & ~m.circle(5, 5, 2)) | m.pts([(5, 4), (5, 5), (6, 5)]),
        'estrela': m.pts([(5, 2), (4, 4), (5, 4), (6, 4), (2, 5), (3, 5), (4, 5), (5, 5), (6, 5), (7, 5), (8, 5), (4, 6), (5, 6), (6, 6), (3, 7), (4, 7), (6, 7), (7, 7), (5, 3)]),
        'livro': m.rect(2, 3, 4, 7) | m.rect(6, 3, 8, 7),
        'visto': m.pts([(2, 5), (3, 6), (4, 7), (5, 6), (6, 5), (7, 4), (8, 3)]),
        'mais': m.rect(4, 2, 6, 8) | m.rect(2, 4, 8, 6),
        'cubo': m.poly([(5, 2), (8, 4), (8, 7), (5, 9), (2, 7), (2, 4)]) & ~m.pts([(5, 5)]),
        'coracao': m.pts([(3, 3), (4, 3), (6, 3), (7, 3), (2, 4), (3, 4), (4, 4), (5, 4), (6, 4), (7, 4), (8, 4), (3, 5), (4, 5), (5, 5), (6, 5), (7, 5), (4, 6), (5, 6), (6, 6), (5, 7)]),
    }[icone]
    cv.put(ic & m.circle(5, 5, 4), W_)
    return cv


def render_item(id_, back=False):
    it = ITENS[id_]
    cv = Canvas(*it['size'])
    it['fn'](cv, back)
    return cv


# padrões do fato (camada por cima do corpo, recortada ao tronco)
PADROES = ['riscas', 'pintas', 'estrelas', 'xadrez', 'confetes']


def padrao_layer(p, nome, cor='#ffffff', opac=200):
    g = A.Geo(p)
    cv = Canvas(A.W, A.H)
    m = cv.m
    tx, ty, rx, ry = g.torso
    torso = m.ellipse(tx, ty, rx - 1, ry - 1)
    yy, xx = m.yy, m.xx
    if nome == 'riscas':
        mk = ((yy - ty) % 4 == 0)
    elif nome == 'pintas':
        mk = (((xx + (yy // 4) * 2) % 4 == 0) & (yy % 4 == 1))
    elif nome == 'xadrez':
        mk = (((xx // 2) + (yy // 2)) % 2 == 0)
    elif nome == 'estrelas':
        mk = m.empty()
        for (x, y) in ((tx - 4, ty - 3), (tx + 3, ty), (tx - 2, ty + 4), (tx + 5, ty - 5)):
            mk |= m.pts([(x, y - 1), (x - 1, y), (x, y), (x + 1, y), (x, y + 1)])
    elif nome == 'confetes':
        mk = m.empty()
        cols = ['#ef6f8f', '#6fa8e8', '#ffd65c', '#8fd18a']
        k = 0
        for (x, y) in ((tx - 5, ty - 4), (tx + 2, ty - 5), (tx + 5, ty), (tx - 3, ty + 1), (tx + 1, ty + 4), (tx - 5, ty + 4), (tx + 4, ty + 5)):
            cv.put(m.pts([(x, y), (x + 1, y)]) & torso, (*hx(cols[k % 4]), 255)); k += 1
        if A.view_flip(p):
            cv = cv.flip()
        return cv
    cv.put(mk & torso, (*hx(cor), opac))
    if A.view_flip(p):
        cv = cv.flip()
    return cv


def pin(cor):
    """alfinete de 5x5 para o peito do avatar (o emblema de 11x11 é para a UI e a parede dos troféus)."""
    cv = Canvas(7, 7)
    m = cv.m
    R = Ramp(cor)
    cv.part(m.circle(3, 3, 2), R, shade=0)
    cv.put(m.pts([(2, 2)]), (255, 255, 255))
    return cv
