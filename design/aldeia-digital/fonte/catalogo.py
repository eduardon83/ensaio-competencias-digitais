"""Catálogo dos edifícios da aldeia, com estados: obras, aberto, concluido, festivo."""
from __future__ import annotations
import math
from engine import Canvas, Ramp, hx, dilate4
import iso as I
from edificios import Ed, PISO
import nascimento as N

CREME = Ramp('#f6ead2', light='#fff7e6', shade='#e2cfae', dark='#8a6f55')
ROSA_V = Ramp('#f6c9c0', light='#fde3dc', shade='#e2aaa0', dark='#8a5a55')
AZUL_V = Ramp('#cfe3f2', light='#e9f4fb', shade='#aecbe2', dark='#4f6f8f')
MENTA = Ramp('#d4efe0', light='#eefbf3', shade='#b4dcc6', dark='#4f7f6a')
AMARELO = Ramp('#f9e3a3', light='#fff3cc', shade='#e8c97e', dark='#8a6a35')
PEDRA = Ramp('#e9e1d3', light='#f8f3ea', shade='#d0c4b0', dark='#7a6a5a')
BRANCO = Ramp('#f5f7fa', light='#ffffff', shade='#dbe2ec', dark='#5a6a80')
LILAS = Ramp('#e0d6f2', light='#f1ebfa', shade='#c6b8e2', dark='#5f557f')
TERRACOTA = Ramp('#efb48f', light='#f8d2b8', shade='#d9946c', dark='#7e4a33')
LOUSA = Ramp('#6f7891', light='#8f98ae', shade='#58607a', dark='#343a4f')
VERDE_T = Ramp('#8fc9a0', light='#b5e0c0', shade='#6fae84', dark='#3f6f55')


def _fim(e: Ed, estado, z_topo):
    if estado == 'concluido':
        x, y = e.ancoras.get('topo', e.P(e.W / 2, e.D / 2, z_topo))
        fl = N.visto_bandeira(0)
        e.cv.over_fast(fl, int(x - 3), int(y - 21))
    if estado == 'festivo':
        e.grinaldas(e.h - 4)
    x, y = e.ancoras.get('topo', e.P(e.W / 2, e.D / 2, z_topo))
    e.ancoras['marcador'] = (int(x), int(y - 26))
    e.ancoras['porta'] = e.ancoras.get('porta', e.P(e.W / 2, e.D, 0))
    return e


