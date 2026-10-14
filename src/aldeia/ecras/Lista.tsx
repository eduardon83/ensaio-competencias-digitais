// ─── Aldeia Digital · Mapa em lista (faz tudo o que o mapa faz) ──────────────
import { useNavigate } from "react-router";
import { Check, CircleAlert, LockKeyhole } from "lucide-react";
import { Botao } from "../../ui";
import { urlPixel } from "../arte/pixel";
import { EDIFICIOS } from "../nucleo/catalogo";
import { estadoEdificio } from "../mapa/mundo";
import { useAldeia } from "../cliente/estado";
import { ALDEIA } from "../textos";
import { CabecalhoAldeia } from "./comum";

export function Lista() {
  const { caps, vista, codigo, missoes } = useAldeia();
  const nav = useNavigate();
  const T = ALDEIA.interface.lista;
  const E = ALDEIA.estadosEdificio;
  const ir = (alvo: string) => nav(`/aldeia/${codigo}`, { state: { ir: alvo } });
  return (
    <div className="aldeia-pagina">
      <CabecalhoAldeia seccao={ALDEIA.interface.mapa.lugares} voltar={`/aldeia/${codigo}`} />
      <main id="conteudo" tabIndex={-1} className="aldeia-conteudo grid gap-4" style={{ maxWidth: 760 }}>
        <h1 className="text-3xl">{T.titulo}</h1>
        <ul className="m-0 p-0 list-none grid gap-3">
          <li className="cartao p-3 aldeia-lugar">
            <img src={urlPixel(`mundo/casa/casa-paredes-${vista.aluno.casa.paredes}`)} alt="" width={74} height={71} className="aldeia-lugar__img" />
            <div className="grid gap-1 min-w-0">
              <strong>{ALDEIA.interface.mapa.aTuaCasa}</strong>
              <span className="text-sm" style={{ color: "var(--suave)" }}>{ALDEIA.edificios.casa.descricao}</span>
            </div>
            <Botao variante="contorno" onClick={() => nav(`/aldeia/${codigo}/casa`)}>{T.entrar}</Botao>
          </li>
          {EDIFICIOS.map((e) => {
            const r = estadoEdificio(e.id, caps, vista.aluno.progresso);
            const daTurma = missoes.filter((m) => m.edificio === e.id && m.tipo !== "evento");
            const feitas = daTurma.filter((m) => vista.aluno.progresso[m.id]).length;
            const obras = r.estado === "obras";
            const descEstado = obras ? `${E.obras}${r.abreNo !== null ? `. ${E.abreNoCapitulo.replace("{capitulo}", String(r.abreNo))}` : ""}` : r.missao ? E.missao : r.estado === "concluido" ? E.concluido : r.estado === "festivo" ? E.festivo : E.aberto;
            return (
              <li key={e.id} className="cartao p-3 aldeia-lugar">
                <img src={urlPixel(`mundo/edificios/${e.id}/edificio-${e.id}-${r.estado}-dia`)} alt="" width={64} className="aldeia-lugar__img" style={{ opacity: obras ? 0.7 : 1 }} />
                <div className="grid gap-1 min-w-0">
                  <strong>{ALDEIA.edificios[e.id].nome}</strong>
                  <span className={`aldeia-estado aldeia-estado--${obras ? "obras" : r.missao ? "missao" : r.estado}`}>
                    {obras ? <LockKeyhole size={14} aria-hidden="true" /> : r.missao ? <CircleAlert size={14} aria-hidden="true" /> : r.estado === "concluido" ? <Check size={14} aria-hidden="true" /> : null}
                    {descEstado}
                  </span>
                  {daTurma.length > 0 && !obras && <span className="text-sm" style={{ color: "var(--suave)" }}>{T.feitas.replace("{n}", String(feitas)).replace("{total}", String(daTurma.length))}</span>}
                </div>
                <Botao variante="contorno" disabled={obras} aria-label={`${T.entrar} ${ALDEIA.edificios[e.id].nome}${obras ? `: ${descEstado}` : ""}`} onClick={() => ir(e.id)}>
                  {T.entrar}
                </Botao>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
