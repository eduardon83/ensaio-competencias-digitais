// ─── Aldeia Digital · missões de cidadania (definições do motor, numero ≥ 300) ──
// Cada missão: três situações ilustradas da aldeia com escolhas. Decisões, não perguntas de memória
// (CURRICULO.md 2.1). A pontuação conta para a história, os prémios e o perfil de cidadania; não conta para o
// perfil de competências (os 12 desafios). Usa o motor (briefing, prática, avaliação, resultado) como as atividades.
import { useMemo, useRef, useState } from "react";
import { definir, limitar, type DefinicaoAtividade, type LinhaRelatorio, type Nivel, type PropsAtividade } from "../../motor/tipos";
import { Botao, BotaoRadio } from "../../ui";
import { Ouvir } from "../../componentes/Ouvir";
import { misturar } from "../../motor/aleatorio";
import { Avatar, avatarGuardado } from "../arte/componentes";
import { BandaEdificio, NOME_EDIFICIO, Retrato, pixelado, urlPixel } from "../arte/pixel";
import manifesto from "../arte/manifesto.json";
import { MISSAO, cicloDoNivel, type CicloTexto } from "../nucleo/catalogo";
import { porCiclo } from "../textos";
import { CENAS, CIDADANIA, PERGUNTA_PADRAO, type Situacao } from "./conteudo";
import type { Anim } from "../arte/avatar";

export interface ConfigCidadania {
  missao: string;
  ciclo: CicloTexto;
  situacoes: ("s1" | "s2" | "s3")[];
}

type Ancoras = { ancoras: { ecra: number[]; avatar_pes: number[]; balao: number[] }; pose: { anim: string; frame: number; espelhar: boolean } };
const ARTE = manifesto.missoes as Record<string, Ancoras[]>;

export function situacoesDe(missao: string, ciclo: CicloTexto) {
  const m = CIDADANIA[missao];
  return ciclo === "sec" ? (m.situacoes.sec ?? m.situacoes.c23 ?? m.situacoes.c1) : ciclo === "c23" ? (m.situacoes.c23 ?? m.situacoes.c1) : m.situacoes.c1;
}

/** Cena da situação: ilustração do pacote (com âncoras para o ecrã, o avatar e o balão) ou o edifício da missão. */
export function CenaSituacao({ missao, indice, s, anim }: { missao: string; indice: number; s: Situacao; anim: Anim }) {
  const cena = CENAS[missao];
  const arte = cena.arte ? ARTE[cena.arte]?.[indice] : undefined;
  const aparencia = useMemo(() => avatarGuardado(), []);
  if (cena.arte && arte) {
    const pct = (v: number, total: number) => `${(v / total) * 100}%`;
    const [ex0, ey0, ex1, ey1] = arte.ancoras.ecra;
    const [ax, ay] = arte.ancoras.avatar_pes;
    const [bx, by] = arte.ancoras.balao;
    return (
      <div className="cena-missao" role="img" aria-label={s.texto}>
        <img src={urlPixel(`missoes/${cena.arte}/missao-${cena.arte}-situacao-${indice + 1}`)} alt="" className="cena-missao__fundo" style={pixelado} />
        {s.ecra && (
          <div className="cena-missao__ecra" style={{ left: pct(ex0, 1280), top: pct(ey0, 720), width: pct(ex1 - ex0, 1280), height: pct(ey1 - ey0, 720) }}>
            <span>{s.ecra}</span>
          </div>
        )}
        <div className="cena-missao__avatar" style={{ left: pct(ax, 1280), top: pct(ay, 720), transform: `translate(-50%, -93.75%) ${arte.pose.espelhar ? "scaleX(-1)" : ""}` }}>
          <Avatar aparencia={aparencia} anim={anim} escala={4} rotulo="" style={{ width: "100%", height: "auto" }} />
        </div>
        <div className="cena-missao__balao" style={{ left: pct(Math.min(bx, 1000), 1280), top: pct(Math.max(40, by - 200), 720) }} aria-hidden="true">
          {s.texto}
        </div>
      </div>
    );
  }
  const m = MISSAO.get(missao);
  const edificio = m?.edificio === "casa" ? "largo" : (m?.edificio ?? "largo");
  return (
    <div className="cena-missao cena-missao--simples" role="img" aria-label={s.texto}>
      <BandaEdificio edificio={edificio} nome={NOME_EDIFICIO[edificio] ?? ""} altura={220} />
      <div className="cena-missao__simples">
        <Retrato id={cena.personagem} escala={2} />
        {s.ecra && <div className="cena-missao__cartaz">{s.ecra}</div>}
        <Avatar aparencia={aparencia} anim={anim} escala={2} rotulo="" />
      </div>
    </div>
  );
}

