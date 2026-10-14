// ─── Aldeia Digital · documentos para professores e a página das ligações do email ──
import { useEffect, useState } from "react";
import { Caminho } from "../../componentes/Caminho";
import { obterLigacao } from "../cliente/servidor";
import { ALDEIA } from "../textos";

export function Termos() {
  const T = ALDEIA.documentos.termos;
  return (
    <article className="grid gap-4 max-w-3xl">
      <Caminho itens={[["/professor", "Professor"]]} atual={T.titulo} />
      <h1 className="text-4xl">{T.titulo}</h1>
      <p className="m-0">{T.intro}</p>
      <ol className="m-0 pl-5 grid gap-2">
        {Object.entries(T.pontos).map(([k, v]) => (
          <li key={k}>{v}</li>
        ))}
      </ol>
    </article>
  );
}

export function Tratamento() {
  const T = ALDEIA.documentos.tratamento;
  return (
    <article className="grid gap-4 max-w-3xl">
      <Caminho itens={[["/professor", "Professor"]]} atual={T.titulo} />
      <h1 className="text-4xl">{T.titulo}</h1>
      <p className="m-0">{T.intro}</p>
      <ul className="m-0 pl-5 grid gap-2">
        {Object.entries(T.pontos).map(([k, v]) => (
          <li key={k}>{v}</li>
        ))}
      </ul>
    </article>
  );
}

/** /professor/aldeia/email#confirmar=… ou #sair=…: o token vai no fragmento (não chega aos registos do servidor). */
export function EmailAldeia() {
  const T = ALDEIA.professor.emailPagina;
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const p = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const confirmar = p.get("confirmar");
    const sair = p.get("sair");
    void (async () => {
      const { servidor } = await obterLigacao();
      if (confirmar) setMsg((await servidor.confirmarEmail(confirmar)).ok ? T.confirmado : T.erro);
      else if (sair) setMsg((await servidor.sairEmail(sair)).ok ? T.saiu : T.erro);
      else setMsg(T.erro);
      history.replaceState(null, "", window.location.pathname);
    })();
  }, [T]);
  return (
    <div className="grid gap-3 max-w-2xl">
      <Caminho itens={[["/professor", "Professor"]]} atual={T.titulo} />
      <h1 className="text-4xl">{T.titulo}</h1>
      <p className="m-0" role="status">{msg}</p>
    </div>
  );
}
