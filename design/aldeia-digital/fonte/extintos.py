"""Coleção opcional 'Animais de antigamente': dinossauros e outros animais extintos.

Usa o mesmo motor dos fatos atuais (avatar.py) com elementos extra ('extras') desenhados por ganchos.
Escolha por turma ou por aluno: coleção 'atuais' (36) ou 'extintos' (32). As duas convivem.
"""
from __future__ import annotations
import math
from engine import Ramp, hx, dilate4
import avatar as A

F = lambda **k: k
OSSO = Ramp('#fbf1d6', dark='#8a7a5a')
BR = (255, 255, 255)

EXTINTOS = [
    # masculino
    F(id='tiranossauro', nome='Tiranossauro', g='m', main='#f4a96a', belly='#fbe8c8', acc='#c96a3c', ears='nenhuma', top=None, pattern='riscas-cam', tail='dino', hands='patas', feet='patas', extras=('dentes', 'bracos-curtos')),
    F(id='triceratopo', nome='Tricerátopo', g='m', main='#8fc1d9', belly='#e8f4f8', acc='#e98a8a', ears='nenhuma', top=None, pattern='nenhum', tail='dino', hands='patas', feet='patas', extras=('gola', 'chifres3')),
    F(id='estegossauro', nome='Estegossauro', g='m', main='#a7d49a', belly='#f2f0c4', acc='#f2a65a', ears='nenhuma', top=None, pattern='escamas', tail='dino', hands='patas', feet='patas', extras=('placas', 'espinhos-cauda')),
    F(id='braquiossauro', nome='Braquiossauro', g='m', main='#b7c9e8', belly='#eef3fb', acc='#8aa2cf', ears='nenhuma', top=None, pattern='pintas', tail='dino', hands='patas', feet='patas', extras=('pescoco',)),
    F(id='anquilossauro', nome='Anquilossauro', g='m', main='#c9b48f', belly='#f4ead6', acc='#8f7a5a', ears='nenhuma', top=None, pattern='nenhum', tail='dino', hands='patas', feet='patas', extras=('armadura', 'clava')),
    F(id='velociraptor', nome='Velociraptor', g='m', main='#9fd3b0', belly='#f3f8e8', acc='#5f8fe0', ears='nenhuma', top=None, pattern='riscas-cam', tail='dino', hands='asa', feet='patas', extras=('penas-crista', 'dentes')),
    F(id='pterodactilo', nome='Pterodáctilo', g='m', main='#e0b4d8', belly='#f8ecf5', acc='#a87ab8', ears='nenhuma', top=None, pattern='nenhum', tail='curta', hands='asa', feet='laranja', extras=('crista-ptero', 'bico-longo')),
    F(id='parassaurolofo', nome='Parassaurolofo', g='m', main='#f2d16b', belly='#fff6d6', acc='#e07a5a', ears='nenhuma', top=None, pattern='riscas-cam', tail='dino', hands='patas', feet='patas', extras=('crista-tubo',)),
    F(id='espinossauro', nome='Espinossauro', g='m', main='#9cc7a8', belly='#eef6e6', acc='#e46f5c', ears='nenhuma', top=None, pattern='escamas', tail='dino', hands='patas', feet='patas', extras=('vela', 'dentes')),
    F(id='lourinhanossauro', nome='Lourinhanossauro', g='m', main='#c9d98a', belly='#f6f4cf', acc='#7a8f4a', ears='nenhuma', top=None, pattern='riscas-cam', tail='dino', hands='patas', feet='patas', extras=('sobrancelhas', 'dentes')),
    F(id='plesiossauro', nome='Plesiossauro', g='m', main='#7fcfc0', belly='#e7f8f3', acc='#3f8f86', ears='nenhuma', top=None, pattern='pintas-foca', tail='peixe', hands='barbatana', feet='barbatana', extras=('pescoco',)),
    F(id='mamute', nome='Mamute', g='m', main='#b78462', belly='#e6c9ad', acc='#f6b9c5', ears='pequenas', top=None, pattern='nenhum', tail='fina', hands='patas', feet='patas', tromba=True, extras=('pelo', 'cupula', 'presas-mamute')),
    F(id='dentes-de-sabre', nome='Tigre-dentes-de-sabre', g='m', main='#e8b878', belly='#fbecd2', acc='#a8774c', ears='redondas', top=None, pattern='pintas', tail='curta', hands='patas', feet='patas', extras=('presas',)),
    F(id='dodo', nome='Dodó', g='m', main='#a9b2c8', belly='#e4e8f0', acc='#e8d37a', ears='nenhuma', top=None, pattern='nenhum', tail='pompom', hands='asa', feet='laranja', extras=('bico-dodo',)),
    F(id='gliptodonte', nome='Gliptodonte', g='m', main='#c7a27e', belly='#f2e2cf', acc='#8a6446', ears='pequenas', top=None, pattern='nenhum', tail='dino', hands='patas', feet='patas', extras=('armadura', 'carapaca-hex')),
    F(id='arqueopterix', nome='Arqueoptérix', g='m', main='#7fc4c0', belly='#f5f0dc', acc='#e46f5c', ears='nenhuma', top=None, pattern='penas', tail='andorinha', hands='asa', feet='laranja', bico='pequeno', extras=('penas-crista',)),
    # feminino
    F(id='titanoboa', nome='Titanoboa', g='f', main='#9ccf8a', belly='#eef5cf', acc='#5f8f5a', ears='nenhuma', top=None, pattern='losangos', tail='enrolada', hands='patas', feet='patas', extras=('olhos-cobra', 'losangos')),
    F(id='hiena-cavernas', nome='Hiena-das-cavernas', g='f', main='#d9b98e', belly='#f6ead6', acc='#7a5a46', ears='redondas', top=None, pattern='pintas', tail='farfalhuda', hands='patas', feet='patas', extras=('crina-costas',)),
    F(id='arau-gigante', nome='Arau-gigante', g='f', main='#3f4a62', belly='#f8f7f2', acc='#e8eaf0', ears='nenhuma', top=None, pattern='nenhum', tail=None, hands='barbatana', feet='escuras', bico='pinguim', extras=('mancha-branca',)),
    F(id='meganeura', nome='Meganeura', g='f', main='#8fd6d0', belly='#e9fbf8', acc='#5f8fe0', ears='nenhuma', top=None, pattern='segmentos', tail='fina', hands='escuras', feet='escuras', extras=('olhos-compostos', 'asas-libelula')),
    F(id='moa', nome='Moa', g='f', main='#b08a68', belly='#efdcc6', acc='#e8c46a', ears='nenhuma', top=None, pattern='penas', tail='pompom', hands='asa', feet='laranja', extras=('pescoco', 'pelo')),
    F(id='ave-elefante', nome='Ave-elefante', g='f', main='#c9a6c9', belly='#f4e8f4', acc='#8f6f9f', ears='nenhuma', top=None, pattern='penas', tail='pompom', hands='asa', feet='laranja', bico='pequeno', extras=('fofa', 'cupula')),
    F(id='quaga', nome='Quaga', g='f', main='#c9a07a', belly='#f6e6d4', acc='#4e3f3a', ears='pontiagudas', top='crina', pattern='riscas', tail='fina', hands='patas', feet='escuras'),
    F(id='vaca-marinha', nome='Vaca-marinha', g='f', main='#9fa9b8', belly='#e6eaf0', acc='#6f7a8a', ears='nenhuma', top=None, pattern='focinho', tail='peixe', hands='barbatana', feet='barbatana', bigodes=True, nariz=True),
    F(id='preguica-gigante', nome='Preguiça-gigante', g='f', main='#b99b7a', belly='#ead9c4', acc='#6b5240', ears='nenhuma', top=None, pattern='nenhum', tail='pompom', hands='garras', feet='patas', extras=('mascara-preguica', 'pelo')),
    F(id='amonite', nome='Amonite', g='f', main='#f2b9a0', belly='#fde8de', acc='#d97a5a', ears='nenhuma', top=None, pattern='nenhum', tail='tentaculos', hands='tentaculo', feet='tentaculo', extras=('concha-espiral',)),
    F(id='trilobite', nome='Trilobite', g='f', main='#b5a4c9', belly='#ece6f4', acc='#6f5f8a', ears='nenhuma', top='antenas', pattern='segmentos', tail=None, hands='escuras', feet='escuras', extras=('espinhos-laterais', 'segmentos-capuz')),
    F(id='meiolania', nome='Meiolânia', g='f', main='#b8d89a', belly='#f4f0c0', acc='#6f9f62', ears='nenhuma', top=None, pattern='nenhum', tail='fina', hands='patas', feet='patas', carapaca=True, extras=('chifres-vaca',)),
    F(id='foca-monge', nome='Foca-monge', g='f', main='#b0a090', belly='#ece4da', acc='#7a6a5a', ears='nenhuma', top=None, pattern='nenhum', tail='peixe', hands='barbatana', feet='barbatana', bigodes=True, nariz=True),
    F(id='coruja-risonha', nome='Coruja-risonha', g='f', main='#d9a26e', belly='#f8e7cc', acc='#f2c94c', ears='nenhuma', top=None, pattern='penas', tail=None, hands='asa', feet='laranja', bico='coruja', olhos_grandes=True, extras=('riscas-coruja',)),
    F(id='lagartixa-gigante', nome='Lagartixa-gigante', g='f', main='#c2b47c', belly='#f2f2cf', acc='#6f8f4a', ears='nenhuma', top=None, pattern='riscas-cam', tail='dino', hands='patas', feet='patas', extras=('pintas-claras',)),
    F(id='cabra-pireneus', nome='Cabra-dos-Pirenéus', g='f', main='#c9ad8c', belly='#f4e8d8', acc='#6b5442', ears='pequenas', top=None, pattern='nenhum', tail='pompom', hands='escuras', feet='escuras', extras=('chifres-cabra', 'barbicha')),
]
assert len(EXTINTOS) == 32

