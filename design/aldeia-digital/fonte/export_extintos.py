"""Exporta a coleção 'Animais de antigamente' (32 fatos extintos) com a mesma grelha e manifesto."""
import json, os
from engine import Ramp, save_png, Canvas
import avatar as A
import extintos as EX
import montar as MT
import nascimento as NS
import ui_pixel as U
from export_avatares import sheet, write, OUT, ROWS, SC

def run():
    for f in EX.EXTINTOS:
        def rnd(p, li, f=f):
            L = A.render_layers(f, 'pele-2', 'rapado', 'castanho', p)
            return L['corpo'] if li == 0 else L['capuz']
        write(sheet(rnd, 2), f'{OUT}/avatares/fatos-extintos/avatar-fato-{f["id"]}', ['corpo', 'capuz'])
        comp = sheet(lambda p, li, f=f: MT.avatar(f['id'], p, shadow=True))
        save_png(comp.img(1), f'{OUT}/guia/a/av-ext/{f["id"]}.png')
        # ovos
        b = f'{OUT}/nascimento/ovos-extintos/{f["id"]}'
        def s3(cv, base):
            for suf, sc in SC.items():
                save_png(cv.img(sc), f'{base}{suf}.png')
        s3(NS.ovo(f), f'{b}/nascimento-ovo-{f["id"]}')
        for k in (1, 2, 3):
            s3(NS.ovo(f, racha=k), f'{b}/nascimento-ovo-{f["id"]}-racha-{k}')
        s3(NS.ovo(f, aberto=True), f'{b}/nascimento-ovo-{f["id"]}-aberto')
        s3(NS.tampa(f), f'{b}/nascimento-ovo-{f["id"]}-tampa')
        s3(U.cabeca(f['id']), f'{OUT}/ui/cabecas/cabeca-{f["id"]}')
    man_p = f'{OUT}/avatares/avatares.json'
    man = json.load(open(man_p))
    man['colecoes'] = {
        'atuais': {'nome': 'Animais de hoje', 'pasta': 'fatos/', 'fatos': [f['id'] for f in A.FATOS]},
        'extintos': {'nome': 'Animais de antigamente', 'pasta': 'fatos-extintos/', 'fatos': [f['id'] for f in EX.EXTINTOS],
                     'nota': 'Opcional. O professor escolhe a coleção da turma (ou deixa o aluno escolher). As duas usam a mesma grelha, âncoras e cosmética.'},
    }
    man['fatos_extintos'] = [{'id': f['id'], 'nome': f['nome'], 'genero': f['g'], 'artigo': 'o' if f['g'] == 'm' else 'a',
                              'rampa': {'principal': Ramp(f['main']).as_dict(), 'barriga': Ramp(f['belly']).as_dict(), 'acento': Ramp(f['acc']).as_dict()},
                              'ficheiro': f'fatos-extintos/avatar-fato-{f["id"]}.png', 'nota': EX.NOTAS.get(f['id'])} for f in EX.EXTINTOS]
    json.dump(man, open(man_p, 'w'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    run(); print('ok extintos')
