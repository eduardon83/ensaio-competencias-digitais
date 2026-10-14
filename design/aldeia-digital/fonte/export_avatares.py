import json, os
from PIL import Image
from engine import Canvas, save_png, Ramp
import avatar as A
import cosmetica as C
import montar as MT

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SC = {'': 2, '@2x': 4, '@nativo': 1}

# disposição comum a todas as folhas do avatar
ROWS = [('parado', 'se'), ('parado', 'ne'), ('andar', 'se'), ('andar', 'ne'), ('acenar', 'se'), ('celebrar', 'se'),
        ('pensar', 'se'), ('outra-vez', 'se'), ('dormir', 'se'), ('vestir', 'giro')]
COLS = 10


def frames():
    out = []
    for r, (anim, d) in enumerate(ROWS):
        for i, p in enumerate(A.ANIMS[anim]):
            p = dict(p)
            if d == 'ne':
                p['view'] = 'ne'
            out.append((r, i, anim, d, p))
    return out


FR = frames()


def sheet(render, layers=1):
    sh = Canvas(A.W * COLS, A.H * len(ROWS) * layers)
    for li in range(layers):
        for r, i, anim, d, p in FR:
            cv = render(p, li)
            if cv is not None:
                sh.over_fast(cv, i * A.W, (r + li * len(ROWS)) * A.H)
    return sh


def write(sh: Canvas, base, layer_names):
    os.makedirs(os.path.dirname(base), exist_ok=True)
    for suf, sc in SC.items():
        im = sh.img(sc)
        save_png(im, f'{base}{suf}.png')
        data = {'frames': {}, 'animations': {}, 'meta': {
            'image': os.path.basename(f'{base}{suf}.png'), 'size': {'w': im.width, 'h': im.height}, 'scale': str(sc / 2),
            'app': 'Aldeia Digital · pacote de arte', 'pixel': f'1 px de arte = {sc} px', 'pivot': {'x': A.CX / A.W, 'y': A.GY / A.H}}}
        for li, ln in enumerate(layer_names):
            for r, i, anim, d, p in FR:
                k = f'{ln}/{anim}/{d}/{i + 1:02d}'
                data['frames'][k] = {'frame': {'x': i * A.W * sc, 'y': (r + li * len(ROWS)) * A.H * sc, 'w': A.W * sc, 'h': A.H * sc},
                                     'sourceSize': {'w': A.W * sc, 'h': A.H * sc}, 'anchor': {'x': A.CX / A.W, 'y': A.GY / A.H}}
                data['animations'].setdefault(f'{ln}/{anim}/{d}', []).append(k)
        with open(f'{base}{suf}.json', 'w') as fh:
            json.dump(data, fh, ensure_ascii=False, separators=(',', ':'))


