"""Nascimento do avatar: Dona Cegonha, ninho, ovos (um por fato), rachas, abertura e efeitos."""
from __future__ import annotations
import math
from engine import Canvas, Ramp, hx, dilate4, checker
import avatar as A

BRANCO = (255, 255, 255)

# ------------------------------------------------------------------ Dona Cegonha
CEG = dict(corpo=Ramp('#f7f5f0'), asa=Ramp('#3f4258'), bico=Ramp('#f2854a'), perna=Ramp('#f08a5b'),
           bone=Ramp('#5f8fe0'), mala=Ramp('#c98e5a'), olho=hx('#2b2233'))


def cegonha(estado='parada', i=0, falar=False, piscar=False, trouxa=False):
    """estado: parada | voo | pousar | acenar. Tela 64x64, pés em (32, 60)."""
    cv = Canvas(64, 64)
    m = cv.m
    from types import SimpleNamespace
    C = SimpleNamespace(**CEG)
    if estado == 'voo':
        bob = [0, -1, -2, -1, 0, 1][i % 6]
        up = [1, .4, -.4, -1, -.4, .4][i % 6]
        bx, by = 30, 30 + bob
        # asa de trás
        cv.part(m.poly([(bx + 2, by - 2), (bx + 10, by - 2 - 14 * up), (bx + 18, by - 4 - 12 * up), (bx + 10, by + 2)]), C.asa, shade=0)
        # corpo
        cv.part(m.ellipse(bx, by, 11, 6), C.corpo, shade=1)
        # pernas para trás
        cv.put(m.line([(bx - 9, by + 3), (bx - 20, by + 6)]), C.perna.base)
        cv.put(m.line([(bx - 9, by + 4), (bx - 20, by + 8)]), C.perna.shade)
        # pescoço e cabeça
        cv.part(m.capsule(bx + 8, by - 2, bx + 15, by - 6, 2.4), C.corpo, shade=0)
        cv.part(m.circle(bx + 17, by - 8, 4.5), C.corpo, shade=1)
        cv.part(m.poly([(bx + 20, by - 9), (bx + 31, by - 6), (bx + 20, by - 6)]), C.bico, shade=0)
        # boné de carteira
        cv.part(m.ellipse(bx + 16, by - 12, 4, 2.5) & m.rect(0, 0, 64, by - 11), C.bone, shade=0)
        cv.put(m.rect(bx + 19, by - 12, bx + 22, by - 11), C.bone.dark)
        cv.put(m.rect(bx + 18, by - 9, bx + 19, by - 8), C.olho)
        cv.put(m.pts([(bx + 18, by - 9)]), BRANCO)
        cv.put(m.pts([(bx + 16, by - 6)]), Ramp('#f6a5b4').base)
        # trouxa pendurada no bico
        cv.put(m.line([(bx + 27, by - 6), (bx + 27, by + 3)]), hx('#a07b5a'))
        cv.part(m.ellipse(bx + 27, by + 8, 5, 5), Ramp('#f8d9e2'), shade=1)
        cv.part(m.tri((bx + 24, by + 3), (bx + 30, by + 3), (bx + 27, by + 6)), Ramp('#f8d9e2'), shade=0)
        cv.put(m.pts([(bx + 25, by + 8), (bx + 29, by + 9), (bx + 27, by + 11)]), Ramp('#9fc8ee').base)
        # asa da frente
        cv.part(m.poly([(bx - 4, by - 2), (bx + 2, by - 4 - 16 * up), (bx + 12, by - 6 - 14 * up), (bx + 8, by + 3)]), C.corpo, shade=1)
        cv.put(m.poly([(bx + 2, by - 4 - 16 * up), (bx + 12, by - 6 - 14 * up), (bx + 9, by - 6 - 9 * up), (bx + 3, by - 4 - 11 * up)]), C.asa.base)
        # cauda
        cv.part(m.tri((bx - 10, by - 3), (bx - 17, by - 5), (bx - 11, by + 2)), C.asa, shade=0)
        return cv
    # de pé (parada, pousar, acenar)
    bob = 0
    asa_up = 0
    if estado == 'pousar':
        bob = [-6, -3, -1, 0][min(i, 3)]
        asa_up = [1, .6, .3, 0][min(i, 3)]
    if estado == 'parada':
        bob = [0, 0, 1, 1][i % 4]
    bx, by = 30, 38 + bob
    # pernas
    for dx in (-3, 3):
        cv.put(m.line([(bx + dx, by + 6), (bx + dx, 59)]), C.perna.base)
        cv.put(m.pts([(bx + dx - 1, 59), (bx + dx + 1, 59), (bx + dx + 2, 59)]), C.perna.dark)
    # mala de carteira
    cv.put(m.line([(bx - 6, by - 6), (bx + 7, by + 4)]), C.mala.dark)
    cv.part(m.rect(bx + 4, by + 1, bx + 11, by + 7), C.mala, shade=1)
    cv.put(m.rect(bx + 6, by + 3, bx + 9, by + 4), BRANCO)
    # asa de trás aberta (pouso ou acenar)
    if estado in ('pousar',) and asa_up:
        cv.part(m.poly([(bx + 2, by - 4), (bx + 16, by - 4 - 12 * asa_up), (bx + 14, by + 2)]), C.corpo, shade=1)
    # corpo
    cv.part(m.ellipse(bx, by, 9, 8), C.corpo, shade=2, light=1)
    # asa lateral com pontas escuras
    if estado == 'acenar':
        up = [0, 1, .5, 1][i % 4]
        cv.part(m.poly([(bx - 6, by - 3), (bx - 16, by - 8 - 6 * up), (bx - 18, by - 2 - 6 * up), (bx - 7, by + 4)]), C.corpo, shade=1)
        cv.put(m.poly([(bx - 16, by - 8 - 6 * up), (bx - 18, by - 2 - 6 * up), (bx - 14, by - 3 - 6 * up)]), C.asa.base)
    else:
        w = m.ellipse(bx - 2, by + 1, 7, 5)
        cv.part(w, C.corpo, shade=1)
        cv.put(w & m.rect(0, by + 3, bx + 1, 64), C.asa.base)
    cv.part(m.tri((bx - 8, by + 2), (bx - 14, by + 6), (bx - 7, by + 6)), C.asa, shade=0)
    # pescoço e cabeça
    b = [0, 1, 2, 3, 3, 2, 1, 0][i % 8] if estado == 'entregar' else 0
    cv.part(m.capsule(bx + 3, by - 6, bx + 5 + 2 * b, by - 16 + 3 * b, 2.6), C.corpo, shade=1)
    hxp, hyp = bx + 6 + 2 * b, by - 19 + 4 * b
    cv.part(m.circle(hxp, hyp, 5), C.corpo, shade=1)
    bopen = 2 if falar else 0
    cv.part(m.poly([(hxp + 3, hyp - 1), (hxp + 17, hyp + 2 - bopen), (hxp + 3, hyp + 2)]), C.bico, shade=0)
    if falar:
        cv.part(m.poly([(hxp + 3, hyp + 3), (hxp + 15, hyp + 4), (hxp + 3, hyp + 4)]), C.bico, shade=0)
    # boné
    cv.part(m.ellipse(hxp - 1, hyp - 5, 5, 3) & m.rect(0, 0, 64, hyp - 4), C.bone, shade=0)
    cv.put(m.rect(hxp + 2, hyp - 5, hxp + 6, hyp - 4), C.bone.dark)
    cv.put(m.pts([(hxp - 1, hyp - 7)]), hx('#ffd65c'))
    # olho
    if piscar:
        cv.put(m.rect(hxp + 1, hyp, hxp + 2, hyp), C.olho)
    else:
        cv.put(m.rect(hxp + 1, hyp - 1, hxp + 2, hyp + 1), C.olho)
        cv.put(m.pts([(hxp + 1, hyp - 1)]), BRANCO)
    cv.put(m.pts([(hxp - 2, hyp + 2), (hxp - 1, hyp + 2)]), Ramp('#f6a5b4').base)
    if trouxa:
        tx_, ty_ = hxp + 14, hyp + 1
        cv.put(m.line([(tx_, ty_), (tx_, ty_ + 4)]), hx('#a07b5a'))
        cv.part(m.ellipse(tx_, ty_ + 9, 5, 5), Ramp('#f8d9e2'), shade=1)
        cv.part(m.tri((tx_ - 3, ty_ + 4), (tx_ + 3, ty_ + 4), (tx_, ty_ + 7)), Ramp('#f8d9e2'), shade=0)
        cv.put(m.pts([(tx_ - 2, ty_ + 9), (tx_ + 2, ty_ + 10), (tx_, ty_ + 12)]), Ramp('#9fc8ee').base)
    return cv


