"""Mapa da aldeia: 40 x 40 mosaicos, 32 lotes no bairro, edifícios, ruas e natureza.
Gera a disposição (JSON) e renders de dia e de entardecer, completos e recortados.
"""
from __future__ import annotations
import json, random, math
import numpy as np
from engine import Canvas, Ramp, hx, dilate4
import iso as I
import catalogo as K
from edificios import tinta_noite

N_ = 40

# (id, i0, j0, W, D)
EDIF = [
    ('escola', 13, 9, 4, 3),
    ('jornal', 22, 10, 3, 3),
    ('laboratorio', 26, 13, 3, 3),
    ('biblioteca', 8, 15, 3, 3),
    ('arquivo', 8, 20, 3, 3),
    ('junta', 23, 19, 3, 3),
    ('seguranca', 27, 21, 3, 3),
    ('mercado', 13, 20, 3, 3),
    ('oficina', 31, 17, 3, 3),
    ('museu', 4, 10, 3, 3),
    ('largo', 16, 16, 4, 4),
    ('horta', 31, 9, 3, 2),
]
# 32 lotes 2x2 em 4 filas de 8 (bairro a sul)
LOTES = []
for r in range(4):
    for c in range(8):
        LOTES.append((5 + c * 3 + (r % 2), 27 + r * 3))


def grelha():
    g = [['relva'] * N_ for _ in range(N_)]
    rnd = random.Random(4)
    # lago a nordeste
    for i in range(N_):
        for j in range(N_):
            if (i - 35) ** 2 / 16 + (j - 4) ** 2 / 9 <= 1:
                g[j][i] = 'agua'
            elif (i - 35) ** 2 / 25 + (j - 4) ** 2 / 14 <= 1:
                g[j][i] = 'areia'
    # ruas: anel e eixos (paralelos), calçada à volta do largo
    def rua(i0, j0, i1, j1, t='paralelo'):
        for i in range(min(i0, i1), max(i0, i1) + 1):
            for j in range(min(j0, j1), max(j0, j1) + 1):
                if g[j][i] not in ('agua',):
                    g[j][i] = t
    rua(3, 7, 31, 7)      # rua norte
    for j in range(7, N_):
        for i in (35, 36):
            g[j][i] = 'agua'
    for i in (34, 37):
        for j in range(8, N_):
            if g[j][i] == 'relva' and (j % 3):
                g[j][i] = 'areia' if j % 4 == 0 else g[j][i]
    # campo de jogos da escola
    for i in range(17, 21):
        for j in range(12, 15):
            g[j][i] = 'campo'
    rua(3, 7, 3, 38)      # rua oeste
    rua(3, 25, 38, 25)    # rua do bairro
    for i in (35, 36):
        g[25][i] = 'ponte'
    rua(12, 7, 12, 25)
    rua(21, 7, 21, 25)
    rua(30, 7, 30, 38)
    for r in range(4):
        rua(4, 29 + r * 3, 29, 29 + r * 3, 'terra')
    rua(15, 15, 20, 20, 'calcada')
    rua(13, 12, 16, 12, 'calcada')
    return g