def run():
    # fatos: corpo (linhas 0-9) + capuz (linhas 10-19)
    for f in A.FATOS:
        def rnd(p, li, f=f):
            L = A.render_layers(f, 'pele-2', 'rapado', 'castanho', p)
            return L['corpo'] if li == 0 else L['capuz']
        write(sheet(rnd, 2), f'{OUT}/avatares/fatos/avatar-fato-{f["id"]}', ['corpo', 'capuz'])
        # composto de pré-visualização (pele 2, franja castanha) só nativo
        comp = sheet(lambda p, li, f=f: MT.avatar(f['id'], p, shadow=True))
        save_png(comp.img(1), f'{OUT}/guia/avatares/{f["id"]}.png')
    for pele in A.PELES:
        write(sheet(lambda p, li, pele=pele: A.draw_face(pele, p) if not A.view_flip(p) else A.draw_face(pele, p).flip()), f'{OUT}/avatares/caras/avatar-cara-{pele}', ['cara'])
    LENCOS = {'castanho': '#e4728d', 'preto': '#5f8fe0', 'ruivo': '#f2c94c', 'loiro': '#7fc9a0'}
    for est in A.CABELOS:
        if est == 'rapado':
            continue
        for cor, hexc in A.CABELO_CORES.items():
            nome = cor if est != 'lenco' else {'castanho': 'rosa', 'preto': 'azul', 'ruivo': 'amarelo', 'loiro': 'verde'}[cor]

            def rh(p, li, est=est, hexc=hexc, cor=cor):
                cv = A.draw_hair(est, hexc, p, lenco=LENCOS[cor])
                return cv.flip() if A.view_flip(p) else cv
            write(sheet(rh), f'{OUT}/avatares/cabelos/avatar-cabelo-{est}-{nome}', ['cabelo'])
    for pad in C.PADROES:
        write(sheet(lambda p, li, pad=pad: C.padrao_layer(p, pad)), f'{OUT}/avatares/padroes/avatar-padrao-{pad}', ['padrao'])

    # cosmética
    cos = {}
    for id_, it in C.ITENS.items():
        entry = {k: it[k] for k in ('cat', 'nome', 'anchor', 'pivot', 'size')}
        entry['ficheiros'] = {}
        for lado, back in (('frente', False), ('costas', True)):
            cv = C.render_item(id_, back)
            if cv.bbox() is None:
                continue
            for suf, sc in SC.items():
                save_png(cv.img(sc), f'{OUT}/avatares/cosmetica/{it["cat"]}-{id_}-{lado}{suf}.png')
            entry['ficheiros'][lado] = f'{it["cat"]}-{id_}-{lado}.png'
        cos[id_] = entry
    for e in C.EMBLEMAS:
        cv = C.emblema(e[0], e[2], e[3])
        for suf, sc in SC.items():
            save_png(cv.img(sc), f'{OUT}/avatares/emblemas/emblema-{e[0]}{suf}.png')
            save_png(C.pin(e[2]).img(sc), f'{OUT}/avatares/emblemas/alfinete-{e[0]}{suf}.png')

    # manifesto
    man = {
        'versao': '1.0', 'celula': {'w': A.W, 'h': A.H, 'origem': {'x': A.CX, 'y': A.GY}}, 'fps': A.FPS,
        'escala': {'nativo': 1, '1x': 2, '2x': 4},
        'linhas': [{'anim': a, 'dir': d, 'frames': len(A.ANIMS[a]), 'uso': A.ANIM_INFO[a]} for a, d in ROWS],
        'espelhar': {'sw': 'se espelhado na horizontal', 'nw': 'ne espelhado na horizontal'},
        'ancoras': {}, 'ordem_camadas': MT.ORDEM,
        'fatos': [{'id': f['id'], 'nome': f['nome'], 'genero': f['g'], 'artigo': 'o' if f['g'] == 'm' else 'a',
                   'rampa': {'principal': Ramp(f['main']).as_dict(), 'barriga': Ramp(f['belly']).as_dict(), 'acento': Ramp(f['acc']).as_dict()},
                   'ficheiro': f'fatos/avatar-fato-{f["id"]}.png'} for f in A.FATOS],
        'cores_fato': {k: Ramp(v).as_dict() for k, v in A.COR_FATOS.items()},
        'peles': {k: Ramp(v).as_dict() for k, v in A.PELES.items()},
        'cabelos': A.CABELOS, 'cores_cabelo': A.CABELO_CORES,
        'cosmetica': cos,
        'emblemas': [{'id': e[0], 'nome': e[1], 'cor': e[2]} for e in C.EMBLEMAS],
        'padroes': C.PADROES,
    }
    for r, i, anim, d, p in FR:
        an = A.anchors(p)
        man['ancoras'][f'{anim}/{d}/{i + 1:02d}'] = {k: (list(map(int, v)) if isinstance(v, tuple) else v) for k, v in an.items()}
    with open(f'{OUT}/avatares/avatares.json', 'w') as fh:
        json.dump(man, fh, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    run()