COLECOES = {
    'atuais': {'nome': 'Animais de hoje', 'fatos': A.FATOS},
    'extintos': {'nome': 'Animais de antigamente', 'fatos': EXTINTOS},
}
NOTAS = {
    'lourinhanossauro': 'Descoberto na Lourinhã, Portugal.',
    'cabra-pireneus': 'Bucardo: vivia na Península Ibérica; extinto em 2000.',
    'lagartixa-gigante': 'Lagartixa-gigante de Cabo Verde.',
    'arau-gigante': 'Chegou a viver nas costas da Península Ibérica.',
    'pterodactilo': 'Réptil voador; não era dinossauro.',
    'plesiossauro': 'Réptil marinho; não era dinossauro.',
    'meganeura': 'Libélula gigante, muito antes dos dinossauros.',
}


def _hook(nome, stage):
    def deco(fn):
        A.HOOKS[(nome, stage)] = fn
        return fn
    return deco


# ------------------------------------------------------------------ capuz: atrás
@_hook('gola', 'capuz_atras')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; Ac = c['A']
    g = m.ellipse(hx_, hy_ - 2, rx + 6, ry + 4) & m.rect(0, 0, 60, hy_ + 3)
    cv.part(g, Ac, shade=1, light=1)
    for k in range(9):
        a = math.pi + math.pi * (k + .5) / 9
        cv.put(m.pts([(hx_ + math.cos(a) * (rx + 4), hy_ - 2 + math.sin(a) * (ry + 2))]), Ac.light)


