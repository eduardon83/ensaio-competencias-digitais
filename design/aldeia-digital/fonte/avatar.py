"""Avatares da Aldeia Digital: criança com fato de animal (capuz com cara do animal).

Tela nativa 44 x 64. Origem (pés no chão) em (22, 60).
Camadas: corpo (fato), cara, cabelo, capuz. Cosmética por âncoras.
"""
from __future__ import annotations
import math
from engine import Canvas, Ramp, hx, dilate4, ahead, erode4

W, H = 44, 64
CX, GY = 22, 60

# ------------------------------------------------------------------ paletas
PELES = {
    'pele-1': '#fde4d0', 'pele-2': '#f4c9a4', 'pele-3': '#dfa676',
    'pele-4': '#c0855a', 'pele-5': '#93603f', 'pele-6': '#664231',
}
CABELO_CORES = {'castanho': '#6b4430', 'preto': '#33293f', 'ruivo': '#c4602f', 'loiro': '#e6b85a'}
CABELOS = ['franja', 'caracois', 'trancas', 'curto', 'rapado', 'lenco']
CABELO_NOMES = {'franja': 'Franja', 'caracois': 'Caracóis', 'trancas': 'Tranças', 'curto': 'Curto', 'rapado': 'Rapado', 'lenco': 'Com lenço'}

ROSA = Ramp('#f6a5b4')
BOCA = hx('#7a3b3b')
OLHO = hx('#2b2233')
BRANCO = (255, 255, 255)

# ------------------------------------------------------------------ 32 fatos
# ears: pontiagudas | tufos | redondas | longas | caidas | elefante | pequenas | nenhuma
# top: espinhos | barbatana | repuxo | manto | juba | crina | picos | la | penachos | olhos-rã | crista | ossiconos | chifres | antenas
# pattern: pintas | riscas | escamas | manchas | nenhum
F = lambda **k: k
FATOS = [
    F(id='dinossauro', nome='Dinossauro', g='m', main='#8fd18a', belly='#f2f0b3', acc='#f2a65a', ears='nenhuma', top='espinhos', pattern='escamas', tail='dino', hands='patas', feet='patas'),
    F(id='lince', nome='Lince', g='m', main='#e9b97e', belly='#fbecd2', acc='#7c5537', ears='tufos', top=None, pattern='pintas', tail='curta', hands='patas', feet='patas'),
    F(id='lobo', nome='Lobo', g='m', main='#a9b2c3', belly='#eef0f5', acc='#6f7891', ears='pontiagudas', top=None, pattern='mascara', tail='farfalhuda', hands='patas', feet='patas'),
    F(id='golfinho', nome='Golfinho', g='m', main='#7fc4e8', belly='#e6f6fc', acc='#4f93c4', ears='nenhuma', top='barbatana', pattern='nenhum', tail='peixe', hands='barbatana', feet='barbatana'),
    F(id='esquilo', nome='Esquilo', g='m', main='#d98b53', belly='#fbe3c7', acc='#a65f34', ears='esquilo', top=None, pattern='nenhum', tail='esquilo', hands='patas', feet='patas'),
    F(id='polvo', nome='Polvo', g='m', main='#c79be6', belly='#f2e2fb', acc='#9a6cc0', ears='nenhuma', top='polvo', pattern='ventosas', tail='tentaculos', hands='tentaculo', feet='tentaculo'),
    F(id='ourico', nome='Ouriço', g='m', main='#c9a27e', belly='#f6e4cf', acc='#8a6446', ears='pequenas', top='picos', pattern='nenhum', tail=None, hands='patas', feet='patas'),
    F(id='coelho', nome='Coelho', g='m', main='#f3eee8', belly='#ffffff', acc='#f6a5b4', ears='longas', top=None, pattern='nenhum', tail='pompom', hands='patas', feet='patas'),
    F(id='gato', nome='Gato', g='m', main='#b7b9c9', belly='#f1f1f6', acc='#7e8197', ears='pontiagudas', top=None, pattern='riscas-gato', tail='gato', hands='patas', feet='patas', bigodes=True),
    F(id='cao', nome='Cão', g='m', main='#e3c79e', belly='#fbf1e0', acc='#a5794c', ears='caidas', top=None, pattern='mancha-olho', tail='cao', hands='patas', feet='patas'),
    F(id='urso', nome='Urso', g='m', main='#b98762', belly='#ecd2b6', acc='#7f5a3f', ears='redondas', top=None, pattern='nenhum', tail='pompom', hands='patas', feet='patas'),
    F(id='panda', nome='Panda', g='m', main='#f5f5f2', belly='#ffffff', acc='#3d3a4a', ears='redondas-escuras', top=None, pattern='panda', tail='pompom', hands='escuras', feet='escuras'),
    F(id='pinguim', nome='Pinguim', g='m', main='#3b4257', belly='#f8f7f2', acc='#f5a54a', ears='nenhuma', top=None, pattern='nenhum', tail=None, hands='barbatana', feet='laranja', bico='pinguim'),
    F(id='leao', nome='Leão', g='m', main='#f2c66d', belly='#fdf0cf', acc='#d98a3d', ears='redondas', top='juba', pattern='nenhum', tail='leao', hands='patas', feet='patas'),
    F(id='tigre', nome='Tigre', g='m', main='#f4a55c', belly='#fff3e2', acc='#5c3b34', ears='redondas', top=None, pattern='riscas', tail='tigre', hands='patas', feet='patas'),
    F(id='elefante', nome='Elefante', g='m', main='#b9c3d6', belly='#e8edf5', acc='#f6b9c5', ears='elefante', top=None, pattern='nenhum', tail='fina', hands='patas', feet='patas', tromba=True),
    F(id='camaleao', nome='Camaleão', g='m', main='#9fdc8c', belly='#f5f3b0', acc='#5fae8f', ears='nenhuma', top='crista', pattern='riscas-cam', tail='enrolada', hands='patas', feet='patas', olhos_lado=True),
    F(id='dragao', nome='Dragão', g='m', main='#7ccdc6', belly='#fbe7a8', acc='#e4826f', ears='nenhuma', top='chifres', pattern='escamas', tail='dino', hands='patas', feet='patas', asas='dragao'),
    F(id='andorinha', nome='Andorinha', g='f', main='#5d7ad0', belly='#fbf6ee', acc='#e46f5c', ears='nenhuma', top=None, pattern='garganta', tail='andorinha', hands='asa', feet='laranja', bico='pequeno'),
    F(id='raposa', nome='Raposa', g='f', main='#f08a4b', belly='#fff2e3', acc='#57443f', ears='raposa', top=None, pattern='nenhum', tail='raposa', hands='escuras', feet='escuras'),
    F(id='coruja', nome='Coruja', g='f', main='#b5926f', belly='#f4e5cc', acc='#f2c94c', ears='nenhuma', top='penachos', pattern='penas', tail=None, hands='asa', feet='laranja', bico='coruja', olhos_grandes=True),
    F(id='tartaruga', nome='Tartaruga', g='f', main='#b8e09a', belly='#f6efb9', acc='#6fa064', ears='nenhuma', top=None, pattern='nenhum', tail='fina', hands='patas', feet='patas', carapaca=True),
    F(id='baleia', nome='Baleia', g='f', main='#6f9ad8', belly='#e9f1fb', acc='#a9dcf5', ears='nenhuma', top='repuxo', pattern='nenhum', tail='peixe', hands='barbatana', feet='barbatana'),
    F(id='abelha', nome='Abelha', g='f', main='#f9d55b', belly='#fff3bf', acc='#4a3f45', ears='nenhuma', top='antenas', pattern='riscas-abelha', tail='ferrao', hands='escuras', feet='escuras', asas='inseto'),
    F(id='girafa', nome='Girafa', g='f', main='#f4cf7e', belly='#fdf2d8', acc='#c4834b', ears='pequenas', top='ossiconos', pattern='manchas', tail='fina', hands='patas', feet='escuras'),
    F(id='lontra', nome='Lontra', g='f', main='#a7785a', belly='#f1dcc5', acc='#6e4a37', ears='mini', top=None, pattern='focinho', tail='lontra', hands='patas', feet='patas', bigodes=True),
    F(id='zebra', nome='Zebra', g='f', main='#f7f6f2', belly='#ffffff', acc='#3f3c4c', ears='pontiagudas', top='crina', pattern='riscas', tail='fina', hands='patas', feet='escuras'),
    F(id='ra', nome='Rã', g='f', main='#8fd36c', belly='#f2f7c2', acc='#f4a6b4', ears='nenhuma', top='olhos-ra', pattern='nenhum', tail=None, hands='patas', feet='ra'),
    F(id='foca', nome='Foca', g='f', main='#b8c2cf', belly='#eef2f6', acc='#8b97a8', ears='nenhuma', top=None, pattern='pintas-foca', tail='peixe', hands='barbatana', feet='barbatana', bigodes=True, nariz=True),
    F(id='joaninha', nome='Joaninha', g='f', main='#ef5f5b', belly='#fde7e3', acc='#3d3346', ears='nenhuma', top='antenas', pattern='joaninha', tail=None, hands='escuras', feet='escuras', asas='joaninha'),
    F(id='lula', nome='Lula', g='f', main='#f6a9c0', belly='#fde6ee', acc='#e07a9b', ears='nenhuma', top='manto', pattern='pintas', tail='tentaculos', hands='tentaculo', feet='tentaculo'),
    F(id='gaivota', nome='Gaivota', g='f', main='#f5f6f8', belly='#ffffff', acc='#9eaab9', ears='nenhuma', top=None, pattern='nenhum', tail='curta', hands='asa-cinza', feet='laranja', bico='gaivota'),
    F(id='lebre', nome='Lebre', g='f', main='#d6aa7c', belly='#f8e7d2', acc='#4e3f3a', ears='lebre', top=None, pattern='nenhum', tail='pompom', hands='patas', feet='patas'),
    F(id='ovelha', nome='Ovelha', g='f', main='#fbf7ee', belly='#ffffff', acc='#6c5b5b', ears='ovelha', top='la', pattern='nenhum', tail='pompom', hands='escuras', feet='escuras'),
    F(id='formiga', nome='Formiga', g='f', main='#c8664f', belly='#f4cdb9', acc='#5b3530', ears='nenhuma', top='antenas', pattern='segmentos', tail='abdomen', hands='escuras', feet='escuras'),
    F(id='toupeira', nome='Toupeira', g='f', main='#6e6178', belly='#d9d2de', acc='#f39bb0', ears='nenhuma', top=None, pattern='nenhum', tail='fina', hands='garras', feet='patas', nariz=True),
]
# lista do design.md: 18 m + 18 f = 36 -> já contámos; confirmar
assert len(FATOS) == 36, len(FATOS)  # o design.md pede pelo menos 32; a lista tem 36

