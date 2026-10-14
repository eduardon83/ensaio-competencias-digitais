// ─── Esperas e carregamentos: o avatar anda no lugar ao lado de uma frase curta ──
// Leve (sem manifestos): as camadas do avatar são folhas com a mesma grelha, animadas por CSS a 12 fps (passos).
// Só aparece se a espera passar de 400 ms; no modo calmo fica parado.
import { useEffect, useState } from "react";
import { urlPixel } from "./pixel";

interface Guardado {
  fato: string;
  pele: string;
  cabelo: string;
  corCabelo: string;
  pasta?: string;
}

function lerAvatar(): Guardado {
  try {
    const v = JSON.parse(localStorage.getItem("ecd.aldeia.avatar.v1") ?? "null") as Guardado | null;
    if (v && /^[a-z-]+$/.test(v.fato)) return v;
  } catch {
    /* nada */
  }
  return { fato: "raposa", pele: "pele-3", cabelo: "curto", corCabelo: "castanho", pasta: "avatares/fatos" };
}

/** Avatar a andar no lugar (camadas: corpo, cara, cabelo, capuz). */
export function AvatarAndar({ escala = 2 }: { escala?: number }) {
  const a = lerAvatar();
  const pasta = a.pasta ?? "avatares/fatos";
  const camadas: [string, number][] = [
    [`${pasta}/avatar-fato-${a.fato}`, 2],
    [`avatares/caras/avatar-cara-${a.pele}`, 2],
    ...(a.cabelo !== "rapado" ? ([[`avatares/cabelos/avatar-cabelo-${a.cabelo}-${a.corCabelo}`, 2]] as [string, number][]) : []),
    [`${pasta}/avatar-fato-${a.fato}`, 12],
  ];
  return (
    <span className="avatar-andar" aria-hidden="true" style={{ width: 44 * escala, height: 64 * escala, ["--e" as string]: escala }}>
      {camadas.map(([c, linha], k) => (
        <span key={k} style={{ backgroundImage: `url(${urlPixel(c)})`, backgroundSize: `${440 * escala}px auto`, backgroundPositionY: `${-linha * 64 * escala}px` }} />
      ))}
    </span>
  );
}

export function Espera({ texto = "A carregar…" }: { texto?: string }) {
  const [ver, setVer] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVer(true), 400);
    return () => clearTimeout(t);
  }, []);
  if (!ver) return <div aria-busy="true" style={{ minHeight: 64 }} />;
  return (
    <div className="flex items-center gap-3 py-4" role="status" aria-live="polite">
      <AvatarAndar escala={1} />
      <span>{texto}</span>
    </div>
  );
}
