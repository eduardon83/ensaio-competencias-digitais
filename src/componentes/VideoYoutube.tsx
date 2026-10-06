// ─── Vídeo do YouTube com "fachada": nada é pedido ao YouTube antes de a pessoa carregar em reproduzir ──
// Depois do clique, o vídeo vem de youtube-nocookie.com (modo de privacidade reforçada). Sem miniatura remota: a
// fachada é desenhada aqui, para a página não contactar terceiros só por ser aberta (ver a página Privacidade).
import { useState } from "react";
import { PAGINAS } from "../textos/paginas";
import { preencher } from "../textos/Rico";

export const VIDEOS = {
  promocional: "jVf32NQmNhs",
  institucional: "hamCz5WLmq0",
  aluno: "X7X09rY0ACs",
  professor: "xHucitIp8qw",
} as const;
export type QualVideo = keyof typeof VIDEOS;

export function VideoYoutube({ qual, compacto }: { qual: QualVideo; compacto?: boolean }) {
  const [ativo, setAtivo] = useState(false);
  const T = PAGINAS.videos;
  const titulo = T.titulos[qual];
  const id = VIDEOS[qual];
  return (
    <figure className="grid gap-1 m-0">
      <div className="video video--youtube">
        {ativo ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&hl=pt-PT&cc_lang_pref=pt&cc_load_policy=1`}
            title={titulo}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button type="button" className="video-fachada" onClick={() => setAtivo(true)} aria-label={preencher(T.reproduzir, { titulo })}>
            <span className="video-fachada__play" aria-hidden="true">▶</span>
            <span className={compacto ? "text-base font-bold" : "text-xl font-bold"}>{titulo}</span>
            <span className="text-sm">{T.publico[qual]}</span>
          </button>
        )}
      </div>
      <figcaption className="text-xs" style={{ color: "var(--suave)" }}>
        {T.aviso}{" "}
        <a href={`https://youtu.be/${id}`} target="_blank" rel="noreferrer">
          {T.verNoYoutube}
        </a>
      </figcaption>
    </figure>
  );
}