COR_FATOS = {  # 8 cores de fato (recolor do principal)
    'menta': '#9fdcc0', 'ceu': '#9cc8ee', 'lilas': '#c6a8ec', 'pessego': '#f7b98f',
    'limao': '#f2e27a', 'rosa': '#f5a9c4', 'areia': '#e5cfa6', 'nuvem': '#eef1f6',
}


# ------------------------------------------------------------------ ganchos (coleções extra, ex.: extintos)
HOOKS = {}


def _hook(stage, cv, f, **ctx):
    for nome in f.get('extras', ()):
        fn = HOOKS.get((nome, stage))
        if fn:
            fn(cv, f, ctx)


# ------------------------------------------------------------------ poses
def pose(**k):
    p = dict(by=0, hy=0, lh=(-3, 7), rh=(3, 7), lf=(0, 0), rf=(0, 0), eyes='open', mouth='smile', blush=True, view='se', tilt=0, squash=0)
    p.update(k)
    return p


def _wave(i):
    up = [(5, -9), (7, -10), (5, -9), (3, -10)]
    return up[i % 4]


ANIMS = {}
# Parado (8): respirar e piscar
ANIMS['parado'] = [pose(by=b, hy=b, eyes=('closed' if i == 5 else 'open')) for i, b in enumerate([0, 0, 0, 1, 1, 1, 0, 0])]
# Andar (8 por direção)
_wb = [0, -1, -1, 0, 0, -1, -1, 0]
_lf = [(0, 0), (0, -2), (1, -2), (1, 0), (0, 0), (0, 0), (0, 0), (0, 0)]
_rf = [(0, 0), (0, 0), (0, 0), (0, 0), (0, 0), (0, -2), (-1, -2), (-1, 0)]
_arm = [0, 1, 2, 1, 0, -1, -2, -1]
ANIMS['andar'] = [pose(by=_wb[i], hy=_wb[i], lf=_lf[i], rf=_rf[i], lh=(-3 + _arm[i], 7), rh=(3 + _arm[i], 7)) for i in range(8)]
# Acenar (8)
ANIMS['acenar'] = [pose(rh=_wave(i) if i > 0 else (4, 2), mouth='open' if i in (2, 3, 4, 5) else 'smile', eyes='happy' if i in (3, 4) else 'open', hy=0 if i % 2 else 0) for i in range(8)]
# Celebrar (10)
_cj = [0, 1, 0, -3, -5, -5, -3, 0, 1, 0]
ANIMS['celebrar'] = [pose(by=_cj[i], hy=_cj[i], lh=(-6, -8) if 2 < i < 8 else (-4, 3), rh=(6, -8) if 2 < i < 8 else (4, 3),
                          lf=(0, 0), rf=(0, 0), eyes='happy' if i > 1 else 'open', mouth='open' if i > 1 else 'smile', squash=1 if i in (1, 8) else 0) for i in range(10)]
