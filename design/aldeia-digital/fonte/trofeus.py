"""Troféus da casa. Recompensam esforço e progresso, nunca comparação.

Famílias:
- taca-<competencia> (13): taça com o emblema da competência; carimbo com 85 ou mais.
- estatueta-cap-<n> (9): objeto do capítulo concluído.
- roseta-<dimensao> (8): missões de cidadania de uma dimensão concluídas.
- especial-<id> (6): marcos de esforço (primeira missão, tentar outra vez, treino em casa...).
Dois tamanhos: grande 20x26 (UI, desbloqueio, vitrine) e pequeno 10x13 (prateleiras da sala).
"""
from __future__ import annotations
import math
from engine import Canvas, Ramp, hx, dilate4
import cosmetica as C

OURO = Ramp('#ffd65c', light='#fff1a8', shade='#e8a83a', dark='#8a5a12')
MAD = Ramp('#c99a6b')
BR = (255, 255, 255)


def _pedestal(cv, cor, w=14, y=21):
    m = cv.m
    x0 = (cv.w - w) // 2
    cv.part(m.rect(x0, y, x0 + w - 1, y + 3), MAD, shade=1)
    cv.part(m.rect(x0 + 3, y + 1, x0 + w - 4, y + 2), Ramp(cor), shade=0, outline=False)


def _brilho(cv, x, y):
    cv.put(cv.m.pts([(x, y - 1), (x - 1, y), (x, y), (x + 1, y), (x, y + 1)]), BR)


# ---------------------------------------------------------------- grandes
def taca(emb_id):
    e = next(x for x in C.EMBLEMAS if x[0] == emb_id)
    cv = Canvas(20, 26)
    m = cv.m
    cup = (m.ellipse(10, 6, 7, 6) & m.rect(0, 0, 20, 7)) | m.rect(3, 1, 16, 7) | m.ellipse(10, 8, 6, 5)
    for s in (-1, 1):
        h = m.ellipse(10 + s * 8, 6, 2.5, 3) & ~m.ellipse(10 + s * 8, 6, 1, 1.6)
        cv.part(h, OURO, shade=0, light=0)
    cv.part(cup, OURO, shade=2, light=1)
    cv.part(m.rect(9, 13, 10, 17), OURO, shade=0)
    cv.part(m.ellipse(9.5, 19, 4, 1.6), OURO, shade=0)
    em = C.emblema(e[0], e[2], e[3])
    cv.over_fast(em, 5, 2)
    _pedestal(cv, e[2])
    _brilho(cv, 4, 3)
    return cv


CAPITULOS = ['Nasce um morador', 'A sala de computadores', 'O jornal da turma', 'A experiência perdida', 'Papéis por todo o lado', 'A aldeia decide', 'Alerta na aldeia', 'Quem baralhou a aldeia?', 'A Festa da Aldeia']
CAP_COR = ['#f6a5b4', '#6fa8e8', '#4f7fd0', '#7fc9a0', '#c9a27e', '#f6c9c0', '#6fd0d8', '#9c7bf0', '#ffcf4d']


