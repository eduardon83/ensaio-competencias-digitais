"""Edifícios isométricos da Aldeia Digital.

Projeção 2:1, mosaico 64x32 nativo. Ponto 3D (i, j, z) -> ecrã: x = ox + (i - j) * 32, y = oy + (i + j) * 16 - z.
Face esquerda (virada a sudoeste) recebe luz; face direita (sudeste) fica na sombra.
Um piso = 32 px nativos (64 px a 1x).
"""
from __future__ import annotations
import math
import numpy as np
from engine import Canvas, Ramp, hx, dilate4, ahead
import iso as I

PISO = 32
NOITE_MUL = np.array([.64, .60, .82])
NOITE_ADD = np.array([26, 14, 34])


class Ed:
    def __init__(self, W, D, h, extra_top=80, margin=10):
        self.W, self.D, self.h = W, D, h
        self.cw = int(math.ceil((W + D) * 32 + margin * 2))
        self.chh = int(math.ceil((W + D) * 16 + h + extra_top + margin))
        self.ox = D * 32 + margin
        self.oy = h + extra_top
        self.cv = Canvas(self.cw, self.chh)
        self.m = self.cv.m
        self.emissivo = []  # (mask, ramp acesa)
        self.ancoras = {}

    # 3D -> ecrã
    def P(self, i, j, z=0):
        return (self.ox + (i - j) * 32, self.oy + (i + j) * 16 - z)

    def poly(self, pts3):
        return self.m.poly([self.P(*p) for p in pts3])

    # ---------------------------------------------------------- caixa
    def caixa(self, i0, j0, i1, j1, z0, z1, R: Ramp, topo=True, contorno=True):
        L = self.poly([(i0, j1, z0), (i1, j1, z0), (i1, j1, z1), (i0, j1, z1)])
        Rf = self.poly([(i1, j1, z0), (i1, j0, z0), (i1, j0, z1), (i1, j1, z1)])
        T = self.poly([(i0, j0, z1), (i1, j0, z1), (i1, j1, z1), (i0, j1, z1)])
        cv = self.cv
        allm = L | Rf | (T if topo else self.m.empty())
        if contorno:
            cv.put(dilate4(allm) & ~allm, R.dark)
        cv.put(L, R.base)
        cv.put(Rf, R.shade)
        if topo:
            cv.put(T, R.light)
        # aresta vertical da frente
        cv.put(self.m.line([self.P(i1, j1, z0), self.P(i1, j1, z1)]), R.dark if contorno else R.shade)
        return L, Rf, T

    # ---------------------------------------------------------- faces
    def fq(self, face, a0, a1, z0, z1):
        """quadrilátero numa face. face 'e' (esquerda, ao longo de i, em j=D) ou 'd' (direita, ao longo de j, em i=W)."""
        W, D = self.W, self.D
        if face == 'e':
            return [(a0, D, z0), (a1, D, z0), (a1, D, z1), (a0, D, z1)]
        return [(W, D - a0, z0), (W, D - a1, z0), (W, D - a1, z1), (W, D - a0, z1)]

    def janela(self, face, a, z, w=.5, hh=14, arco=False, moldura='#ffffff', persiana=None, flores=False):
        pts = self.fq(face, a - w / 2, a + w / 2, z, z + hh)
        mk = self.poly(pts)
        if arco:
            ca, cz = a, z + hh
            for k in range(9):
                t = k / 8
                aa = a - w / 2 + w * t
                zz = z + hh + math.sin(math.pi * t) * w * 16
                mk |= self.poly(self.fq(face, aa - w / 16, aa + w / 16, z + hh - 1, zz))
        F = Ramp(moldura)
        cv = self.cv
        cv.put(dilate4(mk) & ~mk, F.base)
        cv.put(dilate4(dilate4(mk)) & ~dilate4(mk) & self._wall_mask(face), F.shade)
        V = I.P['vidro']
        cv.put(mk, V.base)
        # reflexo diagonal
        refl = mk & self._diag(face, a, z, hh)
        cv.put(refl, V.light)
        # travessa
        mid = self.poly(self.fq(face, a - .02, a + .02, z, z + hh)) & mk
        cv.put(mid, F.base)
        self.emissivo.append(mk)
        if persiana:
            P_ = Ramp(persiana)
            for s in (-1, 1):
                sm = self.poly(self.fq(face, a + s * (w / 2 + .02) - (.12 if s > 0 else -.12) * 0 - (0 if s > 0 else .12), a + s * (w / 2 + .02) + (.12 if s > 0 else 0), z, z + hh))
                cv.put(sm, P_.base if face == 'e' else P_.shade)
                cv.put(dilate4(sm) & ~sm & ~mk, P_.dark)
        if flores:
            fl = self.poly(self.fq(face, a - w / 2 - .03, a + w / 2 + .03, z - 4, z - 1))
            cv.put(fl, Ramp('#c98e5a').base)
            for k in range(4):
                p = self.P(*self.fq(face, a - w / 2 + w * (k + .5) / 4, a, z - 1, z)[0])
                cv.put(self.m.pts([(p[0], p[1] - 1)]), hx(['#ef6f8f', '#ffd65c', '#ffffff', '#ef6f8f'][k]))
        return mk

    def _diag(self, face, a, z, hh):
        m = self.m
        x0, y0 = self.P(*self.fq(face, a, a, z + hh, z + hh)[0])
        return (m.xx - m.yy) % 7 < 2 if face == 'e' else (m.xx + m.yy) % 7 < 2

    def _wall_mask(self, face):
        return self._walls.get(face, self.m.empty()) if hasattr(self, '_walls') else self.m.empty()

    def porta(self, face, a, w=.45, hh=22, cor='#c98e5a', arco=True, dupla=False, vidro=False):
        pts = self.fq(face, a - w / 2, a + w / 2, 0, hh)
        mk = self.poly(pts)
        if arco:
            for k in range(9):
                t = k / 8
                aa = a - w / 2 + w * t
                zz = hh + math.sin(math.pi * t) * w * 14
                mk |= self.poly(self.fq(face, aa - w / 16, aa + w / 16, hh - 1, zz))
        R = Ramp(cor)
        cv = self.cv
        cv.put(dilate4(mk) & ~mk, R.dark)
        cv.put(mk, R.base if face == 'e' else R.shade)
        if vidro:
            v = self.poly(self.fq(face, a - w / 2 + .06, a + w / 2 - .06, hh * .45, hh - 2))
            cv.put(v, I.P['vidro'].base)
            self.emissivo.append(v)
        if dupla:
            cv.put(self.poly(self.fq(face, a - .015, a + .015, 0, hh)) & mk, R.dark)
        kx, ky = self.P(*self.fq(face, a + w / 2 - .08, a, hh * .45, hh)[0])
        cv.put(self.m.pts([(kx, ky)]), hx('#ffd65c'))
        # degrau
        st = self.poly([(*self.fq(face, a - w / 2 - .08, a + w / 2 + .08, 0, 0)[0][:2], 0)] if False else self._step(face, a, w))
        cv.part(st, I.P['pedra'], shade=0)
        return mk

    def _step(self, face, a, w):
        W, D = self.W, self.D
        if face == 'e':
            return [(a - w / 2 - .08, D, 0), (a + w / 2 + .08, D, 0), (a + w / 2 + .08, D + .25, 0), (a - w / 2 - .08, D + .25, 0)]
        return [(W, D - a + w / 2 + .08, 0), (W, D - a - w / 2 - .08, 0), (W + .25, D - a - w / 2 - .08, 0), (W + .25, D - a + w / 2 + .08, 0)]

    def paredes(self, R: Ramp, z0=0, z1=None, azulejo=None, rodape=None):
        z1 = z1 if z1 is not None else self.h
        L, Rf, T = self.caixa(0, 0, self.W, self.D, z0, z1, R, topo=False)
        self._walls = {'e': L, 'd': Rf}
        cv = self.cv
        # textura subtil de reboco
        for face, mk, col in (('e', L, R.light), ('d', Rf, R.base)):
            dots = mk & (((self.m.xx * 3 + self.m.yy * 7) % 23) == 0)
            cv.put(dots, col)
        if azulejo:
            A = Ramp(azulejo)
            for face, mk in (('e', L), ('d', Rf)):
                band = mk & self.poly(self.fq(face, 0, self.W if face == 'e' else self.D, 2, min(18, z1 - 2)))
                cv.put(band, (255, 255, 255) if face == 'e' else R.base)
                grid = band & (((self.m.xx // 3) + (self.m.yy // 3)) % 2 == 0)
                cv.put(grid, A.base if face == 'e' else A.shade)
                cv.put(band & ((self.m.xx + self.m.yy) % 6 == 0), A.dark)
        if rodape:
            Rp = Ramp(rodape)
            for face, mk in (('e', L), ('d', Rf)):
                cv.put(mk & self.poly(self.fq(face, 0, self.W if face == 'e' else self.D, 0, 3)), Rp.base if face == 'e' else Rp.shade)
        return L, Rf

    def cornija(self, z, R: Ramp, o=.08):
        W, D = self.W, self.D
        self.caixa(-o, -o, W + o, D + o, z, z + 3, R)

    # ---------------------------------------------------------- telhados
    def telhado_4aguas(self, z, rh=22, o=.18, R: Ramp = None, cumeeira=True):
        R = R or I.P['telha']
        W, D = self.W, self.D
        r0 = min(W, D) / 2
        e = [(-o, -o, z), (W + o, -o, z), (W + o, D + o, z), (-o, D + o, z)]
        rA, rB = (r0, D / 2, z + rh), (W - r0, D / 2, z + rh)
        back = self.poly([e[0], e[1], rB, rA]) | self.poly([e[3], e[0], rA])
        front = self.poly([e[3], e[2], rB, rA])
        right = self.poly([e[2], e[1], rB])
        allm = back | front | right
        cv = self.cv
        cv.put(dilate4(allm) & ~allm, R.dark)
        cv.put(back, R.shade)
        cv.put(front, R.base)
        cv.put(right, R.shade)
        # fiadas de telha
        for k in range(1, 6):
            t = k / 6
            p0 = tuple(e[3][q] * (1 - t) + rA[q] * t for q in range(3))
            p1 = tuple(e[2][q] * (1 - t) + rB[q] * t for q in range(3))
            cv.put(self.m.line([self.P(*p0), self.P(*p1)]) & front, R.shade)
            p2 = tuple(e[1][q] * (1 - t) + rB[q] * t for q in range(3))
            cv.put(self.m.line([self.P(*p1), self.P(*p2)]) & right, R.dark)
        # ondulação das telhas
        cv.put(front & (((self.m.xx // 2) % 3 == 0) & ((self.m.yy) % 3 == 0)), R.light)
        if cumeeira:
            cv.put(self.m.line([self.P(*rA), self.P(*rB)]), R.light)
        self.ancoras['topo'] = self.P((rA[0] + rB[0]) / 2, D / 2, z + rh)
        self.ancoras['cumeeira'] = (self.P(*rA), self.P(*rB))
        return front

    def telhado_2aguas(self, z, rh=20, o=.15, R: Ramp = None, parede: Ramp = None):
        R = R or I.P['telha']
        W, D = self.W, self.D
        a, b = (-o, D / 2, z + rh), (W + o, D / 2, z + rh)
        front = self.poly([(-o, D + o, z), (W + o, D + o, z), b, a])
        back = self.poly([(-o, -o, z), (W + o, -o, z), b, a])
        cv = self.cv
        if parede is not None:
            gable = self.poly([(W, D, z), (W, 0, z), (W, D / 2, z + rh - 1)])
            cv.put(gable, parede.shade)
            cv.put(dilate4(gable) & ~gable, parede.dark)
            # janela redonda no frontão
            gx, gy = self.P(W, D / 2, z + rh * .45)
            cv.put(self.m.ellipse(gx, gy, 2, 3), I.P['vidro'].base)
            cv.put(dilate4(self.m.ellipse(gx, gy, 2, 3)) & ~self.m.ellipse(gx, gy, 2, 3), (255, 255, 255))
        allm = front | back
        cv.put(dilate4(allm) & ~allm, R.dark)
        cv.put(back, R.shade)
        cv.put(front, R.base)
        for k in range(1, 5):
            t = k / 5
            p0 = (-o, D + o - (D / 2 + o) * t, z + rh * t)
            p1 = (W + o, D + o - (D / 2 + o) * t, z + rh * t)
            cv.put(self.m.line([self.P(*p0), self.P(*p1)]) & front, R.shade)
        # beiral do lado direito (espessura)
        edge = self.poly([(W + o, D + o, z), (W + o, D / 2, z + rh), (W + o, D / 2, z + rh - 3), (W + o, D + o, z - 3)])
        cv.put(edge, R.dark)
        cv.put(self.m.line([self.P(*a), self.P(*b)]), R.light)
        self.ancoras['topo'] = self.P(W / 2, D / 2, z + rh)
        return front

    def telhado_plano(self, z, R: Ramp, parapeito=4):
        W, D = self.W, self.D
        self.caixa(0, 0, W, D, z, z + parapeito, R, topo=True)
        inner = self.poly([(.12, .12, z + parapeito), (W - .12, .12, z + parapeito), (W - .12, D - .12, z + parapeito), (.12, D - .12, z + parapeito)])
        self.cv.put(inner, R.shade)
        self.ancoras['topo'] = self.P(W / 2, D / 2, z + parapeito)

    # ---------------------------------------------------------- adornos
    def chamine(self, i, j, z, hh=12, R=None):
        R = R or I.P['pedra']
        self.caixa(i, j, i + .3, j + .3, z, z + hh, R)
        self.ancoras['fumo'] = self.P(i + .15, j + .15, z + hh)

    def ninho_cegonha(self, x, y):
        cv = self.cv
        m = self.m
        Nm = Ramp('#b48a5c')
        cv.part(m.ellipse(x, y, 8, 3), Nm, shade=1)
        for k in range(-6, 7, 3):
            cv.put(m.pts([(x + k, y - 1), (x + k + 1, y)]), Nm.dark)
        self.ancoras['ninho'] = (x, y - 3)

    def bandeira(self, x, y, cor='#6fa8e8', cor2='#ffd65c', alt=18):
        cv = self.cv
        m = self.m
        cv.put(m.line([(x, y), (x, y - alt)]), hx('#6b5a4a'))
        f = m.poly([(x + 1, y - alt), (x + 11, y - alt + 1), (x + 11, y - alt + 7), (x + 1, y - alt + 6)])
        cv.part(f, Ramp(cor), shade=0)
        cv.put(m.circle(x + 6, y - alt + 3.5, 1.5) & f, hx(cor2))

    def relogio(self, face, a, z, r=6):
        x, y = self.P(*self.fq(face, a, a, z, z)[0])
        m = self.m
        mk = m.ellipse(x, y, r, r + (1 if face == 'e' else 1))
        self.cv.part(mk, Ramp('#ffffff', dark='#5a5466'), shade=1)
        self.cv.put(m.line([(x, y), (x, y - r + 2)]) | m.line([(x, y), (x + 3, y + 1)]), hx('#3d3a4a'))
        self.cv.put(m.pts([(x, y)]), hx('#ef6f6f'))

    def toldo(self, face, a0, a1, z, cores=('#ef7b8f', '#ffffff'), prof=.35, hh=8):
        W, D = self.W, self.D
        cv = self.cv
        if face == 'e':
            top0, top1 = (a0, D, z + hh), (a1, D, z + hh)
            bot0, bot1 = (a0, D + prof, z), (a1, D + prof, z)
        else:
            top0, top1 = (W, D - a0, z + hh), (W, D - a1, z + hh)
            bot0, bot1 = (W + prof, D - a0, z), (W + prof, D - a1, z)
        n = 8
        for k in range(n):
            t0, t1 = k / n, (k + 1) / n
            lerp = lambda p, q, t: tuple(p[c] * (1 - t) + q[c] * t for c in range(3))
            q = self.poly([lerp(top0, top1, t0), lerp(top0, top1, t1), lerp(bot0, bot1, t1), lerp(bot0, bot1, t0)])
            R = Ramp(cores[k % 2])
            cv.put(q, R.base if face == 'e' else R.shade)
        allq = self.poly([top0, top1, bot1, bot0])
        cv.put(dilate4(allq) & ~allq, Ramp(cores[0]).dark)
        # franja
        for k in range(n * 2):
            t = (k + .5) / (n * 2)
            p = self.P(*tuple(bot0[c] * (1 - t) + bot1[c] * t for c in range(3)))
            cv.put(self.m.pts([(p[0], p[1] + 1)]), Ramp(cores[(k // 2) % 2]).shade)

    # ---------------------------------------------------------- estados
    def andaimes(self, z1):
        cv = self.cv
        m = self.m
        Mad = Ramp('#d9a86a')
        W, D = self.W, self.D
        for face, L in (('e', W), ('d', D)):
            for k in range(int(L * 2) + 1):
                a = k / 2
                p0, p1 = self.P(*self.fq(face, a, a, 0, z1 + 10)[0]), self.P(*self.fq(face, a, a, z1 + 10, 0)[0])
                q = self.fq(face, a, a, 0, z1 + 10)
                pa, pb = self.P(*q[0]), self.P(*q[3])
                off = (3, 2) if face == 'e' else (3, 1)
                cv.put(m.line([(pa[0] - 0, pa[1] + 3), (pb[0], pb[1] + 3)]), Mad.dark)
            for zz in range(8, z1 + 11, 10):
                q = self.fq(face, 0, L, zz, zz)
                pa, pb = self.P(*q[0]), self.P(*q[1])
                cv.put(m.line([(pa[0], pa[1] + 3), (pb[0], pb[1] + 3)], 2), Mad.base)
        # lona
        q = self.fq('e', .2, min(W, 1.6), z1 * .3, z1 * .9)
        lona = self.poly(q)
        cv.put(lona & (((m.xx + m.yy) % 4) < 3), (*Ramp('#7fc9e0').base, 210))

    def grinaldas(self, z, cores=('#ef6f8f', '#ffd65c', '#6fa8e8', '#8fd18a', '#c79be6')):
        cv = self.cv
        m = self.m
        W, D = self.W, self.D
        for face, L in (('e', W), ('d', D)):
            n = int(L * 6)
            pts = []
            for k in range(n + 1):
                t = k / n
                sag = math.sin(math.pi * ((t * L) % 1)) * 6
                p = self.P(*self.fq(face, t * L, t * L, z - sag, z)[0])
                pts.append(p)
            cv.put(m.line(pts), hx('#6b5a4a'))
            for k, p in enumerate(pts[1:-1:2]):
                R = Ramp(cores[k % len(cores)])
                cv.part(m.tri((p[0] - 2, p[1]), (p[0] + 2, p[1]), (p[0], p[1] + 4)), R, shade=0)

    # ---------------------------------------------------------- saída
    def noite(self):
        """versão de entardecer (tema escuro): tinta azul-violeta, janelas acesas."""
        c = self.cv.copy()
        a = c.a.astype(float)
        sel = a[..., 3] > 0
        a[sel, :3] = np.clip(a[sel, :3] * NOITE_MUL + NOITE_ADD, 0, 255)
        c.a = a.astype(np.uint8)
        J = I.P['janela_noite']
        for mk in self.emissivo:
            vis = mk & (self.cv.a[..., 3] > 0)
            c.put(vis, J.base)
            c.put(vis & (self.m.yy % 3 == 0), J.light)
        return c


def tinta_noite(cv: Canvas):
    c = cv.copy()
    a = c.a.astype(float)
    sel = a[..., 3] > 0
    a[sel, :3] = np.clip(a[sel, :3] * NOITE_MUL + NOITE_ADD, 0, 255)
    c.a = a.astype(np.uint8)
    return c
