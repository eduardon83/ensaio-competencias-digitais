"""Mundo isométrico: mosaicos 64x32 nativos (128x64 a 1x), adereços e utilitários de iluminação."""
from __future__ import annotations
import math, random
import numpy as np
from engine import Canvas, Ramp, hx, dilate4, ahead

TW, TH = 64, 32

# ------------------------------------------------------------------ paleta do mundo
P = dict(
    relva=Ramp('#9fd67e', light='#c3e8a0', shade='#7fbf6a', dark='#4f8f5a'),
    relva2=Ramp('#8ccc74'),
    terra=Ramp('#e2bf8c'),
    calcada=Ramp('#f1ead9', light='#fbf7ee', shade='#ddd2bb'),
    basalto=Ramp('#5b5664'),
    paralelo=Ramp('#c9c3c8'),
    agua=Ramp('#8fd0ee', light='#c6ecfa', shade='#6bb5e0', dark='#3f80b8'),
    areia=Ramp('#f6dfaa'),
    telha=Ramp('#e98a5e', light='#f7b28b', shade='#c86c4c', dark='#7e3b33'),
    pedra=Ramp('#efe4cf'),
    madeira=Ramp('#c99a6b'),
    folha=Ramp('#7cc47a', light='#a8dc8e', shade='#5ea86d', dark='#3d7556'),
    folha_escura=Ramp('#5fae74'),
    tronco=Ramp('#a77755'),
    laranja=Ramp('#ffa94a'),
    vidro=Ramp('#bfe6f6', light='#ecfaff', shade='#93cbe6', dark='#4f86a8'),
    janela_noite=Ramp('#ffd98a', light='#fff1c4', shade='#f2b75e'),
)


