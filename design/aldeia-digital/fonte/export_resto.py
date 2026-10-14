import json, os, random
from engine import Canvas, save_png, Ramp
import avatar as A
import nascimento as NS
import iso as I
import catalogo as K
import interior as R
import npc as N
import cenas as S
import ui_pixel as U
import mapa as MP
import montar as MT
from edificios import tinta_noite

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
MAN = {}


def save3(cv, base, s1=2):
    for suf, sc in (('', s1), ('@2x', s1 * 2), ('@nativo', 1)):
        save_png(cv.img(sc), f'{base}{suf}.png')


def strip(frames, base, fps=12, s1=2, loop=True, pivot=None, extra=None):
    w = max(f.w for f in frames); h = max(f.h for f in frames)
    sh = Canvas(w * len(frames), h)
    for k, f in enumerate(frames):
        sh.over_fast(f, k * w, 0)
    save3(sh, base, s1)
    meta = {'celula': [w, h], 'fotogramas': len(frames), 'fps': fps, 'ciclo': loop}
    if pivot:
        meta['pivo'] = pivot
    if extra:
        meta.update(extra)
    with open(base + '.json', 'w') as fh:
        json.dump(meta, fh, ensure_ascii=False, indent=1)
    return meta


def rel(p):
    return os.path.relpath(p, OUT)


def nascimento():
    d = f'{OUT}/nascimento'
    for nome, seq in NS.CEG_ANIMS.items():
        fps = {'voo': 10, 'pousar': 8, 'parada': 4, 'falar': 8, 'acenar': 8}[nome]
        strip([NS.cegonha(*a) for a in seq], f'{d}/cegonha/cegonha-{nome}', fps=fps, loop=nome != 'pousar', pivot=[32, 60])
    save3(NS.ninho(), f'{d}/ninho')
    for f in A.FATOS:
        b = f'{d}/ovos/{f["id"]}'
        save3(NS.ovo(f), f'{b}/nascimento-ovo-{f["id"]}')
        for k in (1, 2, 3):
            save3(NS.ovo(f, racha=k), f'{b}/nascimento-ovo-{f["id"]}-racha-{k}')
        save3(NS.ovo(f, aberto=True), f'{b}/nascimento-ovo-{f["id"]}-aberto')
        save3(NS.tampa(f), f'{b}/nascimento-ovo-{f["id"]}-tampa')
        # abanar (para o ciclo de espera e para cada toque)
        strip([NS.ovo(f, racha=0, wob=w) for w in (0, -1, 0, 1)], f'{b}/nascimento-ovo-{f["id"]}-abanar', fps=8, pivot=[14, 34])
        # modo calmo: 4 imagens fixas no ninho
        for k, (nm, egg) in enumerate((('ovo', NS.ovo(f)), ('racha', NS.ovo(f, racha=3)), ('aberto', NS.ovo(f, aberto=True)), ('avatar', None))):
            cv = Canvas(64, 80)
            cv.over_fast(NS.ninho(), 8, 52)
            if egg is not None:
                cv.over_fast(egg, 18, 32)
            else:
                cv.over_fast(NS.ovo(f, aberto=True), 18, 32)
                av = MT.avatar(f['id'], A.ANIMS['acenar'][3], shadow=False)
                cv.over_fast(av, 32 - A.CX, 66 - A.GY)
            if nm == 'aberto':
                cv.over_fast(NS.tampa(f), 30, 18)
            save3(cv, f'{b}/calmo-{k + 1}-{nm}')
    e = f'{d}/efeitos'
    strip([NS.brilho(i) for i in range(4)], f'{e}/efeito-brilho', fps=8)
    strip([NS.coracao(i) for i in range(4)], f'{e}/efeito-coracao', fps=6, loop=False)
    strip([NS.confetes(i) for i in range(8)], f'{e}/efeito-confetes', fps=12, loop=False)
    strip([NS.luz(i) for i in range(6)], f'{e}/efeito-luz-abertura', fps=10, loop=False, extra={'mistura': 'screen ou lighter'})
    strip([NS.poeira(i) for i in range(4)], f'{e}/efeito-poeira', fps=10, loop=False)
    strip([NS.zzz(i) for i in range(3)], f'{e}/efeito-zzz', fps=3)
    strip([NS.pensamento(i) for i in range(4)], f'{e}/efeito-pensamento', fps=4, loop=False)