def estatueta(n):
    cv = Canvas(20, 26)
    m = cv.m
    G = OURO
    if n == 0:  # ovo dourado no ninho
        cv.part(m.ellipse(10, 18, 7, 3), Ramp('#d9a86a'), shade=1)
        cv.part(m.ellipse(10, 11, 5, 7), G, shade=2, light=1)
        _brilho(cv, 8, 7)
    elif n == 1:  # computador
        cv.part(m.rect(3, 4, 16, 14), G, shade=1)
        cv.put(m.rect(5, 6, 14, 12), hx('#bfe6f6'))
        cv.put(m.pts([(6, 7), (7, 7)]), BR)
        cv.part(m.rect(8, 15, 11, 18), G, shade=0)
        cv.part(m.rect(5, 18, 14, 19), G, shade=0)
    elif n == 2:  # jornal enrolado
        cv.part(m.rect(4, 6, 15, 17), Ramp('#fffaf0', dark='#8a7a5a'), shade=1)
        cv.put(m.rect(6, 8, 13, 9), hx('#4f7fd0'))
        for y in (11, 13, 15):
            cv.put(m.rect(6, y, 13, y), hx('#c9c3b8'))
        cv.part(m.ellipse(15, 11, 2, 6), G, shade=0)
    elif n == 3:  # tubo de ensaio com bolhas
        t = m.capsule(10, 4, 10, 17, 3)
        cv.put(dilate4(t) & ~t, hx('#5a7d8c'))
        cv.put(t, (226, 244, 250, 255))
        cv.put(t & m.rect(0, 11, 20, 26), hx('#8fe0a8'))
        for (x, y) in ((9, 9), (11, 6), (10, 3)):
            cv.put(m.pts([(x, y)]), hx('#8fe0a8'))
        cv.part(m.rect(6, 18, 13, 19), G, shade=0)
    elif n == 4:  # livro aberto
        cv.part(m.poly([(2, 8), (10, 10), (10, 18), (2, 16)]), Ramp('#fffaf0', dark='#8a7a5a'), shade=0)
        cv.part(m.poly([(10, 10), (18, 8), (18, 16), (10, 18)]), Ramp('#f4eedf', dark='#8a7a5a'), shade=0)
        cv.put(m.line([(4, 11), (8, 12)]) | m.line([(12, 12), (16, 11)]) | m.line([(4, 13), (8, 14)]), hx('#c9c3b8'))
        cv.part(m.rect(9, 18, 11, 19), G, shade=0)
    elif n == 5:  # urna de voto
        cv.part(m.rect(4, 9, 15, 19), G, shade=2, light=1)
        cv.put(m.rect(7, 9, 12, 9), G.dark)
        cv.part(m.rect(8, 4, 12, 9), Ramp('#ffffff', dark='#8a8a9a'), shade=0)
        cv.put(m.pts([(9, 6), (10, 7), (11, 5)]), hx('#6cc489'))
    elif n == 6:  # escudo com estrela
        sh = m.poly([(4, 3), (15, 3), (15, 11), (9.5, 18), (4, 11)])
        cv.part(sh, G, shade=2, light=1)
        cv.put(m.pts([(9, 6), (10, 6), (8, 8), (9, 8), (10, 8), (11, 8), (9, 9), (10, 9), (8, 11), (11, 11)]), hx('#5f8fe0'))
    elif n == 7:  # robozinho
        cv.part(m.ellipse(10, 11, 6, 5), G, shade=2, light=1)
        cv.part(m.ellipse(10, 11, 4, 3), Ramp('#3d4a6a'), shade=0, outline=False)
        cv.put(m.pts([(8, 10), (12, 10)]), hx('#9ef0c0'))
        cv.put(m.line([(10, 6), (10, 3)]), G.dark)
        cv.part(m.circle(10, 3, 1.4), Ramp('#ff9fb8'), shade=0)
        cv.part(m.ellipse(10, 18, 6, 1.6), G, shade=0)
    elif n == 8:  # estrela da festa com grinalda
        st = m.poly([(10, 1), (12.5, 7), (19, 7.5), (14, 11.5), (15.5, 18), (10, 14.5), (4.5, 18), (6, 11.5), (1, 7.5), (7.5, 7)])
        cv.part(st, G, shade=2, light=1)
        for k, c in enumerate(('#ef6f8f', '#6fa8e8', '#8fd18a')):
            cv.put(m.pts([(7 + k * 3, 19)]), hx(c))
    _pedestal(cv, CAP_COR[n])
    return cv


DIMENSOES = [
    ('media', 'Media', '#4f7fd0'), ('direitos', 'Direitos Humanos', '#ef7b8f'), ('democracia', 'Democracia e Instituições', '#9c7bf0'),
    ('sustentabilidade', 'Desenvolvimento Sustentável', '#6cc489'), ('financeira', 'Literacia Financeira', '#f2c94c'),
    ('pluralismo', 'Pluralismo e Diversidade', '#f5a54a'), ('saude', 'Saúde', '#e8675e'), ('seguranca', 'Risco e Segurança', '#6fd0d8'),
]