function MissaoCidadania({ config, modo, aoTerminar }: PropsAtividade<ConfigCidadania>) {
  const sits = situacoesDe(config.missao, config.ciclo);
  const ordem = config.situacoes;
  const [i, setI] = useState(0);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [visto, setVisto] = useState(false);
  const inicio = useRef(performance.now());
  const linhas = useRef<LinhaRelatorio[]>([]);
  const k = ordem[i];
  const s = sits[k];
  const opcoes = useMemo(() => misturar([{ t: s.certa, certa: true }, { t: s.a, certa: false }, { t: s.b, certa: false }]), [s]);
  const certa = escolha !== null && opcoes[escolha].certa;
  const indiceArte = Number(k.slice(1)) - 1;

  function seguinte() {
    linhas.current.push({ tarefa: s.texto, resultado: certa ? "certo" : "errado", resposta: escolha !== null ? opcoes[escolha].t : undefined, certa: s.certa, feedback: s.porque });
    if (i + 1 < ordem.length) {
      setI(i + 1);
      setEscolha(null);
      setVisto(false);
      return;
    }
    const n = linhas.current.filter((l) => l.resultado === "certo").length;
    aoTerminar({ pontuacao: limitar((100 * n) / ordem.length), duracaoMs: performance.now() - inicio.current, metricas: { certas: n, total: ordem.length, modo }, relatorio: linhas.current });
  }

  return (
    <div className="grid gap-4">
      <div className="text-sm font-bold" style={{ color: "var(--suave)" }}>
        Situação {i + 1} de {ordem.length}
      </div>
      <CenaSituacao missao={config.missao} indice={indiceArte} s={s} anim={visto ? (certa ? "acenar" : "parado") : "pensar"} />
      <fieldset className="cartao p-4 grid gap-2 border-0" data-ouvir="">
        <legend className="sr-only">{s.pergunta ?? PERGUNTA_PADRAO}</legend>
        <p className="m-0 text-lg">{s.texto}</p>
        {s.ecra && <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>“{s.ecra}”</p>}
        <p className="m-0 font-bold" style={{ fontFamily: "var(--fonte-titulo)" }}>{s.pergunta ?? PERGUNTA_PADRAO}</p>
        {opcoes.map((o, j) => (
          <BotaoRadio key={`${i}-${j}`} id={`cid-${i}-${j}`} name={`cid-${i}`} rotulo={o.t} checked={escolha === j} disabled={visto} onChange={() => setEscolha(j)} />
        ))}
        {visto && (
          <p className="m-0" role="status" style={{ color: certa ? "var(--certo)" : "var(--tinta)" }}>
            {certa ? <strong>Muito bem. </strong> : <><strong>Quase.</strong> A escolha mais segura: {s.certa.replace(/\.$/, "")}. </>}
            {s.porque}
          </p>
        )}
        <div className="flex gap-3 flex-wrap items-center">
          {!visto ? (
            <Botao disabled={escolha === null} onClick={() => setVisto(true)}>
              Escolher
            </Botao>
          ) : (
            <Botao onClick={seguinte}>{i + 1 < ordem.length ? "Continuar" : "Terminar"}</Botao>
          )}
          <Ouvir />
        </div>
      </fieldset>
    </div>
  );
}

const NIVEIS_POR_CICLO = (missao: string): Record<Nivel, ConfigCidadania> => {
  const c = (n: Nivel): ConfigCidadania => ({ missao, ciclo: cicloDoNivel(n), situacoes: ["s1", "s2", "s3"] });
  return { 1: c(1), 2: c(2), 3: c(3), 4: c(4), 5: c(5) };
};

/** Uma definição do motor por missão de cidadania. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MISSOES_CIDADANIA: Record<string, DefinicaoAtividade<any>> = Object.fromEntries(
  Object.keys(CIDADANIA).map((id, k) => {
    const m = CIDADANIA[id];
    return [
      id,
      definir<ConfigCidadania>({
        slug: id,
        numero: 300 + k,
        dominio: "pensamento",
        titulo: { jornal: porCiclo(m.titulo, "c1"), laboratorio: porCiclo(m.titulo, "c1") },
        descricao: porCiclo(m.intro, "c1"),
        duracao: "5 minutos",
        disponivel: true,
        niveis: NIVEIS_POR_CICLO(id),
        pratica: (c) => ({ ...c, situacoes: ["s1"] }),
        Componente: MissaoCidadania,
        dica: (_m, p) => (p >= 67 ? porCiclo(m.fecho, "c1") : "Pensa no que protege toda a gente e lembra-te: pedir ajuda a um adulto de confiança é sempre uma boa escolha."),
      }),
    ];
  }),
);