def mundo():
    d = f'{OUT}/mundo'
    t = f'{d}/mosaicos'
    for k in range(3):
        save3(I.tile_relva(k), f'{t}/mosaico-relva-{k + 1}')
    save3(I.tile_relva(9, flores=True), f'{t}/mosaico-relva-flores')
    save3(I.tile_calcada(0), f'{t}/mosaico-calcada-onda')
    save3(I.tile_calcada(2), f'{t}/mosaico-calcada-lisa')
    save3(I.tile_paralelos(), f'{t}/mosaico-paralelos')
    save3(I.tile_terra(), f'{t}/mosaico-terra')
    save3(I.tile_areia(), f'{t}/mosaico-areia')
    save3(I.tile_canteiro(), f'{t}/mosaico-canteiro')
    save3(I.tile_ponte(), f'{t}/mosaico-ponte')
    save3(I.tile_campo(), f'{t}/mosaico-campo')
    strip([I.tile_agua(f) for f in range(4)], f'{t}/mosaico-agua', fps=4)
    save3(I.bloco_borda(I.tile_relva(0), 14), f'{t}/mosaico-borda-relva')
    save3(I.contorno_mosaico(), f'{t}/mosaico-foco')
    a = f'{d}/aderecos'
    for tp in ('laranjeira', 'pinheiro-manso', 'oliveira'):
        strip([I.arvore(tp, f) for f in range(4)], f'{a}/arvore-{tp}', fps=3, pivot=[24, 60])
    save3(I.arvore('arbusto'), f'{a}/arbusto')
    for nm, fn in (('banco', I.banco), ('marco-correio', I.marco_correio), ('bicicleta', I.bicicleta), ('mochila-chao', I.mochila_chao),
                   ('vedacao', I.vedacao), ('baloico', I.baloico), ('caixa-correio-casa', I.caixa_correio_casa), ('canteiro-flores', I.canteiro_flores),
                   ('coreto', I.coreto), ('nuvem', I.nuvem), ('sombra-nuvem', I.sombra_nuvem), ('baliza', I.baliza)):
        save3(fn(), f'{a}/{nm}')
    save3(I.candeeiro(False), f'{a}/candeeiro')
    save3(I.candeeiro(True), f'{a}/candeeiro-aceso')
    save3(I.halo(22), f'{a}/luz-halo')
    for nm, c in (('azul', '#4f7fd0'), ('amarelo', '#ffcf4d'), ('verde', '#6fbf6a')):
        save3(I.ecoponto(c), f'{a}/ecoponto-{nm}')
    strip([I.fonte(f) for f in range(4)], f'{a}/fonte', fps=6)
    strip([I.grinaldas(48, f) for f in range(1)], f'{a}/grinaldas', fps=1)
    strip([I.luzinhas(48, f) for f in range(3)], f'{a}/luzinhas', fps=3)
    strip([I.borboleta(f) for f in range(2)], f'{a}/borboleta', fps=8)
    strip([I.passaro(f) for f in range(2)], f'{a}/passaro', fps=6)
    for k in range(2):
        pass
    # edifícios
    ed_man = {}
    for id_, (fn, fp, nome) in K.EDIFICIOS.items():
        ed_man[id_] = {'nome': nome, 'pegada': fp, 'estados': {}}
        for st in K.ESTADOS:
            e = fn(st)
            base = f'{d}/edificios/{id_}/edificio-{id_}-{st}'
            save3(e.cv, base + '-dia')
            save3(e.noite(), base + '-entardecer')
            an = {k: (list(map(float, v)) if isinstance(v, tuple) and not isinstance(v[0], tuple) else None) for k, v in e.ancoras.items()}
            ed_man[id_]['estados'][st] = {'dia': rel(base + '-dia.png'), 'entardecer': rel(base + '-entardecer.png'),
                                          'origem_mosaico_norte': [e.ox, e.oy], 'ancoras': {k: v for k, v in an.items() if v}}
    # estufa do laboratório
    es = K.estufa(); save3(es.cv, f'{d}/edificios/laboratorio/estufa-dia'); save3(es.noite(), f'{d}/edificios/laboratorio/estufa-entardecer')
    # casa por camadas
    c = f'{d}/casa'
    for nm in K.CASA_PAREDES:
        e = K.casa(parede=nm, camada='paredes'); save3(e.cv, f'{c}/casa-paredes-{nm}')
    for nm in K.CASA_TELHADOS:
        e = K.casa(telhado=nm, camada='telhado'); save3(e.cv, f'{c}/casa-telhado-{nm}')
    for nm in K.CASA_PORTAS:
        e = K.casa(porta=nm, camada='porta'); save3(e.cv, f'{c}/casa-porta-{nm}')
    for k, (p, t, q) in enumerate((('nata', 'telha', 'azul'), ('rosa', 'ardosia', 'verde'), ('ceu', 'mel', 'amarela'), ('menta', 'vinho', 'madeira'))):
        e = K.casa(p, t, q)
        save3(e.cv, f'{c}/casa-exemplo-{k + 1}-dia'); save3(e.noite(), f'{c}/casa-exemplo-{k + 1}-entardecer')
    e = K.casa()
    ed_man['casa'] = {'nome': 'Casa do aluno', 'pegada': '2x2', 'origem_mosaico_norte': [e.ox, e.oy],
                      'ancoras': {k: list(map(float, v)) for k, v in e.ancoras.items()},
                      'paredes': K.CASA_PAREDES, 'telhados': K.CASA_TELHADOS, 'portas': K.CASA_PORTAS,
                      'ordem': ['paredes', 'porta', 'telhado'], 'nota': 'As três camadas partilham a mesma tela e origem; empilhar por esta ordem.'}
    for f in A.FATOS[:]:
        strip([I.bandeira_casa(f['main'], f['belly'], k) for k in range(4)], f'{c}/bandeiras/bandeira-{f["id"]}', fps=4, pivot=[2, 27])
    # interior
    it = f'{d}/interior'
    for p in R.PAPEIS:
        s = R.sala(p, 'madeira'); save3(s.cv, f'{it}/sala-{p}')
    for ch in R.CHAOS:
        s = R.sala('liso-pessego', ch); save3(s.cv, f'{it}/sala-chao-{ch}')
    s = R.sala()
    ed_man['interior'] = {'grelha': '6x6', 'origem_grelha': list(map(float, s.ancoras['grelha_origem'])),
                          'trofeus': [list(map(float, p)) for p in s.ancoras['trofeus']], 'moldura': [list(map(float, p)) for p in s.ancoras['moldura']],
                          'projecao': 'x = ox + (i - j) * 32, y = oy + (i + j) * 16 (nativo)', 'moveis': {}}
    for tp, cor in (('cama', None), ('cama', '#f6a5b4'), ('secretaria', None), ('cadeira', None), ('cadeira', '#6fa8e8'), ('estante', None), ('tapete', None), ('tapete', '#bfe3c9'), ('candeeiro', None), ('planta', None)):
        e, piv, foot = R.movel(tp, cor)
        nm = tp + ('' if cor is None else '-' + cor.strip('#'))
        save3(e.cv, f'{it}/moveis/movel-{nm}')
        ed_man['interior']['moveis'][nm] = {'pivo_esquina_sul': list(map(float, piv)), 'pegada': list(foot)}
    import cosmetica as C
    import export_trofeus
    export_trofeus.run()
    with open(f'{d}/mundo.json', 'w') as fh:
        json.dump(ed_man, fh, ensure_ascii=False, indent=1)
    # mapa
    casas = {k: (random.Random(k).choice(list(K.CASA_PAREDES)), random.Random(k + 1).choice(list(K.CASA_TELHADOS)), random.Random(k + 2).choice(list(K.CASA_PORTAS))) for k in range(32) if k % 5 != 3}
    day, _ = MP.render(casas=casas)
    save_png(day.img(1), f'{d}/mapa/mapa-dia@nativo.png')
    save_png(day.img(2), f'{d}/mapa/mapa-dia.png')
    night = MP.render_noite_total(casas=casas)
    save_png(night.img(1), f'{d}/mapa/mapa-entardecer@nativo.png')
    save_png(night.img(2), f'{d}/mapa/mapa-entardecer.png')
    est = {k: 'obras' for k in ('biblioteca', 'arquivo', 'seguranca', 'mercado', 'oficina', 'museu', 'horta')}
    d2, _ = MP.render(casas={k: v for k, v in list(casas.items())[:6]}, estados=est)
    save_png(d2.img(1), f'{d}/mapa/mapa-inicio-da-historia@nativo.png')
    fest = {k: 'festivo' for k in K.EDIFICIOS}
    n2 = MP.render_noite_total(casas=casas, estados=fest)
    save_png(n2.img(1), f'{d}/mapa/mapa-festa@nativo.png')
    with open(f'{d}/mapa/mapa.json', 'w') as fh:
        json.dump(MP.layout_json(), fh, ensure_ascii=False)


