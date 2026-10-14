"""Interior da casa do aluno: sala isométrica 6x6, papel de parede, mobília em grelha, parede dos troféus, moldura."""
from __future__ import annotations
import math
from engine import Canvas, Ramp, hx, dilate4
import iso as I
from edificios import Ed

PAPEIS = {
    'riscas-menta': ('#d9f0e4', '#c3e6d3'), 'pintas-rosa': ('#fbe1e6', '#f4c3cd'), 'estrelas-ceu': ('#dcecfa', '#ffffff'),
    'xadrez-limao': ('#fbf0bf', '#f4e29a'), 'liso-pessego': ('#fbe2d0', '#fbe2d0'), 'nuvens-lilas': ('#e9e1f7', '#ffffff'),
}
CHAOS = {'madeira': '#d9b07a', 'madeira-escura': '#a77755', 'tijoleira': '#e8a47a', 'alcatifa-azul': '#9cc0e8'}


def sala(papel='riscas-menta', chao='madeira'):
    S = 6
    e = Ed(S, S, 44, extra_top=10, margin=6)
    m = e.m
    cv = e.cv
    # chão
    F = Ramp(CHAOS[chao])
    floor = e.poly([(0, 0, 0), (S, 0, 0), (S, S, 0), (0, S, 0)])
    cv.put(floor, F.base)
    for k in range(1, S * 3):
        cv.put(m.line([e.P(k / 3, 0, 0), e.P(k / 3, S, 0)]) & floor, F.shade)
    cv.put(floor & (((m.xx * 5 + m.yy * 3) % 31) == 0), F.light)
    # paredes de trás: ao longo de j=0 (direita, parede NE) e i=0 (esquerda, parede NW)
    a, b = PAPEIS[papel]
    Ra, Rb = Ramp(a), Ramp(b)
    wl = e.poly([(0, 0, 0), (0, S, 0), (0, S, 44), (0, 0, 44)])   # parede esquerda (NW), virada a SE -> sombra leve
    wr = e.poly([(0, 0, 0), (S, 0, 0), (S, 0, 44), (0, 0, 44)])   # parede direita (NE), virada a SW -> luz
    cv.put(wl, Ra.shade)
    cv.put(wr, Ra.base)
    if papel.startswith('riscas'):
        for k in range(0, S * 4):
            cv.put(m.line([e.P(0, k / 4, 0), e.P(0, k / 4, 44)]) & wl, Rb.shade)
            cv.put(m.line([e.P(k / 4, 0, 0), e.P(k / 4, 0, 44)]) & wr, Rb.base)
    elif papel.startswith('pintas') or papel.startswith('estrelas') or papel.startswith('nuvens'):
        cv.put(wl & ((m.xx % 6 == 0) & (m.yy % 6 == 0)), Rb.shade)
        cv.put(wr & ((m.xx % 6 == 3) & (m.yy % 6 == 3)), Rb.base)
    elif papel.startswith('xadrez'):
        cv.put(wl & (((m.xx // 4 + m.yy // 4) % 2) == 0), Rb.shade)
        cv.put(wr & (((m.xx // 4 + m.yy // 4) % 2) == 0), Rb.base)
    # rodapé e cimalha
    for w in (wl, wr):
        cv.put(w & ~dilate4(~w), Ra.dark) if False else None
    cv.put(e.poly([(0, 0, 0), (0, S, 0), (0, S, 3), (0, 0, 3)]), (255, 255, 255))
    cv.put(e.poly([(0, 0, 0), (S, 0, 0), (S, 0, 3), (0, 0, 3)]), (255, 255, 255))
    edge = dilate4(wl | wr | floor) & ~(wl | wr | floor)
    cv.put(edge, Ra.dark)
    cv.put(m.line([e.P(0, 0, 0), e.P(0, 0, 44)]), Ra.dark)
    # janela na parede direita
    win = e.poly([(3.6, 0, 14), (5.0, 0, 14), (5.0, 0, 34), (3.6, 0, 34)])
    cv.put(dilate4(win) & ~win, (255, 255, 255))
    cv.put(win, Ramp('#bfe6f6').base)
    cv.put(win & ((m.xx - m.yy) % 7 < 2), Ramp('#bfe6f6').light)
    cv.put(m.line([e.P(4.3, 0, 14), e.P(4.3, 0, 34)]) | m.line([e.P(3.6, 0, 24), e.P(5.0, 0, 24)]), (255, 255, 255))
    # cortinas
    for (i0, i1) in ((3.3, 3.6), (5.0, 5.3)):
        cv.put(e.poly([(i0, 0, 12), (i1, 0, 12), (i1, 0, 36), (i0, 0, 36)]), hx('#f6a5b4'))
    # moldura (o Jornal da Aldeia entra aqui por código)
    fr = e.poly([(1.2, 0, 18), (2.6, 0, 18), (2.6, 0, 34), (1.2, 0, 34)])
    cv.put(dilate4(fr) & ~fr, hx('#c98e5a'))
    cv.put(fr, (255, 255, 255))
    e.ancoras['moldura'] = [e.P(1.2, 0, 34), e.P(2.6, 0, 34), e.P(2.6, 0, 18), e.P(1.2, 0, 18)]
    # parede dos troféus: prateleiras na parede esquerda
    for z in (9, 23, 37):
        sh = e.poly([(0, 1.0, z), (0, 4.6, z), (.25, 4.6, z), (.25, 1.0, z)])
        cv.part(sh, Ramp('#c99a6b'), shade=0)
    e.ancoras['trofeus'] = [e.P(.12, 1.2 + k * .55, 20 + 12 * (k // 6)) for k in range(12)]
    e.ancoras['trofeus'] = [e.P(.12, 1.25 + (k % 6) * .6, (10, 24, 38)[k // 6]) for k in range(18)]
    e.ancoras['grelha_origem'] = e.P(0, 0, 0)
    return e


def movel(tipo, cor=None):
    """mobília em grelha; devolve (Canvas, pivô = esquina sul no chão, pegada)."""
    if tipo == 'cama':
        e = Ed(2, 1, 10, extra_top=20, margin=4)
        e.caixa(0, 0, 2, 1, 0, 6, Ramp('#c99a6b'))
        e.caixa(.05, .05, 1.95, .95, 6, 10, Ramp(cor or '#9fc8ee', light='#c9e2f6'))
        e.caixa(.1, .15, .55, .85, 10, 13, Ramp('#ffffff', dark='#8a93a8'))
        e.caixa(-.05, 0, .12, 1, 0, 20, Ramp('#c99a6b'))
        e.cv.put(e.poly([(.7, 1, 6), (1.95, 1, 6), (1.95, 1, 9), (.7, 1, 9)]) & ((e.m.xx // 3) % 2 == 0), Ramp(cor or '#9fc8ee').shade)
        foot = (2, 1)
    elif tipo == 'secretaria':
        e = Ed(1.5, .8, 10, extra_top=26, margin=4)
        e.caixa(0, 0, 1.5, .8, 12, 14, Ramp('#e8c99a'))
        for (i, j) in ((0, 0), (1.4, 0), (1.4, .7), (0, .7)):
            e.caixa(i, j, i + .1, j + .1, 0, 12, Ramp('#c99a6b'), contorno=False)
        # computador
        e.caixa(.5, .1, 1.1, .2, 14, 28, Ramp('#5a6070'))
        scr = e.poly([(.55, .2, 16), (1.05, .2, 16), (1.05, .2, 27), (.55, .2, 27)])
        e.cv.put(scr, hx('#8fd0ee'))
        e.cv.put(scr & ((e.m.xx - e.m.yy) % 6 < 2), hx('#c6ecfa'))
        e.emissivo.append(scr)
        e.caixa(.5, .45, 1.0, .65, 14, 15, Ramp('#eef1f6'))
        foot = (1.5, .8)
    elif tipo == 'cadeira':
        e = Ed(.6, .6, 8, extra_top=20, margin=4)
        e.caixa(0, 0, .6, .6, 7, 9, Ramp(cor or '#ef7b8f'))
        e.caixa(0, 0, .1, .6, 9, 20, Ramp(cor or '#ef7b8f'))
        for (i, j) in ((.05, .05), (.5, .05), (.5, .5), (.05, .5)):
            e.cv.put(e.m.line([e.P(i, j, 0), e.P(i, j, 7)]), hx('#6b5a4a'))
        foot = (.6, .6)
    elif tipo == 'estante':
        e = Ed(1, .5, 40, extra_top=10, margin=4)
        e.caixa(0, 0, 1, .5, 0, 40, Ramp('#c99a6b'))
        cols = ['#ef7b8f', '#6fa8e8', '#ffd65c', '#8fd18a', '#c79be6']
        for k, z in enumerate((4, 14, 24, 34)):
            for q in range(5):
                bk = e.poly([(.1 + q * .17, .5, z), (.22 + q * .17, .5, z), (.22 + q * .17, .5, z + 7 - (q % 2)), (.1 + q * .17, .5, z + 7 - (q % 2))])
                e.cv.put(bk, Ramp(cols[(q + k) % 5]).base)
            e.cv.put(e.m.line([e.P(0, .5, z - 1), e.P(1, .5, z - 1)]), Ramp('#c99a6b').dark)
        foot = (1, .5)
    elif tipo == 'tapete':
        e = Ed(2, 2, 2, extra_top=4, margin=4)
        R = Ramp(cor or '#f6c7a0')
        t = e.poly([(0, 0, 0), (2, 0, 0), (2, 2, 0), (0, 2, 0)])
        e.cv.put(dilate4(t) & ~t, R.dark)
        e.cv.put(t, R.base)
        e.cv.put(e.poly([(.3, .3, 0), (1.7, .3, 0), (1.7, 1.7, 0), (.3, 1.7, 0)]), R.light)
        e.cv.put(e.poly([(.6, .6, 0), (1.4, .6, 0), (1.4, 1.4, 0), (.6, 1.4, 0)]), R.shade)
        foot = (2, 2)
    elif tipo == 'candeeiro':
        e = Ed(.4, .4, 34, extra_top=6, margin=8)
        m = e.m
        x, y = e.P(.2, .2, 0)
        e.cv.part(m.ellipse(x, y, 4, 2), Ramp('#5a6070'), shade=0)
        e.cv.put(m.line([(x, y), (x, y - 26)]), hx('#5a6070'))
        sh = m.poly([(x - 6, y - 24), (x + 6, y - 24), (x + 4, y - 32), (x - 4, y - 32)])
        e.cv.part(sh, Ramp(cor or '#ffd65c'), shade=1)
        e.emissivo.append(sh)
        foot = (.4, .4)
    elif tipo == 'planta':
        e = Ed(.5, .5, 20, extra_top=10, margin=8)
        m = e.m
        x, y = e.P(.25, .25, 0)
        e.cv.part(m.rect(x - 4, y - 8, x + 4, y), Ramp('#e98a5e'), shade=1)
        for (dx, dy, r) in ((-4, -14, 4), (4, -15, 4), (0, -20, 4.5), (-2, -10, 3), (3, -10, 3)):
            e.cv.part(m.circle(x + dx, y + dy, r), I.P['folha'], shade=1)
        foot = (.5, .5)
    else:
        raise ValueError(tipo)
    # pivô: esquina sul no chão
    sx, sy = e.P(*foot, 0)
    return e, (sx, sy), foot


def trofeu(cor):
    cv = Canvas(10, 13)
    m = cv.m
    R = Ramp('#ffd65c')
    cv.part(m.ellipse(5, 4, 4, 3.5) & m.rect(0, 0, 10, 5) | m.rect(1, 1, 9, 4), R, shade=1, glint=True)
    cv.put(m.pts([(0, 2), (0, 3), (9, 2), (9, 3)]), R.dark)
    cv.part(m.rect(4, 6, 5, 8), R, shade=0)
    cv.part(m.rect(2, 9, 7, 11), Ramp(cor), shade=0)
    return cv


def compor_exemplo(papel='riscas-menta', chao='madeira', fato='raposa', noite=False):
    """sala de exemplo com mobília, avatar e troféus (para guia e maquetas)."""
    import montar as MT, avatar as A, cosmetica as C
    s = sala(papel, chao)
    cv = s.cv
    itens = [('tapete', (2, 2), '#f6c7a0'), ('cama', (0.2, 4.6), '#9fc8ee'), ('estante', (0.1, .1), None), ('secretaria', (2.5, .1), None),
             ('cadeira', (3.0, 1.0), '#ef7b8f'), ('planta', (5.3, .2), None), ('candeeiro', (.3, 3.6), None)]
    objs = []
    for t, (gi, gj), cor in itens:
        e, piv, foot = movel(t, cor)
        objs.append((gi + foot[0] + gj + foot[1] - (10 if t == 'tapete' else 0), e, piv, gi + foot[0], gj + foot[1]))
    objs.append((7.6, 'avatar', None, 3.4, 3.4))
    for _, e, piv, i, j in sorted(objs, key=lambda o: o[0]):
        x, y = s.P(i, j, 0)
        if e == 'avatar':
            av = MT.avatar(fato, A.ANIMS['acenar'][3], itens=('bone-reporter', 'pantufas'))
            cv.over_fast(av, x - A.CX, y - A.GY)
        else:
            cv.over_fast(e.cv, x - piv[0], y - piv[1])
    import trofeus as T
    cat = T.catalogo()
    escolha = [cat[i] for i in (0, 1, 2, 4, 6, 13, 14, 15, 22, 23, 26, 31, 32, 33)]
    for k, (x, y) in enumerate(s.ancoras['trofeus'][:len(escolha)]):
        cv.over_fast(escolha[k][5], x - 5, y - 12)
    return s
