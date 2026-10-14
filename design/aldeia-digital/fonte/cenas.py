"""Ilustrações das missões de cidadania (grupo 1, 1.º ciclo). 320x180 nativo (1280x720 a 1x, 4 px por pixel).

Sem texto nas imagens. Cada cena devolve âncoras: 'ecra' (retângulo para o texto da UI), 'avatar' (pés do avatar do aluno), 'balao' (ponto de origem do balão).
Composição em 3 planos: fundo claro e pouco saturado, plano médio, primeiro plano forte. Luz de cima à esquerda.
"""
from __future__ import annotations
import math, random
import numpy as np
from engine import Canvas, Ramp, hx, dilate4
import iso as I
import npc as N
import avatar as A
import montar as MT

W, H = 320, 180


def nc(id_):
    for n in N.NPCS + N.CRIANCAS:
        if n['id'] == id_:
            return n


def ceu(cv, top='#bfe3f7', bot='#fbeedd'):
    m = cv.m
    t, b = np.array(hx(top), float), np.array(hx(bot), float)
    bands = 8
    for k in range(bands):
        y0, y1 = int(H * .62 * k / bands), int(H * .62 * (k + 1) / bands)
        c = t * (1 - k / (bands - 1)) + b * (k / (bands - 1))
        cv.put(m.rect(0, y0, W, y1), tuple(int(v) for v in c))
        # pontilhado de transição
        if k < bands - 1:
            c2 = t * (1 - (k + 1) / (bands - 1)) + b * ((k + 1) / (bands - 1))
            cv.put(m.rect(0, y1 - 1, W, y1 - 1) & ((m.xx % 2) == 0), tuple(int(v) for v in c2))


def nuvens(cv, seed=1):
    rnd = random.Random(seed)
    for _ in range(3):
        n = I.nuvem()
        cv.over_fast(n, rnd.randrange(-20, W - 40), rnd.randrange(4, 40))


def colinas(cv):
    m = cv.m
    R = Ramp('#b9dca4')
    h1 = m.ellipse(60, 128, 120, 30) | m.ellipse(250, 125, 140, 28)
    cv.put(h1 & m.rect(0, 0, W, 120), R.base)
    R2 = Ramp('#a2d18e')
    h2 = m.ellipse(170, 132, 160, 22)
    cv.put(h2 & m.rect(0, 0, W, 124), R2.base)
    # casinhas ao longe (silhuetas suaves)
    for k, x in enumerate((28, 70, 210, 262)):
        y = 108 - (k % 2) * 3
        cv.put(m.rect(x, y, x + 14, y + 10), hx('#f3e6d6'))
        cv.put(m.tri((x - 2, y), (x + 16, y), (x + 7, y - 6)), hx('#e9b49a'))


def chao_exterior(cv, y=120, tipo='calcada'):
    m = cv.m
    if tipo == 'relva':
        R = I.P['relva']
        cv.put(m.rect(0, y, W, H), R.base)
        cv.put(m.rect(0, y, W, H) & (((m.xx * 7 + m.yy * 3) % 17) == 0), R.shade)
        cv.put(m.rect(0, y, W, y), R.light)
    else:
        R = I.P['calcada']
        cv.put(m.rect(0, y, W, H), R.base)
        cv.put(m.rect(0, y, W, H) & ((m.xx % 6 == 0) | ((m.yy - y) % 5 == 0)), R.shade)
        for x in range(0, W):
            yc = y + 30 + math.sin(x / 26) * 6
            cv.put(m.rect(x, int(yc), x, int(yc) + 3), I.P['basalto'].base)