def _obras(W, D, floors, R):
    e = Ed(W, D, floors * PISO)
    h = int(e.h * .55)
    e.caixa(0, 0, W, D, 0, h, R, topo=True)
    # topo aberto: laje por acabar, com interior em sombra
    inner = e.poly([(.15, .15, h), (W - .15, .15, h), (W - .15, D - .15, h), (.15, D - .15, h)])
    e.cv.put(inner, R.shade)
    e.cv.put(inner & ((e.m.xx + e.m.yy * 2) % 9 == 0), R.dark)
    # tijolo à vista
    m = e.m
    L = e.poly(e.fq('e', 0, W, 0, h))
    e.cv.put(L & ((m.yy % 4 == 0) | (((m.xx + (m.yy // 4) * 3) % 6) == 0)), R.shade)
    e.andaimes(h)
    # cones e baia
    for k in range(3):
        x, y = e.P(W * (k + 1) / 4, D + .5, 0)
        e.cv.part(m.tri((x - 3, y), (x + 3, y), (x, y - 7)), Ramp('#ff9a4a'), shade=0)
        e.cv.put(m.rect(x - 2, y - 4, x + 2, y - 3), (255, 255, 255))
    x, y = e.P(W / 2, D / 2, h)
    e.ancoras['topo'] = (x, y)
    e.ancoras['marcador'] = (x, y - 30)
    e.ancoras['porta'] = e.P(W / 2, D, 0)
    return e


# ------------------------------------------------------------------ Escola 4x3
def escola(estado='aberto'):
    if estado == 'obras':
        return _obras(4, 3, 2, Ramp('#e8c9a0'))
    e = Ed(4, 3, 2 * PISO + 6, extra_top=70)
    e.paredes(CREME, rodape='#d98a5e')
    for a in (.5, 1.2, 2.8, 3.5):
        e.janela('e', a, 8, w=.42, hh=12, moldura='#ffffff', persiana='#6fa8e8')
        e.janela('e', a, 8 + PISO, w=.42, hh=12, moldura='#ffffff', persiana='#6fa8e8', flores=(a in (1.2, 2.8)))
    for a in (.6, 1.5, 2.4):
        e.janela('d', a, 8, w=.42, hh=12)
        e.janela('d', a, 8 + PISO, w=.42, hh=12)
    e.porta('e', 2.0, w=.7, hh=24, cor='#5f8fe0', dupla=True, vidro=True)
    e.ancoras['porta'] = e.P(2.0, 3.2, 0)
    e.cornija(e.h, Ramp('#ffffff', dark='#8a7a6a'))
    e.relogio('e', 2.0, e.h - 10, r=5)
    e.telhado_4aguas(e.h + 3, rh=26)
    x, y = e.ancoras['topo']
    e.bandeira(x + 18, y + 12, cor='#6fa8e8', cor2='#ffd65c', alt=20)
    e.chamine(.5, .7, e.h + 3, 18)
    return _fim(e, estado, e.h)


# ------------------------------------------------------------------ Redação do Jornal 3x3
def jornal(estado='aberto'):
    if estado == 'obras':
        return _obras(3, 3, 2, Ramp('#cfe3f2'))
    e = Ed(3, 3, 2 * PISO, extra_top=60)
    e.paredes(AZUL_V, azulejo='#4f7fd0', rodape='#4f6f8f')
    # montra grande com a capa da edição (texto vem da UI)
    mk = e.poly(e.fq('e', .3, 1.7, 3, 19))
    e.cv.put(dilate4(mk) & ~mk, hx('#3d4a6a'))
    e.cv.put(mk, I.P['vidro'].base)
    capa = e.poly(e.fq('e', .6, 1.1, 5, 17))
    e.cv.put(capa, (255, 255, 255))
    e.cv.put(capa & (e.m.yy % 3 == 0), hx('#c9d3e2'))
    e.emissivo.append(mk & ~capa)
    e.porta('e', 2.3, w=.5, hh=22, cor='#e8775e', arco=False, vidro=True)
    e.ancoras['porta'] = e.P(2.3, 3.2, 0)
    e.toldo('e', .2, 1.8, 20, cores=('#4f7fd0', '#ffffff'))
    for a in (.6, 1.5, 2.4):
        e.janela('e', a, 8 + PISO - 4, w=.4, hh=12)
        e.janela('d', a, 8 + PISO - 4, w=.4, hh=12)
    e.janela('d', 1.0, 6, w=.6, hh=12)
    # quadro de ardósia à porta
    x, y = e.P(2.9, 3.6, 0)
    e.cv.part(e.m.rect(x - 4, y - 12, x + 4, y - 3), LOUSA, shade=0)
    e.cv.put(e.m.line([(x - 3, y - 2), (x - 5, y + 1)]) | e.m.line([(x + 3, y - 2), (x + 5, y + 1)]), hx('#8a6a4a'))
    e.telhado_4aguas(e.h, rh=22)
    e.chamine(2.2, .6, e.h, 14)
    return _fim(e, estado, e.h)


# ------------------------------------------------------------------ Laboratório 3x3 + estufa
def laboratorio(estado='aberto'):
    if estado == 'obras':
        return _obras(3, 3, 2, Ramp('#d4efe0'))
    e = Ed(3, 3, 2 * PISO, extra_top=70)
    e.paredes(MENTA, rodape='#4f7f6a')
    for a in (.5, 1.5, 2.5):
        e.janela('e', a, 9, w=.5, hh=14, arco=True)
        e.janela('d', a, 9, w=.5, hh=14, arco=True)
        e.janela('e', a, 9 + PISO, w=.4, hh=11)
        e.janela('d', a, 9 + PISO, w=.4, hh=11)
    e.porta('e', 1.5, w=.5, hh=22, cor='#5fae8f', vidro=True)
    e.ancoras['porta'] = e.P(1.5, 3.2, 0)
    e.telhado_plano(e.h, Ramp('#b4dcc6', dark='#4f7f6a'))
    # cúpula de vidro
    x, y = e.P(1.5, 1.5, e.h + 4)
    m = e.m
    dome = m.ellipse(x, y - 4, 30, 24) & m.rect(0, 0, e.cw, y)
    V = I.P['vidro']
    e.cv.put(dilate4(dome) & ~dome, V.dark)
    e.cv.put(dome, V.base)
    for k in range(-24, 25, 12):
        e.cv.put(m.line([(x + k, y), (x + k // 3, y - 27)]) & dome, V.shade)
    e.cv.put(m.ellipse(x, y - 4, 30, 24) & ~m.ellipse(x, y - 4, 29, 23) & m.rect(0, 0, e.cw, y), V.dark)
    e.cv.put(m.line([(x - 15, y - 14), (x - 8, y - 18)]), V.light)
    e.emissivo.append(dome)
    e.cv.part(m.circle(x, y - 28, 2), Ramp('#ffcf4d'), shade=0)
    e.ancoras['topo'] = (x, y - 30)
    e.ancoras['fumo'] = (x + 22, y - 10)
    e.chamine(2.5, .3, e.h + 4, 10)
    return _fim(e, estado, e.h)


def estufa():
    e = Ed(2, 1, 20, extra_top=20)
    V = I.P['vidro']
    e.caixa(0, 0, 2, 1, 0, 20, Ramp('#cfeef2', light='#ecfaff', shade='#a9dbe6', dark='#4f86a8'))
    m = e.m
    for face, L in (('e', 2), ('d', 1)):
        mk = e.poly(e.fq(face, 0, L, 0, 20))
        for k in range(1, int(L * 4)):
            e.cv.put(e.m.line([e.P(*e.fq(face, k / 4, k / 4, 0, 20)[0]), e.P(*e.fq(face, k / 4, k / 4, 0, 20)[3])]), V.dark)
        # plantas lá dentro
        e.cv.put(mk & (m.yy % 5 == 0) & ((m.xx // 2) % 3 == 0), I.P['folha'].base)
    e.telhado_2aguas(20, rh=10, R=Ramp('#dff6fa', dark='#4f86a8'))
    return e


# ------------------------------------------------------------------ Biblioteca 3x3
def biblioteca(estado='aberto'):
    if estado == 'obras':
        return _obras(3, 3, 2, Ramp('#f4e3c4'))
    e = Ed(3, 3, 2 * PISO + 4, extra_top=60)
    e.paredes(AMARELO, rodape='#b98a5e')
    for a in (.55, 2.45):
        e.janela('e', a, 10, w=.45, hh=16, arco=True)
    for a in (.6, 1.5, 2.4):
        e.janela('d', a, 10, w=.45, hh=16, arco=True)
        e.janela('e', a, 12 + PISO, w=.45, hh=10, arco=True)
        e.janela('d', a, 12 + PISO, w=.45, hh=10, arco=True)
    # escadaria
    for k in range(3):
        e.caixa(1.0 - k * .08, 3, 2.0 + k * .08, 3.25 + k * .22, 0, 6 - k * 2, PEDRA)
    e.porta('e', 1.5, w=.55, hh=26, cor='#8a5a3a', dupla=True)
    e.ancoras['porta'] = e.P(1.5, 3.8, 0)
    e.cornija(e.h, PEDRA)
    e.telhado_4aguas(e.h + 3, rh=20, R=Ramp('#9fb4d6', light='#c3d2ea', shade='#8197bf', dark='#3f4f7a'))
    return _fim(e, estado, e.h)


# ------------------------------------------------------------------ Arquivo 3x3
def arquivo(estado='aberto'):
    if estado == 'obras':
        return _obras(3, 3, 1, Ramp('#e0d6c4'))
    e = Ed(3, 3, PISO + 14, extra_top=50)
    e.paredes(PEDRA, rodape='#9a8a7a')
    e.porta('e', 1.5, w=1.1, hh=30, cor='#a77755', dupla=True, arco=True)
    e.ancoras['porta'] = e.P(1.5, 3.2, 0)
    for a in (.6, 1.5, 2.4):
        e.janela('d', a, 22, w=.35, hh=10)
    # caixas e pastas à porta
    for k, (i, j) in enumerate(((.25, 3.5), (2.6, 3.4), (2.75, 3.75))):
        e.caixa(i, j, i + .3, j + .3, 0, 8 + (k == 1) * 6, Ramp('#d9b07a'))
    e.telhado_4aguas(e.h, rh=18, R=Ramp('#c9a27e', dark='#5a4030'))
    return _fim(e, estado, e.h)


# ------------------------------------------------------------------ Junta de Freguesia e Correios 3x3 + torre
def junta(estado='aberto'):
    if estado == 'obras':
        return _obras(3, 3, 2, Ramp('#f6ead2'))
    e = Ed(3, 3, 2 * PISO, extra_top=110)
    e.paredes(ROSA_V, rodape='#a3675a')
    for a in (.5, 2.5):
        e.janela('e', a, 9, w=.45, hh=14, moldura='#ffffff', persiana='#4f7f6a')
    for a in (.6, 1.5, 2.4):
        e.janela('e', a, 9 + PISO, w=.4, hh=12, moldura='#ffffff', flores=True)
        e.janela('d', a, 9, w=.4, hh=12)
        e.janela('d', a, 9 + PISO, w=.4, hh=12)
    e.porta('e', 1.5, w=.55, hh=24, cor='#4f7f6a', dupla=True)
    e.ancoras['porta'] = e.P(1.5, 3.2, 0)
    e.cornija(e.h, Ramp('#ffffff', dark='#8a6a60'))
    e.telhado_4aguas(e.h + 3, rh=18)
    # torre
    z0 = e.h + 3
    e.caixa(1.1, 1.1, 1.9, 1.9, z0, z0 + 34, ROSA_V)
    tx, ty = e.P(1.9, 1.5, z0 + 22)
    e.cv.part(e.m.rect(tx - 2, ty - 6, tx + 2, ty + 2), Ramp('#3d3a4a'), shade=0)  # sineira
    e.cv.put(e.m.circle(tx, ty - 1, 1.5), hx('#ffd65c'))
    ex = Ed.__new__(Ed)
    # telhado da torre: pirâmide
    a, b, c, d = e.P(1.0, 1.0, z0 + 34), e.P(2.0, 1.0, z0 + 34), e.P(2.0, 2.0, z0 + 34), e.P(1.0, 2.0, z0 + 34)
    top = e.P(1.5, 1.5, z0 + 52)
    T = I.P['telha']
    front = e.m.poly([d, c, top]); right = e.m.poly([c, b, top])
    e.cv.put(dilate4(front | right) & ~(front | right), T.dark)
    e.cv.put(front, T.base); e.cv.put(right, T.shade)
    e.ninho_cegonha(top[0], top[1] + 1)
    e.ancoras['topo'] = (top[0], top[1] - 4)
    # marco do correio à porta
    mc = I.marco_correio()
    x, y = e.P(2.6, 3.5, 0)
    e.cv.over_fast(mc, x - 8, y - 29)
    e.bandeira(*e.P(.3, 3.0, e.h + 3), cor='#4f7fd0', cor2='#ffffff', alt=20)
    return _fim(e, estado, e.h)


# ------------------------------------------------------------------ Centro de Segurança Digital 3x3
def seguranca(estado='aberto'):
    if estado == 'obras':
        return _obras(3, 3, 2, Ramp('#dbe2ec'))
    e = Ed(3, 3, 2 * PISO, extra_top=60)
    e.paredes(BRANCO, rodape='#5a6a80')
    # janelas em banda
    for z in (8, 8 + PISO):
        for face, L in (('e', 3), ('d', 3)):
            mk = e.poly(e.fq(face, .25, L - .25, z, z + 12))
            e.cv.put(dilate4(mk) & ~mk, hx('#5a6a80'))
            e.cv.put(mk, I.P['vidro'].base)
            e.cv.put(mk & ((e.m.xx - e.m.yy) % 9 < 2), I.P['vidro'].light)
            e.emissivo.append(mk)
    e.porta('e', 1.5, w=.6, hh=22, cor='#5f8fe0', arco=False, vidro=True)
    e.ancoras['porta'] = e.P(1.5, 3.2, 0)
    e.telhado_plano(e.h, Ramp('#dbe2ec', dark='#5a6a80'))
    # símbolo inventado: escudo com estrela
    x, y = e.P(1.5, 1.5, e.h + 6)
    m = e.m
    sh = m.poly([(x - 8, y - 16), (x + 8, y - 16), (x + 8, y - 6), (x, y + 2), (x - 8, y - 6)])
    e.cv.part(sh, Ramp('#6fa8e8'), shade=1, glint=True)
    st = m.poly([(x, y - 14), (x + 2, y - 10), (x + 6, y - 10), (x + 3, y - 7), (x + 4, y - 3), (x, y - 5), (x - 4, y - 3), (x - 3, y - 7), (x - 6, y - 10), (x - 2, y - 10)])
    e.cv.put(st, hx('#ffe36e'))
    e.cv.put(m.line([(x, y + 2), (x, y + 8)]), hx('#5a6a80'))
    e.ancoras['topo'] = (x, y - 18)
    return _fim(e, estado, e.h)


# ------------------------------------------------------------------ Mercado 3x3 (bancas)
def mercado(estado='aberto'):
    if estado == 'obras':
        return _obras(3, 3, 1, Ramp('#f2dcc0'))
    e = Ed(3, 3, PISO, extra_top=50)
    m = e.m
    # chão de calçada
    base = e.poly([(0, 0, 0), (3, 0, 0), (3, 3, 0), (0, 3, 0)])
    e.cv.put(base, I.P['calcada'].shade)
    cores = [('#ef7b8f', '#ffffff'), ('#6fa8e8', '#ffffff'), ('#8fd18a', '#ffffff'), ('#ffcf4d', '#ffffff')]
    pos = [(.2, .2), (1.6, .2), (.2, 1.6), (1.6, 1.6)]
    frutas = ['#ffa94a', '#ef6f6f', '#8fd18a', '#ffd65c', '#c79be6']
    for k, (i, j) in enumerate(pos):
        # balcão
        e.caixa(i, j + .8, i + 1.1, j + 1.2, 0, 10, Ramp('#d9a86a'))
        top = e.poly([(i, j + .8, 10), (i + 1.1, j + .8, 10), (i + 1.1, j + 1.2, 10), (i, j + 1.2, 10)])
        for q in range(6):
            p = e.P(i + .15 + q * .16, j + 1.0, 11)
            e.cv.part(m.circle(p[0], p[1] - 1, 1.5), Ramp(frutas[(q + k) % 5]), shade=0)
        # postes e toldo às riscas
        for (pi, pj) in ((i, j + 1.2), (i + 1.1, j + 1.2)):
            e.cv.put(m.line([e.P(pi, pj, 0), e.P(pi, pj, 26)]), hx('#6b5a4a'))
        n = 6
        for q in range(n):
            a0, a1 = i + 1.1 * q / n, i + 1.1 * (q + 1) / n
            tq = e.poly([(a0, j + .6, 30), (a1, j + .6, 30), (a1, j + 1.35, 24), (a0, j + 1.35, 24)])
            e.cv.put(tq, Ramp(cores[k][q % 2]).base)
        allq = e.poly([(i, j + .6, 30), (i + 1.1, j + .6, 30), (i + 1.1, j + 1.35, 24), (i, j + 1.35, 24)])
        e.cv.put(dilate4(allq) & ~allq, Ramp(cores[k][0]).dark)
    # balança
    x, y = e.P(2.75, 2.9, 0)
    e.cv.part(m.rect(x - 3, y - 8, x + 3, y), Ramp('#ef6f6f'), shade=0)
    e.cv.part(m.ellipse(x, y - 9, 4, 1.5), Ramp('#c9cfdc'), shade=0)
    e.ancoras['topo'] = e.P(1.5, 1.5, 34)
    e.ancoras['porta'] = e.P(1.5, 3.2, 0)
    if estado == 'festivo':
        e.grinaldas(28)
    return _fim(e, estado if estado != 'festivo' else 'aberto', 30)


# ------------------------------------------------------------------ Oficina dos Robôs 3x3
def oficina(estado='aberto'):
    if estado == 'obras':
        return _obras(3, 3, 1, Ramp('#d6d9e4'))
    e = Ed(3, 3, PISO + 12, extra_top=50)
    e.paredes(LILAS, rodape='#5f557f')
    # portão de garagem
    mk = e.poly(e.fq('e', .4, 2.0, 0, 28))
    e.cv.put(dilate4(mk) & ~mk, hx('#4f4a6a'))
    e.cv.put(mk, hx('#b9bfd6'))
    e.cv.put(mk & (e.m.yy % 3 == 0), hx('#9aa1bd'))
    e.porta('e', 2.5, w=.4, hh=20, cor='#ffcf4d', arco=False, vidro=True)
    e.ancoras['porta'] = e.P(1.2, 3.2, 0)
    for a in (.8, 2.2):
        e.janela('d', a, 14, w=.5, hh=12)
    e.telhado_2aguas(e.h, rh=16, R=Ramp('#8a92b8', dark='#3f4560'), parede=LILAS)
    # engrenagem no frontão
    x, y = e.P(1.5, 3.0, e.h - 8)
    m = e.m
    g = m.circle(x, y, 5)
    for k in range(8):
        a = k * math.pi / 4
        g |= m.circle(x + math.cos(a) * 5, y + math.sin(a) * 5, 1.4)
    e.cv.part(g & ~m.circle(x, y, 2), Ramp('#ffcf4d'), shade=0)
    return _fim(e, estado, e.h)


# ------------------------------------------------------------------ Museu 3x3
def museu(estado='aberto'):
    if estado == 'obras':
        return _obras(3, 3, 2, Ramp('#efe4cf'))
    e = Ed(3, 3, 2 * PISO, extra_top=60)
    e.paredes(PEDRA, rodape='#9a8a7a')
    # colunas
    m = e.m
    for a in (.35, .95, 2.05, 2.65):
        col = e.poly(e.fq('e', a - .07, a + .07, 0, e.h - 2))
        e.cv.part(col, Ramp('#ffffff', dark='#8a7a6a'), shade=1)
    e.porta('e', 1.5, w=.6, hh=28, cor='#7a5a8a', dupla=True)
    # fechadura grande
    x, y = e.P(1.55, 3, 13)
    e.cv.part(m.circle(x, y, 2), Ramp('#ffcf4d'), shade=0)
    e.cv.put(m.tri((x - 1, y + 1), (x + 1, y + 1), (x, y + 5)), hx('#ffcf4d'))
    e.ancoras['porta'] = e.P(1.5, 3.2, 0)
    for a in (.75, 2.25):
        e.janela('d', a, 14, w=.4, hh=18, arco=True)
    e.cornija(e.h, PEDRA)
    # frontão triangular
    z = e.h + 3
    fr = e.poly([(0, 3.1, z), (3, 3.1, z), (1.5, 3.1, z + 18)])
    e.cv.part(fr, PEDRA, shade=1)
    x, y = e.P(1.5, 3.1, z + 7)
    e.cv.part(m.ellipse(x, y, 4, 2), Ramp('#ffcf4d'), shade=0)
    e.telhado_2aguas(z, rh=18, R=Ramp('#c9bfae', dark='#6a5a4a'))
    return _fim(e, estado, e.h)


# ------------------------------------------------------------------ Largo e Torre do Relógio 4x4
def largo(estado='aberto', frame=0):
    e = Ed(4, 4, 90, extra_top=40)
    m = e.m
    base = e.poly([(0, 0, 0), (4, 0, 0), (4, 4, 0), (0, 4, 0)])
    calc = I.tile_calcada(0)
    # chão de calçada em 16 mosaicos
    for i in range(4):
        for j in range(4):
            x, y = e.P(i, j, 0)
            e.cv.over_fast(calc, int(x - 32), int(y))
    # torre do relógio (canto de trás)
    if estado == 'obras':
        e.caixa(.3, .3, 1.1, 1.1, 0, 40, PEDRA)
        e.ancoras['topo'] = e.P(.7, .7, 40)
    else:
        e.caixa(.3, .3, 1.1, 1.1, 0, 86, PEDRA)
        for z in (20, 46):
            mk = e.poly([(.55, 1.1, z), (.85, 1.1, z), (.85, 1.1, z + 10), (.55, 1.1, z + 10)])
            e.cv.put(mk, I.P['vidro'].base); e.emissivo.append(mk)
        x, y = e.P(.7, 1.1, 72)
        e.cv.part(m.circle(x, y, 6), Ramp('#ffffff', dark='#5a5466'), shade=1)
        e.cv.put(m.line([(x, y), (x, y - 4)]) | m.line([(x, y), (x + 3, y + 1)]), hx('#3d3a4a'))
        a, b, c, d = e.P(.2, .2, 86), e.P(1.2, .2, 86), e.P(1.2, 1.2, 86), e.P(.2, 1.2, 86)
        top = e.P(.7, .7, 104)
        T = I.P['telha']
        fr = m.poly([d, c, top]); rr = m.poly([c, b, top])
        e.cv.put(dilate4(fr | rr) & ~(fr | rr), T.dark); e.cv.put(fr, T.base); e.cv.put(rr, T.shade)
        e.ancoras['topo'] = top
    # coreto, fonte, bancos, laranjeiras
    cr = I.coreto(); x, y = e.P(2.9, 1.2, 0); e.cv.over_fast(cr, x - 32, y - 52)
    ft = I.fonte(frame); x, y = e.P(1.6, 2.8, 0); e.cv.over_fast(ft, x - 24, y - 28)
    for (i, j) in ((3.6, 2.6), (2.6, 3.6)):
        b = I.banco(); x, y = e.P(i, j, 0); e.cv.over_fast(b, x - 16, y - 18)
    for (i, j) in ((.3, 3.5), (3.6, .4)):
        t = I.arvore('laranjeira', frame); x, y = e.P(i, j, 0); e.cv.over_fast(t, x - 24, y - 60)
    if estado == 'festivo':
        for (p0, p1) in (((.7, 1.1, 60), (2.9, 1.2, 40)), ((.7, 1.1, 60), (1.1, 3.6, 30))):
            pts = []
            for k in range(25):
                t = k / 24
                p = tuple(p0[q] * (1 - t) + p1[q] * t for q in range(3))
                x, y = e.P(*p)
                pts.append((x, y + math.sin(math.pi * t) * 10))
            e.cv.put(m.line(pts), hx('#6b5a4a'))
            for k, (x, y) in enumerate(pts[1:-1:2]):
                e.cv.part(m.tri((x - 2, y), (x + 2, y), (x, y + 4)), Ramp(['#ef6f8f', '#ffd65c', '#6fa8e8', '#8fd18a'][k % 4]), shade=0)
    e.ancoras['porta'] = e.P(2, 4, 0)
    x, y = e.ancoras['topo']
    e.ancoras['marcador'] = (int(x), int(y - 24))
    if estado == 'concluido':
        fl = N.visto_bandeira(0); e.cv.over_fast(fl, int(x - 3), int(y - 21))
    return e


# ------------------------------------------------------------------ Horta e Ecoponto 3x2
def horta(estado='aberto'):
    e = Ed(3, 2, 30, extra_top=40)
    m = e.m
    soil = I.tile_canteiro()
    for i in range(2):
        for j in range(2):
            x, y = e.P(i, j, 0)
            e.cv.over_fast(soil, int(x - 32), int(y))
    if estado != 'obras':
        # couves e alfaces
        for i in range(4):
            for j in range(4):
                x, y = e.P(.25 + i * .45, .25 + j * .45, 0)
                e.cv.part(m.ellipse(x, y - 2, 3, 2), I.P['folha'], shade=0)
        # telheiro de reparação
        e.caixa(2.1, .2, 2.9, 1.2, 0, 22, Ramp('#d9b07a'))
        x, y = e.P(2.9, .7, 12)
        e.cv.part(m.rect(x - 3, y - 4, x + 3, y + 1), Ramp('#8a92b8'), shade=0)  # computador velho a reparar
        e.cv.put(m.rect(x - 2, y - 3, x + 2, y - 1), hx('#bfe6f6'))
        for k, c in enumerate(('#4f7fd0', '#ffcf4d', '#6fbf6a')):
            ec = I.ecoponto(c)
            x, y = e.P(1.2 + k * .55, 2.4, 0)
            e.cv.over_fast(ec, x - 10, y - 27)
        rg = I.mochila_chao()
    else:
        e.andaimes(10)
    e.ancoras['topo'] = e.P(1.5, 1, 30)
    e.ancoras['porta'] = e.P(1.5, 2.2, 0)
    x, y = e.ancoras['topo']
    e.ancoras['marcador'] = (int(x), int(y - 24))
    if estado == 'concluido':
        fl = N.visto_bandeira(0); e.cv.over_fast(fl, int(x - 3), int(y - 21))
    if estado == 'festivo':
        e.grinaldas(26)
    return e


# ------------------------------------------------------------------ Casa 2x2 (camadas)
CASA_PAREDES = {'nata': '#f6ead2', 'rosa': '#f6c9c0', 'ceu': '#cfe3f2', 'menta': '#d4efe0', 'limao': '#f9eaa3', 'lilas': '#e0d6f2', 'pessego': '#f8d2b8', 'branco': '#f5f7fa'}
CASA_TELHADOS = {'telha': '#e98a5e', 'ardosia': '#6f7891', 'verde': '#7fb88a', 'azul': '#6f9fd8', 'vinho': '#b45d6a', 'mel': '#e3a94a'}
CASA_PORTAS = {'azul': '#5f8fe0', 'verde': '#4f9f7a', 'amarela': '#f2c94c', 'vermelha': '#e8675e', 'madeira': '#a77755', 'lilas': '#9c7bf0'}


def casa(parede='nata', telhado='telha', porta='azul', camada=None, estado='aberto'):
    """camada: None (tudo) | 'paredes' | 'telhado' | 'porta' para composição em código."""
    e = Ed(2, 2, PISO - 4, extra_top=40)
    Rw = Ramp(CASA_PAREDES[parede])
    if camada in (None, 'paredes'):
        e.paredes(Rw, rodape='#c98e5a')
        e.janela('e', .55, 8, w=.45, hh=11, persiana=CASA_PORTAS[porta] if camada is None else '#ffffff', flores=True)
        e.janela('d', 1.0, 8, w=.5, hh=11)
    if camada in (None, 'porta'):
        e.porta('e', 1.4, w=.4, hh=19, cor=CASA_PORTAS[porta], arco=False)
    e.ancoras['porta'] = e.P(1.4, 2.25, 0)
    if camada in (None, 'telhado'):
        e.telhado_2aguas(e.h, rh=18, R=Ramp(CASA_TELHADOS[telhado]), parede=Rw if camada is None else None)
        e.chamine(1.4, .4, e.h + 4, 12)
    e.ancoras['topo'] = e.P(1, 1, e.h + 18)
    x, y = e.ancoras['topo']
    e.ancoras['marcador'] = (int(x), int(y - 24))
    e.ancoras['caixa_correio'] = e.P(.2, 2.6, 0)
    e.ancoras['bandeira'] = e.P(2.3, 2.4, 0)
    return e


EDIFICIOS = {
    'escola': (escola, '4x3', 'Escola'),
    'jornal': (jornal, '3x3', 'Redação do Jornal'),
    'laboratorio': (laboratorio, '3x3', 'Laboratório'),
    'biblioteca': (biblioteca, '3x3', 'Biblioteca'),
    'arquivo': (arquivo, '3x3', 'Arquivo'),
    'junta': (junta, '3x3', 'Junta de Freguesia e Correios'),
    'seguranca': (seguranca, '3x3', 'Centro de Segurança Digital'),
    'mercado': (mercado, '3x3', 'Mercado'),
    'oficina': (oficina, '3x3', 'Oficina dos Robôs'),
    'museu': (museu, '3x3', 'Museu'),
    'largo': (largo, '4x4', 'Largo e Torre do Relógio'),
    'horta': (horta, '3x2', 'Horta e Ecoponto'),
}
ESTADOS = ['obras', 'aberto', 'concluido', 'festivo']
