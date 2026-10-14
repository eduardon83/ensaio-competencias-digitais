import json, os, shutil
from engine import save_png
import trofeus as T
import interior as R
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
def run():
    d = f'{OUT}/mundo/interior/trofeus'
    shutil.rmtree(d, ignore_errors=True)
    man = []
    for (id_, nome, fam, cor, g, p, regra) in T.catalogo():
        for suf, sc in (('', 2), ('@2x', 4), ('@nativo', 1)):
            save_png(g.img(sc), f'{d}/trofeu-{id_}{suf}.png')
            save_png(p.img(sc), f'{d}/trofeu-{id_}-pequeno{suf}.png')
        man.append({'id': id_, 'nome': nome, 'familia': fam, 'cor': cor, 'regra': regra,
                    'grande': f'trofeu-{id_}.png', 'pequeno': f'trofeu-{id_}-pequeno.png'})
    e, lug = T.vitrine()
    for suf, sc in (('', 2), ('@2x', 4), ('@nativo', 1)):
        save_png(e.cv.img(sc), f'{OUT}/mundo/interior/moveis/movel-vitrine{suf}.png')
    s = R.sala()
    json.dump({'nota': 'Recompensam esforço e progresso, nunca comparação. Grande 20x26 para UI e desbloqueio; pequeno 10x13 para as prateleiras.',
               'parede': {'lugares': 18, 'ancoras_nativas': [list(map(float, p)) for p in s.ancoras['trofeus']], 'pivo_pequeno': [5, 12]},
               'vitrine': {'lugares_nativos': [list(map(float, p)) for p in lug], 'pivo_pequeno': [5, 12]},
               'trofeus': man}, open(f'{d}/trofeus.json', 'w'), ensure_ascii=False, indent=1)
    for p in ('liso-pessego',):
        pass
if __name__ == '__main__':
    run(); print('ok trofeus')
