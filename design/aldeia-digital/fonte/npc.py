"""Personagens (NPC): corpo em 2 direções (parado, 4 fotogramas) e retrato 48x48 com 4 expressões."""
from __future__ import annotations
import math
from engine import Canvas, Ramp, hx, dilate4
import avatar as A

OLHO = hx('#2b2233')
BOCA = hx('#7a3b3b')
BR = (255, 255, 255)
ROSA = Ramp('#f6a5b4')

NPCS = [
    dict(id='diretora-graca', nome='Diretora Graça', papel='Redação do Jornal', pele='pele-3', cabelo='coque', cor_cabelo='#6b4430', topo='#4f7fd0', baixo='#3d4a6a', extra='oculos', idade='adulto', saia=True),
    dict(id='tome', nome='Tomé', papel='Redação: fotógrafo, ficheiros', pele='pele-5', cabelo='afro', cor_cabelo='#33293f', topo='#f2a65a', baixo='#5a6a80', extra='camara', idade='jovem'),
    dict(id='lia', nome='Lia', papel='Redação: revisão', pele='pele-1', cabelo='rabo', cor_cabelo='#c4602f', topo='#8fd18a', baixo='#6f7891', extra='lapis', idade='jovem', saia=True),
    dict(id='doutora-ines', nome='Doutora Inês', papel='Laboratório', pele='pele-4', cabelo='comprido', cor_cabelo='#33293f', topo='#ffffff', baixo='#5f557f', extra='bata', idade='adulto'),
    dict(id='rui', nome='Rui', papel='Laboratório: ficheiros', pele='pele-2', cabelo='curto', cor_cabelo='#e6b85a', topo='#6fd0d8', baixo='#5a6a80', extra='oculos-lab', idade='jovem'),
    dict(id='marta', nome='Marta', papel='Laboratório: revisão', pele='pele-6', cabelo='trancas', cor_cabelo='#33293f', topo='#c79be6', baixo='#3d4a6a', extra=None, idade='jovem'),
    dict(id='professora', nome='Professora Sara', papel='Escola', pele='pele-2', cabelo='curto-f', cor_cabelo='#6b4430', topo='#ef7b8f', baixo='#3d4a6a', extra='livro', idade='adulto', saia=True),
    dict(id='bibliotecaria', nome='Dona Amélia', papel='Biblioteca', pele='pele-4', cabelo='grisalho', cor_cabelo='#d9d6e0', topo='#7fb88a', baixo='#5a4a6a', extra='oculos', idade='idoso', cadeira=True),
    dict(id='presidente-junta', nome='Senhor Joaquim', papel='Junta de Freguesia', pele='pele-3', cabelo='careca', cor_cabelo='#9a8f8a', topo='#6f7891', baixo='#3d3a4a', extra='bigode', idade='idoso'),
    dict(id='mae', nome='Mãe Rita', papel='Família da aldeia', pele='pele-5', cabelo='lenco', cor_cabelo='#e4728d', topo='#f2c94c', baixo='#5f8fe0', extra=None, idade='adulto'),
    dict(id='avo', nome='Avô Zé', papel='Família da aldeia', pele='pele-2', cabelo='grisalho-c', cor_cabelo='#e8e6ee', topo='#c98e5a', baixo='#5a5466', extra='bengala', idade='idoso'),
    dict(id='crianca', nome='Bia', papel='Família da aldeia', pele='pele-3', cabelo='rabo', cor_cabelo='#33293f', topo='#6fa8e8', baixo='#ef7b8f', extra=None, idade='crianca'),
]
CRIANCAS = [
    dict(id='leo', nome='Leo', pele='pele-1', cabelo='curto', cor_cabelo='#e6b85a', topo='#ef7b8f', baixo='#5a6a80', extra=None, idade='crianca'),
    dict(id='nina', nome='Nina', pele='pele-6', cabelo='afro', cor_cabelo='#33293f', topo='#ffd65c', baixo='#6f9ff0', extra=None, idade='crianca', saia=True),
    dict(id='tiago', nome='Tiago', pele='pele-4', cabelo='curto', cor_cabelo='#33293f', topo='#7fc9a0', baixo='#3d4a6a', extra='oculos', idade='crianca'),
    dict(id='ana', nome='Ana', pele='pele-2', cabelo='trancas', cor_cabelo='#c4602f', topo='#c79be6', baixo='#5a4a6a', extra=None, idade='crianca'),
]
ESPECIAIS = ['sr-prazo', 'cronometro', 'robo']
EXPRESSOES = ['neutra', 'contente', 'preocupada', 'surpreendida']


