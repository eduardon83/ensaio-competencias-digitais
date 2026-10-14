"""Exporta a disposição do mapa da Aldeia Digital (chão, adereços, lotes, edifícios) para src/aldeia/mundo/cena.json.

Usa os geradores do pacote de arte (design/aldeia-digital/fonte) e repete a mesma sequência aleatória de
mapa.render(), para o mapa do jogo ficar igual aos renders do pacote. Correr depois de mudar o pacote de arte:

    python scripts/aldeia/exportar-cena.py

Precisa de Python 3 com NumPy e Pillow (os geradores importam-nos).
"""
from __future__ import annotations
import json
import os
import random
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FONTE = os.path.join(RAIZ, "design", "aldeia-digital", "fonte")
sys.path.insert(0, FONTE)

import mapa as MP  # noqa: E402

N = MP.N_


def exportar():
    g = MP.grelha()
    rnd = random.Random(11)
    # Chão: a mesma ordem de mapa.render() (i por fora, j por dentro); só os mosaicos que não são relva gastam um número.
    chao = [["" for _ in range(N)] for _ in range(N)]
    for i in range(N):
        for j in range(N):
            t = g[j][i]
            if t != "relva":
                rnd.randrange(1)
                nome = {"paralelo": "paralelos", "calcada": "calcada-onda"}.get(t, t)
            else:
                k = (i * 7 + j * 13) % 4 if (i * j) % 5 else 0
                nome = ["relva-1", "relva-2", "relva-3", "relva-flores"][k]
            chao[j][i] = nome
    occ = set()
    for (_, i0, j0, W, D) in MP.EDIF:
        for i in range(i0 - 1, i0 + W + 1):
            for j in range(j0 - 1, j0 + D + 1):
                occ.add((i, j))
    for (i0, j0) in MP.LOTES:
        for i in range(i0, i0 + 3):
            for j in range(j0, j0 + 3):
                occ.add((i, j))
    cand = []
    for _ in range(420):
        if rnd.random() < .55:
            cx_, cy_ = rnd.choice(((36, 14), (34, 30), (8, 3), (24, 2), (2, 20), (32, 36), (20, 36)))
            i, j = int(cx_ + rnd.gauss(0, 2.4)), int(cy_ + rnd.gauss(0, 2.4))
        else:
            i, j = rnd.randrange(1, N - 1), rnd.randrange(1, N - 1)
        cand.append((i, j))
    aderecos = []
    for (i, j) in cand:
        if not (0 <= i < N and 0 <= j < N):
            continue
        if g[j][i] == "relva" and (i, j) not in occ:
            occ.add((i, j))
            t = rnd.choice(["laranjeira", "pinheiro-manso", "oliveira", "arbusto", "arbusto", "flores"])
            if t == "flores":
                aderecos.append({"t": "canteiro-flores", "i": i + .5, "j": j + .5, "piv": [16, 17]})
            elif t == "arbusto":
                aderecos.append({"t": "arbusto", "i": i + .5, "j": j + .5, "piv": [16, 24]})
            else:
                aderecos.append({"t": f"arvore-{t}", "i": i + .5, "j": j + .5, "piv": [24, 60]})
    for (i, j) in ((12.5, 8.4), (20.5, 8.4), (29.5, 8.4), (12.5, 24.4), (21.4, 24.6), (29.5, 24.6), (4, 24.5), (3.6, 14), (30.6, 31)):
        aderecos.append({"t": "candeeiro", "i": i, "j": j, "piv": [8, 45]})
    aderecos.append({"t": "bicicleta", "i": 8, "j": 25.6, "piv": [14, 17]})
    aderecos.append({"t": "baliza", "i": 17.2, "j": 13.5, "piv": [12, 20]})
    aderecos.append({"t": "baliza", "i": 20.8, "j": 13.5, "piv": [12, 20], "espelhar": True})
    for (i, j) in ((23.2, 16.8), (11.3, 13.8), (26.6, 26.2), (18.5, 21.4)):
        aderecos.append({"t": "banco", "i": i, "j": j, "piv": [12, 20]})
    # Jardins dos lotes vazios (variação pelo número do lote, como no pacote).
    jardins = []
    for k, (i0, j0) in enumerate(MP.LOTES):
        v = k % 4
        if v == 0:
            itens = [{"t": "canteiro-flores", "i": i0 + 1, "j": j0 + 1, "piv": [16, 17]}]
        elif v == 1:
            itens = [{"t": "arvore-laranjeira", "i": i0 + 1, "j": j0 + 1, "piv": [24, 60]}]
        elif v == 2:
            itens = [{"t": "baloico", "i": i0 + 1, "j": j0 + 1, "piv": [16, 32]}]
        else:
            itens = [{"t": "arbusto", "i": i0 + .6, "j": j0 + .8, "piv": [16, 24]}, {"t": "canteiro-flores", "i": i0 + 1.5, "j": j0 + 1.4, "piv": [16, 17]}]
        jardins.append(itens)
    cena = {
        "_nota": "Gerado por scripts/aldeia/exportar-cena.py a partir de design/aldeia-digital/fonte/mapa.py. Não editar à mão.",
        "tamanho": N,
        "chao": chao,
        "edificios": [{"id": e[0], "i": e[1], "j": e[2], "w": e[3], "d": e[4]} for e in MP.EDIF],
        "lotes": [{"n": k + 1, "i": i, "j": j} for k, (i, j) in enumerate(MP.LOTES)],
        "aderecos": aderecos,
        "jardins": jardins,
    }
    destino = os.path.join(RAIZ, "src", "aldeia", "mundo", "cena.json")
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    with open(destino, "w", encoding="utf-8") as fh:
        json.dump(cena, fh, ensure_ascii=False, separators=(",", ":"))
    print("cena:", destino, len(aderecos), "adereços")


if __name__ == "__main__":
    exportar()
