import json, os, sys, time
from PIL import Image
from engine import Canvas, save_png
import avatar as A
import extintos as EX
import nascimento as N
import nascimento2 as N2
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SC = {'': 2, '@2x': 4, '@nativo': 1}
AMOSTRAS = ['dinossauro', 'raposa', 'coelho', 'panda', 'tiranossauro', 'triceratopo']

def s3(cv, base):
    for suf, sc in SC.items():
        save_png(cv.img(sc), f'{base}{suf}.png')

def strip(frames, base):
    w, h = frames[0].w, frames[0].h
    sh = Canvas(w * len(frames), h)
    for k, f in enumerate(frames):
        sh.over_fast(f, k * w, 0)
    s3(sh, base)

def run(calmo_todos=True):
    d = f'{OUT}/nascimento-v2'
    todos = A.FATOS + EX.EXTINTOS
    s3(N2.ninho_g(), f'{d}/ninho-grande')
    s3(N2.ninho_frente(), f'{d}/ninho-grande-frente')
    for nome in ('entregar', 'pousar-trouxa'):
        strip([N.cegonha(*a) for a in N.CEG_ANIMS[nome]], f'{d}/cegonha/cegonha-{nome}')
    for f in todos:
        b = f'{d}/ovos/{f["id"]}'
        s3(N2.ovo_g(f), f'{b}/ovo-{f["id"]}')
        for r in (1, 2, 3):
            s3(N2.ovo_g(f, r), f'{b}/ovo-{f["id"]}-racha-{r}')
        s3(N2.ovo_g(f, 3, 0, 'baixo'), f'{b}/ovo-{f["id"]}-fundo')
        s3(N2.ovo_g(f, 3, 0, 'tampa'), f'{b}/ovo-{f["id"]}-tampa')
        strip([N2.ovo_g(f, 0, w) for w in (0, -1, 0, 1)], f'{b}/ovo-{f["id"]}-abanar')
    tl = None
    for fid in AMOSTRAS:
        f = next(x for x in todos if x['id'] == fid)
        fr, seg = N2.sequencia(f)
        tl = seg
        strip(fr, f'{d}/sequencia/sequencia-{fid}')
        ims = [x.img(3).convert('RGB') for x in fr]
        ims[0].save(f'{d}/sequencia/sequencia-{fid}.gif', save_all=True, append_images=ims[1:], duration=83, loop=0, optimize=True)
    if calmo_todos:
        for f in todos:
            for k, cv in enumerate(N2.calmo(f)):
                s3(cv, f'{d}/calmo/{f["id"]}/calmo-{k + 1}-{N2.CALMO[k]}')
    fps = 12
    meta = {
        'fps': fps, 'cena': {'w': N2.SW, 'h': N2.SH, 'chao_y': N2.GROUND, 'ninho': [N2.NX, N2.NY], 'ovo': [N2.EX_, N2.EY_]},
        'segmentos': {k: {'fotogramas': v, 'duracao_ms': round((v[1] - v[0]) * 1000 / fps), 'ciclo': k in ('espera', 'acenar')} for k, v in tl.items()},
        'interacao': 'chegada e entrega correm sozinhas; espera em ciclo até ao 1.º toque; cada toque toca o seu segmento; o 3.º toque encadeia abertura, sair e acenar.',
        'camadas': 'fundo, cegonha, ninho grande, avatar (quando está dentro do ovo), fundo do ovo, frente do ninho, tampa, avatar (quando já saiu), efeitos.',
        'correcoes_v2': ['ovo maior: o avatar sai de dentro, tapado pelo fundo do ovo', 'a tampa pousa no chão à direita do ninho, virada; já não fica junto à mão', 'a cegonha entrega a trouxa no ninho', 'o avatar salta para o chão à frente do ninho e só depois acena'],
        'calmo': '4 imagens fixas: ovo, ovo rachado, ovo aberto, avatar a acenar; botão Abrir o ovo.',
        'amostras': AMOSTRAS,
    }
    json.dump(meta, open(f'{d}/nascimento.json', 'w'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    t = time.time(); run(); print('ok', round(time.time() - t))
