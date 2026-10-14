"""Nascimento v2: ovo grande (o avatar cabe lá dentro), ninho maior e coreografia completa a 12 fps.

Problemas da v1 corrigidos:
- o avatar era maior do que o ovo e ficava por cima dele; agora sai de dentro (o fundo do ovo tapa-lhe o corpo);
- a tampa voava para junto da mão do avatar e parecia um objeto; agora descreve um arco e pousa no chão, à direita do ninho, virada ao contrário;
- a cegonha entrega a trouxa no ninho (antes o ovo aparecia do nada);
- o avatar salta do ovo para o chão, à frente do ninho, e só depois acena.
"""
from __future__ import annotations
import math
import numpy as np
from engine import Canvas, Ramp, hx, dilate4, ahead
import nascimento as N
import avatar as A
import montar as MT

EW, EH = 44, 58          # tela do ovo grande
ECX, ECY, ERX, ERY = 22, 33, 18, 24
ZIG = 21                 # linha de abertura


def _zig(m, w):
    z = m.empty()
    for x in range(w):
        y = ZIG + (1 if (x // 3) % 2 else -1)
        z |= m.rect(x, 0, x, y)
    return z


def ovo_g(f, racha=0, wob=0, parte='inteiro'):
    """parte: inteiro | baixo | tampa."""
    cv = Canvas(EW, EH)
    m = cv.m
    base = Ramp(N._pastel(f['main'], .5))
    acc = Ramp(N._pastel(f['acc'], .15))
    cx = ECX + wob
    e = N.egg_mask(m, cx, ECY, ERX, ERY)
    zig = _zig(m, EW)
    if parte == 'baixo':
        e = e & ~zig
    elif parte == 'tampa':
        e = e & zig
    cv.part(e, base, shade=2, light=1)
    area = e & ~dilate4(~e)
    tex = area & (((m.xx + (m.yy // 4) * 2) % 4) == 0) & (m.yy % 4 == 2)
    cv.put(tex, tuple(int(a * .55 + b * .45) for a, b in zip(base.base, base.light)))
    pat = f['pattern']
    s = 1.6
    P = lambda x, y: (cx + x * s, ECY + (y - 20) * s)
    if pat in ('pintas', 'joaninha', 'pintas-foca', 'manchas', 'ventosas'):
        for (x, y) in ((-5, 12), (4, 10), (-2, 19), (6, 18), (-6, 25), (2, 27), (0, 6)):
            r = 2.4 if pat != 'pintas-foca' else 1.2
            cv.part(m.ellipse(*P(x, y), r, r * .8) & area, acc, outline=False, shade=0, light=0)
    elif pat in ('riscas', 'riscas-gato', 'riscas-abelha', 'riscas-cam', 'segmentos'):
        for y in range(8, 34, 5):
            yy = P(0, y)[1]
            cv.put(m.rect(0, yy, EW, yy + (1 if pat != 'segmentos' else 0)) & area, acc.base)
    elif pat == 'escamas':
        for y in range(9, 32, 4):
            for x in range(-10 + (y // 4 % 2) * 2, 11, 4):
                X, Y = P(x, y)
                cv.put(m.pts([(X, Y), (X + 1, Y + 1), (X - 1, Y + 1)]) & area, acc.base)
    elif pat == 'panda':
        for x in (-4, 4):
            cv.put(m.ellipse(*P(x, 16), 3.6, 3) & area, acc.base)
    elif pat in ('penas', 'losangos'):
        for y in range(10, 32, 4):
            for x in range(-8, 9, 4):
                X, Y = P(x, y)
                cv.put(m.pts([(X, Y), (X + 1, Y + 1), (X + 2, Y)]) & area, acc.base)
    else:
        for (x, y) in ((-5, 12), (4, 20), (-3, 27), (5, 10)):
            X, Y = P(x, y)
            cv.put(m.pts([(X - 1, Y), (X + 1, Y), (X - 2, Y + 1), (X - 1, Y + 1), (X, Y + 1), (X + 1, Y + 1), (X + 2, Y + 1), (X - 1, Y + 2), (X, Y + 2), (X + 1, Y + 2), (X, Y + 3)]) & area, acc.base)
    if parte in ('inteiro', 'tampa'):
        lr = Ramp('#ff9fb8')
        cv.part(m.tri((cx, 11), (cx - 7, 7), (cx - 7, 14)), lr, shade=0)
        cv.part(m.tri((cx, 11), (cx + 7, 7), (cx + 7, 14)), lr, shade=0)
        cv.part(m.circle(cx, 11, 1.8), lr, shade=0)
    if parte == 'inteiro':
        cracks = [[], [(1, 20), (2, 21), (1, 22), (2, 23), (3, 24)], [(-6, 19), (-5, 20), (-6, 21), (-7, 22), (-6, 23)], [(7, 28), (8, 29), (7, 30), (6, 31), (7, 32), (8, 33)]]
        for k in range(1, min(racha, 3) + 1):
            cv.put(m.pts([(cx + x, y) for x, y in cracks[k]]) & area, base.dark)
        if racha >= 3:
            cv.put(m.pts([(cx - 2, 15), (cx - 1, 16), (cx - 2, 17), (cx + 9, 21), (cx + 10, 22)]) & area, base.dark)
    if parte == 'baixo':
        # interior: luz quente na boca do ovo
        inner = N.egg_mask(m, cx, ECY, ERX - 2, ERY - 2) & ~_zig(m, EW) & m.rect(0, 0, EW, ZIG + 4)
        cv.put(inner, hx('#fff6c9'))
    return cv


def ninho_g():
    cv = Canvas(72, 34)
    m = cv.m
    cesto = Ramp('#d9a86a')
    manta = [Ramp('#f6b7c8'), Ramp('#fbe9d0'), Ramp('#9fd0ee')]
    back = m.ellipse(36, 13, 29, 8)
    cv.part(back, manta[1], shade=1)
    for k, x in enumerate(range(8, 66, 5)):
        cv.put(back & m.rect(x, 0, x + 1, 34), manta[0].base if k % 2 else manta[2].base)
    c = (m.ellipse(36, 22, 32, 11) & m.rect(0, 17, 72, 34)) | m.rect(4, 17, 68, 21)
    cv.part(c, cesto, shade=2, light=1)
    for y in (21, 25, 29):
        for x in range(5, 68, 5):
            cv.put(m.pts([(x + (y // 4) % 2 * 2, y), (x + 1 + (y // 4) % 2 * 2, y)]) & c, cesto.shade)
    cv.part(m.ellipse(36, 17, 33, 3.5), cesto, shade=0, light=1)
    cv.part(m.poly([(6, 15), (14, 16), (10, 24)]), manta[0], shade=0)
    cv.part(m.poly([(60, 15), (67, 16), (63, 23)]), manta[2], shade=0)
    return cv


def ninho_frente():
    """só o rebordo e a parte de fora do cesto, para desenhar por cima do fundo do ovo."""
    full = ninho_g()
    cv = Canvas(72, 34)
    cv.a[16:] = full.a[16:]
    return cv


# ------------------------------------------------------------------ coreografia
SW, SH = 200, 120         # tela da cena
GROUND = 100
NX, NY = 74, 70           # canto do ninho
EX_, EY_ = NX + 36 - ECX, NY + 18 - (ECY + ERY) + 2   # o ovo assenta dentro do ninho


def _ease_out(t):
    return 1 - (1 - t) ** 3


def _ease_in_out(t):
    return .5 - math.cos(math.pi * t) / 2


def _put(cv, spr, x, y):
    cv.over_fast(spr, int(round(x)), int(round(y)))


def sequencia(f, ceu=True):
    """devolve (frames, segmentos). segmentos: nome -> [início, fim] (fim exclusivo)."""
    frames = []
    seg = {}
    ninho = ninho_g()
    nfront = ninho_frente()

    def fundo():
        cv = Canvas(SW, SH)
        if ceu:
            m = cv.m
            for k in range(8):
                y0, y1 = int(GROUND * k / 8), int(GROUND * (k + 1) / 8)
                t = k / 7
                c = tuple(int(a * (1 - t) + b * t) for a, b in zip(hx('#f7b98f'), hx('#fde3cf')))
                cv.put(m.rect(0, y0, SW, y1), c)
            cv.put(m.rect(0, GROUND - 6, SW, SH), hx('#a9d98f'))
            cv.put(m.rect(0, GROUND - 6, SW, GROUND - 6), hx('#c3e8a0'))
            cv.put(m.rect(0, GROUND + 2, SW, SH) & (((m.xx * 7 + m.yy * 3) % 13) == 0), hx('#8fc77a'))
        return cv

    stork_x, stork_y = 20, GROUND - 60 + 2  # canto da tela 64x64 da cegonha pousada

    def frame(ceg=None, ceg_pos=None, egg=None, egg_pos=(EX_, EY_), extra_back=(), extra_front=(), av=None, av_pos=None, av_inside=False, tampa=None):
        cv = fundo()
        for spr, x, y in extra_back:
            _put(cv, spr, x, y)
        if ceg is not None:
            _put(cv, ceg, *ceg_pos)
        _put(cv, ninho, NX, NY)
        if av is not None and av_inside:
            _put(cv, av, *av_pos)
        if egg is not None:
            _put(cv, egg, *egg_pos)
        _put(cv, nfront, NX, NY) if egg is not None and egg is not False else None
        if tampa is not None:
            _put(cv, tampa[0], tampa[1], tampa[2])
        if av is not None and not av_inside:
            _put(cv, av, *av_pos)
        for spr, x, y in extra_front:
            _put(cv, spr, x, y)
        frames.append(cv)

    # 1. chegada: 18 fotogramas de voo com trouxa, descida suave; 4 de pouso
    s0 = len(frames)
    for k in range(18):
        t = _ease_out(k / 17)
        x = -60 + (stork_x + 4 - -60) * t
        y = 4 + (stork_y - 8 - 4) * t + math.sin(k / 3) * 2 * (1 - t)
        frame(ceg=N.cegonha('voo', k % 6), ceg_pos=(x, y), egg=None)
    for k in range(4):
        frame(ceg=N.cegonha('pousar', k, trouxa=True), ceg_pos=(stork_x, stork_y))
    seg['chegada'] = [s0, len(frames)]
    # 2. entrega: baixa o pescoço até ao ninho, larga a trouxa; o ovo aparece com um saltinho e brilhos
    s0 = len(frames)
    for k in range(4):
        frame(ceg=N.cegonha('entregar', k, trouxa=True), ceg_pos=(stork_x, stork_y))
    egg = ovo_g(f)
    bounce = [-3, -1, 0, 0]
    for k in range(4):
        frame(ceg=N.cegonha('entregar', 4 + k), ceg_pos=(stork_x, stork_y), egg=egg, egg_pos=(EX_, EY_ + bounce[k]),
              extra_front=[(N.brilho(k), EX_ + 2, EY_ + 6), (N.brilho(k + 2), EX_ + 34, EY_ + 14), (N.poeira(k), EX_ + 14, EY_ + 46)])
    seg['entrega'] = [s0, len(frames)]
    # 3. à espera (ciclo de 12): cegonha fala e o ovo baloiça
    s0 = len(frames)
    wob = [0, 0, -1, -1, 0, 0, 1, 1, 0, 0, 0, 0]
    for k in range(12):
        frame(ceg=N.cegonha('parada', 0, falar=(k // 2) % 2 == 1), ceg_pos=(stork_x, stork_y), egg=ovo_g(f, 0, wob[k]),
              extra_front=[(N.brilho((k // 3) % 4), EX_ + 38, EY_ + 4)] if k % 6 < 3 else [])
    seg['espera'] = [s0, len(frames)]
    # 4. toques: 7 fotogramas cada (abanar, racha, poeira, brilho)
    for r in (1, 2, 3):
        s0 = len(frames)
        sh = [-2, 2, -2, 1, -1, 0, 0]
        for k in range(7):
            ex = []
            if k >= 2:
                ex.append((N.poeira(min(k - 2, 3)), EX_ + 14 + (r - 2) * 8, EY_ + 18))
            if k >= 3:
                ex.append((N.brilho(k - 3), EX_ + (6 if r % 2 else 30), EY_ + 10))
            frame(ceg=N.cegonha('parada', 0, piscar=(k == 1)), ceg_pos=(stork_x, stork_y), egg=ovo_g(f, r if k >= 1 else r - 1, sh[k]), extra_front=ex)
        seg[f'toque-{r}'] = [s0, len(frames)]
    # 5. abertura: abana forte, a tampa salta em arco e pousa no chão à direita (virada), luz quente e confetes
    s0 = len(frames)
    for k, w in enumerate((-2, 2, -2, 2)):
        frame(ceg=N.cegonha('parada', 0), ceg_pos=(stork_x, stork_y), egg=ovo_g(f, 3, w))
    low = ovo_g(f, 3, 0, 'baixo')
    lid = ovo_g(f, 3, 0, 'tampa')
    lid_flip = lid.copy(); lid_flip.a = lid.a[::-1].copy()
    lb, fb = lid.bbox(), lid_flip.bbox()
    L = 12
    x0, y0 = EX_, EY_
    x1 = NX + 76
    y1_unf = GROUND + 2 - lb[3]          # fundo do conteúdo da tampa no chão
    y1_flip = GROUND + 2 - fb[3]
    for k in range(L):
        t = k / (L - 1)
        x = x0 + (x1 - x0) * t
        y = y0 + (y1_unf - y0) * t - math.sin(math.pi * t) * 30
        spr, yy = (lid, y) if k < L - 2 else (lid_flip, y1_flip)
        ex = []
        if k < 6:
            ex.append((N.luz(k), EX_ - 2, EY_ - 6))
        front = []
        if 1 <= k < 9:
            front.append((N.confetes(k - 1), EX_ - 2, EY_ - 18))
        if k >= L - 2:
            front.append((N.poeira(k - (L - 2)), x1 + 14, GROUND - 6))
        frame(ceg=N.cegonha('parada', 0, falar=True), ceg_pos=(stork_x, stork_y), egg=low, extra_back=ex, tampa=(spr, x, yy), extra_front=front)
    seg['abertura'] = [s0, len(frames)]
    tampa_chao = (lid_flip, x1, y1_flip)
    # 6. sair: o avatar sobe de dentro do ovo (o fundo tapa-lhe o corpo), espreguiça-se, salta para o chão e acena
    s0 = len(frames)
    p_par = A.ANIMS['parado'][0]
    inside_x = EX_ + ECX - A.CX
    base_y = EY_ + 38 - A.GY + 22   # escondido
    rise = [EY_ + 7, EY_ + 1, EY_ - 5, EY_ - 11, EY_ - 16, EY_ - 19]
    for k, ay in enumerate(rise):
        pz = dict(A.ANIMS['outra-vez'][2 if k < 3 else 3]) if False else dict(p_par)
        pz['eyes'] = 'closed' if k < 4 else 'open'
        av = MT.avatar(f['id'], pz, shadow=False)
        frame(ceg=N.cegonha('parada', 0), ceg_pos=(stork_x, stork_y), egg=low, av=av, av_pos=(inside_x, ay), av_inside=True, tampa=tampa_chao,
              extra_front=[(N.coracao(min(k, 3)), EX_ + 36, EY_ - 4)] if k >= 2 else [])
    # espreguiçar (braços no ar) 4 fotogramas
    for k in range(4):
        av = MT.avatar(f['id'], A.ANIMS['celebrar'][4 if k % 2 else 3], shadow=False)
        frame(ceg=N.cegonha('parada', 0), ceg_pos=(stork_x, stork_y), egg=low, av=av, av_pos=(inside_x, EY_ - 21 - (k % 2)), av_inside=True, tampa=tampa_chao)
    # salto em arco para o chão, à frente do ninho
    jx0, jy0 = inside_x, EY_ - 21
    jx1, jy1 = NX + 36 - A.CX - 4, GROUND + 12 - A.GY
    J = 7
    for k in range(J):
        t = (k + 1) / J
        x = jx0 + (jx1 - jx0) * t
        y = jy0 + (jy1 - jy0) * t - math.sin(math.pi * t) * 14
        pz = A.ANIMS['celebrar'][5] if k < J - 1 else A.ANIMS['celebrar'][8]
        av = MT.avatar(f['id'], pz, shadow=(k == J - 1))
        frame(ceg=N.cegonha('parada', 0), ceg_pos=(stork_x, stork_y), egg=low, av=av, av_pos=(x, y), av_inside=False, tampa=tampa_chao)
    seg['sair'] = [s0, len(frames)]
    # 7. acenar (ciclo de 8) e a cegonha acena também
    s0 = len(frames)
    for k in range(8):
        av = MT.avatar(f['id'], A.ANIMS['acenar'][k], shadow=True)
        frame(ceg=N.cegonha('acenar', k % 4, falar=(k % 4) in (1, 3)), ceg_pos=(stork_x, stork_y), egg=low, av=av, av_pos=(jx1, jy1), av_inside=False, tampa=tampa_chao,
              extra_front=[(N.coracao(k % 4), jx1 + 34, jy1 + 8)] if k < 4 else [])
    seg['acenar'] = [s0, len(frames)]
    return frames, seg


CALMO = ['ovo', 'racha', 'aberto', 'avatar']


def calmo(f):
    """4 imagens fixas para o modo calmo (frames-chave da coreografia)."""
    fr, seg = sequencia(f)
    return [fr[seg['espera'][0]], fr[seg['toque-3'][1] - 1], fr[seg['abertura'][1] - 1], fr[seg['acenar'][0]]]
