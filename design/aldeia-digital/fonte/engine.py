"""Motor de pixel art procedimental da Aldeia Digital.

Regras do estilo (ver guia):
- Formas redondas e grossas, contorno de 1 px nativo na cor escura do próprio objeto (nunca preto).
- Luz de cima à esquerda: banda clara no topo esquerdo, banda de sombra em baixo à direita.
- 2 a 3 tons por cor, com desvio de matiz (sombras para o azul, luzes para o amarelo).
- 1 px nativo = 2 px a 1x = 4 px a 2x.
"""
from __future__ import annotations
import colorsys
import numpy as np
from PIL import Image, ImageDraw


# ---------------------------------------------------------------- cores
def hx(s: str):
    s = s.lstrip('#')
    return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16))


def to_hex(c):
    return '#%02x%02x%02x' % tuple(int(v) for v in c[:3])


def _shift(rgb, dh=0.0, ds=1.0, dv=1.0, v_add=0.0, s_add=0.0):
    r, g, b = [v / 255 for v in rgb]
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    h = (h + dh) % 1.0
    s = min(1, max(0, s * ds + s_add))
    v = min(1, max(0, v * dv + v_add))
    r, g, b = colorsys.hsv_to_rgb(h, s, v)
    return (round(r * 255), round(g * 255), round(b * 255))


def _toward(h, target, amt):
    d = ((target - h + 0.5) % 1.0) - 0.5
    return d * amt


class Ramp:
    """Rampa de 4 tons: luz, base, sombra, contorno."""

    def __init__(self, base, light=None, shade=None, dark=None):
        self.base = hx(base) if isinstance(base, str) else base
        r, g, b = [v / 255 for v in self.base]
        h, s, v = colorsys.rgb_to_hsv(r, g, b)
        self.light = hx(light) if isinstance(light, str) else (light or _shift(self.base, _toward(h, 1 / 6, .08), .78, 1.0, .10))
        self.shade = hx(shade) if isinstance(shade, str) else (shade or _shift(self.base, _toward(h, 2 / 3, .10), 1.08, .84, 0, .04))
        self.dark = hx(dark) if isinstance(dark, str) else (dark or _shift(self.base, _toward(h, 2 / 3, .14), 1.15, .46, 0, .08))

    def as_dict(self):
        return {k: to_hex(getattr(self, k)) for k in ('light', 'base', 'shade', 'dark')}


# ---------------------------------------------------------------- máscaras
class M:
    """Fábrica de máscaras booleanas numa grelha HxW."""

    def __init__(self, w, h):
        self.w, self.h = w, h
        self.yy, self.xx = np.mgrid[0:h, 0:w]

    def empty(self):
        return np.zeros((self.h, self.w), bool)

    def ellipse(self, cx, cy, rx, ry):
        rx = max(rx, .5); ry = max(ry, .5)
        return ((self.xx + .5 - cx - .5) / (rx + .5)) ** 2 + ((self.yy + .5 - cy - .5) / (ry + .5)) ** 2 <= 1.0

    def circle(self, cx, cy, r):
        return self.ellipse(cx, cy, r, r)

    def rect(self, x0, y0, x1, y1):
        return (self.xx >= x0) & (self.xx <= x1) & (self.yy >= y0) & (self.yy <= y1)

    def poly(self, pts):
        im = Image.new('1', (self.w, self.h), 0)
        ImageDraw.Draw(im).polygon([tuple(map(float, p)) for p in pts], fill=1, outline=1)
        return np.array(im, bool)

    def line(self, pts, width=1):
        im = Image.new('1', (self.w, self.h), 0)
        ImageDraw.Draw(im).line([tuple(map(float, p)) for p in pts], fill=1, width=width)
        return np.array(im, bool)

    def capsule(self, x0, y0, x1, y1, r):
        px, py = self.xx, self.yy
        dx, dy = x1 - x0, y1 - y0
        L = dx * dx + dy * dy
        if L == 0:
            t = 0
        else:
            t = np.clip(((px - x0) * dx + (py - y0) * dy) / L, 0, 1)
        qx, qy = x0 + t * dx, y0 + t * dy
        return (px - qx) ** 2 + (py - qy) ** 2 <= (r + .35) ** 2

    def tri(self, a, b, c):
        return self.poly([a, b, c])

    def pts(self, pts):
        m = self.empty()
        for x, y in pts:
            x, y = int(round(x)), int(round(y))
            if 0 <= x < self.w and 0 <= y < self.h:
                m[y, x] = True
        return m