def render(noite=False, frame=0, recorte=None, escala_preview=None, estados=None, casas=None):
    g = grelha()
    estados = estados or {}
    ox = N_ * 32 + 40
    oy = 160
    Wc = N_ * 64 + 80
    Hc = N_ * 32 + 160 + 60
    cv = Canvas(Wc, Hc)
    tiles = {
        'relva': [I.tile_relva(s) for s in range(3)] + [I.tile_relva(9, flores=True)],
        'paralelo': [I.tile_paralelos()],
        'calcada': [I.tile_calcada(0)],
        'terra': [I.tile_terra()],
        'agua': [I.tile_agua(frame)],
        'areia': [I.tile_areia()],
        'ponte': [I.tile_ponte()],
        'campo': [I.tile_campo()],
    }
    rnd = random.Random(11)

    def P(i, j, z=0):
        return (ox + (i - j) * 32, oy + (i + j) * 16 - z)

    # bordas (ilha-maqueta)
    for i in range(N_):
        for j in range(N_):
            t = g[j][i]
            var = tiles[t][rnd.randrange(len(tiles[t]))] if t != 'relva' else tiles[t][(i * 7 + j * 13) % 4 if (i * j) % 5 else 0]
            if i == N_ - 1 or j == N_ - 1:
                var = I.bloco_borda(var, 14)
            if noite:
                var = tinta_noite(var)
            x, y = P(i, j)
            cv.over_fast(var, x - 32, y)
    # objetos ordenados por profundidade
    objs = []
    for (id_, i0, j0, W, D) in EDIF:
        objs.append((i0 + W + j0 + D, 'ed', (id_, i0, j0, W, D)))
    casas = casas or {}
    for k, (i0, j0) in enumerate(LOTES):
        objs.append((i0 + 2 + j0 + 2, 'casa', (k, i0, j0)))
    occ = set()
    for (_, i0, j0, W, D) in EDIF:
        for i in range(i0 - 1, i0 + W + 1):
            for j in range(j0 - 1, j0 + D + 1):
                occ.add((i, j))
    for (i0, j0) in LOTES:
        for i in range(i0, i0 + 3):
            for j in range(j0, j0 + 3):
                occ.add((i, j))
    # árvores e adereços na relva livre
    cand = []
    for _ in range(420):
        if rnd.random() < .55:
            cx_, cy_ = rnd.choice(((36, 14), (34, 30), (8, 3), (24, 2), (2, 20), (32, 36), (20, 36)))
            i, j = int(cx_ + rnd.gauss(0, 2.4)), int(cy_ + rnd.gauss(0, 2.4))
        else:
            i, j = rnd.randrange(1, N_ - 1), rnd.randrange(1, N_ - 1)
        cand.append((i, j))
    for (i, j) in cand:
        if not (0 <= i < N_ and 0 <= j < N_):
            continue
        if g[j][i] == 'relva' and (i, j) not in occ:
            occ.add((i, j))
            t = rnd.choice(['laranjeira', 'pinheiro-manso', 'oliveira', 'arbusto', 'arbusto', 'flores'])
            objs.append((i + j + 1, 'arv', (t, i, j)))
    for (i, j) in ((12.5, 8.4), (20.5, 8.4), (29.5, 8.4), (12.5, 24.4), (21.4, 24.6), (29.5, 24.6), (4, 24.5), (3.6, 14), (30.6, 31)):
        objs.append((i + j, 'lamp', (i, j)))
    objs.append((8 + 26, 'bici', (8, 25.6)))
    objs.append((17 + 13.5, 'baliza', (17.2, 13.5)))
    objs.append((21 + 13.5, 'baliza2', (20.8, 13.5)))
    for k, (i, j) in enumerate(((23.2, 16.8), (11.3, 13.8), (26.6, 26.2), (18.5, 21.4))):
        objs.append((i + j, 'banco', (i, j)))
    for k, (i, j) in enumerate(((31.5, 12.2), (32.2, 12.2), (32.9, 12.2))):
        pass
    objs.sort(key=lambda o: o[0])
    lampadas = []
    if noite:
        for _, kind, d in objs:
            if kind == 'lamp':
                x, y = P(*d)
                h = I.halo(22)
                cv.over_fast(h, x - 22, y - 10)
    for _, kind, d in objs:
        if kind == 'ed':
            id_, i0, j0, W, D = d
            fn = K.EDIFICIOS[id_][0]
            st = estados.get(id_, 'aberto')
            e = fn(st) if id_ != 'largo' else fn(st, frame)
            img = e.noite() if noite else e.cv
            x, y = P(i0, j0)
            cv.over_fast(img, x - e.ox, y - e.oy)
        elif kind == 'casa':
            k, i0, j0 = d
            c = casas.get(k)
            if c is None:
                # lote vazio: jardim com variações
                v = k % 4
                items = []
                if v == 0:
                    items = [(I.canteiro_flores(), (i0 + 1, j0 + 1), (16, 17))]
                elif v == 1:
                    items = [(I.arvore('laranjeira', frame), (i0 + 1, j0 + 1), (24, 60))]
                elif v == 2:
                    items = [(I.baloico(), (i0 + 1, j0 + 1), (16, 32))]
                else:
                    items = [(I.arvore('arbusto'), (i0 + .6, j0 + .8), (16, 24)), (I.canteiro_flores(), (i0 + 1.5, j0 + 1.4), (16, 17))]
                for spr, (ii, jj), piv in items:
                    s = tinta_noite(spr) if noite else spr
                    x, y = P(ii, jj)
                    cv.over_fast(s, x - piv[0], y - piv[1])
            else:
                e = K.casa(*c)
                img = e.noite() if noite else e.cv
                x, y = P(i0, j0)
                cv.over_fast(img, x - e.ox, y - e.oy)
                # caixa de correio
                cx_ = I.caixa_correio_casa(); s = tinta_noite(cx_) if noite else cx_
                x, y = P(i0 + .1, j0 + 2.5); cv.over_fast(s, x - 5, y - 21)
        elif kind == 'arv':
            t, i, j = d
            spr = I.canteiro_flores() if t == 'flores' else I.arvore(t, frame)
            piv = (16, 17) if t == 'flores' else ((16, 24) if t == 'arbusto' else (24, 60))
            s = tinta_noite(spr) if noite else spr
            x, y = P(i + .5, j + .5)
            cv.over_fast(s, x - piv[0], y - piv[1])
        elif kind == 'lamp':
            i, j = d
            spr = I.candeeiro(aceso=noite)
            s = tinta_noite(spr) if noite else spr
            if noite:
                s.put(s.m.rect(5, 9, 10, 13), I.P['janela_noite'].light)
            x, y = P(i, j)
            cv.over_fast(s, x - 8, y - 45)
            lampadas.append((x, y))
        elif kind in ('baliza', 'baliza2', 'banco'):
            i, j = d
            spr = I.baliza() if kind != 'banco' else I.banco()
            if kind == 'baliza2':
                spr = spr.flip()
            s = tinta_noite(spr) if noite else spr
            x, y = P(i, j); cv.over_fast(s, x - 12, y - 20)
        elif kind == 'bici':
            i, j = d
            spr = I.bicicleta(); s = tinta_noite(spr) if noite else spr
            x, y = P(i, j); cv.over_fast(s, x - 14, y - 17)
    if noite:
        # tinta do chão (os edifícios já vêm tintos) aplicada só onde ainda não foi tingido: refazemos o chão
        pass
    # nuvens a passar (sombra) de dia
    if not noite:
        sh = I.sombra_nuvem()
        for (cx_, cy_) in ((900, 500), (2000, 900)):
            cv.over_fast(sh, cx_ + frame * 2, cy_)
    return cv, g


def render_noite_total(frame=0, **kw):
    """entardecer: chão tinto + edifícios com janelas acesas + halos."""
    night, _ = render(noite=True, frame=frame, **kw)
    return night


def layout_json():
    g = grelha()
    return {
        'mosaico': {'w': 128, 'h': 64, 'nota': '1x; nativo 64x32'},
        'tamanho': [N_, N_],
        'projecao': 'x = (i - j) * 64, y = (i + j) * 32 (a 1x); ordem de desenho por i + j da esquina sul',
        'edificios': [{'id': e[0], 'nome': K.EDIFICIOS[e[0]][2], 'i': e[1], 'j': e[2], 'w': e[3], 'd': e[4]} for e in EDIF],
        'lotes': [{'n': k + 1, 'i': i, 'j': j, 'w': 2, 'd': 2} for k, (i, j) in enumerate(LOTES)],
        'chao': g,
    }