# ---------------------------------------------------------------- corpo
def corpo(n, view='se', i=0, expr='neutra'):
    cv = Canvas(48, 72)
    m = cv.m
    cx, gy = 24, 69
    S = Ramp(A.PELES[n['pele']])
    T = Ramp(n['topo'])
    Bt = Ramp(n['baixo'])
    H = Ramp(n['cor_cabelo'])
    back = view == 'ne'
    bob = [0, 0, 1, 1][i % 4]
    blink = i == 2
    kid = n['idade'] == 'crianca'
    sc = .78 if kid else 1.0
    # proporções
    head_r = 11 if not kid else 10
    hy = gy - (50 if not kid else 40) + bob
    ty = gy - (24 if not kid else 18) + bob
    from engine import shadow_ellipse
    shadow_ellipse(cv, cx, gy, 11, 2.5, (60, 50, 90), .25)
    if n.get('cadeira'):
        # cadeira de rodas (lado), roda grande atrás
        Wh = Ramp('#5a6070')
        cv.put(m.ellipse(cx - 2, gy - 9, 9, 9) & ~m.ellipse(cx - 2, gy - 9, 7, 7), Wh.dark)
        cv.put(m.ellipse(cx - 2, gy - 9, 7, 7) & ~m.ellipse(cx - 2, gy - 9, 6, 6), Wh.light)
        cv.put(m.line([(cx - 2, gy - 18), (cx - 2, gy)]) | m.line([(cx - 11, gy - 9), (cx + 7, gy - 9)]), Wh.base)
        cv.part(m.rect(cx - 8, gy - 22, cx + 9, gy - 18), Ramp('#6fa8e8'), shade=0)
        cv.part(m.rect(cx - 10, gy - 38, cx - 7, gy - 18), Ramp('#6fa8e8'), shade=0)
        cv.put(m.circle(cx + 9, gy - 2, 2), Wh.dark)
        ty = gy - 26 + bob
        hy = gy - 48 + bob
        # pernas sentadas
        cv.part(m.capsule(cx - 3, gy - 20, cx + 8, gy - 19, 3), Bt, shade=0)
        cv.part(m.capsule(cx + 8, gy - 19, cx + 9, gy - 8, 2.5), Bt, shade=0)
        cv.part(m.ellipse(cx + 10, gy - 6, 3, 2), Ramp('#5a4a6a'), shade=0)
    else:
        # pernas
        leg = 10 if not kid else 7
        for dx in (-4, 4):
            if n.get('saia'):
                cv.part(m.capsule(cx + dx, ty + 12, cx + dx, gy - 2, 2), S, shade=0)
            else:
                cv.part(m.capsule(cx + dx, ty + 10, cx + dx, gy - 2, 3), Bt, shade=1)
            cv.part(m.ellipse(cx + dx + (0 if back else 1), gy - 1, 3.2, 2), Ramp('#5a4a4a'), shade=0)
        if n.get('saia'):
            cv.part(m.poly([(cx - 9, ty + 14), (cx + 9, ty + 14), (cx + 7, ty + 6), (cx - 7, ty + 6)]), Bt, shade=1)
    # tronco
    tw = 9 if not kid else 7
    torso = m.ellipse(cx, ty, tw, 11 if not kid else 9) & m.rect(0, ty - 10, 48, ty + 9)
    torso |= m.rect(cx - tw + 1, ty, cx + tw - 1, ty + 9)
    cv.part(torso, T, shade=2, light=1)
    if n.get('extra') == 'bata':
        cv.part(m.rect(cx - tw, ty - 4, cx + tw, ty + 14), Ramp('#f7f8fb'), shade=1)
        if not back:
            cv.put(m.line([(cx, ty - 4), (cx, ty + 14)]), Ramp('#f7f8fb').dark)
            cv.put(m.rect(cx + 3, ty, cx + 6, ty + 2), Ramp('#6fa8e8').base)
    # braços
    if not n.get('cadeira'):
        for sgn in (-1, 1):
            hand = (cx + sgn * (tw + 2), ty + 9)
            if n.get('extra') == 'bengala' and sgn == 1:
                hand = (cx + tw + 3, ty + 8)
                cv.put(m.line([(hand[0] + 1, hand[1]), (hand[0] + 2, gy - 1)]), hx('#8a5a3a'))
            cv.part(m.capsule(cx + sgn * (tw - 1), ty - 5, hand[0], hand[1], 2.6), T if n.get('extra') != 'bata' else Ramp('#f7f8fb'), shade=0)
            cv.part(m.circle(hand[0], hand[1] + 1, 2), S, shade=0)
    else:
        for sgn in (-1, 1):
            cv.part(m.capsule(cx + sgn * (tw - 1), ty - 4, cx + sgn * 4 + 3, ty + 5, 2.4), T, shade=0)
            cv.part(m.circle(cx + sgn * 4 + 3, ty + 6, 2), S, shade=0)
    # objeto na mão
    ex = n.get('extra')
    if not back and not n.get('cadeira'):
        hx_, hy_ = cx + tw + 2, ty + 9
        if ex == 'camara':
            cv.part(m.rect(cx - 5, ty - 2, cx + 4, ty + 4), Ramp('#5a6070'), shade=0)
            cv.put(m.circle(cx, ty + 1, 2), hx('#8fd0ee'))
            cv.put(m.line([(cx - 7, ty - 9), (cx - 5, ty - 2)]) | m.line([(cx + 7, ty - 9), (cx + 4, ty - 2)]), hx('#3d3a4a'))
        elif ex == 'lapis':
            cv.part(m.rect(hx_ - 1, hy_ - 9, hx_ + 1, hy_), Ramp('#ffcf4d'), shade=0)
        elif ex == 'livro':
            cv.part(m.rect(hx_ - 4, hy_ - 5, hx_ + 3, hy_ + 3), Ramp('#5fa0e0'), shade=0)
    # pescoço e cabeça
    cv.part(m.rect(cx - 2, hy + head_r - 3, cx + 2, ty - 8), S, shade=0)
    _cabeca(cv, n, cx, hy, head_r, expr, back=back, blink=blink)
    return cv