# Pensar (6)
ANIMS['pensar'] = [pose(rh=(-2, -1), eyes='up', mouth='o' if i in (2, 3) else 'soft', hy=0, tilt=1 if i in (1, 2, 3, 4) else 0) for i in range(6)]
# Vamos outra vez (6): suspiro leve e depois punho no ar
ANIMS['outra-vez'] = [
    pose(eyes='half', mouth='soft', by=1, hy=1),
    pose(eyes='half', mouth='soft', by=1, hy=2),
    pose(eyes='open', mouth='soft', by=0, hy=0),
    pose(eyes='open', mouth='smile', rh=(4, 1)),
    pose(eyes='happy', mouth='open', rh=(5, -8), by=-1, hy=-1),
    pose(eyes='open', mouth='smile', rh=(5, -7)),
]
# Dormir (6)
ANIMS['dormir'] = [pose(eyes='closed', mouth='sleep', by=b, hy=b + 1, tilt=1, blush=True) for b in [0, 0, 1, 1, 1, 0]]
# Vestir / rodopio (8)
_views = ['se', 'se-m', 'ne-m', 'ne', 'se', 'se-m', 'ne-m', 'ne']
ANIMS['vestir'] = [pose(view=_views[i], by=[0, -1, -2, -1, 0, -1, -2, 0][i], hy=[0, -1, -2, -1, 0, -1, -2, 0][i], eyes='happy', mouth='open', lh=(-5, 3), rh=(5, 3)) for i in range(8)]

FPS = 12
ANIM_INFO = {
    'parado': 'respirar e piscar; sempre',
    'andar': 'mapa; 8 por direção',
    'acenar': 'chegar, à porta de casa',
    'celebrar': 'missão, desbloqueio',
    'pensar': 'à porta de um edifício',
    'outra-vez': 'abaixo de 50; leve, nunca choro',
    'dormir': 'aluno inativo, à porta de casa',
    'vestir': 'guarda-roupa (rodopio)',
}


# ------------------------------------------------------------------ desenho
class Geo:
    def __init__(self, p):
        v = p['view'].split('-')[0]
        self.back = v == 'ne'
        self.fx = 0 if self.back else 1
        self.by = p['by']
        self.hy = p['hy']
        sq = p.get('squash', 0)
        self.hood = (CX, 28 + self.hy + sq, 12, 11 - sq)
        self.opening = (CX + self.fx, 31 + self.hy + sq, 7, 6 - sq)
        self.torso = (CX, 47 + self.by + sq, 8, 8 - sq)
        self.sh_l = (15, 43 + self.by + sq)
        self.sh_r = (29, 43 + self.by + sq)
        self.hip_l = (18, 53 + self.by)
        self.hip_r = (26, 53 + self.by)
        lf, rf = p['lf'], p['rf']
        self.foot_l = (18 + lf[0], 58 + lf[1])
        self.foot_r = (26 + rf[0], 58 + rf[1])
        lh, rh = p['lh'], p['rh']
        self.hand_l = (self.sh_l[0] + lh[0], self.sh_l[1] + lh[1])
        self.hand_r = (self.sh_r[0] + rh[0], self.sh_r[1] + rh[1])


def _ramps(f, color=None):
    main = color or f['main']
    return Ramp(main), Ramp(f['belly']), Ramp(f['acc'])