@_hook('placas', 'capuz_atras')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; Ac = c['A']; top = c['top']
    for dx, dy, h in ((-8, 4, 4), (0, 0, 5), (8, 4, 4)):
        cv.part(m.ellipse(hx_ + dx, top + dy - h + 1, 2.6, h), Ac, shade=0, light=1)


@_hook('pescoco', 'capuz_atras')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; R = c['R']; top = c['top']
    s = -1 if c['back'] else 1
    cv.part(m.capsule(hx_ + 2 * s, top + 5, hx_ + 5 * s, top - 6, 3.4), R, shade=1)
    cv.part(m.ellipse(hx_ + 7 * s, top - 8, 5, 3.6), R, shade=1, light=1)
    if not c['back']:
        cv.put(m.rect(hx_ + 8, top - 10, hx_ + 9, top - 9), A.OLHO)
        cv.put(m.pts([(hx_ + 8, top - 10)]), BR)
        cv.put(m.pts([(hx_ + 10, top - 6), (hx_ + 11, top - 7)]), R.dark)
        if f['id'] == 'moa':
            cv.part(m.tri((hx_ + 11, top - 9), (hx_ + 11, top - 6), (hx_ + 15, top - 7)), Ramp('#e8c46a'), shade=0)
        else:
            cv.put(m.pts([(hx_ + 6, top - 6)]), A.ROSA.base)


@_hook('cupula', 'capuz_atras')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; R = c['R']; top = c['top']
    cv.part(m.ellipse(hx_, top + 1, 7, 4), R, shade=0, light=1)