def ahead(mask, dx, dy):
    """valor em (y,x) = mask[y+dy, x+dx]; fora = False."""
    h, w = mask.shape
    out = np.zeros_like(mask)
    ys = slice(max(0, -dy), min(h, h - dy))
    xs = slice(max(0, -dx), min(w, w - dx))
    ys2 = slice(max(0, dy), min(h, h + dy))
    xs2 = slice(max(0, dx), min(w, w + dx))
    out[ys, xs] = mask[ys2, xs2]
    return out


def dilate4(mask):
    return mask | ahead(mask, 1, 0) | ahead(mask, -1, 0) | ahead(mask, 0, 1) | ahead(mask, 0, -1)


def dilate8(mask):
    m = dilate4(mask)
    return m | ahead(mask, 1, 1) | ahead(mask, -1, -1) | ahead(mask, 1, -1) | ahead(mask, -1, 1)


def erode4(mask):
    return mask & ahead(mask, 1, 0) & ahead(mask, -1, 0) & ahead(mask, 0, 1) & ahead(mask, 0, -1)


def checker(shape, phase=0):
    h, w = shape
    yy, xx = np.mgrid[0:h, 0:w]
    return ((xx + yy + phase) % 2) == 0


# ---------------------------------------------------------------- tela
class Canvas:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.a = np.zeros((h, w, 4), np.uint8)
        self.m = M(w, h)

    def put(self, mask, color, alpha=255):
        if mask is None:
            return
        c = color if len(color) == 4 else (*color, alpha)
        self.a[mask] = c

    def blend(self, mask, color, opacity):
        """mistura uma cor por cima de píxeis já pintados (para luz e sombra)."""
        sel = mask & (self.a[..., 3] > 0)
        src = np.array(color, float)
        cur = self.a[sel][:, :3].astype(float)
        self.a[sel, :3] = np.round(cur * (1 - opacity) + src * opacity).astype(np.uint8)

    def part(self, mask, ramp: Ramp, outline=True, shade=1, light=1, glint=False, outline_mask=None, under=None):
        """Pinta uma parte com contorno, sombra e luz. `under`: limita o contorno ao que já existe fora."""
        if not mask.any():
            return
        if outline:
            ol = dilate4(mask) & ~mask
            if outline_mask is not None:
                ol &= outline_mask
            self.put(ol, ramp.dark)
        self.put(mask, ramp.base)
        if shade:
            inner = mask.copy()
            for _ in range(shade):
                inner = inner & ahead(inner, 1, 1) & ahead(inner, 1, 0)
            sh = mask & ~inner
            # só do lado de baixo/direita
            sh &= ~(mask & ~ahead(mask, -1, -1))
            self.put(sh, ramp.shade)
        if light:
            inner = mask.copy()
            for _ in range(light):
                inner = inner & ahead(inner, -1, -1)
            lt = mask & ~inner & ahead(mask, 1, 1) & ahead(mask, 2, 2)
            self.put(lt, ramp.light)
        if glint:
            ys, xs = np.nonzero(mask)
            if len(ys):
                y0, x0 = ys.min(), xs.min()
                h = ys.max() - y0
                w = xs.max() - x0
                gx, gy = int(x0 + w * .28), int(y0 + h * .22)
                g = self.m.pts([(gx, gy), (gx + 1, gy)]) & mask
                self.put(g, (255, 255, 255))

    def flat(self, mask, color, outline=None):
        if outline is not None:
            self.put(dilate4(mask) & ~mask, outline)
        self.put(mask, color)

    def over(self, other: 'Canvas', dx=0, dy=0):
        src = other.a
        h, w = src.shape[:2]
        for y in range(h):
            ty = y + dy
            if not 0 <= ty < self.h:
                continue
            row = src[y]
            sel = row[:, 3] > 0
            xs = np.nonzero(sel)[0]
            for x in xs:
                tx = x + dx
                if 0 <= tx < self.w:
                    s = row[x]
                    if s[3] == 255:
                        self.a[ty, tx] = s
                    else:
                        al = s[3] / 255
                        d = self.a[ty, tx].astype(float)
                        out = s[:3] * al + d[:3] * (1 - al)
                        self.a[ty, tx, :3] = out
                        self.a[ty, tx, 3] = max(d[3], s[3])

    def over_fast(self, other: 'Canvas', dx=0, dy=0):
        """composição rápida (alfa binário ou parcial)."""
        dx, dy = int(round(dx)), int(round(dy))
        src = other.a
        h, w = src.shape[:2]
        x0, y0 = max(0, dx), max(0, dy)
        x1, y1 = min(self.w, dx + w), min(self.h, dy + h)
        if x1 <= x0 or y1 <= y0:
            return
        s = src[y0 - dy:y1 - dy, x0 - dx:x1 - dx].astype(float)
        d = self.a[y0:y1, x0:x1].astype(float)
        al = s[..., 3:4] / 255
        out = np.empty_like(d)
        out[..., :3] = s[..., :3] * al + d[..., :3] * (1 - al)
        out[..., 3] = np.maximum(d[..., 3], s[..., 3])
        self.a[y0:y1, x0:x1] = np.round(out).astype(np.uint8)

    def clear(self, mask):
        self.a[mask] = 0

    def alpha_mask(self):
        return self.a[..., 3] > 0

    def outline_all(self, color):
        m = self.alpha_mask()
        self.put(dilate4(m) & ~m, color)

    def flip(self):
        c = Canvas(self.w, self.h)
        c.a = self.a[:, ::-1].copy()
        return c

    def copy(self):
        c = Canvas(self.w, self.h)
        c.a = self.a.copy()
        return c

    def img(self, scale=1):
        im = Image.fromarray(self.a, 'RGBA')
        if scale != 1:
            im = im.resize((self.w * scale, self.h * scale), Image.NEAREST)
        return im

    def bbox(self):
        ys, xs = np.nonzero(self.a[..., 3])
        if not len(ys):
            return None
        return xs.min(), ys.min(), xs.max(), ys.max()


