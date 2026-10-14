"""Montagem de um avatar completo (para pré-visualização e para o guia).
Ordem das camadas proposta (ajuste ao design.md 5.4: o chapéu fica por cima do capuz):
corpo, padrão, cara, óculos de ver, cabelo, calçado, mochila, emblemas, capuz, objeto, óculos de estilo, chapéu.
"""
from engine import Canvas
import avatar as A
import cosmetica as C

ORDEM = ['corpo', 'padrao', 'cara', 'ver', 'cabelo', 'calcado', 'mochila', 'emblema', 'capuz', 'objeto', 'oculos', 'chapeu']


def place(cv, sprite, anchor, pivot, flip=False):
    if flip:
        sprite = sprite.flip()
        pivot = (sprite.w - 1 - pivot[0], pivot[1])
    cv.over_fast(sprite, int(round(anchor[0] - pivot[0])), int(round(anchor[1] - pivot[1])))


def avatar(fato, p, pele='pele-2', cabelo='franja', cor_cabelo='castanho', itens=(), cor_fato=None, padrao=None, emblema=None, shadow=True):
    import extintos as EX
    f = next(x for x in A.FATOS + EX.EXTINTOS if x['id'] == fato)
    L = A.render_layers(f, pele, cabelo, cor_cabelo, p, cor_fato)
    an = A.anchors(p)
    back = an['costas']
    flip = A.view_flip(p)
    cv = Canvas(A.W, A.H)
    if shadow:
        A.shadow(cv)
    byc = {C.ITENS[i]['cat']: i for i in itens}
    for k in ORDEM:
        if k in ('corpo', 'cara', 'cabelo', 'capuz'):
            cv.over_fast(L[k])
        elif k == 'padrao' and padrao:
            cv.over_fast(C.padrao_layer(p, padrao))
        elif k == 'emblema' and emblema and not back:
            e = [x for x in C.EMBLEMAS if x[0] == emblema][0]
            place(cv, C.pin(e[2]), an['peito'], (3, 3))
        elif k == 'calcado' and 'calcado' in byc:
            it = C.ITENS[byc['calcado']]
            s = C.render_item(it['id'], back)
            for pe in ('pe_e', 'pe_d'):
                place(cv, s, an[pe], it['pivot'], flip)
        elif k in ('ver', 'mochila', 'objeto', 'oculos', 'chapeu') and k in byc:
            it = C.ITENS[byc[k]]
            if back and k in ('ver', 'oculos'):
                continue
            s = C.render_item(it['id'], back)
            place(cv, s, an[it['anchor']], it['pivot'], flip)
    return cv