@_hook('crista-tubo', 'capuz_atras')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; Ac = c['A']; top = c['top']
    s = -1 if c['back'] else 1
    cv.part(m.capsule(hx_ + 1 * s, top + 3, hx_ - 11 * s, top - 7, 2.4), Ac, shade=1, light=1)


@_hook('crista-ptero', 'capuz_atras')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; Ac = c['A']; top = c['top']
    s = -1 if c['back'] else 1
    cv.part(m.poly([(hx_ + 3 * s, top + 4), (hx_ - 2 * s, top + 1), (hx_ - 15 * s, top - 6), (hx_ - 6 * s, top + 6)]), Ac, shade=0, light=1)


@_hook('penas-crista', 'capuz_atras')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; top = c['top']
    cols = ('#e46f5c', '#ffcf4d', '#5f8fe0') if f['id'] == 'arqueopterix' else (f['acc'],) * 3
    for k, (dx, col) in enumerate(zip((-4, 0, 4), cols)):
        cv.part(m.ellipse(hx_ + dx - 2, top - 2 - (k == 1) * 2, 2, 4), Ramp(col), shade=0)


@_hook('vela', 'capuz_atras')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; Ac = c['A']; top = c['top']
    v = m.ellipse(hx_, top + 4, 10, 13) & m.rect(0, 0, 60, top + 4)
    cv.part(v, Ac, shade=1, light=1)
    for dx in (-6, -3, 0, 3, 6):
        cv.put(m.line([(hx_ + dx * .4, top + 3), (hx_ + dx, top - 7 + abs(dx) // 2)]) & v, Ac.dark)


@_hook('concha-espiral', 'capuz_atras')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; Ac = c['A']; top = c['top']
    sh = m.circle(hx_, hy_ - 3, 15)
    cv.part(sh, Ramp('#f6d8b8', dark='#8a5a3a'), shade=2, light=1)
    pts = []
    for k in range(80):
        t = k / 80 * 4.2 * math.pi
        r = 14 * (1 - k / 90)
        pts.append((hx_ + math.cos(t) * r, hy_ - 3 + math.sin(t) * r))
    cv.put(m.line(pts, 2) & sh, Ramp('#d9a27a').dark)


@_hook('chifres-cabra', 'capuz_atras')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; top = c['top']
    H = Ramp('#8a7a6a', dark='#3f342b')
    for s in (-1, 1):
        pts = [(hx_ + s * (3 + k * .9) + s * math.sin(k / 6) * 2, top + 3 - k * 1.1 + (k / 6) ** 2 * 1.4) for k in range(13)]
        mk = m.empty()
        for (x, y) in pts:
            mk |= m.circle(x, y, 2.2 - pts.index((x, y)) / 13)
        cv.part(mk, H, shade=0, light=1)
        for (x, y) in pts[2::3]:
            cv.put(m.pts([(x, y)]), H.dark)


@_hook('crina-costas', 'capuz_atras')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; Ac = c['A']; top = c['top']
    cv.part(m.ellipse(hx_, top + 1, 3, 4), Ac, shade=0)


@_hook('olhos-compostos', 'capuz_atras')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; top = c['top']
    E = Ramp('#5fbfd0', dark='#2f5f7a')
    for s in (-1, 1):
        cv.part(m.circle(hx_ + s * 7, top + 2, 5), E, shade=1, light=1)
        if not c['back']:
            cv.put(m.rect(hx_ + s * 7 - 1, top + 1, hx_ + s * 7, top + 3), A.OLHO)
            cv.put(m.pts([(hx_ + s * 7 - 2, top)]), BR)


@_hook('chifres-vaca', 'capuz_atras')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; top = c['top']
    for s in (-1, 1):
        cv.part(m.poly([(hx_ + s * 7, top + 4), (hx_ + s * 11, top + 4), (hx_ + s * 16, top - 2), (hx_ + s * 14, top - 3)]), OSSO, shade=0)


@_hook('espinhos-laterais', 'capuz_atras')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; Ac = c['A']
    for s in (-1, 1):
        cv.part(m.tri((hx_ + s * 10, hy_ + 4), (hx_ + s * 12, hy_ + 9), (hx_ + s * 16, hy_ + 16)), Ac, shade=0)


@_hook('fofa', 'capuz_atras')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; R = c['R']
    fl = m.empty()
    for k in range(14):
        a = 2 * math.pi * k / 14
        fl |= m.circle(hx_ + math.cos(a) * 12, hy_ + math.sin(a) * 11, 2.6)
    cv.part(fl, R, shade=1, light=1)


# ------------------------------------------------------------------ capuz: frente
@_hook('chifres3', 'capuz_frente')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; top = c['top']; fx = c['fx']
    for s in (-1, 1):
        cv.part(m.poly([(hx_ + s * 3, top + 4), (hx_ + s * 6, top + 3), (hx_ + s * 7, top - 6)]), OSSO, shade=0)
    if not c['back']:
        cv.part(m.tri((hx_ + fx - 2, top + 8), (hx_ + fx + 2, top + 8), (hx_ + fx, top + 4)), OSSO, shade=0)


@_hook('armadura', 'capuz_frente')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; Ac = c['A']; d = c.get('deco')
    for (x, y) in ((-7, -6), (-2, -9), (3, -9), (8, -6), (-10, 0), (10, 0)):
        mk = m.circle(hx_ + x, hy_ + y, 1.6)
        if d is not None:
            mk &= d
        cv.put(mk, Ac.base)
        cv.put(m.pts([(hx_ + x - 1, hy_ + y - 1)]) & mk, Ac.light)


@_hook('segmentos-capuz', 'capuz_frente')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; Ac = c['A']; d = c.get('deco')
    for k in range(-8, 9, 4):
        line = m.line([(hx_ + k, hy_ - ry + 2), (hx_ + k * 1.1, hy_ + ry - 2)])
        if d is not None:
            line &= d
        cv.put(line, Ac.base)


@_hook('pelo', 'capuz_frente')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; R = c['R']; d = c.get('deco')
    mk = (m.ellipse(hx_, hy_, rx, ry)) & (((m.xx * 3 + m.yy) % 7) == 0)
    if d is not None:
        mk &= d
    cv.put(mk, R.shade)


@_hook('losangos', 'capuz_frente')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; Ac = c['A']; d = c.get('deco')
    mk = m.empty()
    for (x, y) in ((-7, -5), (0, -8), (7, -5), (-10, 2), (10, 2)):
        mk |= m.poly([(hx_ + x, hy_ + y - 2), (hx_ + x + 2, hy_ + y), (hx_ + x, hy_ + y + 2), (hx_ + x - 2, hy_ + y)])
    if d is not None:
        mk &= d
    cv.put(mk, Ac.base)


@_hook('olhos-cobra', 'capuz_frente')
def _(cv, f, c):
    if c['back']:
        return
    m = cv.m; hx_, hy_, rx, ry = c['hood']; top = c['top']; fx = c['fx']
    for s in (-1, 1):
        x = hx_ + fx + s * 5
        cv.put(m.rect(x, top + 4, x + 1, top + 5), hx('#ffd65c'))
        cv.put(m.pts([(x + (s < 0), top + 4), (x + (s < 0), top + 5)]), A.OLHO)


@_hook('mancha-branca', 'capuz_frente')
def _(cv, f, c):
    if c['back']:
        return
    m = cv.m; hx_, hy_, rx, ry = c['hood']; top = c['top']; fx = c['fx']
    for s in (-1, 1):
        cv.put(m.ellipse(hx_ + fx + s * 7, top + 6, 2, 1.4), BR)


@_hook('mascara-preguica', 'capuz_frente')
def _(cv, f, c):
    if c['back']:
        return
    m = cv.m; hx_, hy_, rx, ry = c['hood']; top = c['top']; fx = c['fx']; Ac = c['A']
    for s in (-1, 1):
        cv.put(m.poly([(hx_ + fx + s * 3, top + 4), (hx_ + fx + s * 8, top + 5), (hx_ + fx + s * 8, top + 7), (hx_ + fx + s * 4, top + 6)]), Ac.base)
        cv.put(m.rect(hx_ + fx + s * 5, top + 5, hx_ + fx + s * 5 + 1, top + 5), A.OLHO)


@_hook('riscas-coruja', 'capuz_frente')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; R = c['R']; d = c.get('deco')
    mk = m.ellipse(hx_, hy_, rx, ry) & ((m.xx % 4 == 0) & (m.yy % 3 == 0))
    if d is not None:
        mk &= d
    cv.put(mk, R.dark)


@_hook('pintas-claras', 'capuz_frente')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']; B = c['B']; d = c.get('deco')
    mk = m.pts([(hx_ - 8, hy_ - 4), (hx_ + 7, hy_ - 6), (hx_ - 3, hy_ - 9), (hx_ + 10, hy_ + 1), (hx_ - 10, hy_ + 2)])
    if d is not None:
        mk &= d
    cv.put(mk, B.base)


@_hook('sobrancelhas', 'capuz_frente')
def _(cv, f, c):
    if c['back']:
        return
    m = cv.m; hx_, hy_, rx, ry = c['hood']; top = c['top']; fx = c['fx']; Ac = c['A']
    for s in (-1, 1):
        cv.part(m.ellipse(hx_ + fx + s * 5, top + 3, 2.4, 1.3), Ac, shade=0)


@_hook('bico-longo', 'capuz_frente')
def _(cv, f, c):
    if c['back']:
        return
    m = cv.m; hx_, hy_, rx, ry = c['hood']; top = c['top']; fx = c['fx']
    cv.part(m.poly([(hx_ + fx - 3, top + 6), (hx_ + fx + 3, top + 6), (hx_ + fx + 10, top + 9), (hx_ + fx + 1, top + 9)]), Ramp('#f2c46a'), shade=0)


@_hook('bico-dodo', 'capuz_frente')
def _(cv, f, c):
    if c['back']:
        return
    m = cv.m; hx_, hy_, rx, ry = c['hood']; top = c['top']; fx = c['fx']
    x = hx_ + fx
    cv.part(m.poly([(x - 5, top + 3), (x + 5, top + 3), (x + 6, top + 8), (x + 3, top + 10), (x + 1, top + 8), (x - 3, top + 7)]), Ramp('#e8d37a'), shade=0)
    cv.put(m.pts([(x + 3, top + 9), (x + 4, top + 9), (x + 5, top + 8)]), hx('#8a6a2a'))


# ------------------------------------------------------------------ capuz: borda (por cima da cara)
@_hook('dentes', 'capuz_borda')
def _(cv, f, c):
    if c['back']:
        return
    m = cv.m
    ox, oy, rx, ry = c['g'].opening
    t = oy - ry - 1
    for dx in (-5, -2, 1, 4):
        cv.put(m.pts([(ox + dx, t), (ox + dx + 1, t), (ox + dx, t + 1)]), BR)
        cv.put(m.pts([(ox + dx + 1, t + 1), (ox + dx, t + 2)]), c['R'].dark)


@_hook('presas', 'capuz_borda')
def _(cv, f, c):
    if c['back']:
        return
    m = cv.m
    ox, oy, rx, ry = c['g'].opening
    t = oy - ry - 1
    for s in (-1, 1):
        fang = m.poly([(ox + s * 4 - 1, t), (ox + s * 4 + 1, t), (ox + s * 4, t + 5)])
        cv.put(dilate4(fang) & ~fang & ~m.rect(0, 0, 60, t - 1), OSSO.dark)
        cv.put(fang, BR)


@_hook('presas-mamute', 'capuz_borda')
def _(cv, f, c):
    m = cv.m; hx_, hy_, rx, ry = c['hood']
    if c['back']:
        return
    for s in (-1, 1):
        pts = [(hx_ + s * (8 + k * .45), hy_ + 7 + k * .5 - (k / 7) ** 2 * 6) for k in range(9)]
        mk = m.empty()
        for (x, y) in pts:
            mk |= m.circle(x, y, 1.4)
        cv.part(mk, OSSO, shade=0)


@_hook('barbicha', 'capuz_borda')
def _(cv, f, c):
    if c['back']:
        return
    m = cv.m
    ox, oy, rx, ry = c['g'].opening
    cv.part(m.tri((ox - 2, oy + ry + 1), (ox + 2, oy + ry + 1), (ox, oy + ry + 5)), c['A'], shade=0)


# ------------------------------------------------------------------ corpo
@_hook('espinhos-cauda', 'corpo_atras')
def _(cv, f, c):
    if c['back']:
        return
    m = cv.m; g = c['g']
    tx, ty = A.CX + 7, g.torso[1] + 4
    for dx, dy in ((9, -1), (11, 1)):
        cv.part(m.tri((tx + dx - 1, ty + dy), (tx + dx + 1, ty + dy), (tx + dx, ty + dy - 4)), OSSO, shade=0)


@_hook('clava', 'corpo_atras')
def _(cv, f, c):
    m = cv.m; g = c['g']
    tx, ty = (A.CX + 7, g.torso[1] + 4) if not c['back'] else (A.CX, g.torso[1] + 4)
    cv.part(m.ellipse(tx + 12, ty + 5, 3.4, 2.6) if not c['back'] else m.ellipse(tx + 1, ty + 9, 3.4, 2.6), c['A'], shade=1, light=1)


@_hook('asas-libelula', 'corpo_atras')
def _(cv, f, c):
    m = cv.m; g = c['g']; ty = g.torso[1] - 4
    Wg = Ramp('#e8f8ff', dark='#7fb0c8')
    for s in (-1, 1):
        cv.part(m.ellipse(A.CX + s * 13, ty - 3, 9, 2.4), Wg, shade=0)
        cv.part(m.ellipse(A.CX + s * 12, ty + 2, 8, 2.2), Wg, shade=0)


@_hook('carapaca-hex', 'corpo_frente')
def _(cv, f, c):
    m = cv.m; g = c['g']; tx, ty, rx, ry = g.torso; Ac = c['A']
    if c['back']:
        sh = m.ellipse(tx, ty, rx + 2, ry)
        cv.part(sh, Ac, shade=2, light=1)
        for (x, y) in ((0, -4), (-4, 0), (4, 0), (0, 4), (-4, -6), (4, -6)):
            cv.put(m.ellipse(tx + x, ty + y, 1.6, 1.2), Ac.light)
    else:
        side = c['torso'] & ~m.ellipse(tx, ty + 1, 5, 5)
        cv.put(side & (((m.xx + m.yy) % 3) == 0), Ac.base)


@_hook('placas', 'corpo_frente')
def _(cv, f, c):
    if not c['back']:
        return
    m = cv.m; g = c['g']; tx, ty, rx, ry = g.torso; Ac = c['A']
    for k, y in enumerate(range(ty - ry + 1, ty + ry, 4)):
        cv.part(m.ellipse(tx, y, 2.6, 2.6), Ac, shade=0)


@_hook('vela', 'corpo_frente')
def _(cv, f, c):
    if not c['back']:
        return
    m = cv.m; g = c['g']; tx, ty, rx, ry = g.torso; Ac = c['A']
    cv.part(m.ellipse(tx, ty - 2, 3, ry), Ac, shade=0)


@_hook('pelo', 'corpo_frente')
def _(cv, f, c):
    m = cv.m; R = c['R']
    cv.put(c['torso'] & (((m.xx * 3 + m.yy) % 7) == 0), R.shade)


@_hook('fofa', 'corpo_frente')
def _(cv, f, c):
    m = cv.m; R = c['R']; g = c['g']; tx, ty, rx, ry = g.torso
    for k in range(10):
        a = 2 * math.pi * k / 10
        cv.part(m.circle(tx + math.cos(a) * 8, ty + math.sin(a) * 7, 2), R, shade=0, outline=False)


@_hook('losangos', 'corpo_frente')
def _(cv, f, c):
    m = cv.m; g = c['g']; tx, ty, rx, ry = g.torso; Ac = c['A']
    side = c['torso'] & ~m.ellipse(tx, ty + 1, 5, 5)
    for (x, y) in ((-6, -4), (6, -4), (-6, 3), (6, 3)):
        cv.put(m.poly([(tx + x, ty + y - 2), (tx + x + 2, ty + y), (tx + x, ty + y + 2), (tx + x - 2, ty + y)]) & side, Ac.base)


@_hook('crina-costas', 'corpo_frente')
def _(cv, f, c):
    if not c['back']:
        return
    m = cv.m; g = c['g']; tx, ty, rx, ry = g.torso
    cv.put(m.rect(tx - 1, ty - ry + 1, tx + 1, ty), c['A'].base)


@_hook('bracos-curtos', 'corpo_fim')
def _(cv, f, c):
    """o T-rex tem bracinhos: um par extra pequenino no peito (os braços do pijama continuam)."""
    if c['back']:
        return
    m = cv.m; g = c['g']; tx, ty, rx, ry = g.torso
    for s in (-1, 1):
        cv.part(m.capsule(tx + s * 3, ty - 4, tx + s * 4, ty - 1, 1.1), c['R'], shade=0)
        cv.put(m.pts([(tx + s * 4, ty)]), OSSO.base)


def todos():
    return A.FATOS + EXTINTOS