def shadow_ellipse(cv: Canvas, cx, cy, rx, ry, color=(40, 30, 60), opacity=.3):
    m = cv.m.ellipse(cx, cy, rx, ry)
    a = np.zeros_like(cv.a)
    a[m] = (*color, int(255 * opacity))
    tmp = Canvas(cv.w, cv.h)
    tmp.a = a
    cv.over_fast(tmp)


def save(im: Image.Image, path, palette=True):
    import os
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if palette:
        # tenta paleta indexada (muito mais leve) quando há poucas cores
        a = np.array(im)
        alpha = a[..., 3]
        if set(np.unique(alpha)).issubset({0, 255}):
            q = im.convert('RGBA')
            cols = len(set(map(tuple, a.reshape(-1, 4)[alpha.reshape(-1) > 0][:, :3].tolist())))
            if cols <= 255:
                p = q.quantize(colors=cols + 1, method=Image.FASTOCTREE, dither=Image.NONE)
                # garantir transparência
                p = _indexed_with_alpha(im)
                p.save(path, optimize=True)
                return
    im.save(path, optimize=True)


def _indexed_with_alpha(im):
    a = np.array(im)
    alpha = a[..., 3] > 0
    rgb = a[..., :3]
    flat = rgb.reshape(-1, 3)
    keys = (flat[:, 0].astype(np.int32) << 16) | (flat[:, 1].astype(np.int32) << 8) | flat[:, 2]
    keys = np.where(alpha.reshape(-1), keys, -1)
    uniq, inv = np.unique(keys, return_inverse=True)
    pal = []
    for k in uniq:
        if k < 0:
            pal += [0, 0, 0]
        else:
            pal += [(k >> 16) & 255, (k >> 8) & 255, k & 255]
    idx = inv.reshape(alpha.shape).astype(np.uint8)
    p = Image.fromarray(idx, 'P')
    p.putpalette(pal + [0] * (768 - len(pal)))
    tidx = int(np.nonzero(uniq < 0)[0][0]) if (uniq < 0).any() else None
    if tidx is not None:
        p.info['transparency'] = tidx
    return p


def save_png(im, path):
    import os
    os.makedirs(os.path.dirname(path), exist_ok=True)
    a = np.array(im)
    alpha = a[..., 3]
    ok = set(np.unique(alpha).tolist()).issubset({0, 255})
    if ok:
        flat = a[..., :3].reshape(-1, 3)[alpha.reshape(-1) > 0]
        n = len(np.unique(flat.view([('', flat.dtype)] * 3))) if len(flat) else 0
        if n < 255:
            p = _indexed_with_alpha(im)
            p.save(path, optimize=True, transparency=p.info.get('transparency'))
            return
    im.save(path, optimize=True)