def roseta(dim):
    _, _, cor = next(d for d in DIMENSOES if d[0] == dim)
    cv = Canvas(20, 26)
    m = cv.m
    R = Ramp(cor)
    # fitas
    for s in (-1, 1):
        cv.part(m.poly([(10 + s * 1, 12), (10 + s * 5, 12), (10 + s * 6, 22), (10 + s * 4, 20), (10 + s * 2, 22)]), R, shade=1)
    # pétalas
    pet = m.empty()
    for k in range(12):
        a = 2 * math.pi * k / 12
        pet |= m.circle(10 + math.cos(a) * 6.5, 9 + math.sin(a) * 6.5, 2.4)
    cv.part(pet, R, shade=1, light=1)
    cv.part(m.circle(10, 9, 5), OURO, shade=1, light=1)
    ic = {
        'media': m.rect(8, 7, 12, 11) & ~m.rect(9, 9, 11, 9),
        'direitos': m.pts([(8, 8), (9, 8), (11, 8), (12, 8), (7, 9), (8, 9), (9, 9), (10, 9), (11, 9), (12, 9), (13, 9), (8, 10), (9, 10), (10, 10), (11, 10), (12, 10), (9, 11), (10, 11), (11, 11), (10, 12)]),
        'democracia': m.rect(8, 9, 12, 12) | m.rect(9, 7, 11, 8),
        'sustentabilidade': m.ellipse(10, 9, 2, 3) | m.line([(10, 12), (10, 13)]),
        'financeira': m.circle(10, 9, 2.5) & ~m.pts([(10, 9)]),
        'pluralismo': m.rect(7, 7, 10, 9) | m.rect(10, 10, 13, 12),
        'saude': m.rect(9, 6, 11, 12) | m.rect(7, 8, 13, 10),
        'seguranca': m.poly([(7, 6), (13, 6), (13, 9), (10, 12), (7, 9)]),
    }[dim]
    cv.put(ic, R.dark)
    return cv


ESPECIAIS = [
    ('primeira-missao', 'Primeira missão', '#ef7b8f'),
    ('outra-vez', 'Tentei outra vez', '#9c7bf0'),
    ('treino-casa', 'Treino em casa', '#7fc9a0'),
    ('todas-estrelas', 'Todas as estrelas', '#ffcf4d'),
    ('ajudante-aldeia', 'Ajudante da aldeia', '#6fa8e8'),
    ('jornal-aldeia', 'Jornal da Aldeia', '#c99a6b'),
]


def especial(id_):
    _, _, cor = next(e for e in ESPECIAIS if e[0] == id_)
    cv = Canvas(20, 26)
    m = cv.m
    G = OURO
    if id_ == 'primeira-missao':
        cv.put(m.line([(6, 3), (6, 19)]), G.dark)
        cv.part(m.poly([(7, 3), (16, 5), (16, 11), (7, 10)]), Ramp(cor), shade=0)
        cv.put(m.pts([(10, 7), (11, 8), (12, 7), (13, 6)]), BR)
    elif id_ == 'outra-vez':
        ring = m.circle(10, 10, 7) & ~m.circle(10, 10, 4.5) & ~m.rect(10, 2, 18, 9)
        cv.part(ring, G, shade=1, light=1)
        cv.part(m.tri((10, 2), (10, 8), (15, 5)), G, shade=0)
        cv.put(m.pts([(9, 10), (10, 10), (11, 10)]), hx(cor))
    elif id_ == 'treino-casa':
        cv.part(m.rect(5, 9, 15, 18), G, shade=2, light=1)
        cv.part(m.tri((2, 10), (18, 10), (10, 2)), Ramp('#e98a5e'), shade=0)
        cv.put(m.rect(9, 13, 11, 18), hx(cor))
    elif id_ == 'todas-estrelas':
        for (x, y, r) in ((5, 12, 3.6), (15, 12, 3.6), (10, 7, 4.6)):
            st = m.poly([(x + math.cos(-math.pi / 2 + k * math.pi / 5) * (r if k % 2 == 0 else r * .45), y + math.sin(-math.pi / 2 + k * math.pi / 5) * (r if k % 2 == 0 else r * .45)) for k in range(10)])
            cv.part(st, G, shade=0, light=1)
    elif id_ == 'ajudante-aldeia':
        cv.part(m.circle(10, 10, 7), G, shade=2, light=1)
        cv.put(m.pts([(7, 9), (8, 8), (9, 9), (11, 9), (12, 8), (13, 9), (7, 10), (13, 10), (8, 11), (12, 11), (9, 12), (11, 12), (10, 13), (10, 10), (10, 11), (9, 10), (11, 10), (8, 9), (12, 9), (9, 11), (11, 11)]), hx('#ef6f8f'))
    elif id_ == 'jornal-aldeia':
        fr = m.rect(3, 3, 16, 18)
        cv.part(fr, G, shade=1, light=1)
        cv.put(m.rect(5, 5, 14, 16), hx('#fffaf0'))
        cv.put(m.rect(6, 6, 13, 7), hx('#3d3a4a'))
        cv.put(m.rect(6, 9, 9, 13), hx(cor))
        for y in (9, 11, 13, 15):
            cv.put(m.rect(10, y, 13, y), hx('#c9c3b8'))
    _pedestal(cv, cor)
    return cv