def sala_fundo(cv, parede='#f6ead2', rodape='#7fb8d8', chao='#d9b07a', janela=True):
    m = cv.m
    P_ = Ramp(parede)
    cv.put(m.rect(0, 0, W, 132), P_.base)
    cv.put(m.rect(0, 0, W, 132) & (((m.xx * 3 + m.yy * 7) % 29) == 0), P_.light)
    cv.put(m.rect(0, 100, W, 132), Ramp(rodape).light)
    cv.put(m.rect(0, 100, W, 101), Ramp(rodape).base)
    F = Ramp(chao)
    cv.put(m.rect(0, 132, W, H), F.base)
    for y in range(136, H, 8):
        cv.put(m.rect(0, y, W, y), F.shade)
    cv.put(m.rect(0, 132, W, 133), F.dark)
    if janela:
        win = m.rect(220, 22, 300, 84)
        cv.put(dilate4(dilate4(win)) & ~win, (255, 255, 255))
        sky = Canvas(W, H)
        ceu(sky)
        cv.a[win] = sky.a[win]
        cv.put(m.rect(259, 22, 260, 84) | m.rect(220, 52, 300, 53), (255, 255, 255))
        # raio de luz suave
        ray = m.poly([(220, 22), (300, 22), (210, 160), (110, 160)])
        tmp = Canvas(W, H)
        tmp.put(ray & (((m.xx + m.yy) % 3) == 0), (255, 250, 220, 40))
        cv.over_fast(tmp)


def quadro(cv, x0, y0, x1, y1, cor='#5f7a6a'):
    m = cv.m
    R = Ramp(cor)
    b = m.rect(x0, y0, x1, y1)
    cv.put(dilate4(dilate4(b)) & ~b, hx('#c99a6b'))
    cv.put(b, R.base)
    cv.put(b & (((m.xx + m.yy * 2) % 13) == 0), R.light)
    return (x0 + 3, y0 + 3, x1 - 3, y1 - 3)


def mesa(cv, x, y, w=60, cor='#e8c99a'):
    m = cv.m
    R = Ramp(cor)
    cv.part(m.rect(x, y, x + w, y + 4), R, shade=0)
    for lx in (x + 3, x + w - 5):
        cv.part(m.rect(lx, y + 5, lx + 2, y + 24), Ramp('#c99a6b'), shade=0)