def personagens():
    d = f'{OUT}/personagens'
    man = {}
    for n in N.NPCS:
        b = f'{d}/{n["id"]}'
        strip([N.corpo(n, 'se', i) for i in range(4)], f'{b}/npc-{n["id"]}-parado-se', fps=4, pivot=[24, 69])
        strip([N.corpo(n, 'ne', i) for i in range(4)], f'{b}/npc-{n["id"]}-parado-ne', fps=4, pivot=[24, 69])
        for e in N.EXPRESSOES:
            save3(N.retrato(n, e), f'{b}/retrato-{n["id"]}-{e}')
        man[n['id']] = {'nome': n['nome'], 'papel': n['papel']}
    for n in N.CRIANCAS:
        b = f'{d}/criancas/{n["id"]}'
        for e in N.EXPRESSOES:
            strip([N.corpo(n, 'se', i, e) for i in range(4)], f'{b}/npc-{n["id"]}-{e}-se', fps=4, pivot=[24, 69])
            save3(N.retrato(n, e), f'{b}/retrato-{n["id"]}-{e}')
        man[n['id']] = {'nome': n['nome'], 'papel': 'Criança da aldeia (missões)'}
    for s in N.ESPECIAIS:
        b = f'{d}/{s}'
        strip([N.especial(s, 'neutra', i) for i in range(4)], f'{b}/npc-{s}-parado', fps=4, pivot=[24, 69])
        for e in N.EXPRESSOES:
            save3(N.especial(s, e, retrato_=True), f'{b}/retrato-{s}-{e}')
    man['sr-prazo'] = {'nome': 'Sr. Prazo', 'papel': 'Redação: atividades com tempo'}
    man['cronometro'] = {'nome': 'O Cronómetro', 'papel': 'Laboratório: atividades com tempo'}
    man['robo'] = {'nome': 'Robô de limpeza', 'papel': 'Centro do mistério; adorável, nunca vilão'}
    # Dona Cegonha: retrato
    for e in N.EXPRESSOES:
        cv = Canvas(48, 48)
        c = NS.cegonha('parada', 0, falar=(e == 'contente'), piscar=(e == 'preocupada'))
        cv.over_fast(c, -14, -8)
        save3(cv, f'{d}/dona-cegonha/retrato-dona-cegonha-{e}')
    man['dona-cegonha'] = {'nome': 'Dona Cegonha', 'papel': 'Carteira e guia da aldeia'}
    with open(f'{d}/personagens.json', 'w') as fh:
        json.dump(man, fh, ensure_ascii=False, indent=1)