# ---------------------------------------------------------------- pequenos (prateleiras)
def pequeno(familia, cor):
    cv = Canvas(10, 13)
    m = cv.m
    if familia == 'taca':
        cv.part(m.ellipse(5, 4, 4, 3.5) & m.rect(0, 0, 10, 5) | m.rect(1, 1, 9, 4), OURO, shade=1, glint=True)
        cv.put(m.pts([(0, 2), (0, 3), (9, 2), (9, 3)]), OURO.dark)
        cv.part(m.rect(4, 6, 5, 8), OURO, shade=0)
    elif familia == 'estatueta':
        cv.part(m.ellipse(5, 5, 3.4, 4.4), OURO, shade=1, glint=True)
    elif familia == 'roseta':
        pet = m.empty()
        for k in range(8):
            a = 2 * math.pi * k / 8
            pet |= m.circle(5 + math.cos(a) * 3, 5 + math.sin(a) * 3, 1.4)
        cv.part(pet, Ramp(cor), shade=0)
        cv.part(m.circle(5, 5, 2), OURO, shade=0)
        cv.put(m.pts([(3, 9), (4, 10), (6, 10), (7, 9)]), Ramp(cor).base)
    else:
        st = m.poly([(5, 0), (6.4, 3.6), (10, 4), (7.2, 6.4), (8, 10), (5, 8), (2, 10), (2.8, 6.4), (0, 4), (3.6, 3.6)])
        cv.part(st, OURO, shade=0, light=1)
    cv.part(m.rect(2, 10, 7, 11), Ramp(cor), shade=0)
    return cv


def catalogo():
    """lista (id, nome, família, cor, grande, pequeno)."""
    out = []
    for e in C.EMBLEMAS:
        out.append((f'taca-{e[0]}', f'Taça · {e[1]}', 'taca', e[2], taca(e[0]), pequeno('taca', e[2]), 'Carimbo: 85 ou mais nesta competência.'))
    for n, t in enumerate(CAPITULOS):
        out.append((f'estatueta-cap-{n}', f'Capítulo {n} · {t}', 'estatueta', CAP_COR[n], estatueta(n), pequeno('estatueta', CAP_COR[n]), 'Capítulo concluído.'))
    for d, nome, cor in DIMENSOES:
        out.append((f'roseta-{d}', f'Roseta · {nome}', 'roseta', cor, roseta(d), pequeno('roseta', cor), 'Missões de cidadania desta dimensão concluídas.'))
    regra = {'primeira-missao': 'Concluir a primeira missão.', 'outra-vez': 'Repetir uma missão e melhorar.', 'treino-casa': 'Treinar em casa 3 vezes.',
             'todas-estrelas': 'Ganhar 3 estrelas em 5 missões.', 'ajudante-aldeia': 'A turma chegou ao objetivo coletivo.', 'jornal-aldeia': 'Terminar a história.'}
    for i, nome, cor in ESPECIAIS:
        out.append((f'especial-{i}', nome, 'especial', cor, especial(i), pequeno('especial', cor), regra[i]))
    return out


def vitrine():
    """móvel extra para quando a parede enche: vitrine de vidro com 3 prateleiras (12 lugares)."""
    from edificios import Ed
    e = Ed(1, .5, 44, extra_top=8, margin=4)
    e.caixa(0, 0, 1, .5, 0, 44, Ramp('#c99a6b'))
    gl = e.poly([(.06, .5, 3), (.94, .5, 3), (.94, .5, 41), (.06, .5, 41)])
    e.cv.put(gl, (214, 240, 250, 255))
    for z in (14, 27):
        e.cv.put(e.m.line([e.P(.06, .5, z), e.P(.94, .5, z)]), Ramp('#c99a6b').dark)
    e.cv.put(gl & ((e.m.xx - e.m.yy) % 9 < 2), (240, 250, 255, 255))
    lug = [e.P(.2 + (k % 4) * .2, .5, 4 + (k // 4) * 13) for k in range(12)]
    return e, lug