def draw_body(f, p, color=None):
    """camada corpo: fato, braços, pernas, cauda e asas."""
    g = Geo(p)
    cv = Canvas(W, H)
    m = cv.m
    R, B, A = _ramps(f, color)
    back = g.back

    def tail():
        t = f.get('tail')
        tx, ty = (CX + 7, g.torso[1] + 4) if not back else (CX, g.torso[1] + 4)
        s = 1 if not back else 0
        if not t:
            return
        if t == 'pompom':
            cv.part(m.circle(tx + (2 if not back else 0), ty, 3), B if f['id'] != 'panda' else R, shade=1)
        elif t == 'curta':
            cv.part(m.ellipse(tx + 2, ty, 3, 2), R)
        elif t in ('dino',):
            pts = [(tx - 2, ty - 4), (tx + 9, ty + 3), (tx + 12, ty + 6), (tx - 1, ty + 4)] if not back else [(CX - 4, ty - 3), (CX + 4, ty - 3), (CX + 1, ty + 7), (CX - 1, ty + 7)]
            cv.part(m.poly(pts), R)
        elif t == 'farfalhuda':
            cv.part(m.ellipse(tx + 4, ty - 1, 4, 3), R)
            cv.part(m.ellipse(tx + 7, ty - 2, 2, 2), B, shade=0)
        elif t == 'raposa':
            cv.part(m.ellipse(tx + 4, ty - 2, 5, 3), R)
            cv.part(m.ellipse(tx + 8, ty - 3, 2, 2), B, shade=0, outline=False)
        elif t == 'esquilo':
            cv.part(m.ellipse(tx + 5, ty - 7, 5, 8), R)
            cv.part(m.ellipse(tx + 5, ty - 13, 4, 3), R, shade=0)
            cv.part(m.ellipse(tx + 4, ty - 8, 2, 4), B, outline=False, shade=0, light=0)
        elif t == 'gato':
            cv.part(m.capsule(tx, ty, tx + 6, ty - 8, 1.5), R)
        elif t == 'cao':
            cv.part(m.capsule(tx, ty, tx + 5, ty - 5, 1.5), R)
        elif t == 'leao':
            cv.part(m.capsule(tx, ty, tx + 7, ty - 2, 1), R, shade=0)
            cv.part(m.circle(tx + 8, ty - 3, 2), A, shade=0)
        elif t == 'tigre':
            cv.part(m.capsule(tx, ty, tx + 6, ty - 7, 1.5), R)
            cv.put(m.capsule(tx + 3, ty - 3, tx + 4, ty - 4, .5), A.base)
        elif t == 'fina':
            cv.part(m.capsule(tx, ty, tx + 4, ty + 2, .8), R, shade=0)
            cv.part(m.circle(tx + 5, ty + 2, 1), A, shade=0)
        elif t == 'peixe':
            cv.part(m.poly([(tx - 1, ty - 1), (tx + 6, ty + 1), (tx + 9, ty - 3), (tx + 9, ty + 5), (tx + 5, ty + 4), (tx - 1, ty + 3)]), R)
        elif t == 'enrolada':
            cv.part(m.circle(tx + 5, ty, 3) & ~m.circle(tx + 5, ty, 1), R, shade=0)
        elif t == 'andorinha':
            cv.part(m.poly([(tx - 2, ty), (tx + 6, ty + 2), (tx + 10, ty + 8), (tx + 5, ty + 4), (tx + 4, ty + 9), (tx, ty + 3)]), R)
        elif t == 'lontra':
            cv.part(m.capsule(tx, ty + 2, tx + 7, ty + 4, 2), R)
        elif t == 'ferrao':
            cv.part(m.tri((tx - 1, ty - 1), (tx - 1, ty + 4), (tx + 5, ty + 3)), A, shade=0)
        elif t == 'abdomen':
            cv.part(m.ellipse(tx + 3, ty + 1, 4, 3), A)
        elif t == 'tentaculos':
            pass

    def wings():
        a = f.get('asas')
        if not a:
            return
        ty = g.torso[1] - 4
        if a == 'dragao':
            for sgn in (-1, 1):
                pts = [(CX + sgn * 5, ty), (CX + sgn * 15, ty - 6), (CX + sgn * 13, ty + 1), (CX + sgn * 15, ty + 4), (CX + sgn * 6, ty + 5)]
                cv.part(m.poly(pts), A)
        elif a == 'inseto':
            for sgn in (-1, 1):
                cv.part(m.ellipse(CX + sgn * 10, ty - 2, 5, 3), Ramp('#e8f6ff'), shade=0)
        elif a == 'joaninha' and back:
            pass

    # atrás do corpo
    if not back:
        tail()
    wings()

    _hook('corpo_atras', cv, f, g=g, R=R, B=B, A=A, back=back)
    # pernas e pés
    for hip, foot in ((g.hip_l, g.foot_l), (g.hip_r, g.foot_r)):
        ft = f.get('feet')
        if ft == 'tentaculo':
            cv.part(m.capsule(hip[0], hip[1] - 1, foot[0] + (-2 if hip[0] < CX else 2), foot[1], 2.2), R)
            continue
        cv.part(m.capsule(hip[0], hip[1] - 2, foot[0], foot[1] - 1, 3), R, shade=1)
        fr = {'patas': B, 'escuras': A if f['id'] not in ('panda',) else Ramp(f['acc']), 'laranja': Ramp('#f5a54a'), 'barbatana': R, 'ra': R}.get(ft, B)
        if f['id'] == 'panda':
            fr = A
        if ft == 'barbatana':
            cv.part(m.ellipse(foot[0] + (-1 if hip[0] < CX else 1), foot[1], 4, 2), R)
        elif ft == 'ra':
            cv.part(m.ellipse(foot[0] + (-1 if hip[0] < CX else 1), foot[1], 4, 2), R)
        else:
            cv.part(m.ellipse(foot[0], foot[1], 3, 2), fr)

    # tronco
    tx, ty, rx, ry = g.torso
    torso = m.ellipse(tx, ty, rx, ry)
    if f['id'] == 'polvo' or f['id'] == 'lula':
        torso = torso | m.ellipse(tx, ty + 3, rx + 1, ry - 3)
    cv.part(torso, R, shade=2, light=1)
    if f.get('carapaca'):
        sh = m.ellipse(tx, ty, rx + 2, ry - 1)
        sh_r = Ramp(f['acc'])
        if back:
            cv.part(sh, sh_r, shade=2, glint=True)
            for (ox, oy) in [(0, -3), (-4, 1), (4, 1), (0, 4)]:
                cv.put(m.ellipse(tx + ox, ty + oy, 2, 1.5), sh_r.light)
        else:
            cv.part(sh & ~m.ellipse(tx, ty, rx - 1, ry), sh_r, shade=1)
            cv.part(m.ellipse(tx, ty, rx - 2, ry - 1), R, shade=1)
    if not back:
        belly = m.ellipse(tx, ty + 1, 5, 5) & torso
        pat = f['pattern']
        if pat == 'garganta':
            belly = m.ellipse(tx, ty, 5, 6) & torso
        if pat != 'panda':
            cv.part(belly, B, outline=False, shade=1, light=0)
        if pat == 'garganta':
            cv.part(m.ellipse(tx, ty - 5, 3, 2) & torso, A, outline=False, shade=0, light=0)
        _torso_pattern(cv, f, torso, belly, g, A, R, back)
        # fecho/botões do pijama: um pequeno detalhe
        if f['id'] not in ('polvo', 'lula'):
            cv.put(m.pts([(tx, ty - 4)]), B.shade)
    else:
        _torso_pattern(cv, f, torso, None, g, A, R, back)
        if f['id'] == 'joaninha':
            cv.put(m.line([(tx, ty - ry + 1), (tx, ty + ry - 1)]), A.base)
        tail()
        if f.get('asas') == 'inseto':
            for sgn in (-1, 1):
                cv.part(m.ellipse(CX + sgn * 4, ty - 2, 3, 4), Ramp('#e8f6ff'), shade=0)

    _hook('corpo_frente', cv, f, g=g, R=R, B=B, A=A, back=back, torso=torso)
    # tentáculos extra (polvo/lula) à frente das pernas
    if f.get('tail') == 'tentaculos':
        for dx in (-6, 6):
            cv.part(m.capsule(tx + dx, ty + 4, tx + dx + (2 if dx > 0 else -2), ty + 10, 1.8), R)
        if not back:
            for dx in (-6, 6):
                cv.put(m.pts([(tx + dx + (1 if dx > 0 else -1), ty + 8)]), B.base)

    # braços
    for sh, hand, side in ((g.sh_l, g.hand_l, -1), (g.sh_r, g.hand_r, 1)):
        hk = f.get('hands')
        arm_r = Ramp(f['acc']) if hk == 'escuras' else R
        if f['id'] == 'panda':
            arm_r = A
        if hk == 'asa':
            cv.part(m.poly([(sh[0], sh[1] - 1), (hand[0] + side * 2, hand[1] + 1), (hand[0], hand[1] + 3), (sh[0] - side, sh[1] + 3)]), R)
            continue
        if hk == 'asa-cinza':
            cv.part(m.poly([(sh[0], sh[1] - 1), (hand[0] + side * 2, hand[1] + 1), (hand[0], hand[1] + 3), (sh[0] - side, sh[1] + 3)]), A)
            continue
        if hk == 'barbatana':
            cv.part(m.capsule(sh[0], sh[1], hand[0], hand[1], 2.2), R)
            cv.part(m.ellipse(hand[0] + side, hand[1] + 1, 2, 3), R, shade=0)
            continue
        if hk == 'tentaculo':
            cv.part(m.capsule(sh[0], sh[1], hand[0], hand[1], 2), R)
            cv.put(m.pts([(hand[0], hand[1])]), B.base)
            continue
        cv.part(m.capsule(sh[0], sh[1], hand[0], hand[1], 2.3), arm_r)
        mit = B if hk == 'patas' else (Ramp(f['acc']) if hk == 'escuras' else B)
        if f['id'] == 'panda':
            mit = A
        if hk == 'garras':
            cv.part(m.circle(hand[0], hand[1], 2.6), B)
            cv.put(m.pts([(hand[0] - 1, hand[1] + 2), (hand[0] + 1, hand[1] + 2)]), BRANCO)
        else:
            cv.part(m.circle(hand[0], hand[1], 2.2), mit, shade=0)
    _hook('corpo_fim', cv, f, g=g, R=R, B=B, A=A, back=back)
    return cv