def tablet(cv, x, y, w=40, h=28, ecra='#f2f6fb'):
    """ecrã simulado como objeto da aldeia (não é cópia de app real). Devolve o retângulo do ecrã."""
    m = cv.m
    b = m.rect(x, y, x + w, y + h)
    cv.part(b, Ramp('#4f5670'), shade=1)
    s = m.rect(x + 3, y + 3, x + w - 3, y + h - 3)
    cv.put(s, hx(ecra))
    cv.put(m.pts([(x + w // 2, y + h - 2)]), hx('#9aa1bd'))
    return (x + 3, y + 3, x + w - 3, y + h - 3)


def personagem(cv, n, x, y, expr='neutra', view='se', flip=False, i=0):
    c = N.corpo(n, view, i, expr)
    if flip:
        c = c.flip()
    cv.over_fast(c, x - 24, y - 69)


COM_AVATAR = True
POSES = {}


def avatar_slot(cv, x, y, fato='coelho', anim='parado', fr=0, flip=False):
    POSES['ultima'] = {'anim': anim, 'frame': fr, 'espelhar': flip}
    if not COM_AVATAR:
        return
    p = dict(A.ANIMS[anim][fr])
    a = MT.avatar(fato, p, itens=('mochila-escolar',))
    if flip:
        a = a.flip()
    cv.over_fast(a, x - A.CX, y - A.GY)


def vinheta(cv, forca=28):
    """escurece levemente os cantos (profundidade e foco no centro)."""
    m = cv.m
    d = ((m.xx - W / 2) / (W / 2)) ** 2 + ((m.yy - H / 2) / (H / 2)) ** 2
    tmp = Canvas(W, H)
    tmp.put((d > 1.55) & (((m.xx + m.yy) % 2) == 0), (60, 50, 90, forca))
    cv.over_fast(tmp)


def icone(cv, nome, x, y, cor='#5f8fe0'):
    m = cv.m
    c = hx(cor)
    if nome == 'camara':
        cv.part(m.rect(x - 6, y - 4, x + 6, y + 4), Ramp(cor), shade=0)
        cv.put(m.circle(x, y, 2.5), (255, 255, 255))
    elif nome == 'bolo':
        cv.part(m.rect(x - 6, y - 2, x + 6, y + 4), Ramp('#f6a5b4'), shade=0)
        cv.put(m.rect(x - 6, y - 3, x + 6, y - 2), (255, 255, 255))
        cv.put(m.line([(x, y - 7), (x, y - 4)]), hx('#ffcf4d'))
    elif nome == 'nota':
        cv.put(m.circle(x - 3, y + 3, 2) | m.circle(x + 4, y + 2, 2) | m.line([(x - 1, y + 3), (x - 1, y - 5), (x + 6, y - 6), (x + 6, y + 2)]), c)
    elif nome == 'bola':
        cv.part(m.circle(x, y, 5), Ramp('#ffffff'), shade=1)
        cv.put(m.pts([(x, y - 1), (x - 1, y), (x + 1, y), (x, y + 1)]), hx('#3d3a4a'))
    elif nome == 'estrela':
        cv.put(m.poly([(x, y - 6), (x + 2, y - 2), (x + 6, y - 2), (x + 3, y + 1), (x + 4, y + 6), (x, y + 3), (x - 4, y + 6), (x - 3, y + 1), (x - 6, y - 2), (x - 2, y - 2)]), hx('#ffcf4d'))
    elif nome == 'cesto':
        cv.part(m.rect(x - 5, y - 2, x + 5, y + 4), Ramp('#ffcf4d'), shade=0)
        cv.put(m.line([(x - 4, y - 2), (x - 2, y - 6), (x + 2, y - 6), (x + 4, y - 2)]), hx('#3d3a4a'))


def balao_vazio(cv, x, y, w=40, h=18, cauda='baixo'):
    m = cv.m
    b = m.rect(x, y, x + w, y + h) & ~(m.pts([(x, y), (x + w, y), (x, y + h), (x + w, y + h)]))
    if cauda == 'baixo':
        b |= m.tri((x + 8, y + h), (x + 15, y + h), (x + 9, y + h + 5))
    cv.part(b, Ramp('#ffffff', dark='#9aa3c7'), shade=0, light=0)
    return (x + 3, y + 3, x + w - 3, y + h - 3)


# ======================================================================= missões
def escola_1():
    """Direitos das crianças: tirar foto a um colega sem perguntar."""
    cv = Canvas(W, H)
    sala_fundo(cv)
    q = quadro(cv, 20, 18, 150, 76)
    mesa(cv, 150, 112, 80)
    personagem(cv, nc('leo'), 120, 160, 'contente')
    # tablet apontado
    tablet(cv, 132, 112, 20, 14)
    icone(cv, 'camara', 142, 119, '#ef7b8f')
    personagem(cv, nc('nina'), 200, 162, 'preocupada', flip=True)
    avatar_slot(cv, 262, 170, anim='pensar', flip=True)
    vinheta(cv)
    return cv, {'ecra': q, 'avatar': (262, 170), 'balao': (200, 92)}


def escola_2():
    """Ninguém fica de fora no grupo da turma: ecrã do grupo e uma colega à parte."""
    cv = Canvas(W, H)
    sala_fundo(cv, parede='#e9f2fb', rodape='#ef9f8f')
    mesa(cv, 70, 116, 120)
    scr = tablet(cv, 96, 64, 80, 54)
    # mensagens vazias (texto vem da UI) e avatares redondos genéricos
    m = cv.m
    for k, (yy, side) in enumerate(((70, 0), (82, 1), (94, 0))):
        bx = 104 if side == 0 else 128
        cv.part(m.rect(bx, yy, bx + 36, yy + 8), Ramp('#dfe9ff' if side == 0 else '#e2f6e8'), shade=0)
        cv.part(m.circle(bx - 5 if side == 0 else bx + 41, yy + 4, 3), Ramp(['#f6a5b4', '#9fd0ee', '#ffd65c'][k]), shade=0)
    personagem(cv, nc('tiago'), 70, 162, 'contente')
    personagem(cv, nc('ana'), 250, 164, 'preocupada', flip=True)
    avatar_slot(cv, 196, 170, anim='pensar')
    vinheta(cv)
    return cv, {'ecra': scr, 'avatar': (196, 170), 'balao': (240, 90)}


def escola_3():
    """Pedir ajuda a um adulto de confiança: a professora ouve com calma."""
    cv = Canvas(W, H)
    sala_fundo(cv)
    quadro(cv, 20, 18, 150, 76, cor='#4f7f6a')
    # secretária da professora com plantinha e maçã
    mesa(cv, 150, 110, 90, '#d9b07a')
    m = cv.m
    cv.part(m.circle(162, 106, 4), Ramp('#ef6f6f'), shade=0)
    cv.part(m.rect(220, 100, 228, 109), Ramp('#e98a5e'), shade=0)
    cv.part(m.circle(224, 96, 5), I.P['folha'], shade=0)
    personagem(cv, nc('professora'), 200, 166, 'contente', flip=True)
    avatar_slot(cv, 140, 170, anim='acenar', fr=1)
    t = (40, 20, 200, 44)
    vinheta(cv)
    return cv, {'ecra': t, 'avatar': (140, 170), 'balao': (196, 84)}


def junta_1():
    """A votação da festa: quiosque de voto com três opções em ícone."""
    cv = Canvas(W, H)
    sala_fundo(cv, parede='#f6c9c0', rodape='#a3675a', chao='#c9bfae')
    m = cv.m
    # bandeira inventada
    cv.put(m.rect(30, 20, 31, 90), hx('#6b5a4a'))
    cv.part(m.rect(32, 22, 58, 38), Ramp('#4f7fd0'), shade=0)
    cv.put(m.circle(45, 30, 3), (255, 255, 255))
    # quiosque
    cv.part(m.rect(132, 70, 196, 150), Ramp('#dfe6f2'), shade=2)
    scr = tablet(cv, 138, 76, 52, 40, ecra='#ffffff')
    for k, ic in enumerate(('bolo', 'nota', 'bola')):
        cv.part(m.rect(140 + k * 16, 98, 152 + k * 16, 110), Ramp('#eef4ff'), shade=0)
        icone(cv, ic, 146 + k * 16, 104, '#5f8fe0')
    personagem(cv, nc('presidente-junta'), 250, 164, 'contente', flip=True)
    personagem(cv, nc('leo'), 92, 162, 'neutra')
    avatar_slot(cv, 164, 172, anim='parado')
    vinheta(cv)
    return cv, {'ecra': (scr[0], scr[1], scr[2], scr[1] + 18), 'avatar': (164, 172), 'balao': (240, 84)}


def junta_2():
    """Ouvir todos antes de decidir: cartaz vazio no largo e crianças a conversar."""
    cv = Canvas(W, H)
    ceu(cv); nuvens(cv, 3); colinas(cv); chao_exterior(cv, 124)
    m = cv.m
    # quadro de avisos
    cv.part(m.rect(118, 44, 202, 104), Ramp('#c99a6b'), shade=1)
    poster = m.rect(124, 50, 196, 98)
    cv.put(poster, (255, 255, 255))
    for k, c in enumerate(('#f6a5b4', '#9fd0ee', '#ffd65c')):
        cv.part(m.rect(130 + k * 22, 80, 144 + k * 22, 94), Ramp(c), shade=0)
    for x in (124, 194):
        cv.put(m.rect(x, 104, x + 2, 140), hx('#8a5a3a'))
    personagem(cv, nc('nina'), 76, 166, 'contente')
    personagem(cv, nc('tiago'), 250, 166, 'surpreendida', flip=True)
    personagem(cv, nc('ana'), 286, 168, 'contente', flip=True)
    avatar_slot(cv, 160, 174, anim='pensar')
    vinheta(cv)
    return cv, {'ecra': (126, 52, 194, 76), 'avatar': (160, 174), 'balao': (70, 88)}


def junta_3():
    """O resultado: barras do gráfico em branco para a UI preencher."""
    cv = Canvas(W, H)
    sala_fundo(cv, parede='#f6c9c0', rodape='#a3675a', chao='#c9bfae', janela=False)
    m = cv.m
    b = quadro(cv, 60, 18, 260, 100, cor='#ffffff')
    cv.put(m.rect(80, 92, 240, 92), hx('#9aa1bd'))
    for k, (hgt, c) in enumerate(((40, '#f6a5b4'), (58, '#9fd0ee'), (28, '#ffd65c'))):
        cv.part(m.rect(98 + k * 48, 92 - hgt, 122 + k * 48, 91), Ramp(c), shade=1)
    personagem(cv, nc('presidente-junta'), 56, 164, 'contente')
    for x, idn, ex in ((240, 'leo', 'contente'), (276, 'nina', 'contente')):
        personagem(cv, nc(idn), x, 166, ex, flip=True)
    avatar_slot(cv, 170, 172, anim='celebrar', fr=4)
    # confetes
    from nascimento import confetes
    cv.over_fast(confetes(5), 146, 110)
    vinheta(cv)
    return cv, {'ecra': b, 'avatar': (170, 172), 'balao': (56, 90)}


def horta_1():
    """Onde vai o computador velho? Em casa, a família olha para o computador antigo."""
    cv = Canvas(W, H)
    sala_fundo(cv, parede='#fbe2d0', rodape='#c98e5a')
    mesa(cv, 110, 112, 90)
    m = cv.m
    # computador velho (caixote) com ecrã apagado
    cv.part(m.rect(126, 74, 176, 110), Ramp('#d9d3c4'), shade=2)
    scr = m.rect(132, 80, 170, 102)
    cv.put(scr, hx('#5f6a6f'))
    cv.put(scr & ((m.yy % 3) == 0), hx('#6f7a80'))
    cv.put(m.line([(134, 82), (140, 90)]), hx('#8a959a'))  # racha no ecrã
    cv.part(m.rect(140, 110, 160, 112), Ramp('#d9d3c4'), shade=0)
    personagem(cv, nc('mae'), 76, 164, 'neutra')
    personagem(cv, nc('avo'), 250, 164, 'contente', flip=True)
    avatar_slot(cv, 196, 172, anim='pensar', flip=True)
    vinheta(cv)
    return cv, {'ecra': (40, 20, 200, 44), 'avatar': (196, 172), 'balao': (76, 86)}


def horta_2():
    """Ecoponto e ponto de recolha de elétricos: escolher o sítio certo."""
    cv = Canvas(W, H)
    ceu(cv); nuvens(cv, 5); colinas(cv); chao_exterior(cv, 124, 'relva')
    m = cv.m
    cols = ['#4f7fd0', '#ffcf4d', '#6fbf6a', '#e8675e']
    for k, c in enumerate(cols):
        x = 60 + k * 52
        R = Ramp(c)
        cv.part(m.rect(x, 82, x + 36, 140), R, shade=2, glint=True)
        cv.part(m.ellipse(x + 18, 82, 18, 5), R, shade=0, light=1)
        cv.put(m.rect(x + 10, 96, x + 26, 98), R.dark)
        if k == 3:
            # símbolo de ficha elétrica (ponto de recolha de elétricos, genérico)
            cv.put(m.rect(x + 14, 108, x + 22, 116) | m.rect(x + 15, 104, x + 16, 107) | m.rect(x + 20, 104, x + 21, 107) | m.rect(x + 17, 117, x + 18, 122), (255, 255, 255))
        else:
            cv.put(m.pts([(x + 18, 108), (x + 16, 111), (x + 20, 111), (x + 15, 114), (x + 21, 114), (x + 17, 115), (x + 18, 115), (x + 19, 115)]), (255, 255, 255))
    # telemóvel velho e pilhas na mão do avatar
    avatar_slot(cv, 40, 172, anim='parado')
    personagem(cv, nc('bia') or nc('crianca'), 286, 168, 'contente', flip=True)
    t = tablet(cv, 46, 140, 10, 16, ecra='#5f6a6f')
    vinheta(cv)
    return cv, {'ecra': (60, 18, 260, 44), 'avatar': (40, 172), 'balao': (280, 92)}


def horta_3():
    """Reparar primeiro: a oficina de reparação com o Avô Zé."""
    cv = Canvas(W, H)
    sala_fundo(cv, parede='#e8dcc4', rodape='#8a6a4a', chao='#b9a58a', janela=False)
    m = cv.m
    # painel de ferramentas
    cv.part(m.rect(30, 20, 130, 80), Ramp('#c99a6b'), shade=1)
    for k, (x, y) in enumerate(((42, 30), (62, 28), (84, 32), (104, 30), (50, 56), (90, 54))):
        cv.part(m.rect(x, y, x + 3, y + 16), Ramp(['#ef7b6f', '#6fa8e8', '#ffcf4d'][k % 3]), shade=0)
    mesa(cv, 140, 112, 120, '#c99a6b')
    cv.part(m.rect(170, 84, 214, 112), Ramp('#d9d3c4'), shade=2)
    scr = m.rect(176, 89, 208, 106)
    cv.put(scr, hx('#bfe6f6'))
    cv.put(scr & ((m.xx - m.yy) % 6 < 2), hx('#e9f8ff'))
    # lâmpada a brilhar (ideia)
    cv.part(m.circle(192, 70, 4), Ramp('#ffe36e'), shade=0)
    for a in range(0, 360, 60):
        r = math.radians(a)
        cv.put(m.pts([(192 + math.cos(r) * 7, 70 + math.sin(r) * 7)]), hx('#ffcf4d'))
    personagem(cv, nc('avo'), 262, 164, 'contente', flip=True)
    avatar_slot(cv, 136, 172, anim='celebrar', fr=3)
    vinheta(cv)
    return cv, {'ecra': (176, 89, 208, 106), 'avatar': (136, 172), 'balao': (256, 86)}


def mercado_1():
    """Preciso ou quero? Uma janela de compra brilhante aparece num jogo."""
    cv = Canvas(W, H)
    sala_fundo(cv, parede='#e9e1f7', rodape='#9c7bf0')
    m = cv.m
    # sofá
    cv.part(m.rect(30, 110, 170, 150), Ramp('#7fb8d8'), shade=2)
    cv.part(m.rect(30, 94, 170, 112), Ramp('#7fb8d8'), shade=1)
    scr = tablet(cv, 150, 46, 92, 64)
    # janela de compra genérica: caixa com brilho e cofre de moedas inventadas
    cv.part(m.rect(170, 58, 222, 96), Ramp('#fff7d6'), shade=0)
    icone(cv, 'estrela', 196, 72)
    for k in range(4):
        a = k * math.pi / 2 + .4
        cv.put(m.pts([(196 + math.cos(a) * 12, 72 + math.sin(a) * 10)]), hx('#ffcf4d'))
    cv.part(m.rect(184, 86, 208, 93), Ramp('#6cc489'), shade=0)
    avatar_slot(cv, 110, 150, anim='pensar')
    personagem(cv, nc('mae'), 280, 166, 'neutra', flip=True)
    vinheta(cv)
    return cv, {'ecra': (172, 60, 220, 84), 'avatar': (110, 150), 'balao': (276, 90)}


def mercado_2():
    """O mealheiro: lanche (precisas) e brinquedo (queres) na banca do mercado."""
    cv = Canvas(W, H)
    ceu(cv, '#cfe8f7', '#fff1df'); nuvens(cv, 8); colinas(cv); chao_exterior(cv, 124)
    m = cv.m
    # banca com toldo às riscas
    for x in range(70, 250, 12):
        cv.put(m.rect(x, 50, x + 5, 66), hx('#ef7b8f'))
        cv.put(m.rect(x + 6, 50, x + 11, 66), (255, 255, 255))
    cv.put(m.rect(70, 66, 250, 67), hx('#c45a6a'))
    cv.put(m.rect(72, 67, 73, 120) | m.rect(247, 67, 248, 120), hx('#8a5a3a'))
    cv.part(m.rect(70, 100, 250, 140), Ramp('#d9a86a'), shade=2)
    # lanche: maçã e sandes
    cv.part(m.circle(112, 94, 6), Ramp('#ef6f6f'), shade=1, glint=True)
    cv.put(m.line([(112, 87), (114, 84)]), hx('#6b5a4a'))
    cv.part(m.rect(124, 90, 144, 99), Ramp('#f2d6a0'), shade=0)
    cv.put(m.rect(124, 93, 144, 94), I.P['folha'].base)
    # brinquedo: robô de corda
    cv.part(m.rect(186, 78, 204, 99), Ramp('#9fd0ee'), shade=1)
    cv.part(m.rect(189, 70, 201, 79), Ramp('#9fd0ee'), shade=0)
    cv.put(m.pts([(192, 74), (198, 74)]), hx('#2b2233'))
    cv.put(m.line([(195, 70), (195, 64)]), hx('#8a92b8'))
    cv.part(m.circle(195, 63, 1.5), Ramp('#ff9fb8'), shade=0)
    # mealheiro (porquinho)
    cv.part(m.ellipse(156, 120, 12, 9), Ramp('#f6a5b4'), shade=1, glint=True)
    cv.put(m.rect(152, 111, 160, 111), Ramp('#f6a5b4').dark)
    cv.put(m.pts([(166, 117)]), hx('#2b2233'))
    avatar_slot(cv, 160, 174, anim='pensar')
    personagem(cv, nc('mae'), 290, 168, 'contente', flip=True)
    vinheta(cv)
    return cv, {'ecra': (80, 20, 240, 44), 'avatar': (160, 174), 'balao': (282, 92)}


def mercado_3():
    """Decidir em família: conversa calma no sofá."""
    cv = Canvas(W, H)
    sala_fundo(cv, parede='#e9e1f7', rodape='#9c7bf0')
    m = cv.m
    cv.part(m.rect(60, 110, 260, 150), Ramp('#7fb8d8'), shade=2)
    cv.part(m.rect(60, 92, 260, 112), Ramp('#7fb8d8'), shade=1)
    # candeeiro de pé e quadro com coração
    cv.put(m.rect(286, 60, 287, 150), hx('#5a6070'))
    cv.part(m.poly([(276, 60), (298, 60), (294, 46), (280, 46)]), Ramp('#ffd65c'), shade=1)
    personagem(cv, nc('mae'), 110, 150, 'contente')
    avatar_slot(cv, 170, 150, anim='acenar', fr=2, flip=True)
    t = tablet(cv, 196, 132, 22, 15)
    from nascimento import coracao
    cv.over_fast(coracao(1), 142, 64)
    vinheta(cv)
    return cv, {'ecra': (40, 20, 200, 44), 'avatar': (170, 150), 'balao': (110, 76)}


MISSOES = {
    'direitos-online': ('Escola', 'Os direitos das crianças, também online', [escola_1, escola_2, escola_3]),
    'votacao-festa': ('Junta', 'A votação da festa', [junta_1, junta_2, junta_3]),
    'computador-velho': ('Horta e Ecoponto', 'Onde vai o computador velho?', [horta_1, horta_2, horta_3]),
    'preciso-ou-quero': ('Mercado', 'Preciso ou quero?', [mercado_1, mercado_2, mercado_3]),
}