def _cabelo_atras(cv, n, cx, hy, r, back):
    m = cv.m
    H = Ramp(n['cor_cabelo'])
    c = n['cabelo']
    if c == 'comprido':
        for sgn in (-1, 1):
            cv.part(m.capsule(cx + sgn * (r - 2), hy - 2, cx + sgn * (r - 1), hy + r + 5, 3.2), H, shade=1)
    elif c == 'trancas':
        for s in (-1, 1):
            cv.part(m.capsule(cx + s * (r - 1), hy + 2, cx + s * (r + 1), hy + r + 8, 2), H, shade=0)
    elif c == 'rabo':
        cv.part(m.capsule(cx + r - 2, hy - 4, cx + r + 4, hy + 8, 2.6), H, shade=1)
    elif c == 'afro':
        cv.part(m.circle(cx, hy - 2, r + 4), H, shade=2)
    elif c in ('coque', 'grisalho'):
        cv.part(m.circle(cx + (0 if not back else 0), hy - r - 1, 5), H, shade=1)
    elif c == 'lenco':
        L = Ramp(n['cor_cabelo'])
        cv.part(m.circle(cx, hy - 1, r + 3), L, shade=2)
        cv.part(m.circle(cx + r, hy - r + 2, 3), L, shade=0)


def _cabeca(cv, n, cx, hy, r, expr, back=False, blink=False, big=1):
    m = cv.m
    S = Ramp(A.PELES[n['pele']])
    H = Ramp(n['cor_cabelo'])
    _cabelo_atras(cv, n, cx, hy, r, back)
    head = m.circle(cx, hy, r)
    cv.part(head, S if not back else S, shade=2, light=1)
    c = n['cabelo']
    top = hy - r
    if back:
        if c not in ('careca',):
            cv.part(head & m.rect(0, 0, 200, hy + r // 2) if c != 'lenco' else head, H if c != 'lenco' else Ramp(n['cor_cabelo']), shade=2)
        return
    # cabelo da frente
    if c in ('curto', 'curto-f', 'afro', 'comprido', 'trancas', 'rabo', 'coque', 'grisalho', 'grisalho-c'):
        cap = head & m.rect(0, 0, 200, top + r * .55) & ~m.ellipse(cx + r * .35, top + r * .8, r * .55, r * .3)
        if c in ('curto-f', 'comprido'):
            cap = head & m.rect(0, 0, 200, top + r * .6) & ~m.ellipse(cx - r * .2, top + r * .9, r * .8, r * .35)
        if c == 'afro':
            cap = head & m.rect(0, 0, 200, top + r * .45)
        cv.part(cap, H, outline=False, shade=1, light=1)
        cv.put(dilate4(cap) & ~cap & head, H.dark)
        if c in ('comprido', 'curto-f', 'trancas', 'rabo'):
            for s in (-1, 1):
                cv.part(m.rect(cx + s * r - (2 if s > 0 else 0), hy - 3, cx + s * r + (0 if s > 0 else 2), hy + 5) & dilate4(head), H, outline=False, shade=0)
    elif c == 'careca':
        cv.put(m.ellipse(cx - r * .3, top + 3, 3, 1.5), S.light)
        for s in (-1, 1):
            cv.part(m.ellipse(cx + s * (r - 1), hy - 2, 2, 3), H, shade=0)
    elif c == 'lenco':
        L = Ramp(n['cor_cabelo'])
        cap = head & m.rect(0, 0, 200, top + r * .5)
        cv.part(cap, L, outline=False, shade=0, light=1)
        cv.put(cap & ((m.xx + m.yy) % 5 == 0), BR)
    # cara
    ey = hy + round(r * .15)
    ex = round(r * .38)
    eyes_w = 1 if big == 1 else 2
    for s in (-1, 1):
        x = cx + s * ex
        if blink:
            cv.put(m.rect(x - eyes_w, ey + 1, x + eyes_w - 1 + (big > 1), ey + 1), OLHO)
            continue
        if expr == 'contente':
            cv.put(m.pts([(x - 1 * big, ey + 1), (x, ey), (x + 1 * big, ey + 1)]) | (m.pts([(x - 2, ey + 2), (x + 2, ey + 2)]) if big > 1 else m.empty()), OLHO)
        elif expr == 'surpreendida':
            cv.put(m.ellipse(x, ey, 1 + big * .5, 1.5 + big * .5), OLHO)
            cv.put(m.pts([(x - 1, ey - 1)]), BR)
        else:
            cv.put(m.rect(x - (big - 1), ey - big, x + (big - 1) + 1 - (big == 1), ey + big), OLHO)
            cv.put(m.pts([(x - (big - 1), ey - big)]), BR)
        if expr == 'preocupada':
            cv.put(m.line([(x - 2 * s - (big > 1) * s, ey - 3 - big), (x + 2 * s, ey - 4 - big - (big > 1))]), S.dark)
        elif expr == 'surpreendida':
            cv.put(m.line([(x - 2, ey - 4 - big), (x + 2, ey - 4 - big)]), S.dark)
    # bochechas
    for s in (-1, 1):
        cv.put(m.rect(cx + s * (ex + 2) - big, ey + 2 + big, cx + s * (ex + 2) + big - 1 + (big == 1), ey + 2 + big), ROSA.base)
    my = ey + 3 + big * 2
    if expr == 'contente':
        cv.put(m.ellipse(cx, my, 1.5 * big, 1 * big) & m.rect(0, my, 200, 200) | m.rect(cx - big, my - 1, cx + big, my), BOCA)
        cv.put(m.pts([(cx, my + big)]), hx('#e8758a'))
    elif expr == 'surpreendida':
        cv.put(m.ellipse(cx, my + 1, big * .8 + .5, big + .5), BOCA)
    elif expr == 'preocupada':
        cv.put(m.pts([(cx - 2, my + 1), (cx - 1, my), (cx, my + 1), (cx + 1, my), (cx + 2, my + 1)][: 3 + 2 * (big > 1)]), BOCA)
    else:
        cv.put(m.pts([(cx - big, my), (cx, my + 1), (cx + big, my)]), BOCA)
    # acessórios na cara
    exn = n.get('extra')
    if exn in ('oculos',):
        for s in (-1, 1):
            o = m.ellipse(cx + s * ex, ey, 2 + big, 2 + big * .6)
            cv.put(dilate4(o) & ~o, hx('#7a5fd6'))
        cv.put(m.line([(cx - ex + 2 + big, ey), (cx + ex - 2 - big, ey)]), hx('#7a5fd6'))
    if exn == 'oculos-lab':
        g = m.rect(cx - r + 2, ey - 2 - big, cx + r - 2, ey + 1 + big)
        cv.put(dilate4(g) & ~g, hx('#5aa0c8'))
        cv.put(g & ~m.rect(cx - 1, 0, cx, 200), (220, 240, 250, 255))
        for s in (-1, 1):
            cv.put(m.rect(cx + s * ex, ey - big + 1, cx + s * ex + big - 1, ey + big - 1), OLHO)
    if exn == 'bigode':
        cv.part(m.ellipse(cx - 2 * big, my - 1, 2 * big, 1 * big) | m.ellipse(cx + 2 * big, my - 1, 2 * big, 1 * big), Ramp(n['cor_cabelo']), shade=0)


def retrato(n, expr='neutra'):
    cv = Canvas(48, 48)
    m = cv.m
    T = Ramp(n['topo'])
    if n.get('extra') == 'bata':
        T = Ramp('#f7f8fb')
    cv.part(m.ellipse(24, 52, 20, 14), T, shade=2, light=1)
    if n.get('extra') == 'bata':
        cv.put(m.line([(24, 40), (24, 48)]), T.dark)
    S = Ramp(A.PELES[n['pele']])
    cv.part(m.rect(21, 34, 27, 40), S, shade=0)
    _cabeca(cv, n, 24, 22, 15, expr, big=2)
    if n.get('extra') == 'camara':
        cv.put(m.line([(10, 40), (20, 47)]) | m.line([(38, 40), (28, 47)]), hx('#3d3a4a'))
    return cv


# ---------------------------------------------------------------- especiais
def especial(id_, expr='neutra', i=0, retrato_=False):
    size = (48, 48) if retrato_ else (48, 72)
    cv = Canvas(*size)
    m = cv.m
    cx = 24
    cy = 22 if retrato_ else 36 + [0, 0, 1, 1][i % 4]
    big = 2 if retrato_ else 1
    def olhos(cy_, sep, R_):
        for s in (-1, 1):
            x = cx + s * sep
            if expr == 'contente':
                cv.put(m.pts([(x - big, cy_ + 1), (x, cy_), (x + big, cy_ + 1)]), OLHO)
            elif expr == 'surpreendida':
                cv.put(m.ellipse(x, cy_, big, big + 1), OLHO)
            else:
                cv.put(m.rect(x - big + 1, cy_ - big, x + big - 1 + (big == 1) - (big == 1), cy_ + big), OLHO)
            if expr == 'preocupada':
                cv.put(m.line([(x - 2 * s, cy_ - 3 - big), (x + 2 * s, cy_ - 4 - big)]), R_.dark)
        my = cy_ + 3 + big
        if expr == 'contente':
            cv.put(m.rect(cx - big, my, cx + big, my + big - 1 + (big == 1)), BOCA)
        elif expr == 'surpreendida':
            cv.put(m.ellipse(cx, my + 1, big, big), BOCA)
        elif expr == 'preocupada':
            cv.put(m.pts([(cx - 1, my + 1), (cx, my), (cx + 1, my + 1)]), BOCA)
        else:
            cv.put(m.pts([(cx - 1, my), (cx, my + 1), (cx + 1, my)]), BOCA)
        for s in (-1, 1):
            cv.put(m.rect(cx + s * (sep + 3) - 1, cy_ + 2 + big, cx + s * (sep + 3), cy_ + 2 + big), ROSA.base)

    if id_ == 'sr-prazo':
        R = Ramp('#f2c94c')
        r = 18 if retrato_ else 13
        if not retrato_:
            for s in (-1, 1):
                cv.part(m.capsule(cx + s * 5, cy + r - 2, cx + s * 6, 68, 1.8), Ramp('#5a4a4a'), shade=0)
                cv.part(m.ellipse(cx + s * 7, 69, 3, 1.6), Ramp('#5a4a4a'), shade=0)
                cv.part(m.capsule(cx + s * r, cy, cx + s * (r + 5), cy + 8, 1.6), Ramp('#5a4a4a'), shade=0)
            for s in (-1, 1):
                cv.part(m.circle(cx + s * 9, cy - r - 2, 4), Ramp('#ef7b6f'), shade=0)
        cv.part(m.circle(cx, cy, r), R, shade=2, glint=True)
        cv.part(m.circle(cx, cy, r - 3), Ramp('#fffaf0'), shade=1, outline=False)
        for k in range(12):
            a = k * math.pi / 6
            cv.put(m.pts([(cx + math.cos(a) * (r - 5), cy + math.sin(a) * (r - 5))]), hx('#c9b98a'))
        cv.put(m.line([(cx, cy - 2), (cx, cy - r + 6)]), hx('#3d3a4a'))
        olhos(cy + 2, 5 if not retrato_ else 7, R)
    elif id_ == 'cronometro':
        R = Ramp('#9fd0ee')
        r = 18 if retrato_ else 13
        cv.part(m.rect(cx - 3, cy - r - 6, cx + 3, cy - r + 1), Ramp('#c9cfdc'), shade=0)
        cv.part(m.circle(cx + r - 2, cy - r + 3, 3), Ramp('#c9cfdc'), shade=0)
        if not retrato_:
            for s in (-1, 1):
                cv.part(m.capsule(cx + s * 5, cy + r - 2, cx + s * 6, 68, 1.8), Ramp('#5a6070'), shade=0)
                cv.part(m.ellipse(cx + s * 7, 69, 3, 1.6), Ramp('#ef7b8f'), shade=0)
                cv.part(m.capsule(cx + s * r, cy, cx + s * (r + 5), cy - 6, 1.6), Ramp('#5a6070'), shade=0)
        cv.part(m.circle(cx, cy, r), R, shade=2, glint=True)
        cv.part(m.circle(cx, cy, r - 3), Ramp('#ffffff'), shade=1, outline=False)
        cv.put(m.line([(cx, cy), (cx + r - 6, cy - 4)]), hx('#ef6f6f'))
        olhos(cy + 2, 5 if not retrato_ else 7, R)
    elif id_ == 'robo':
        R = Ramp('#dfe6f2')
        w = 18 if retrato_ else 14
        top = cy - (12 if retrato_ else 8)
        if not retrato_:
            # base redonda com escovas (robô de limpeza)
            cv.part(m.ellipse(cx, 64, w + 2, 5), Ramp('#8a92b8'), shade=1)
            for s in (-1, 1):
                ang = [0, .6, 1.2, 1.8][i % 4]
                bx = cx + s * (w + 1)
                cv.put(m.line([(bx, 66), (bx + math.cos(ang) * 4, 66 + math.sin(ang) * 2)]), hx('#ffd65c'))
            cv.part(m.rect(cx - 3, 50, cx + 3, 60), Ramp('#8a92b8'), shade=0)
            for s in (-1, 1):
                cv.part(m.capsule(cx + s * w, cy + 4, cx + s * (w + 6), cy + 12, 1.6), Ramp('#8a92b8'), shade=0)
                cv.part(m.circle(cx + s * (w + 6), cy + 13, 2.2), Ramp('#ffd65c'), shade=0)
        cv.put(m.line([(cx, top - 6), (cx, top)]), hx('#8a92b8'))
        cv.part(m.circle(cx, top - 7, 2), Ramp('#ff9fb8'), shade=0)
        body = m.ellipse(cx, cy, w, w - 2)
        cv.part(body, R, shade=2, glint=True)
        scr = m.ellipse(cx, cy, w - 4, w - 7)
        cv.part(scr, Ramp('#3d4a6a'), shade=0, outline=False)
        # olhos de ecrã luminosos
        G = hx('#9ef0c0')
        sep = 5 if not retrato_ else 7
        for s in (-1, 1):
            x = cx + s * sep
            if expr == 'contente':
                cv.put(m.pts([(x - big, cy + 1), (x, cy), (x + big, cy + 1)]), G)
            elif expr == 'surpreendida':
                cv.put(m.ellipse(x, cy, big, big + 1) & ~m.ellipse(x, cy, big - 1 if big > 1 else 0, big), G)
            elif expr == 'preocupada':
                cv.put(m.rect(x - big, cy, x + big, cy + big - (big == 1)), G)
                cv.put(m.line([(x - 2 * s, cy - 3), (x + 2 * s, cy - 4)]), G)
            else:
                cv.put(m.rect(x - big + 1, cy - big, x + big - 1, cy + big), G)
        my = cy + 4 + big
        cv.put(m.pts([(cx - 1, my), (cx, my + (1 if expr != 'preocupada' else -1)), (cx + 1, my)]), G)
    return cv