def _torso_pattern(cv, f, torso, belly, g, A, R, back):
    m = cv.m
    tx, ty, rx, ry = g.torso
    pat = f['pattern']
    side = torso & ~(belly if belly is not None else m.empty())
    if pat == 'pintas':
        for ox, oy in [(-6, -3), (5, -4), (-5, 3), (6, 2), (0, -5)]:
            cv.put(m.ellipse(tx + ox, ty + oy, 1, 1) & side, A.base)
    elif pat == 'pintas-foca':
        for ox, oy in [(-6, -2), (5, 1), (-4, 4)]:
            cv.put(m.pts([(tx + ox, ty + oy)]) & side, A.base)
    elif pat in ('riscas', 'riscas-abelha', 'riscas-gato', 'segmentos', 'riscas-cam'):
        col = A.base if pat != 'riscas-cam' else A.base
        step = 4 if pat != 'riscas-abelha' else 4
        for k, yy in enumerate(range(ty - ry + 3, ty + ry, step)):
            if pat == 'riscas-abelha':
                band = m.rect(0, yy, W, yy + 1) & torso
                cv.put(band, A.base)
            elif pat == 'segmentos':
                band = m.rect(0, yy, W, yy) & torso
                cv.put(band, A.base)
            else:
                band = (m.rect(0, yy, tx - 4, yy + 1) | m.rect(tx + 4, yy, W, yy + 1)) & side
                cv.put(band, col)
    elif pat == 'manchas':
        for ox, oy in [(-6, -3), (5, -3), (-4, 4), (6, 4), (0, -6)]:
            cv.part(m.ellipse(tx + ox, ty + oy, 1.5, 1) & side, A, outline=False, shade=0, light=0)
    elif pat == 'escamas':
        for ox, oy in [(-6, -2), (-5, 3), (6, -2), (5, 3)]:
            cv.put(m.pts([(tx + ox, ty + oy), (tx + ox + 1, ty + oy)]) & side, R.shade)
        if back:
            for yy in range(ty - ry + 1, ty + ry - 1, 3):
                cv.put(m.tri((tx - 2, yy + 2), (tx + 2, yy + 2), (tx, yy - 1)), A.base)
    elif pat == 'joaninha':
        for ox, oy in [(-5, -3), (5, -3), (-6, 3), (6, 3), (-2, 5), (3, 5)]:
            cv.put(m.ellipse(tx + ox, ty + oy, 1, 1) & torso & side, A.base)
    elif pat == 'panda':
        cv.part(m.ellipse(tx, ty - 5, 8, 2) & torso, A, outline=False, shade=0, light=0)
    elif pat == 'penas':
        if belly is not None:
            for ox, oy in [(-2, -1), (2, -1), (0, 2), (-3, 3), (3, 3)]:
                cv.put(m.pts([(tx + ox, ty + oy), (tx + ox + 1, ty + oy + 1)]) & belly, R.shade)
    elif pat == 'ventosas' and not back and belly is not None:
        for ox, oy in [(-2, -1), (2, 1), (-1, 3)]:
            cv.put(m.pts([(tx + ox, ty + oy)]), A.base)
    elif pat == 'mancha-olho':
        cv.put(m.ellipse(tx + 5, ty - 2, 2, 2) & side, A.base)


def draw_face(skin, p):
    g = Geo(p)
    cv = Canvas(W, H)
    m = cv.m
    if g.back:
        return cv
    ox, oy, rx, ry = g.opening
    S = Ramp(PELES[skin])
    face = m.ellipse(ox, oy, rx + 1, ry + 1)
    cv.part(face, S, outline=False, shade=1, light=0)
    ey = oy + 0
    tilt = p.get('tilt', 0)
    el, er = (ox - 3, ey), (ox + 3, ey + (0 if not tilt else 0))
    eyes = p['eyes']
    for (x, y) in (el, er):
        if eyes == 'open':
            cv.put(m.rect(x - 1, y - 1, x, y + 1), OLHO)
            cv.put(m.pts([(x - 1, y - 1)]), BRANCO)
        elif eyes == 'up':
            cv.put(m.rect(x - 1, y - 2, x, y), OLHO)
            cv.put(m.pts([(x, y - 2)]), BRANCO)
        elif eyes == 'half':
            cv.put(m.rect(x - 1, y, x, y + 1), OLHO)
            cv.put(m.rect(x - 1, y - 1, x, y - 1), S.shade)
        elif eyes == 'closed':
            cv.put(m.pts([(x - 1, y + 1), (x, y + 1)]), OLHO)
        elif eyes == 'happy':  # ^ ^
            cv.put(m.pts([(x - 1, y), (x, y - 1), (x + 1, y)]) if False else m.pts([(x - 1, y + 1), (x - 1, y), (x, y), (x, y + 1)]) & ~m.pts([(x - 1, y + 1), (x, y + 1)]) | m.pts([(x - 2, y + 1), (x - 1, y), (x, y), (x + 1, y + 1)]), OLHO)
    if p.get('blush', True):
        cv.put(m.pts([(ox - 5, ey + 2), (ox - 4, ey + 2)]), ROSA.base)
        cv.put(m.pts([(ox + 4, ey + 2), (ox + 5, ey + 2)]), ROSA.base)
    my = ey + 3
    mo = p['mouth']
    if mo == 'smile':
        cv.put(m.pts([(ox - 1, my), (ox, my + 1), (ox + 1, my)]), BOCA)
    elif mo == 'open':
        cv.put(m.rect(ox - 1, my, ox + 1, my + 1), BOCA)
        cv.put(m.pts([(ox, my + 1)]), hx('#e8758a'))
    elif mo == 'o':
        cv.put(m.pts([(ox, my), (ox, my + 1)]), BOCA)
    elif mo == 'soft':
        cv.put(m.pts([(ox - 1, my + 1), (ox, my + 1)]), BOCA)
    elif mo == 'sleep':
        cv.put(m.pts([(ox, my + 1)]), BOCA)
    return cv


def draw_hair(style, color, p, lenco='#e4728d'):
    g = Geo(p)
    cv = Canvas(W, H)
    m = cv.m
    if style == 'rapado':
        return cv
    ox, oy, rx, ry = g.opening
    top = oy - ry
    C = Ramp(color)
    face = m.ellipse(ox, oy, rx + 1, ry + 1)
    if g.back:
        if style == 'trancas':
            for dx in (-6, 6):
                cv.part(m.capsule(CX + dx, g.hood[1] + 9, CX + dx, g.hood[1] + 15, 1.6), C, shade=0)
        return cv
    if style == 'franja':
        hm = m.rect(0, top - 1, W, top + 2) & face
        hm |= m.pts([(ox - 5, top + 3), (ox - 4, top + 3), (ox - 1, top + 3), (ox + 2, top + 3), (ox + 3, top + 3), (ox + 6, top + 3)]) & face
        cv.part(hm, C, outline=False, shade=0, light=1)
    elif style == 'curto':
        hm = m.poly([(ox - 8, top - 1), (ox + 8, top - 1), (ox + 8, top + 1), (ox - 1, top + 3), (ox - 8, top + 4)]) & face
        cv.part(hm, C, outline=False, shade=0, light=1)
    elif style == 'caracois':
        hm = m.rect(0, top - 1, W, top + 1) & face
        for dx in range(-6, 7, 3):
            hm |= m.circle(ox + dx, top + 2, 1.4) & face
        cv.part(hm, C, outline=False, shade=0, light=0)
        for dx in (-8, 8):
            cv.part(m.circle(ox + dx, oy + 2, 1.8), C, shade=0)
            cv.part(m.circle(ox + dx, oy + 5, 1.6), C, shade=0)
    elif style == 'trancas':
        hm = m.poly([(ox - 8, top - 1), (ox + 8, top - 1), (ox + 8, top + 2), (ox + 1, top + 1), (ox - 8, top + 2)]) & face
        cv.part(hm, C, outline=False, shade=0, light=1)
        for dx in (-7, 7):
            br = m.capsule(ox + dx, oy + 3, ox + dx + (-1 if dx < 0 else 1), oy + 11, 1.6)
            cv.part(br, C, shade=0)
            cv.put(m.pts([(ox + dx + (-1 if dx < 0 else 1), oy + 7)]), C.dark)
            cv.part(m.circle(ox + dx + (-1 if dx < 0 else 1), oy + 12, 1), Ramp(lenco), shade=0)
    elif style == 'lenco':
        L = Ramp(lenco)
        band = m.rect(0, top - 1, W, top + 2) & face
        cv.part(band, L, outline=False, shade=0, light=1)
        cv.put(m.rect(0, top + 3, W, top + 3) & face, L.dark)
        cv.put(m.pts([(ox - 4, top + 1), (ox, top), (ox + 4, top + 1)]), (255, 255, 255))
    return cv