def iso_pt(i, j):
    return ((i - j) * TW // 2, (i + j) * TH // 2)


# ------------------------------------------------------------------ texturas em espaço de mosaico
def tex_to_iso(T, w=TW, h=TH):
    """mapeia uma textura quadrada (n x n x 4) para o losango isométrico."""
    n = T.shape[0]
    cv = Canvas(w, h)
    yy, xx = np.mgrid[0:h, 0:w]
    xc = (xx + .5 - w / 2) / (w / 2)
    yc = (yy + .5) / (h / 2)
    u = (xc + yc) / 2
    v = (yc - xc) / 2
    inside = (u >= 0) & (u < 1) & (v >= 0) & (v < 1)
    ui = np.clip((u * n).astype(int), 0, n - 1)
    vi = np.clip((v * n).astype(int), 0, n - 1)
    cv.a[inside] = T[vi[inside], ui[inside]]
    return cv


def solid(n, col):
    T = np.zeros((n, n, 4), np.uint8)
    T[...] = (*col, 255)
    return T


def tile_relva(seed=0, flores=False):
    rnd = random.Random(seed)
    n = 32
    T = solid(n, P['relva'].base)
    # manchas suaves
    for _ in range(10):
        x, y = rnd.randrange(n), rnd.randrange(n)
        for dx in range(-2, 3):
            for dy in range(-1, 2):
                if abs(dx) + abs(dy) < 3:
                    T[(y + dy) % n, (x + dx) % n, :3] = P['relva2'].base
    # tufos
    for _ in range(12):
        x, y = rnd.randrange(n), rnd.randrange(n)
        T[y, x, :3] = P['relva'].shade
        T[(y + 1) % n, x, :3] = P['relva'].light
    cv = tex_to_iso(T)
    m = cv.m
    if flores:
        cols = ['#ffffff', '#ffd65c', '#f6a5b4', '#c79be6']
        for _ in range(5):
            x, y = rnd.randrange(14, 50), rnd.randrange(8, 24)
            if cv.a[y, x, 3]:
                c = hx(cols[rnd.randrange(4)])
                cv.put(m.pts([(x, y - 1), (x - 1, y), (x + 1, y)]) & cv.alpha_mask(), c)
                cv.put(m.pts([(x, y)]) & cv.alpha_mask(), hx('#ffcf4d'))
    return cv


def tile_calcada(variante=0):
    """calçada portuguesa: pedra clara com onda de basalto (padrão 'mar largo')."""
    n = 64
    T = solid(n, P['calcada'].base)
    rnd = random.Random(3 + variante)
    # juntas de pedrinhas
    for y in range(n):
        for x in range(n):
            if (x % 4 == 0 and y % 4 in (0, 1)) or (y % 4 == 0 and x % 4 in (2,)):
                T[y, x, :3] = P['calcada'].shade
    if variante in (0, 1):
        for x in range(n):
            yc = n / 2 + math.sin((x / n) * 2 * math.pi) * (n / 6)
            for y in range(n):
                d = abs(y - yc)
                if d < 4:
                    T[y, x, :3] = P['basalto'].base if (x + y) % 4 else P['basalto'].light
                    if (x % 4 == 0 and y % 4 in (0, 1)):
                        T[y, x, :3] = P['basalto'].shade
    return tex_to_iso(T)


def tile_paralelos():
    n = 32
    T = solid(n, P['paralelo'].base)
    for y in range(n):
        for x in range(n):
            if y % 4 == 3 or (x + (y // 4) * 2) % 6 == 5:
                T[y, x, :3] = P['paralelo'].shade
            elif y % 4 == 0 and (x + (y // 4) * 2) % 6 == 0:
                T[y, x, :3] = P['paralelo'].light
    return tex_to_iso(T)


def tile_terra(seed=1):
    rnd = random.Random(seed)
    n = 32
    T = solid(n, P['terra'].base)
    for _ in range(18):
        x, y = rnd.randrange(n), rnd.randrange(n)
        T[y, x, :3] = P['terra'].shade if rnd.random() < .7 else P['terra'].light
    return tex_to_iso(T)


def tile_areia():
    rnd = random.Random(5)
    n = 32
    T = solid(n, P['areia'].base)
    for _ in range(14):
        x, y = rnd.randrange(n), rnd.randrange(n)
        T[y, x, :3] = P['areia'].shade
    return tex_to_iso(T)


def tile_agua(frame=0):
    n = 32
    T = solid(n, P['agua'].base)
    for y in range(n):
        for x in range(n):
            w = math.sin((x + frame * 2) / 32 * 2 * math.pi * 2 + y / 5)
            if w > .85 and y % 4 == (frame % 4):
                T[y, x, :3] = P['agua'].light
            elif w < -.9:
                T[y, x, :3] = P['agua'].shade
    cv = tex_to_iso(T)
    # brilhos que piscam devagar
    m = cv.m
    spots = [(20, 12), (40, 18), (30, 22)]
    x, y = spots[frame % 3]
    cv.put(m.pts([(x, y), (x + 1, y)]), (255, 255, 255))
    return cv


def tile_canteiro():
    n = 32
    T = solid(n, hx('#a67a55'))
    for y in range(n):
        if y % 8 in (0, 1):
            T[y, :, :3] = hx('#8a6244')
        if y % 8 == 4:
            for x in range(2, n, 5):
                T[y, x, :3] = P['folha'].base
                T[y - 1, x, :3] = P['folha'].light
    return tex_to_iso(T)


def bloco_borda(top: Canvas, h=12, side=P['terra']):
    """mosaico com espessura: a aldeia é uma ilha-maqueta a flutuar (profundidade e composição)."""
    cv = Canvas(TW, TH + h)
    m = cv.m
    left = m.poly([(0, 16), (32, 32), (32, 32 + h), (0, 16 + h)])
    right = m.poly([(32, 32), (64, 16), (64, 16 + h), (32, 32 + h)])
    cv.put(left, side.base)
    cv.put(right, side.shade)
    # camadas de terra
    for k in range(3, h, 4):
        cv.put(m.line([(0, 16 + k), (32, 32 + k)]) & left, side.shade)
        cv.put(m.line([(32, 32 + k), (64, 16 + k)]) & right, side.dark)
    cv.put(m.line([(0, 16 + h), (32, 32 + h), (64, 16 + h)]), side.dark)
    cv.over_fast(top)
    # relva a cair pela borda
    for x in range(1, 63, 3):
        y = 16 + abs(32 - x) // -2 + 16 if False else (16 + (x if x < 32 else 64 - x) // 2)
        cv.put(m.pts([(x, y + 1), (x, y + 2 if x % 2 else y + 1)]), P['relva'].shade)
    return cv


def contorno_mosaico(cor=(255, 255, 255), alpha=120):
    """realce de mosaico para foco/rato (usa a cor --foco em código)."""
    cv = Canvas(TW, TH)
    m = cv.m
    d = m.poly([(32, 0), (64, 16), (32, 32), (0, 16)])
    cv.put(dilate4(d) & ~d | (d & ~(ahead(d, 1, 0) & ahead(d, -1, 0) & ahead(d, 0, 1) & ahead(d, 0, -1))), (*cor, alpha))
    return cv


# ------------------------------------------------------------------ adereços (base central em baixo)
def _c(w, h):
    return Canvas(w, h)


def sombra(cv, cx, cy, rx, ry, op=.28):
    from engine import shadow_ellipse
    shadow_ellipse(cv, cx, cy, rx, ry, color=(60, 60, 110), opacity=op)


def arvore(tipo='laranjeira', frame=0, estacao=0):
    cv = _c(48, 64)
    m = cv.m
    sw = [0, 1, 0, -1][frame % 4]  # baloiço suave da copa
    sombra(cv, 24, 60, 14, 5)
    T = P['tronco']
    if tipo == 'pinheiro-manso':
        cv.part(m.poly([(22, 60), (26, 60), (25, 34), (28, 26), (26, 26), (24, 32), (20, 24), (18, 25), (23, 34)]), T, shade=1)
        copa = m.ellipse(24 + sw, 20, 22, 9) | m.ellipse(16 + sw, 18, 10, 7) | m.ellipse(33 + sw, 18, 11, 7)
        cv.part(copa, Ramp('#5fae74', light='#86c98a', shade='#4a9466', dark='#2f6650'), shade=2, light=1)
        for (x, y) in ((14, 16), (24, 14), (34, 16)):
            cv.put(m.ellipse(x + sw, y, 3, 1), hx('#86c98a'))
        return cv
    if tipo == 'oliveira':
        cv.part(m.poly([(21, 60), (27, 60), (26, 44), (30, 36), (27, 36), (24, 42), (19, 36), (17, 37), (22, 46)]), Ramp('#9a8a7a'), shade=1)
        copa = m.ellipse(24 + sw, 28, 17, 11) | m.ellipse(15 + sw, 30, 8, 6) | m.ellipse(33 + sw, 30, 8, 6)
        cv.part(copa, Ramp('#a9c58e', light='#c9dcab', shade='#8aab78', dark='#5a7a5a'), shade=2, light=1)
        for (x, y) in ((16, 28), (26, 24), (30, 32), (21, 33)):
            cv.put(m.pts([(x + sw, y), (x + 1 + sw, y)]), hx('#6b5f7a'))
        return cv
    if tipo == 'arbusto':
        cv = _c(32, 28)
        m = cv.m
        sombra(cv, 16, 24, 11, 3)
        b = m.ellipse(16, 16, 12, 8) | m.ellipse(10, 14, 6, 5) | m.ellipse(22, 13, 7, 6)
        cv.part(b, P['folha'], shade=2, light=1)
        return cv
    # laranjeira
    cv.part(m.capsule(24, 59, 24, 40, 2.5), T, shade=1)
    copa = m.circle(24 + sw, 28, 15) | m.circle(14 + sw, 33, 8) | m.circle(34 + sw, 33, 8)
    cv.part(copa, P['folha'], shade=2, light=1)
    for (x, y) in ((16, 26), (28, 22), (32, 34), (20, 36), (25, 30), (12, 34)):
        cv.part(m.circle(x + sw, y, 1.6), P['laranja'], shade=0, outline=False)
        cv.put(m.pts([(x - 1 + sw, y - 1)]), (255, 230, 170))
    return cv


def banco():
    cv = _c(32, 24)
    m = cv.m
    sombra(cv, 16, 20, 12, 3)
    W_ = P['madeira']
    for (x0, y0) in ((6, 17), (24, 11), (10, 19), (27, 13)):
        cv.put(m.line([(x0, y0 - 5), (x0, y0)]), hx('#5f5a6a'))
    cv.part(m.poly([(4, 13), (24, 3), (29, 6), (9, 16)]), W_, shade=0)
    cv.part(m.poly([(4, 13), (4, 7), (24, -3), (24, 3)]), W_, shade=0)
    for k in range(3):
        cv.put(m.line([(5 + k, 13 - k * 0 + 0), (25, 3 + 0)]) & m.empty(), W_.shade)
    return cv


def candeeiro(aceso=False):
    cv = _c(16, 48)
    m = cv.m
    sombra(cv, 8, 45, 5, 2)
    F = Ramp('#4f5a6e')
    cv.part(m.rect(7, 12, 8, 45), F, shade=0)
    cv.part(m.rect(5, 43, 10, 45), F, shade=0)
    cv.part(m.poly([(3, 8), (12, 8), (10, 14), (5, 14)]), F, shade=0)
    vid = m.rect(5, 9, 10, 13)
    cv.put(vid, P['janela_noite'].light if aceso else P['vidro'].base)
    cv.part(m.tri((3, 8), (12, 8), (7.5, 3)), F, shade=0)
    return cv


def halo(r=18, cor='#ffe6a0', alpha=90):
    """luz aditiva para a noite (desenhar com modo 'lighter' ou 'screen')."""
    cv = _c(r * 2 + 2, r + 2)
    m = cv.m
    for rr, a in ((r, alpha // 3), (r * .7, alpha // 2), (r * .4, alpha)):
        cv.put(m.ellipse(r, r // 2, rr, rr / 2), (*hx(cor), a))
    return cv


def marco_correio():
    cv = _c(16, 32)
    m = cv.m
    sombra(cv, 8, 29, 6, 2)
    R = Ramp('#e8775e')
    cv.part(m.rect(3, 10, 12, 29) | m.ellipse(7.5, 10, 4.5, 4), R, shade=2, glint=True)
    cv.put(m.rect(5, 15, 10, 15), R.dark)
    cv.put(m.rect(3, 27, 12, 29), R.shade)
    return cv


def ecoponto(cor):
    cv = _c(20, 30)
    m = cv.m
    sombra(cv, 10, 27, 8, 2)
    R = Ramp(cor)
    cv.part(m.rect(2, 9, 17, 27), R, shade=2)
    cv.part(m.ellipse(9.5, 9, 8, 3), R, shade=0, light=1)
    cv.put(m.ellipse(9.5, 9, 4, 1), R.dark)
    # símbolo de reciclar simplificado: setas em triângulo
    cv.put(m.pts([(9, 15), (8, 16), (10, 16), (7, 18), (11, 18), (8, 19), (9, 19), (10, 19)]), (255, 255, 255))
    return cv


def fonte(frame=0):
    cv = _c(48, 36)
    m = cv.m
    sombra(cv, 24, 30, 20, 6)
    S = P['pedra']
    cv.part(m.ellipse(24, 26, 20, 8), S, shade=2)
    cv.put(m.ellipse(24, 24, 16, 6), P['agua'].base)
    cv.put(m.ellipse(24, 24, 16, 6) & m.rect(0, 0, 48, 21), P['agua'].light)
    cv.part(m.rect(22, 10, 26, 24), S, shade=1)
    cv.part(m.ellipse(24, 10, 7, 3), S, shade=0)
    # jatos
    for k, dx in enumerate((-4, 0, 4)):
        ph = (frame + k) % 4
        y = 4 + ph
        cv.put(m.pts([(24 + dx, y), (24 + dx + (1 if dx > 0 else -1 if dx < 0 else 0), y + 2)]), P['agua'].light)
    cv.put(m.pts([(24, 2 + frame % 2), (24, 3 + frame % 2)]), (255, 255, 255))
    return cv


def coreto():
    cv = _c(64, 64)
    m = cv.m
    sombra(cv, 32, 56, 26, 8)
    S = P['pedra']
    cv.part(m.ellipse(32, 52, 26, 9), S, shade=2)
    cv.part(m.rect(6, 46, 58, 52) | m.ellipse(32, 46, 26, 9), S, shade=1)
    F = Ramp('#7fb8d8')
    for x in (10, 22, 32, 42, 54):
        cv.part(m.rect(x - 1, 22, x, 46), Ramp('#f4f1ea'), shade=0)
    cv.put(m.line([(8, 38), (56, 38)]), F.dark)
    cv.part(m.poly([(4, 24), (32, 6), (60, 24), (32, 32)]), F, shade=1)
    cv.part(m.poly([(29, 8), (32, 0), (35, 8)]), F, shade=0)
    for x in range(8, 58, 6):
        cv.put(m.pts([(x, 25 + abs(32 - x) // -7 + 4)]), F.light)
    return cv


def grinaldas(w=48, frame=0):
    cv = _c(w, 14)
    m = cv.m
    cols = ['#ef6f8f', '#ffd65c', '#6fa8e8', '#8fd18a', '#c79be6']
    sag = 5
    pts = [(x, 2 + sag * math.sin(math.pi * x / (w - 1))) for x in range(w)]
    cv.put(m.line(pts), hx('#6b5a4a'))
    for k, x in enumerate(range(3, w - 2, 6)):
        y = 2 + sag * math.sin(math.pi * x / (w - 1))
        c = cols[(k + frame) % 5] if False else cols[k % 5]
        cv.part(m.tri((x - 2, y), (x + 2, y), (x, y + 4)), Ramp(c), shade=0)
    return cv


def luzinhas(w=48, frame=0):
    cv = _c(w, 12)
    m = cv.m
    sag = 4
    pts = [(x, 2 + sag * math.sin(math.pi * x / (w - 1))) for x in range(w)]
    cv.put(m.line(pts), hx('#5a5466'))
    for k, x in enumerate(range(2, w - 1, 5)):
        y = 3 + sag * math.sin(math.pi * x / (w - 1))
        on = (k + frame) % 3 != 0
        cv.put(m.pts([(x, y), (x, y + 1)]), hx('#fff1a8') if on else hx('#d9b45a'))
    return cv


def bicicleta():
    cv = _c(28, 20)
    m = cv.m
    sombra(cv, 14, 17, 11, 2)
    for cx_ in (6, 21):
        r = m.ellipse(cx_, 12, 4, 5)
        cv.put(r & ~m.ellipse(cx_, 12, 3, 4), hx('#3d3a4a'))
    F = Ramp('#ef6f6f')
    cv.put(m.line([(6, 12), (12, 6), (19, 6), (21, 12)]), F.base)
    cv.put(m.line([(12, 6), (13, 12), (21, 12)]), F.base)
    cv.put(m.line([(19, 6), (19, 3), (22, 3)]), hx('#3d3a4a'))
    cv.put(m.rect(10, 4, 13, 4), hx('#3d3a4a'))
    return cv


def mochila_chao():
    cv = _c(16, 16)
    m = cv.m
    sombra(cv, 8, 13, 6, 2)
    R = Ramp('#6f9ff0')
    cv.part(m.ellipse(8, 9, 6, 5), R, shade=1, glint=True)
    cv.part(m.rect(4, 9, 11, 12), R, shade=1)
    return cv


def vedacao():
    cv = _c(36, 26)
    m = cv.m
    W_ = Ramp('#f4efe6')
    for k in range(5):
        x = 2 + k * 8
        y = 20 - k * 4
        cv.part(m.rect(x, y - 10, x + 1, y), W_, shade=0)
    cv.part(m.poly([(2, 14), (35, -2), (35, 0), (2, 16)]), W_, shade=0)
    cv.part(m.poly([(2, 18), (35, 2), (35, 4), (2, 20)]), W_, shade=0)
    return cv


def borboleta(frame=0, cor='#f6a5b4'):
    cv = _c(8, 6)
    m = cv.m
    R = Ramp(cor)
    open_ = frame % 2 == 0
    if open_:
        cv.put(m.pts([(1, 1), (2, 1), (1, 2), (2, 2), (5, 1), (6, 1), (5, 2), (6, 2), (2, 3), (5, 3)]), R.base)
    else:
        cv.put(m.pts([(2, 1), (2, 2), (5, 1), (5, 2)]), R.base)
    cv.put(m.pts([(3, 1), (4, 1), (3, 2), (4, 2), (3, 3)]), hx('#4a3f45'))
    return cv


def passaro(frame=0):
    cv = _c(10, 6)
    m = cv.m
    c = hx('#5b5668')
    if frame % 2 == 0:
        cv.put(m.pts([(0, 1), (1, 2), (2, 3), (3, 3), (4, 2), (5, 3), (6, 3), (7, 2), (8, 1)]), c)
    else:
        cv.put(m.pts([(1, 3), (2, 3), (3, 3), (4, 2), (5, 3), (6, 3), (7, 3)]), c)
    return cv


def nuvem():
    cv = _c(64, 24)
    m = cv.m
    b = m.ellipse(32, 15, 26, 7) | m.circle(22, 11, 8) | m.circle(36, 8, 10) | m.circle(48, 13, 6)
    cv.part(b, Ramp('#ffffff', light='#ffffff', shade='#e3ecf7', dark='#bfd0e6'), shade=2, light=0)
    return cv


def sombra_nuvem():
    cv = _c(96, 40)
    m = cv.m
    cv.put(m.ellipse(48, 20, 44, 16) | m.ellipse(30, 16, 20, 12), (60, 70, 120, 40))
    return cv


def baloico():
    cv = _c(32, 36)
    m = cv.m
    sombra(cv, 16, 32, 13, 3)
    F = Ramp('#e8775e')
    cv.put(m.line([(3, 33), (8, 4)]) | m.line([(13, 33), (8, 4)]) | m.line([(19, 33), (24, 4)]) | m.line([(29, 33), (24, 4)]), F.base)
    cv.put(m.line([(8, 4), (24, 4)], 2), F.dark)
    cv.put(m.line([(13, 5), (13, 22)]) | m.line([(19, 5), (19, 22)]), hx('#6b5a4a'))
    cv.part(m.rect(12, 22, 20, 23), P['madeira'], shade=0)
    return cv


def caixa_correio_casa():
    cv = _c(12, 22)
    m = cv.m
    cv.put(m.rect(5, 10, 6, 21), P['tronco'].base)
    R = Ramp('#6f9ff0')
    cv.part(m.rect(1, 4, 10, 10) | m.ellipse(5.5, 4, 4.5, 3) & m.rect(0, 0, 12, 4), R, shade=1)
    cv.put(m.rect(10, 2, 11, 5), hx('#ef6f6f'))
    return cv


def bandeira_casa(cor_fato, cor_barriga, frame=0):
    cv = _c(16, 28)
    m = cv.m
    cv.put(m.line([(2, 2), (2, 27)]), hx('#6b5a4a'))
    sway = [0, 1, 1, 0][frame % 4]
    R = Ramp(cor_fato)
    f = m.poly([(3, 3), (14 + sway, 4 + sway), (14 + sway, 11), (3, 11)])
    cv.part(f, R, shade=0)
    cv.put(m.circle(8, 7, 2) & f, Ramp(cor_barriga).base)
    return cv


def canteiro_flores():
    cv = _c(32, 20)
    m = cv.m
    sombra(cv, 16, 17, 13, 3)
    b = m.poly([(2, 12), (16, 5), (30, 12), (16, 19)])
    cv.part(b, Ramp('#b98a5e'), shade=1)
    rnd = random.Random(9)
    for _ in range(9):
        x, y = rnd.randrange(8, 24), rnd.randrange(8, 15)
        c = ['#ef6f8f', '#ffd65c', '#ffffff', '#c79be6'][rnd.randrange(4)]
        cv.put(m.pts([(x, y + 1)]), P['folha'].base)
        cv.put(m.pts([(x, y)]), hx(c))
    return cv


def tile_ponte():
    n = 32
    T = solid(n, P['madeira'].base)
    for y in range(n):
        for x in range(n):
            if x % 6 == 5:
                T[y, x, :3] = P['madeira'].dark
            elif x % 6 == 0:
                T[y, x, :3] = P['madeira'].light
            if y in (0, 1, n - 2, n - 1):
                T[y, x, :3] = P['madeira'].shade
    return tex_to_iso(T)


def tile_campo(linha=False):
    n = 32
    T = solid(n, hx('#8fd07a'))
    for y in range(n):
        if (y // 4) % 2:
            T[y, :, :3] = hx('#9fda88')
    if linha:
        T[0:1, :, :3] = 255
        T[:, 0:1, :3] = 255
    return tex_to_iso(T)


def baliza():
    cv = _c(24, 22)
    m = cv.m
    W_ = (255, 255, 255)
    cv.put(m.line([(2, 20), (2, 6)]) | m.line([(2, 6), (20, 2)]) | m.line([(20, 2), (20, 14)]), W_)
    cv.put((m.poly([(3, 7), (19, 3), (19, 14), (3, 19)]) & ((m.xx + m.yy) % 3 == 0)), (220, 230, 240, 200))
    return cv