CEG_ANIMS = {
    'entregar': [('entregar', i, False, False, i < 4) for i in range(8)],
    'pousar-trouxa': [('pousar', i, False, False, True) for i in range(4)],
    'voo': [('voo', i, False, False) for i in range(6)],
    'pousar': [('pousar', i, False, False) for i in range(4)],
    'parada': [('parada', i, False, i == 2) for i in range(4)],
    'falar': [('parada', 0, i % 2 == 1, False) for i in range(4)],
    'acenar': [('acenar', i, i % 2 == 1, False) for i in range(4)],
}

# ------------------------------------------------------------------ ninho
def ninho():
    cv = Canvas(48, 28)
    m = cv.m
    cesto = Ramp('#d9a86a')
    manta = [Ramp('#f6b7c8'), Ramp('#fbe9d0'), Ramp('#9fd0ee')]
    # manta por trás
    back = m.ellipse(24, 12, 19, 7)
    cv.part(back, manta[1], shade=1)
    for k, x in enumerate(range(6, 44, 4)):
        cv.put(back & m.rect(x, 0, x + 1, 28), manta[k % 3].base if k % 3 != 1 else manta[0].base)
    # cesto
    c = m.ellipse(24, 18, 21, 9) & m.rect(0, 14, 48, 28)
    c |= m.rect(3, 14, 45, 17)
    cv.part(c, cesto, shade=2, light=1)
    # entrançado
    for y in (17, 20, 23):
        for x in range(4, 46, 4):
            cv.put(m.pts([(x + (y // 3) % 2 * 2, y), (x + 1 + (y // 3) % 2 * 2, y)]) & c, cesto.shade)
    # rebordo
    cv.part(m.ellipse(24, 14, 22, 3), cesto, shade=0, light=1)
    cv.put(m.ellipse(24, 14, 22, 3) & m.rect(0, 13, 48, 13), cesto.light)
    # pontas da manta por cima do rebordo
    cv.part(m.poly([(5, 12), (11, 13), (8, 19)]), manta[0], shade=0)
    cv.part(m.poly([(40, 12), (45, 13), (42, 18)]), manta[2], shade=0)
    return cv


# ------------------------------------------------------------------ ovos
def _pastel(hexc, amt=.45):
    r, g, b = hx(hexc)
    return (int(r + (255 - r) * amt), int(g + (255 - g) * amt), int(b + (255 - b) * amt))


def egg_mask(m, cx=14, cy=19, rx=11, ry=14):
    # oval de ovo: mais estreito em cima
    yy, xx = m.yy, m.xx
    t = (yy - cy) / ry
    k = 1 - .18 * (-t).clip(0, 1)
    return ((xx - cx) / (rx * k + .5)) ** 2 + ((yy - cy) / (ry + .5)) ** 2 <= 1


def ovo(f, racha=0, wob=0, aberto=False, tampa_dy=0, tampa_rot=0):
    """Tela 28x36. Ovo com padrão do animal. racha 0..3. aberto: só a metade de baixo; a tampa é desenhada à parte."""
    cv = Canvas(28, 36)
    m = cv.m
    base = Ramp(_pastel(f['main'], .5))
    acc = Ramp(_pastel(f['acc'], .15) if f['acc'] else base.shade)
    cx = 14 + wob
    e = egg_mask(m, cx, 20)
    cut = m.empty()
    # linha de abertura em zigue-zague
    zig = m.empty()
    for x in range(0, 28):
        y = 13 + (1 if (x // 2) % 2 else -1)
        zig |= m.rect(x, 0, x, y)
    if aberto:
        e = e & ~zig
    cv.part(e, base, shade=2, light=1)
    # textura de tecido (pontinhos)
    tex = e & (((m.xx + (m.yy // 4) * 2) % 4) == 0) & (m.yy % 4 == 2)
    lt = tuple(int(a * .55 + b * .45) for a, b in zip(base.base, base.light))
    cv.put(tex & ~dilate4(~e), lt)
    pat = f['pattern']
    area = e & ~dilate4(~e)
    if pat in ('pintas', 'joaninha', 'pintas-foca', 'manchas', 'ventosas'):
        pts = [(cx - 5, 12), (cx + 4, 10), (cx - 2, 19), (cx + 6, 18), (cx - 6, 25), (cx + 2, 27), (cx, 6)]
        for (x, y) in pts:
            r = 1.6 if pat != 'pintas-foca' else .8
            cv.part(m.ellipse(x, y, r, r * .8) & area, acc, outline=False, shade=0, light=0)
    elif pat in ('riscas', 'riscas-gato', 'riscas-abelha', 'riscas-cam', 'segmentos'):
        for y in range(8, 34, 5):
            cv.put(m.rect(0, y, 28, y + (1 if pat != 'segmentos' else 0)) & area, acc.base)
    elif pat == 'escamas':
        for y in range(9, 32, 4):
            for x in range(cx - 10 + (y // 4 % 2) * 2, cx + 11, 4):
                cv.put(m.pts([(x, y), (x + 1, y + 1), (x - 1, y + 1)]) & area, acc.base)
    elif pat == 'panda':
        for x in (cx - 4, cx + 4):
            cv.put(m.ellipse(x, 16, 2.5, 2) & area, acc.base)
    elif pat == 'penas':
        for y in range(10, 32, 4):
            for x in range(cx - 8, cx + 9, 4):
                cv.put(m.pts([(x, y), (x + 1, y + 1)]) & area, acc.base)
    elif pat in ('garganta', 'mascara', 'focinho', 'mancha-olho', 'nenhum'):
        # coraçõezinhos e estrelas para os lisos
        for (x, y) in ((cx - 5, 12), (cx + 4, 20), (cx - 3, 27)):
            cv.put(m.pts([(x - 1, y), (x + 1, y), (x - 1, y + 1), (x, y + 1), (x + 1, y + 1), (x, y + 2)]) & area, acc.base)
    # laço (só com o ovo fechado)
    if not aberto:
        lr = Ramp('#ff9fb8')
        cv.part(m.tri((cx, 7), (cx - 5, 4), (cx - 5, 9)), lr, shade=0)
        cv.part(m.tri((cx, 7), (cx + 5, 4), (cx + 5, 9)), lr, shade=0)
        cv.part(m.circle(cx, 7, 1.3), lr, shade=0)
    # rachas
    crack = [[], [(cx + 1, 15), (cx + 2, 16), (cx + 1, 17), (cx + 2, 18)],
             [(cx - 4, 14), (cx - 3, 15), (cx - 4, 16), (cx - 5, 17)],
             [(cx + 5, 22), (cx + 6, 23), (cx + 5, 24), (cx + 4, 25), (cx + 5, 26)]]
    for k in range(1, min(racha, 3) + 1):
        cv.put(m.pts(crack[k]) & area, base.dark)
    if racha >= 3:
        cv.put(m.pts([(cx - 1, 11), (cx, 12), (cx - 1, 13)]) & area, base.dark)
    if aberto:
        # interior luminoso
        rim = e & ~ahead_down(e)
        cv.put(m.ellipse(cx, 15, 8, 2) & e, hx('#fff6c9'))
    return cv


def ahead_down(mask):
    from engine import ahead
    return ahead(mask, 0, -1)


def tampa(f, rot=0):
    cv = Canvas(28, 20)
    m = cv.m
    base = Ramp(_pastel(f['main'], .5))
    e = egg_mask(m, 14, 20)
    zig = m.empty()
    for x in range(0, 28):
        y = 13 + (1 if (x // 2) % 2 else -1)
        zig |= m.rect(x, 0, x, y)
    t = e & zig
    cv.part(t, base, shade=1, light=1)
    lr = Ramp('#ff9fb8')
    cv.part(m.tri((14, 7), (9, 4), (9, 9)), lr, shade=0)
    cv.part(m.tri((14, 7), (19, 4), (19, 9)), lr, shade=0)
    cv.part(m.circle(14, 7, 1.3), lr, shade=0)
    return cv


# ------------------------------------------------------------------ efeitos
def brilho(i, cor='#fff3a8'):
    cv = Canvas(9, 9)
    m = cv.m
    s = [1, 2, 3, 2][i % 4]
    c = hx(cor)
    cv.put(m.rect(4, 4 - s, 4, 4 + s) | m.rect(4 - s, 4, 4 + s, 4), c)
    if s >= 2:
        cv.put(m.pts([(4, 4)]), BRANCO)
    return cv


def coracao(i):
    cv = Canvas(9, 12)
    m = cv.m
    dy = 4 - i
    pts = [(2, 1), (3, 1), (5, 1), (6, 1), (1, 2), (2, 2), (3, 2), (4, 2), (5, 2), (6, 2), (7, 2), (2, 3), (3, 3), (4, 3), (5, 3), (6, 3), (3, 4), (4, 4), (5, 4), (4, 5)]
    mk = m.pts([(x, y + dy + 2) for x, y in pts])
    R = Ramp('#ff8fb1')
    cv.part(mk, R, shade=0, light=0)
    cv.put(m.pts([(2, dy + 4)]), BRANCO)
    if i == 3:
        cv.a[..., 3] = (cv.a[..., 3] * .5).astype('uint8')
    return cv


def confetes(i, n=8):
    cv = Canvas(48, 40)
    m = cv.m
    cols = ['#ef6f8f', '#6fa8e8', '#ffd65c', '#8fd18a', '#c79be6']
    import random
    rnd = random.Random(7)
    t = i / (n - 1)
    for k in range(18):
        ang = rnd.uniform(-math.pi * .95, -math.pi * .05)
        sp = rnd.uniform(10, 22)
        x = 24 + math.cos(ang) * sp * t * 1.2
        y = 30 + math.sin(ang) * sp * t + 30 * t * t
        c = hx(cols[k % 5])
        if (k + i) % 2:
            cv.put(m.pts([(x, y), (x + 1, y)]), c)
        else:
            cv.put(m.pts([(x, y), (x, y + 1)]), c)
    return cv


def luz(i):
    """brilho quente da abertura (camada aditiva sugerida)."""
    cv = Canvas(48, 48)
    m = cv.m
    r = [6, 12, 18, 20, 16, 10][i % 6]
    for k, (rr, a) in enumerate(((r, 70), (r * .66, 120), (r * .33, 200))):
        cv.put(m.circle(24, 24, rr), (255, 238, 170, a))
    return cv


def poeira(i):
    cv = Canvas(16, 10)
    m = cv.m
    for k, (x, y) in enumerate(((3, 6), (8, 5), (12, 7))):
        dx = (k - 1) * i
        cv.part(m.circle(x + dx, y - i, max(.6, 1.6 - i * .4)), Ramp('#f4efe6'), shade=0)
    return cv


def zzz(i):
    cv = Canvas(12, 16)
    m = cv.m
    c = hx('#7f8bc9')
    for k in range(3):
        y = 12 - k * 5 - (i % 3)
        x = 2 + k * 3
        if y < 0:
            continue
        s = 1 + (k > 0)
        cv.put(m.line([(x, y), (x + s + 1, y), (x, y + s + 1), (x + s + 1, y + s + 1)]), c)
    return cv


def pensamento(i):
    cv = Canvas(16, 14)
    m = cv.m
    R = Ramp('#ffffff', dark='#9aa3c7')
    for k, (x, y, r) in enumerate(((3, 11, 1), (6, 8, 1.5), (10, 4, 3.4))):
        if k <= i:
            cv.part(m.circle(x, y, r), R, shade=0, light=0)
    if i >= 3:
        cv.put(m.pts([(8, 4), (10, 4), (12, 4)]), hx('#9aa3c7'))
    return cv


def exclamacao(i):
    """marcador de missão: pino com ponto de exclamação (a etiqueta vem da UI)."""
    cv = Canvas(16, 22)
    m = cv.m
    dy = [0, -1, -2, -1][i % 4]
    R = Ramp('#ffcf4d')
    cv.part(m.circle(8, 7 + dy, 6), R, shade=1, glint=True)
    cv.part(m.tri((5, 11 + dy), (11, 11 + dy), (8, 16 + dy)), R, shade=0)
    cv.put(m.rect(7, 3 + dy, 8, 8 + dy) | m.rect(7, 10 + dy, 8, 10 + dy), hx('#5a3a12'))
    return cv


def visto_bandeira(i):
    """concluído: bandeirola com visto (forma + ícone, nunca só cor)."""
    cv = Canvas(16, 22)
    m = cv.m
    sway = [0, 1, 1, 0][i % 4]
    cv.put(m.line([(3, 2), (3, 21)]), hx('#6b5a4a'))
    R = Ramp('#6cc489')
    cv.part(m.poly([(4, 3), (14 + sway, 5), (14 + sway, 12), (4, 11)]), R, shade=0)
    cv.put(m.pts([(7, 8), (8, 9), (9, 8), (10, 7), (11, 6)]), BRANCO)
    return cv


def cadeado():
    cv = Canvas(12, 14)
    m = cv.m
    cv.put((m.ellipse(6, 5, 3.5, 4) & ~m.ellipse(6, 5, 2, 2.6)) & m.rect(0, 0, 12, 6), hx('#7c8296'))
    cv.part(m.rect(2, 6, 9, 12), Ramp('#f2c94c'), shade=1)
    cv.put(m.rect(5, 8, 6, 10), hx('#6b4a12'))
    return cv
