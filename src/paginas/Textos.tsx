// ─── Páginas de texto: guia de acessibilidade, sobre (com espaço para vídeo), privacidade, licença ──
// Todos os textos vêm de src/textos/paginas.ts (editáveis no backoffice).
import { Caminho } from "../componentes/Caminho";
import { AUTORIA, DATA_VERSAO, REPOSITORIO, VERSAO } from "../versao";
import { PAGINAS } from "../textos/paginas";
import { Rico, preencher } from "../textos/Rico";

/** URL do vídeo de apresentação (YouTube/Vimeo "embed" ou ficheiro .mp4). Vazio = espaço reservado. */
const VIDEO_SOBRE: string = (import.meta.env.VITE_VIDEO_SOBRE as string | undefined)?.trim() ?? "";

export function Video({ titulo }: { titulo: string }) {
  const V = PAGINAS.sobre.video;
  if (!VIDEO_SOBRE) {
    return (
      <div className="video" role="img" aria-label={V.reservado}>
        <div className="grid gap-1 p-4">
          <span className="text-4xl" aria-hidden="true">▶</span>
          <strong>{V.reservado}</strong>
          <span className="text-sm">{V.emBreve}</span>
        </div>
      </div>
    );
  }
  if (/\.(mp4|webm)(\?|$)/i.test(VIDEO_SOBRE)) {
    return (
      <div className="video">
        <video controls preload="metadata" src={VIDEO_SOBRE} aria-label={titulo} />
      </div>
    );
  }
  return (
    <div className="video">
      <iframe src={VIDEO_SOBRE} title={titulo} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
    </div>
  );
}

const vars = () => ({ versao: VERSAO, data: DATA_VERSAO, autoria: AUTORIA });

export function Acessibilidade() {
  const T = PAGINAS.acessibilidade;
  return (
    <div className="grid gap-8 max-w-4xl">
      <header className="grid gap-2">
        <Caminho itens={[]} atual={T.caminho} />
        <h1 className="text-4xl">{T.titulo}</h1>
        <p className="m-0">
          <Rico texto={T.introducao} />
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {T.colunas.map((c) => (
          <section key={c.titulo} className="grid gap-3 content-start">
            <h2 className="text-2xl">{c.titulo}</h2>
            {c.grupos.map((g) => (
              <div key={g.titulo} className="grid gap-2">
                <h3 className="text-sm uppercase tracking-wide" style={{ color: "var(--suave)" }}>
                  {g.titulo}
                </h3>
                <ul className="grid gap-1 pl-5 m-0">
                  {g.itens.map((it, k) => (
                    <li key={k}>
                      <Rico texto={it} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>
      <section className="cartao p-5 grid gap-2">
        <h2 className="text-xl">{T.declaracao.titulo}</h2>
        <p className="m-0 text-sm">
          <Rico texto={preencher(T.declaracao.texto, vars())} />
        </p>
      </section>
    </div>
  );
}

export function Sobre() {
  const T = PAGINAS.sobre;
  return (
    <div className="grid gap-6 max-w-3xl">
      <Caminho itens={[]} atual={T.titulo} />
      <h1 className="text-4xl">{T.titulo}</h1>
      <Video titulo={T.video.titulo} />
      <p className="m-0">
        <Rico texto={preencher(T.versao, vars())} />
      </p>
      {T.paragrafos.map((p, k) => (
        <p key={k} className="m-0">
          <Rico texto={p} />
        </p>
      ))}
      {REPOSITORIO && (
        <p className="m-0">
          {T.codigo}{" "}
          <a href={REPOSITORIO} target="_blank" rel="noreferrer">
            {REPOSITORIO}
          </a>
        </p>
      )}
      <section className="grid gap-2">
        <h2 className="text-2xl">{T.estado.titulo}</h2>
        <ul className="pl-5 m-0 grid gap-1 text-sm">
          {T.estado.itens.map((it, k) => (
            <li key={k}>
              <Rico texto={it} />
            </li>
          ))}
        </ul>
      </section>
      <p className="m-0">
        <Rico texto={T.rodape} />
      </p>
      <section className="grid gap-2">
        <h2 className="text-2xl">{T.fontes.titulo}</h2>
        <ol className="pl-5 m-0 grid gap-1 text-sm">
          {T.fontes.lista.map((f) => (
            <li key={f.url}>
              <a href={f.url} target="_blank" rel="noreferrer">
                {f.texto}
              </a>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Seccoes({ seccoes }: { seccoes: { titulo: string; paragrafos: string[] }[] }) {
  return (
    <>
      {seccoes.map((s) => (
        <section key={s.titulo} className="grid gap-2">
          <h2 className="text-xl">{s.titulo}</h2>
          {s.paragrafos.map((p, k) => (
            <p key={k} className="m-0">
              <Rico texto={preencher(p, vars())} />
            </p>
          ))}
        </section>
      ))}
    </>
  );
}

export function Privacidade() {
  const T = PAGINAS.privacidade;
  return (
    <div className="grid gap-5 max-w-3xl">
      <Caminho itens={[]} atual={T.titulo} />
      <h1 className="text-4xl">{T.titulo}</h1>
      <p className="m-0">
        <Rico texto={T.introducao} />
      </p>
      <Seccoes seccoes={T.seccoes} />
    </div>
  );
}

export function Licenca() {
  const T = PAGINAS.licenca;
  return (
    <div className="grid gap-5 max-w-3xl">
      <Caminho itens={[]} atual={T.titulo} />
      <h1 className="text-4xl">{T.titulo}</h1>
      <p className="m-0">
        <Rico texto={preencher(T.introducao, vars())} />
      </p>
      <blockquote className="cartao p-4 m-0 font-bold">{preencher(T.atribuicao, vars())}</blockquote>
      <Seccoes seccoes={T.seccoes} />
      <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
        <Rico texto={T.nota} />
      </p>
    </div>
  );
}