def draw_hood(f, p, color=None):
    g = Geo(p)
    cv = Canvas(W, H)
    m = cv.m
    R, B, A = _ramps(f, color)
    hx_, hy_, hrx, hry = g.hood
    back = g.back
    fx = g.fx if not back else -1
    top = hy_ - hry
    t = f.get('top')
    e = f['ears']

    # --- atrás da cabeça
    if t == 'juba':
        jb = m.empty()
        for k in range(14):
            a = 2 * math.pi * k / 14
            jb |= m.circle(hx_ + math.cos(a) * 13, hy_ + math.sin(a) * 12, 3.6)
        jb |= m.ellipse(hx_, hy_, 14, 13)
        cv.part(jb, A, shade=1)
    if t == 'picos':
        pk = m.empty()
        for k in range(13):
            a = math.pi + math.pi * k / 12 - .2
            x1, y1 = hx_ + math.cos(a) * 11, hy_ + math.sin(a) * 10
            x2, y2 = hx_ + math.cos(a) * 16, hy_ + math.sin(a) * 15
            ang = a + .35
            x3, y3 = hx_ + math.cos(ang) * 11, hy_ + math.sin(ang) * 10
            pk |= m.tri((x1, y1), (x2, y2), (x3, y3))
        cv.part(pk, A, shade=0)
    if t == 'la':
        la = m.empty()
        for k in range(12):
            a = 2 * math.pi * k / 12
            la |= m.circle(hx_ + math.cos(a) * 11, hy_ + math.sin(a) * 10 - 1, 4)
        cv.part(la, R, shade=1, light=1)
    if t == 'espinhos':
        for k, dx in enumerate([-7, -2, 3, 8] if not back else [-6, -1, 4]):
            yy = hy_ - math.sqrt(max(0, 1 - (dx / hrx) ** 2)) * hry
            cv.part(m.tri((hx_ + dx - 3, yy + 3), (hx_ + dx + 3, yy + 3), (hx_ + dx, yy - 4)), A, shade=0)
    if t == 'barbatana':
        cv.part(m.poly([(hx_ - 3, top + 2), (hx_ + 4, top + 2), (hx_ + 5, top - 6), (hx_ + 1, top - 5)]), R)
    if t == 'repuxo':
        W_ = Ramp(f['acc'])
        cv.part(m.capsule(hx_, top - 1, hx_, top - 5, 1), W_, shade=0)
        for dx, dy in [(-4, -7), (4, -7), (-2, -9), (2, -9)]:
            cv.part(m.circle(hx_ + dx, top + dy, 1.4), W_, shade=0)
    if t == 'manto':
        cv.part(m.poly([(hx_ - 10, top + 6), (hx_, top - 9), (hx_ + 10, top + 6)]), R)
        for sgn in (-1, 1):
            cv.part(m.tri((hx_ + sgn * 6, top - 1), (hx_ + sgn * 12, top - 3), (hx_ + sgn * 8, top + 4)), R, shade=0)
    if t == 'polvo':
        cv.part(m.ellipse(hx_, hy_ - 4, hrx, hry + 3), R, shade=2)
    if t == 'crina':
        for k in range(5):
            yy = top - 1 + k * 2
            cv.part(m.ellipse(hx_ + (k - 2) * 0, yy - 2 + (0 if k else 0), 2, 2) if False else m.rect(hx_ - 1, top - 4, hx_ + 1, top + 3), A, shade=0)
    if t == 'ossiconos':
        for sgn in (-1, 1):
            cv.part(m.capsule(hx_ + sgn * 4, top + 2, hx_ + sgn * 5, top - 5, 1), R, shade=0)
            cv.part(m.circle(hx_ + sgn * 5, top - 6, 1.6), A, shade=0)
    if t == 'chifres':
        for sgn in (-1, 1):
            cv.part(m.poly([(hx_ + sgn * 4, top + 3), (hx_ + sgn * 8, top + 3), (hx_ + sgn * 9, top - 6)]), Ramp('#fbe7a8'), shade=0)
    if t == 'antenas':
        for sgn in (-1, 1):
            cv.put(m.line([(hx_ + sgn * 3, top + 1), (hx_ + sgn * 6, top - 6)]), A.base)
            cv.part(m.circle(hx_ + sgn * 6, top - 7, 1.5), A if f['id'] != 'abelha' else A, shade=0)
    if t == 'penachos':
        for sgn in (-1, 1):
            cv.part(m.tri((hx_ + sgn * 4, top + 3), (hx_ + sgn * 11, top + 3), (hx_ + sgn * 10, top - 4)), R, shade=0)
    if t == 'crista':
        for k, dx in enumerate([-4, 0, 4]):
            cv.part(m.circle(hx_ + dx, top + 1 - (1 if dx == 0 else 0), 2.4), A, shade=0)

    _hook('capuz_atras', cv, f, g=g, R=R, B=B, A=A, back=back, hood=(hx_, hy_, hrx, hry), top=top, fx=fx)
    # --- orelhas
    def ear_tri(sgn, w=4, h=8, inner=True, tilt=2, col=R, inn=B, tuft=False, tip=None):
        bx = hx_ + sgn * 7
        by = top + 4
        pts = [(bx - w, by), (bx + w, by), (bx + sgn * tilt, by - h)]
        cv.part(m.poly(pts), col, shade=0)
        if inner and not back:
            ipts = [(bx - w + 2, by), (bx + w - 2, by), (bx + sgn * tilt, by - h + 3)]
            cv.put(m.poly(ipts), inn.base if inn is not B else ROSA.light)
        if tuft:
            cv.put(m.line([(bx + sgn * tilt, by - h), (bx + sgn * (tilt + 1), by - h - 3)]), A.base)
        if tip is not None:
            cv.put(m.poly(pts) & m.rect(0, 0, W, by - h + 2), tip)

    if e in ('pontiagudas', 'tufos', 'raposa'):
        for sgn in (-1, 1):
            if e == 'raposa':
                ear_tri(sgn, w=5, h=10, col=R, inn=B, tip=A.base)
            else:
                ear_tri(sgn, w=4, h=8, tuft=(e == 'tufos'), col=(R if f['id'] != 'zebra' else R))
    elif e in ('redondas', 'redondas-escuras', 'esquilo', 'mini'):
        for sgn in (-1, 1):
            r = 4 if e != 'mini' else 2.5
            cx_, cy_ = hx_ + sgn * 8, top + 2
            col = A if e == 'redondas-escuras' else R
            if e == 'esquilo':
                cv.part(m.tri((cx_ - 3, cy_ + 3), (cx_ + 3, cy_ + 3), (cx_ + sgn * 1, cy_ - 6)), R, shade=0)
                cv.part(m.circle(cx_ + sgn, cy_ - 6, 1.4), A, shade=0)
                continue
            cv.part(m.circle(cx_, cy_, r), col, shade=0)
            if not back and e != 'redondas-escuras':
                cv.put(m.circle(cx_, cy_ + .5, r - 2), B.base if f['id'] != 'tigre' else Ramp('#fff3e2').base)
    elif e in ('longas', 'lebre'):
        for sgn in (-1, 1):
            x0, y0 = hx_ + sgn * 4, top + 3
            x1, y1 = hx_ + sgn * 7, top - 13
            cv.part(m.capsule(x0, y0, x1, y1, 2.7), R, shade=1)
            if not back:
                cv.put(m.capsule(x0, y0 - 1, x1, y1 + 1, 1.0), (ROSA.light if e == 'longas' else B.base))
            if e == 'lebre':
                cv.put(m.capsule(x0, y0, x1, y1, 2.7) & m.rect(0, 0, W, y1 + 1), A.base)
    elif e == 'pequenas':
        for sgn in (-1, 1):
            cv.part(m.ellipse(hx_ + sgn * 11, top + 7, 3, 2), R, shade=0)
    elif e == 'ovelha':
        for sgn in (-1, 1):
            cv.part(m.ellipse(hx_ + sgn * 14, hy_ - 1, 4, 2), Ramp(f['acc']), shade=0)

    # --- cabeça (capuz)
    head = m.ellipse(hx_, hy_, hrx, hry)
    hood_col = R
    if f.get('pattern') == 'panda':
        hood_col = R
    if t != 'polvo':
        cv.part(head, hood_col, shade=2, light=1, glint=False)
    head_all = head | (m.ellipse(hx_, hy_ - 4, hrx, hry + 3) if t == 'polvo' else head)
    if t == 'la':
        for k in range(5):
            a = math.pi + math.pi * (k + .5) / 5
            cv.part(m.circle(hx_ + math.cos(a) * 7, hy_ + math.sin(a) * 7, 3), R, shade=0, light=1)

    # orelhas por cima (cão, elefante)
    if e == 'caidas':
        for sgn in (-1, 1):
            cv.part(m.ellipse(hx_ + sgn * 12, hy_ + 1, 3, 7), Ramp(f['acc']), shade=1)
    if e == 'elefante':
        for sgn in (-1, 1):
            cv.part(m.ellipse(hx_ + sgn * 13, hy_ - 1, 6, 8), R, shade=1)
            if not back:
                cv.put(m.ellipse(hx_ + sgn * 13, hy_ - 1, 4, 6), Ramp(f['acc']).base)

    # --- padrão do capuz
    pat = f['pattern']
    o_x, o_y, o_rx, o_ry = g.opening
    hole = m.ellipse(o_x, o_y, o_rx, o_ry) if not back else m.empty()
    ring = dilate4(dilate4(hole)) if not back else m.empty()
    deco_area = head_all & ~ring
    if pat in ('pintas', 'joaninha'):
        pts = [(-7, -6), (6, -5), (-9, 1), (9, 2), (0, -9)] if pat == 'pintas' else [(-6, -6), (6, -6), (-9, 1), (9, 1), (0, -9)]
        for ox_, oy_ in pts:
            cv.put(m.ellipse(hx_ + ox_, hy_ + oy_, 1 if pat == 'pintas' else 1.5, 1 if pat == 'pintas' else 1.5) & deco_area, A.base)
    if pat == 'pintas-foca':
        for ox_, oy_ in [(-7, -6), (7, -3), (2, -9)]:
            cv.put(m.pts([(hx_ + ox_, hy_ + oy_)]) & deco_area, A.base)
    if pat in ('riscas', 'riscas-gato', 'riscas-cam'):
        for k, dx in enumerate([-3, 0, 3] if pat != 'riscas-cam' else [-4, 4]):
            cv.put(m.capsule(hx_ + dx, top + 1, hx_ + dx, top + 4, .6) & deco_area, A.base)
        for sgn in (-1, 1):
            cv.put(m.capsule(hx_ + sgn * 11, hy_ - 2, hx_ + sgn * 9, hy_ - 1, .5) & deco_area, A.base)
            cv.put(m.capsule(hx_ + sgn * 11, hy_ + 2, hx_ + sgn * 9, hy_ + 2, .5) & deco_area, A.base)
    if pat == 'riscas-abelha':
        cv.put(m.rect(0, top + 2, W, top + 3) & deco_area, A.base)
    if pat == 'manchas':
        for ox_, oy_ in [(-6, -6), (6, -6), (-9, 1), (9, 1), (0, -9)]:
            cv.part(m.ellipse(hx_ + ox_, hy_ + oy_, 1.5, 1) & deco_area, A, outline=False, shade=0, light=0)
    if pat == 'escamas':
        for ox_, oy_ in [(-6, -5), (6, -5), (-9, 1), (9, 1)]:
            cv.put(m.pts([(hx_ + ox_, hy_ + oy_), (hx_ + ox_ + 1, hy_ + oy_)]) & deco_area, R.shade)
    if pat == 'segmentos':
        cv.put(m.rect(0, top + 3, W, top + 3) & deco_area, A.base)
    if pat == 'mascara' and not back:
        cv.put(m.ellipse(hx_ + fx, top + 5, 6, 3) & deco_area, B.base)
    if pat == 'panda' and not back:
        pass
    if pat == 'mancha-olho' and not back:
        cv.put(m.ellipse(hx_ + 5 + fx, top + 6, 2.5, 2) & deco_area, A.base)
    if pat == 'focinho' and not back:
        cv.put(m.ellipse(hx_ + fx, top + 7, 5, 2.5) & deco_area, B.base)
    if pat == 'joaninha' and not back:
        pass
    if pat == 'garganta' and not back:
        pass

    # --- elementos da frente do capuz
    if not back:
        ey = top + 5
        exl, exr = hx_ - 5 + fx, hx_ + 5 + fx
        if f['pattern'] == 'panda':
            for x in (exl, exr):
                cv.put(m.ellipse(x, ey, 2.5, 2) & deco_area, A.base)
        if t == 'olhos-ra':
            for x in (exl - 1, exr + 1):
                cv.part(m.circle(x, top + 1, 3.2), R, shade=0)
                cv.put(m.circle(x, top + 1, 1.8), BRANCO)
                cv.put(m.rect(x, top, x + 1, top + 2), OLHO)
        elif f.get('olhos_grandes'):
            for x in (exl, exr):
                cv.part(m.circle(x, ey, 3), B, shade=0)
                cv.put(m.rect(x - 1, ey - 1, x, ey + 1), OLHO)
                cv.put(m.pts([(x - 1, ey - 1)]), BRANCO)
        elif f.get('olhos_lado'):
            for x in (exl - 3, exr + 3):
                cv.part(m.circle(x, ey + 1, 2.6), R, shade=0)
                cv.put(m.rect(x, ey, x + 1, ey + 1), OLHO)
        else:
            for x in (exl, exr):
                cv.put(m.rect(x, ey - 1, x + 1, ey), OLHO)
                cv.put(m.pts([(x, ey - 1)]), BRANCO)
        # bochechas do capuz
        if f['id'] in ('coelho', 'urso', 'gato', 'raposa', 'lince', 'tigre', 'leao', 'cao', 'esquilo', 'lebre', 'panda', 'toupeira', 'lontra', 'ovelha'):
            for x in (exl - 2, exr + 2):
                cv.put(m.pts([(x, ey + 2)]) & deco_area, ROSA.base)
        nose_y = ey + 1
        if f.get('nariz'):
            cv.part(m.ellipse(hx_ + fx, nose_y + 1, 2.5 if f['id'] == 'toupeira' else 1.5, 1.5 if f['id'] == 'toupeira' else 1), Ramp('#f39bb0') if f['id'] == 'toupeira' else Ramp(f['acc']), shade=0)
        elif f['id'] in ('gato', 'coelho', 'urso', 'cao', 'lince', 'raposa', 'lobo', 'tigre', 'leao', 'panda', 'esquilo', 'lebre', 'lontra', 'ovelha'):
            col = Ramp('#3d3a4a') if f['id'] in ('panda', 'cao', 'lobo', 'raposa', 'lontra', 'ovelha') else ROSA
            cv.put(m.pts([(hx_ + fx, nose_y), (hx_ + fx + 1, nose_y)]), col.dark if col is ROSA else col.base)
        if f.get('bigodes'):
            for sgn in (-1, 1):
                x0 = hx_ + fx + sgn * 6
                cv.put(m.pts([(x0, nose_y + 1), (x0 + sgn, nose_y + 1), (x0, nose_y + 3), (x0 + sgn, nose_y + 3)]) & deco_area, R.dark)
        bk = f.get('bico')
        if bk:
            col = {'pinguim': '#f5a54a', 'pequeno': '#4a3f45', 'coruja': '#f2c94c', 'gaivota': '#f6c544'}[bk]
            Rb = Ramp(col)
            bx = hx_ + fx
            if bk == 'gaivota':
                cv.part(m.poly([(bx - 3, ey + 1), (bx + 3, ey + 1), (bx, ey + 5)]), Rb, shade=0)
                cv.put(m.pts([(bx, ey + 3)]), hx('#e0574a'))
            elif bk == 'pinguim':
                cv.part(m.poly([(bx - 3, ey + 1), (bx + 3, ey + 1), (bx, ey + 5)]), Rb, shade=0)
            else:
                cv.part(m.poly([(bx - 2, ey + 1), (bx + 2, ey + 1), (bx, ey + 4)]), Rb, shade=0)
        if f.get('tromba'):
            tr = m.capsule(hx_ + fx, ey, hx_ + fx, ey + 3, 2)
            cv.part(tr, R, shade=0)
        if f['id'] == 'pinguim':
            pass

    _hook('capuz_frente', cv, f, g=g, R=R, B=B, A=A, back=back, hood=(hx_, hy_, hrx, hry), top=top, fx=fx, deco=deco_area)
    # --- abertura da cara
    if not back:
        r1 = dilate4(hole) & ~hole
        r2 = dilate4(dilate4(hole)) & ~dilate4(hole)
        lining = B if f['id'] not in ('pinguim', 'andorinha') else Ramp('#fbf6ee')
        if f['id'] in ('panda', 'zebra', 'coelho', 'gaivota', 'ovelha'):
            lining = Ramp('#f6dfe4') if f['id'] in ('coelho',) else Ramp('#eceaf2')
        cv.put(r2 & head_all, lining.base)
        cv.put(r1, lining.dark)
        cv.clear(hole)
        # pinguim: máscara branca à volta
        if f['id'] == 'pinguim':
            pm = m.ellipse(o_x, o_y - 1, o_rx + 3, o_ry + 3) & ~dilate4(hole) & head_all
            cv.put(pm & ~r1, Ramp('#f8f7f2').base)
            cv.put(dilate4(pm) & ~pm & head_all & ~hole & ~r1 & ~dilate4(dilate4(hole)), R.shade)
    else:
        # nuca: costura do capuz
        cv.put(m.line([(hx_, hy_ + 3), (hx_, hy_ + hry - 1)]), R.shade)
    _hook('capuz_borda', cv, f, g=g, R=R, B=B, A=A, back=back, hood=(hx_, hy_, hrx, hry), top=top, fx=fx)
    return cv