def missoes():
    d = f'{OUT}/missoes'
    man = {}
    for mid, (ed, tit, fns) in S.MISSOES.items():
        man[mid] = {'edificio': ed, 'titulo': tit, 'situacoes': []}
        for k, fn in enumerate(fns):
            S.COM_AVATAR = False
            cv, an = fn()
            pose = dict(S.POSES['ultima'])
            base = f'{d}/{mid}/missao-{mid}-situacao-{k + 1}'
            for suf, sc in (('', 4), ('@2x', 8), ('@nativo', 1)):
                save_png(cv.img(sc), f'{base}{suf}.png')
            S.COM_AVATAR = True
            cv2, _ = fn()
            save_png(cv2.img(4), f'{base}-exemplo.png')
            sc = 4
            man[mid]['situacoes'].append({
                'imagem': rel(base + '.png'), 'exemplo': rel(base + '-exemplo.png'), 'resumo': fn.__doc__.strip(),
                'ancoras_1x': {'ecra': [v * sc for v in an['ecra']], 'avatar_pes': [an['avatar'][0] * sc, an['avatar'][1] * sc], 'balao': [an['balao'][0] * sc, an['balao'][1] * sc]},
                'pose_avatar': pose, 'escala_avatar': 'desenhar o avatar a 4 px por pixel (igual à cena)'})
    with open(f'{d}/missoes.json', 'w') as fh:
        json.dump(man, fh, ensure_ascii=False, indent=1)


def ui():
    d = f'{OUT}/ui'
    for t in ('claro', 'escuro'):
        save3(U.moldura(t), f'{d}/moldura-{t}')
    save3(U.estrela(True), f'{d}/estrela-cheia')
    save3(U.estrela(False), f'{d}/estrela-vazia')
    for c in U.CATEGORIAS:
        save3(U.icone_categoria(c), f'{d}/icones/icone-{c}')
    strip([NS.exclamacao(i) for i in range(4)], f'{d}/marcador-missao', fps=4, pivot=[8, 21])
    strip([NS.visto_bandeira(i) for i in range(4)], f'{d}/marcador-concluido', fps=4, pivot=[3, 21])
    save3(NS.cadeado(), f'{d}/marcador-bloqueado')
    for f in A.FATOS:
        save3(U.cabeca(f['id']), f'{d}/cabecas/cabeca-{f["id"]}')


if __name__ == '__main__':
    import sys
    parts = sys.argv[1:] or ['nascimento', 'mundo', 'personagens', 'missoes', 'ui']
    for p in parts:
        globals()[p]()
        print('ok', p)
