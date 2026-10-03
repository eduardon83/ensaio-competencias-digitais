// ─── A Maqueta: cena 3D (three.js) ───────────────────────────────────────────
// Só desenha o estado do modelo e traduz o ponteiro (rato/toque) em pedidos ao componente pai.
// Carregado à parte (React.lazy), para o three.js não pesar no resto da aplicação.
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Camara, Ferramenta, Maqueta, Objeto } from "./modelo";

export interface PropsCena {
  maqueta: Maqueta;
  camara: Camara;
  selecionados: string[];
  ferramenta: Ferramenta;
  aoSelecionar: (id: string | null, juntar: boolean) => void;
  aoArrastar: (ref: string, x: number, z: number, fim: boolean) => void;
  aoCamara: (c: Camara, fim: boolean) => void;
}

const RAD = Math.PI / 180;

function geometria(o: Objeto): THREE.BufferGeometry {
  if (o.tipo === "telhado") {
    // Pirâmide de base quadrada (cone de 4 lados), esticada para a planta do telhado.
    const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
    g.rotateY(Math.PI / 4);
    g.scale(o.tam.x, o.tam.y, o.tam.z);
    return g;
  }
  return new THREE.BoxGeometry(o.tam.x, o.tam.y, o.tam.z);
}

export default function Cena({ maqueta, camara, selecionados, ferramenta, aoSelecionar, aoArrastar, aoCamara }: PropsCena) {
  const caixa = useRef<HTMLDivElement>(null);
  const tres = useRef<{
    renderer: THREE.WebGLRenderer;
    cena: THREE.Scene;
    persp: THREE.PerspectiveCamera;
    orto: THREE.OrthographicCamera;
    malhas: Map<string, { malha: THREE.Mesh; contorno: THREE.LineSegments; chave: string }>;
    desenhar: () => void;
  } | null>(null);
  const props = useRef({ maqueta, camara, selecionados, ferramenta, aoSelecionar, aoArrastar, aoCamara });
  props.current = { maqueta, camara, selecionados, ferramenta, aoSelecionar, aoArrastar, aoCamara };

  // ── Inicialização (uma vez)
  useEffect(() => {
    const el = caixa.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    } catch {
      el.textContent = "Este navegador não consegue mostrar 3D (WebGL). Podes usar a lista de objetos e os botões.";
      return;
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";
    const cena = new THREE.Scene();
    cena.background = new THREE.Color("#7a828a");
    cena.add(new THREE.HemisphereLight("#ffffff", "#556070", 1.4));
    const sol = new THREE.DirectionalLight("#ffffff", 1.6);
    sol.position.set(6, 12, 8);
    cena.add(sol);
    const grelha = new THREE.GridHelper(40, 80, "#5b636b", "#6b737b");
    grelha.position.y = -0.21;
    cena.add(grelha);
    const persp = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
    const orto = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 200);
    const malhas = new Map<string, { malha: THREE.Mesh; contorno: THREE.LineSegments; chave: string }>();

    const desenhar = () => {
      const { camara: c } = props.current;
      const w = el.clientWidth || 600;
      const h = el.clientHeight || 400;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      const el2 = Math.min(89.5, Math.max(0.5, c.el)) * RAD;
      const pos = new THREE.Vector3(c.alvo.x + c.dist * Math.cos(el2) * Math.sin(c.az * RAD), c.alvo.y + c.dist * Math.sin(el2), c.alvo.z + c.dist * Math.cos(el2) * Math.cos(c.az * RAD));
      const cam = c.orto ? orto : persp;
      if (c.orto) {
        const meia = c.dist * 0.42;
        orto.left = (-meia * w) / h;
        orto.right = (meia * w) / h;
        orto.top = meia;
        orto.bottom = -meia;
        orto.updateProjectionMatrix();
      } else {
        persp.aspect = w / h;
        persp.updateProjectionMatrix();
      }
      cam.position.copy(pos);
      cam.up.set(0, 1, 0);
      if (c.el > 89) cam.up.set(-Math.sin(c.az * RAD), 0, -Math.cos(c.az * RAD));
      cam.lookAt(c.alvo.x, c.alvo.y, c.alvo.z);
      renderer.render(cena, cam);
    };
    tres.current = { renderer, cena, persp, orto, malhas, desenhar };

    // ── Ponteiro
    const raio = new THREE.Raycaster();
    const chao = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const ndc = (e: PointerEvent) => {
      const b = renderer.domElement.getBoundingClientRect();
      return new THREE.Vector2(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    };
    const camAtual = () => (props.current.camara.orto ? orto : persp);
    const tocado = (e: PointerEvent): string | null => {
      raio.setFromCamera(ndc(e), camAtual());
      const lista = [...malhas.entries()].filter(([id]) => id !== "terreno").map(([, v]) => v.malha);
      const hit = raio.intersectObjects(lista, false)[0];
      return hit ? (hit.object.userData.id as string) : null;
    };
    const noChao = (e: PointerEvent) => {
      raio.setFromCamera(ndc(e), camAtual());
      const p = new THREE.Vector3();
      return raio.ray.intersectPlane(chao, p) ? p : null;
    };
    let arrasto: { modo: "objeto" | "orbita" | "deslocar"; x0: number; y0: number; cam0: Camara; ref?: string; dx?: number; dz?: number; moveu: boolean } | null = null;

    const baixo = (e: PointerEvent) => {
      renderer.domElement.setPointerCapture(e.pointerId);
      const { ferramenta: f, camara: c, maqueta: m } = props.current;
      const id = tocado(e);
      if (f === "mover" && id) {
        const o = m.objetos.find((k) => k.id === id)!;
        const p = noChao(e);
        if (!props.current.selecionados.includes(id)) props.current.aoSelecionar(id, e.shiftKey);
        arrasto = { modo: "objeto", x0: e.clientX, y0: e.clientY, cam0: c, ref: id, dx: p ? o.pos.x - p.x : 0, dz: p ? o.pos.z - p.z : 0, moveu: false };
        return;
      }
      if (f === "deslocar" || e.button === 1) arrasto = { modo: "deslocar", x0: e.clientX, y0: e.clientY, cam0: c, moveu: false };
      else if (f === "orbita" || e.button === 2) arrasto = { modo: "orbita", x0: e.clientX, y0: e.clientY, cam0: c, moveu: false };
      else arrasto = { modo: "orbita", x0: e.clientX, y0: e.clientY, cam0: c, moveu: false, ref: id ?? "" };
    };
    const mexe = (e: PointerEvent) => {
      if (!arrasto) return;
      const dx = e.clientX - arrasto.x0;
      const dy = e.clientY - arrasto.y0;
      if (Math.abs(dx) + Math.abs(dy) > 4) arrasto.moveu = true;
      if (!arrasto.moveu) return;
      const f = props.current.ferramenta;
      if (arrasto.modo === "objeto" && arrasto.ref) {
        const p = noChao(e);
        if (p) props.current.aoArrastar(arrasto.ref, p.x + (arrasto.dx ?? 0), p.z + (arrasto.dz ?? 0), false);
      } else if (arrasto.modo === "deslocar") {
        const k = arrasto.cam0.dist / 400;
        const a = arrasto.cam0.az * RAD;
        props.current.aoCamara({ ...arrasto.cam0, alvo: { ...arrasto.cam0.alvo, x: arrasto.cam0.alvo.x - dx * k * Math.cos(a) - dy * k * Math.sin(a), z: arrasto.cam0.alvo.z + dx * k * Math.sin(a) - dy * k * Math.cos(a) } }, false);
      } else if (arrasto.modo === "orbita" && (f === "orbita" || f === "selecionar" || e.buttons === 2)) {
        props.current.aoCamara({ ...arrasto.cam0, az: (((arrasto.cam0.az - dx * 0.4) % 360) + 360) % 360, el: Math.max(0, Math.min(90, arrasto.cam0.el + dy * 0.3)) }, false);
      }
    };
    const cima = (e: PointerEvent) => {
      if (!arrasto) return;
      const a = arrasto;
      arrasto = null;
      if (!a.moveu) {
        if (a.modo !== "objeto") props.current.aoSelecionar(tocado(e), e.shiftKey);
        return;
      }
      if (a.modo === "objeto" && a.ref) {
        const p = noChao(e);
        if (p) props.current.aoArrastar(a.ref, p.x + (a.dx ?? 0), p.z + (a.dz ?? 0), true);
      } else props.current.aoCamara(props.current.camara, true);
    };
    const roda = (e: WheelEvent) => {
      e.preventDefault();
      const c = props.current.camara;
      props.current.aoCamara({ ...c, dist: Math.max(4, Math.min(30, c.dist * (e.deltaY > 0 ? 1.1 : 0.9))) }, true);
    };
    const tela = renderer.domElement;
    tela.addEventListener("pointerdown", baixo);
    tela.addEventListener("pointermove", mexe);
    tela.addEventListener("pointerup", cima);
    tela.addEventListener("wheel", roda, { passive: false });
    tela.addEventListener("contextmenu", (e) => e.preventDefault());
    const obs = new ResizeObserver(() => desenhar());
    obs.observe(el);
    return () => {
      obs.disconnect();
      tela.removeEventListener("pointerdown", baixo);
      tela.removeEventListener("pointermove", mexe);
      tela.removeEventListener("pointerup", cima);
      tela.removeEventListener("wheel", roda);
      malhas.forEach((v) => {
        v.malha.geometry.dispose();
        (v.malha.material as THREE.Material).dispose();
        v.contorno.geometry.dispose();
      });
      renderer.dispose();
      tela.remove();
      tres.current = null;
    };
  }, []);

  // ── Sincronização com o estado
  useEffect(() => {
    const t = tres.current;
    if (!t) return;
    const vivos = new Set(maqueta.objetos.map((o) => o.id));
    for (const [id, v] of t.malhas)
      if (!vivos.has(id)) {
        t.cena.remove(v.malha, v.contorno);
        v.malha.geometry.dispose();
        v.contorno.geometry.dispose();
        t.malhas.delete(id);
      }
    for (const o of maqueta.objetos) {
      const chave = `${o.tipo}|${o.tam.x}|${o.tam.y}|${o.tam.z}`;
      let v = t.malhas.get(o.id);
      if (!v || v.chave !== chave) {
        if (v) {
          t.cena.remove(v.malha, v.contorno);
          v.malha.geometry.dispose();
          v.contorno.geometry.dispose();
        }
        const g = geometria(o);
        const malha = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: o.cor, roughness: 0.85 }));
        malha.userData.id = o.id;
        const contorno = new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: "#ffd400" }));
        t.cena.add(malha, contorno);
        v = { malha, contorno, chave };
        t.malhas.set(o.id, v);
      }
      const sel = selecionados.includes(o.id);
      for (const obj of [v.malha, v.contorno]) {
        obj.position.set(o.pos.x, o.pos.y + o.tam.y / 2, o.pos.z);
        obj.rotation.set(0, o.rot * RAD, 0);
      }
      v.contorno.visible = sel;
      (v.malha.material as THREE.MeshStandardMaterial).emissive.set(sel ? "#5a4a00" : "#000000");
    }
    t.desenhar();
  }, [maqueta, selecionados, camara]);

  return <div ref={caixa} className="maqueta-tela" aria-hidden="true" />;
}