# ------------------------------------------------------------------ montagem
def view_flip(p):
    return p['view'].endswith('-m')


def render_layers(f, skin, hair, hair_color, p, color=None):
    L = {
        'corpo': draw_body(f, p, color),
        'cara': draw_face(skin, p),
        'cabelo': draw_hair(hair, CABELO_CORES[hair_color], p),
        'capuz': draw_hood(f, p, color),
    }
    if view_flip(p):
        L = {k: v.flip() for k, v in L.items()}
    return L


def compose(layers, order=('corpo', 'cara', 'cabelo', 'capuz'), extra=None):
    cv = Canvas(W, H)
    for k in order:
        if k in layers:
            cv.over_fast(layers[k])
    return cv


def anchors(p):
    g = Geo(p)
    flip = view_flip(p)

    def fx(pt):
        x, y = pt
        return (W - 1 - x if flip else x, y)
    hx_, hy_, hrx, hry = g.hood
    ox, oy, _, _ = g.opening
    a = {
        'chapeu': fx((hx_, hy_ - hry)),
        'olhos': fx((ox, oy)),
        'mao_e': fx(g.hand_l), 'mao_d': fx(g.hand_r),
        'mochila': fx((CX, g.torso[1] - 2)),
        'peito': fx((CX - 3, g.torso[1] - 2)),
        'pe_e': fx(g.foot_l), 'pe_d': fx(g.foot_r),
        'chao': (CX, GY),
        'costas': g.back,
    }
    return a


def shadow(cv):
    from engine import shadow_ellipse
    shadow_ellipse(cv, CX, GY, 9, 2, color=(60, 50, 90), opacity=.25)
