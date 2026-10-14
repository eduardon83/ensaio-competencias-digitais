"""Peças pixel para a fronteira com a UI (Ágora/Mosaico): moldura 9-slice, estrelas, ícones de categoria, cabeças dos avatares."""
from engine import Canvas, Ramp, hx, dilate4
import avatar as A
import montar as MT


def moldura(tema='claro'):
    """9-slice 24x24, cantos de 8 px nativos. Usar com border-image (fatias de 8) e image-rendering: pixelated."""
    cv = Canvas(24, 24)
    m = cv.m
    if tema == 'claro':
        F, L, D = hx('#ffffff'), hx('#ffe9b8'), hx('#8a6a4a')
    else:
        F, L, D = hx('#1e2a31'), hx('#4a3f5e'), hx('#e8c94a')
    shape = m.rect(1, 1, 22, 22) & ~m.pts([(1, 1), (22, 1), (1, 22), (22, 22), (2, 1), (1, 2), (21, 1), (22, 2), (1, 21), (2, 22), (22, 21), (21, 22)])
    cv.put(dilate4(shape) & ~shape, D)
    cv.put(shape, F)
    inner = m.rect(3, 3, 20, 20) & ~m.pts([(3, 3), (20, 3), (3, 20), (20, 20)])
    cv.put(dilate4(inner) & ~inner & shape, L)
    # pontinhos de costura nos cantos (toque de caderno de colorir)
    cv.put(m.pts([(5, 5), (18, 5), (5, 18), (18, 18)]), D)
    return cv


def estrela(cheia=True):
    cv = Canvas(13, 13)
    m = cv.m
    st = m.poly([(6, 0), (8, 4), (12, 4.5), (9, 7.5), (10, 12), (6, 9.5), (2, 12), (3, 7.5), (0, 4.5), (4, 4)])
    if cheia:
        cv.part(st, Ramp('#ffcf4d'), shade=1, glint=True)
    else:
        cv.put(dilate4(st) & ~st, hx('#b9bfd0'))
        cv.put(st, hx('#eef1f6'))
    return cv


def icone_categoria(cat):
    cv = Canvas(16, 16)
    m = cv.m
    if cat == 'chapeu':
        cv.part(m.ellipse(8, 9, 6, 4) & m.rect(0, 0, 16, 10), Ramp('#5f8fe0'), shade=1)
        cv.part(m.ellipse(11, 11, 5, 1.5), Ramp('#3f6cbf'), shade=0)
    elif cat == 'oculos':
        for x in (4, 11):
            o = m.ellipse(x, 8, 3, 2.5)
            cv.put(dilate4(o) & ~o, hx('#3d3a4a'))
            cv.put(o, hx('#bfe6f6'))
        cv.put(m.pts([(7, 7), (8, 7)]), hx('#3d3a4a'))
    elif cat == 'mochila':
        cv.part(m.ellipse(8, 9, 5, 6), Ramp('#f2885a'), shade=1, glint=True)
        cv.put(m.rect(6, 7, 10, 8), Ramp('#f2885a').light)
    elif cat == 'objeto':
        cv.put(m.line([(3, 13), (6, 10)], 2), hx('#8a5a3a'))
        o = m.circle(9, 6, 4)
        cv.put(o & ~m.circle(9, 6, 2.5), hx('#ffc94a'))
        cv.put(m.circle(9, 6, 2.5), hx('#dff3fb'))
    elif cat == 'calcado':
        cv.part(m.rect(3, 4, 9, 11) | m.ellipse(8, 11, 6, 2.5), Ramp('#ffd04a'), shade=1)
    elif cat == 'cor':
        for k, c in enumerate(('#9fdcc0', '#f5a9c4', '#9cc8ee')):
            cv.part(m.circle(5 + k * 3, 6 + (k % 2) * 4, 3.2), Ramp(c), shade=0)
    elif cat == 'padrao':
        b = m.rect(2, 2, 13, 13)
        cv.part(b, Ramp('#c6a8ec'), shade=0)
        cv.put(b & ((m.xx + m.yy) % 4 == 0), (255, 255, 255))
    elif cat == 'trofeu':
        R = Ramp('#ffd65c')
        cv.part(m.rect(4, 2, 11, 7) | m.ellipse(7.5, 7, 3.5, 2), R, shade=1, glint=True)
        cv.part(m.rect(7, 9, 8, 11), R, shade=0)
        cv.part(m.rect(5, 12, 10, 13), Ramp('#6fa8e8'), shade=0)
    elif cat == 'casa':
        cv.part(m.rect(3, 8, 12, 14), Ramp('#f6ead2'), shade=1)
        cv.part(m.tri((1, 8), (14, 8), (7.5, 2)), Ramp('#e98a5e'), shade=0)
        cv.put(m.rect(6, 10, 8, 14), hx('#5f8fe0'))
    elif cat == 'ovo':
        cv.part(m.ellipse(8, 9, 5, 6), Ramp('#fbe3c7'), shade=1, glint=True)
        cv.put(m.pts([(6, 7), (10, 9), (7, 12)]), hx('#e9a57a'))
    return cv


CATEGORIAS = ['chapeu', 'oculos', 'mochila', 'objeto', 'calcado', 'cor', 'padrao', 'trofeu', 'casa', 'ovo']


def cabeca(fato_id, pele='pele-2', cabelo='franja', cor='castanho'):
    """ícone 32x32 com a cabeça do avatar (HUD, lista de turma, marcadores)."""
    p = A.ANIMS['parado'][0]
    full = MT.avatar(fato_id, p, pele=pele, cabelo=cabelo, cor_cabelo=cor, shadow=False)
    cv = Canvas(32, 32)
    # recorte em volta do capuz (centro 22, 28)
    src = full.a[10:42, 6:38]
    cv.a[:src.shape[0], :src.shape[1]] = src
    return cv
