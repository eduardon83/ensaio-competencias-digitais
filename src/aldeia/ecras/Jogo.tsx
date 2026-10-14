// ─── Aldeia Digital · ecrã da aldeia (mapa, HUD, diálogos, missões, prémios, tutorial) ──
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Backpack, CircleHelp, House, List, LogOut, Newspaper, Settings } from "lucide-react";
import { usePreferencias } from "../../preferencias/preferencias";
import { Botao, Barra } from "../../ui";
import { Avatar, Cabeca, Espera } from "../arte/componentes";
import { urlPixel } from "../arte/pixel";
import type { Anim } from "../arte/avatar";
import { EDIFICIOS, ITEM, MISSAO, type CategoriaItem, type DefMissao, type IdEdificio } from "../nucleo/catalogo";
import type { Aparencia } from "../nucleo/modelo";
import { nomeVisivel } from "../nucleo/nomes";
import { capituloAtual, ofertaPara } from "../nucleo/regras";
import { estadoEdificio } from "../mapa/mundo";
import type { Alvo, InfoEdificio } from "../mapa/Mapa";
import { useAldeia } from "../cliente/estado";
import { marcarVisto, vistos } from "../cliente/sessao";
import { ALDEIA } from "../textos";
import { Dialogo, Modal, preencherAluno, texto } from "./comum";
import { titulosMissao } from "./missoes";

const Mapa = lazy(() => import("../mapa/Mapa"));

export const NPC_EDIFICIO: Record<string, string> = {
  escola: "professora", jornal: "diretora-graca", laboratorio: "doutora-ines", biblioteca: "bibliotecaria", arquivo: "tome", junta: "presidente-junta",
  seguranca: "mae", mercado: "marta", oficina: "robo", museu: "rui", horta: "avo", largo: "dona-cegonha", casa: "dona-cegonha",
};

type Passo = { id: keyof typeof ALDEIA.tutorial.passos; mapa: (Alvo | "avatar")[]; hud: string[] };
const PASSOS: Passo[] = [
  { id: "casa", mapa: ["casa"], hud: [] },
  { id: "andar", mapa: ["avatar"], hud: ["lista"] },
  { id: "edificios", mapa: ["escola", "jornal", "laboratorio"], hud: [] },
  { id: "missoes", mapa: ["escola"], hud: [] },
  { id: "premios", mapa: [], hud: ["mochila", "casa"] },
  { id: "dados", mapa: [], hud: ["cartao"] },
  { id: "ajudas", mapa: [], hud: ["ajuda", "definicoes"] },
  { id: "primeira", mapa: ["escola"], hud: [] },
];

type Ecra =
  | { tipo: "nada" }
  | { tipo: "dialogo"; personagem: string; fala: string; expr?: "neutra" | "contente" | "preocupada" | "surpreendida"; depois?: () => void }
  | { tipo: "cartao"; alvo: Alvo }
  | { tipo: "premio"; missao: string }
  | { tipo: "ganhou"; item: string }
  | { tipo: "capitulo"; n: number }
  | { tipo: "sair" };

export interface DepoisMissao {
  missao: string;
  pontuacao: number;
  treino?: boolean;
}

export function Jogo() {
  const al = useAldeia();
  const { vista, caps, d, ciclo, missoes, enviar, codigo } = al;
  const aluno = vista.aluno;
  const { escuro } = usePreferencias();
  const nav = useNavigate();
  const local = useLocation();
  const estadoNav = (local.state ?? {}) as { depoisMissao?: DepoisMissao; ir?: Alvo; tutorial?: boolean };
  const [ecra, setEcra] = useState<Ecra>({ tipo: "nada" });
  const [passoTutorial, setPassoTutorial] = useState(0);
  const [irPara, setIrPara] = useState<{ alvo: Alvo; n: number } | null>(null);
  const [animacao, setAnimacao] = useState<{ anim: Anim; n: number } | null>(null);
  const base = `/aldeia/${codigo}`;
  const [rever, setRever] = useState(Boolean(estadoNav.tutorial));
  const tutorial = !aluno.progresso.tutorial || rever;
  const atual = capituloAtual(caps);
  const capAtual = caps.find((c) => c.n === atual);
  const tituloCap = (n: number) => (ALDEIA.capitulos as Record<string, { titulo: string }>)[`c${n}`]?.titulo ?? "";
  const objetivo = vista.objetivo.atingido;

  const edificios = useMemo(() => {
    const out = {} as Record<IdEdificio, InfoEdificio>;
    for (const e of EDIFICIOS) {
      const r = estadoEdificio(e.id, caps, aluno.progresso);
      out[e.id] = { estado: e.id === "largo" && objetivo && r.estado !== "obras" ? "festivo" : r.estado, missao: r.missao, abreNo: r.abreNo };
    }
    return out;
  }, [caps, aluno.progresso, objetivo]);

  // Fila de momentos da história: depois de uma missão, prémios por escolher, capítulos concluídos e abertos.
  useEffect(() => {
    if (tutorial || ecra.tipo !== "nada") return;
    const visto = vistos(codigo);
    const dm = estadoNav.depoisMissao;
    if (dm) {
      nav(base, { replace: true, state: {} });
      const m = MISSAO.get(dm.missao);
      const npc = m?.tipo === "cidadania" ? undefined : NPC_EDIFICIO[m?.edificio ?? "escola"];
      const D = ALDEIA.dialogos;
      const fala = dm.treino ? texto(D.depois, ciclo) : dm.pontuacao >= 85 ? texto(D.carimbo, ciclo) : dm.pontuacao >= 50 ? texto(D.depois, ciclo) : texto(D.outraVez, ciclo);
      setAnimacao({ anim: dm.pontuacao >= 50 ? "celebrar" : "outra-vez", n: Date.now() });
      setEcra({ tipo: "dialogo", personagem: npc ?? "dona-cegonha", fala, expr: dm.pontuacao >= 50 ? "contente" : "neutra" });
      return;
    }
    if (estadoNav.ir) {
      const alvo = estadoNav.ir;
      nav(base, { replace: true, state: {} });
      setIrPara({ alvo, n: Date.now() });
      return;
    }
    const oferta = d.ofertasPendentes.find((m) => ofertaPara(m, d).length > 0);
    if (oferta) return setEcra({ tipo: "premio", missao: oferta });
    const fechado = d.capitulosConcluidos.find((n) => !visto.includes(`fecho:c${n}`));
    if (fechado !== undefined) return setEcra({ tipo: "capitulo", n: fechado });
    const aberto = caps.find((c) => c.aberto && !c.concluido && !visto.includes(`abertura:c${c.n}`));
    if (aberto) {
      marcarVisto(codigo, `abertura:c${aberto.n}`);
      const t = (ALDEIA.capitulos as Record<string, { abertura: { c1: string } }>)[`c${aberto.n}`];
      if (t) setEcra({ tipo: "dialogo", personagem: "dona-cegonha", fala: `${ALDEIA.interface.hud.capitulo.replace("{n}", String(aberto.n)).replace("{titulo}", tituloCap(aberto.n))}. ${texto(t.abertura, ciclo)}` });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorial, ecra.tipo, d, caps]);

  function aoEntrar(alvo: Alvo) {
    if (alvo === "casa" && !missoesDe("casa").some((m) => !aluno.progresso[m.id])) return nav(`${base}/casa`);
    const chave = `chegada:${alvo}`;
    if (alvo !== "casa" && !vistos(codigo).includes(chave)) {
      marcarVisto(codigo, chave);
      const fala = texto((ALDEIA.dialogos.chegada as Record<string, { c1: string }>)[alvo] ?? ALDEIA.dialogos.antes, ciclo);
      return setEcra({ tipo: "dialogo", personagem: NPC_EDIFICIO[alvo] ?? "dona-cegonha", fala, depois: () => setEcra({ tipo: "cartao", alvo }) });
    }
    setEcra({ tipo: "cartao", alvo });
  }

  function missoesDe(alvo: Alvo): DefMissao[] {
    return missoes.filter((m) => m.edificio === alvo && m.tipo !== "evento" || (m.id === "festa" && alvo === "largo"));
  }

  const passo = PASSOS[passoTutorial];
  async function terminarTutorial(irEscola: boolean) {
    marcarVisto(codigo, "abertura:c0"); // o tutorial já apresenta o capítulo 0
    if (!aluno.progresso.tutorial) await enviar([{ op: "evento", missao: "tutorial" }]);
    setRever(false);
    setPassoTutorial(0);
    if (irEscola) setIrPara({ alvo: "escola", n: Date.now() });
  }

  const destaqueHud = tutorial ? passo.hud : [];
  const feitasCap = capAtual ? capAtual.feitas : 0;
  const totalCap = capAtual ? capAtual.missoes.length : 1;
  const H = ALDEIA.interface.hud;

  return (
    <div className="aldeia-jogo">
      <h1 className="sr-only">{ALDEIA.interface.mapa.titulo}</h1>
      <Suspense fallback={<Espera aparencia={aluno.aparencia} />}>
        <Mapa
          escuro={escuro}
          eu={{ lugar: aluno.lugar, aparencia: aluno.aparencia, casa: aluno.casa, nome: aluno.nome }}
          vizinhos={vista.vizinhos}
          edificios={edificios}
          irPara={irPara}
          animacao={animacao}
          destaque={tutorial ? passo.mapa : []}
          aoEntrar={aoEntrar}
          aoTocarObras={(id, n) => setEcra({ tipo: "dialogo", personagem: NPC_EDIFICIO[id] ?? "dona-cegonha", fala: `${texto(ALDEIA.dialogos.obras, ciclo)}${n !== null ? ` ${ALDEIA.estadosEdificio.abreNoCapitulo.replace("{capitulo}", String(n))}` : ""}` })}
        />
      </Suspense>

      <nav className="aldeia-hud" aria-label="Aldeia">
        <div className={`aldeia-hud__cartao ${destaqueHud.includes("cartao") ? "aldeia-destaque-hud" : ""}`}>
          <Cabeca fato={aluno.aparencia.fato} tamanho={48} />
          <div className="min-w-0">
            <div className="font-bold truncate">{nomeVisivel(aluno.nome)}</div>
            <div className="text-xs truncate" style={{ color: "var(--suave)" }}>{H.capitulo.replace("{n}", String(atual)).replace("{titulo}", tituloCap(atual))}</div>
            <Barra valor={feitasCap} max={totalCap} rotulo={`${feitasCap} de ${totalCap}`} />
          </div>
        </div>
        <div className="aldeia-hud__botoes">
          {[
            { id: "mochila", rotulo: H.mochila, Ic: Backpack, ir: `${base}/guarda-roupa` },
            { id: "casa", rotulo: H.casa, Ic: House, ir: `${base}/casa` },
            { id: "lista", rotulo: H.lista, Ic: List, ir: `${base}/lista` },
            { id: "jornal", rotulo: H.jornal, Ic: Newspaper, ir: `${base}/jornal` },
            { id: "ajuda", rotulo: H.ajuda, Ic: CircleHelp, ir: `${base}/ajuda` },
            { id: "definicoes", rotulo: H.definicoes, Ic: Settings, ir: `/definicoes?voltar=/aldeia/${codigo}` },
          ].map((b) => (
            <button key={b.id} type="button" className={`aldeia-hud__botao ${destaqueHud.includes(b.id) ? "aldeia-destaque-hud" : ""}`} onClick={() => nav(b.ir)} aria-label={b.rotulo}>
              <b.Ic size={20} aria-hidden="true" />
              <span className="aldeia-hud__rotulo">{b.rotulo}</span>
            </button>
          ))}
          <button type="button" className="aldeia-hud__botao" onClick={() => setEcra({ tipo: "sair" })} aria-label={H.sair}>
            <LogOut size={20} aria-hidden="true" />
            <span className="aldeia-hud__rotulo">{H.sair}</span>
          </button>
        </div>
        {al.fila !== "ok" && (
          <div className="aldeia-hud__fila" role="status">
            {al.fila === "sem-rede" ? ALDEIA.interface.fila.pendente : ALDEIA.interface.fila.aGuardar}
          </div>
        )}
      </nav>

      {tutorial && (
        <Dialogo
          personagem="dona-cegonha"
          progresso={`${ALDEIA.tutorial.progresso.replace("{i}", String(passoTutorial + 1)).replace("{n}", String(PASSOS.length))} · ${ALDEIA.tutorial.passos[passo.id].titulo}`}
          fala={texto(ALDEIA.tutorial.passos[passo.id].texto, ciclo)}
          aoContinuar={() => (passoTutorial + 1 < PASSOS.length ? setPassoTutorial(passoTutorial + 1) : void terminarTutorial(true))}
          rotuloContinuar={passoTutorial + 1 < PASSOS.length ? ALDEIA.tutorial.continuar : ALDEIA.tutorial.terminar}
          acoes={passoTutorial + 1 < PASSOS.length ? <Botao variante="contorno" onClick={() => void terminarTutorial(false)}>{ALDEIA.tutorial.saltar}</Botao> : undefined}
        />
      )}

      {ecra.tipo === "dialogo" && (
        <Dialogo personagem={ecra.personagem} fala={ecra.fala} expressao={ecra.expr} aoContinuar={() => { const f = ecra.depois; setEcra({ tipo: "nada" }); f?.(); }} />
      )}

      {ecra.tipo === "cartao" && <CartaoMissoes alvo={ecra.alvo} missoes={missoesDe(ecra.alvo)} aoFechar={() => setEcra({ tipo: "nada" })} aoFesta={async () => {
        await enviar([{ op: "evento", missao: "festa" }]);
        setAnimacao({ anim: "celebrar", n: Date.now() });
        setEcra({ tipo: "dialogo", personagem: "dona-cegonha", fala: `${texto(ALDEIA.dialogos.festa, ciclo)} ${texto(ALDEIA.historia.final, ciclo)}`, expr: "contente", depois: () => nav(`${base}/jornal`) });
      }} />}

      {ecra.tipo === "premio" && <EscolherPremio missao={ecra.missao} aoEscolher={async (item) => {
        await enviar([{ op: "premio", missao: ecra.missao, item }]);
        setEcra({ tipo: "ganhou", item });
      }} aoDepois={() => setEcra({ tipo: "nada" })} />}

      {ecra.tipo === "ganhou" && <Ganhou item={ecra.item} aoVestir={async () => {
        const cat = ITEM.get(ecra.item)?.cat as CategoriaItem;
        await enviar([{ op: "aparencia", valor: { ...aluno.aparencia, [cat]: ecra.item } }]);
        setAnimacao({ anim: "vestir", n: Date.now() });
        setEcra({ tipo: "nada" });
      }} aoDepois={() => setEcra({ tipo: "nada" })} />}

      {ecra.tipo === "capitulo" && <CapituloConcluido n={ecra.n} aoFechar={() => { marcarVisto(codigo, `fecho:c${ecra.n}`); setEcra({ tipo: "nada" }); }} />}

      {ecra.tipo === "sair" && (
        <Modal titulo={ALDEIA.interface.ajuda.sair} aoFechar={() => setEcra({ tipo: "nada" })}>
          <div className="grid gap-3">
            <h2 className="text-xl">{ALDEIA.interface.ajuda.sair}</h2>
            <p className="m-0">{ALDEIA.interface.ajuda.sairTexto}</p>
            <div className="flex gap-3 flex-wrap">
              <Botao onClick={async () => { await al.sair(); nav("/aldeia", { state: { saiu: true } }); }}>{ALDEIA.interface.hud.sair}</Botao>
              <Botao variante="contorno" onClick={() => setEcra({ tipo: "nada" })}>{ALDEIA.professor.painel.acoes.cancelar}</Botao>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/** Cartão da missão (ou das missões) de um edifício: título, personagem, briefing, nível, duração, Começar. */
function CartaoMissoes({ alvo, missoes, aoFechar, aoFesta }: { alvo: Alvo; missoes: DefMissao[]; aoFechar: () => void; aoFesta: () => void }) {
  const { vista, caps, ciclo, codigo } = useAldeia();
  const nav = useNavigate();
  const C = ALDEIA.interface.cartao;
  const nome = alvo === "casa" ? ALDEIA.edificios.casa.nome : ALDEIA.edificios[alvo].nome;
  const abertas = new Set(caps.filter((c) => c.aberto).flatMap((c) => c.missoes.map((m) => m.id)));
  const espera = caps.find((c) => c.aEsperaDoProfessor && c.missoes.some((m) => m.edificio === alvo));
  const lista = missoes.filter((m) => abertas.has(m.id) || vista.aluno.progresso[m.id]);
  const festa = lista.find((m) => m.id === "festa" && !vista.aluno.progresso.festa);
  const arte = alvo === "casa" ? null : alvo;
  return (
    <Modal titulo={nome} aoFechar={aoFechar} largura={600}>
      <div className="grid gap-3 aldeia-cartao-missao">
        {arte && (
          <div className="aldeia-cartao-missao__arte" aria-hidden="true">
            <img src={urlPixel(`mundo/edificios/${arte}/edificio-${arte}-aberto-dia`)} alt="" style={{ imageRendering: "pixelated", height: 150 }} />
          </div>
        )}
        <h2 className="text-2xl">{nome}</h2>
        {lista.length === 0 && <p className="m-0">{espera ? texto(ALDEIA.dialogos.espera, ciclo) : C.semMissoes}</p>}
        <ul className="m-0 p-0 list-none grid gap-2">
          {lista.filter((m) => m.id !== "festa").map((m) => {
            const p = vista.aluno.progresso[m.id];
            const t = titulosMissao(m, ciclo);
            return (
              <li key={m.id} className="cartao p-3 grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-lg">{t.titulo}</strong>
                  <span className="etiqueta">{p ? `✓ ${C.feita}` : `! ${C.porFazer}`}</span>
                  {m.pratica && <span className="etiqueta">{C.praticaNaoConta}</span>}
                </div>
                <p className="m-0 text-sm">{t.briefing}</p>
                {p && <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>{C.melhor.replace("{pontos}", String(p.melhor))}</p>}
                <div className="flex flex-wrap gap-2">
                  {abertas.has(m.id) && <Botao onClick={() => nav(`/aldeia/${codigo}/missao/${m.id}`)}>{p ? C.repetir : C.comecar}</Botao>}
                  {p && m.tipo === "atividade" && <Botao variante="contorno" onClick={() => nav(`/aldeia/${codigo}/treinar/${m.id}`)}>{C.treinar}</Botao>}
                </div>
              </li>
            );
          })}
        </ul>
        {festa && <Botao grande onClick={aoFesta}>{ALDEIA.estadosEdificio.festivo}</Botao>}
        <div className="flex gap-2 flex-wrap">
          {alvo === "casa" && <Botao onClick={() => nav(`/aldeia/${codigo}/casa`)}>{ALDEIA.interface.hud.casa}</Botao>}
          <Botao variante="contorno" onClick={aoFechar}>{C.agoraNao}</Botao>
        </div>
      </div>
    </Modal>
  );
}

function comItem(a: Aparencia, item: string): Aparencia {
  const cat = ITEM.get(item)?.cat;
  return cat ? { ...a, [cat]: item } : a;
}

function EscolherPremio({ missao, aoEscolher, aoDepois }: { missao: string; aoEscolher: (item: string) => void; aoDepois: () => void }) {
  const { vista, d, ciclo } = useAldeia();
  const itens = ofertaPara(missao, d);
  const D = ALDEIA.interface.desbloqueio;
  const m = MISSAO.get(missao);
  return (
    <Modal titulo={D.titulo} aoFechar={aoDepois} largura={720}>
      <div className="grid gap-3">
        <span className="etiqueta" style={{ justifySelf: "center" }}>{D.missaoConcluida}{m ? ` · ${titulosMissao(m, ciclo).titulo}` : ""}</span>
        <h2 className="text-2xl text-center">{D.titulo}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {itens.map((i) => (
            <button key={i} type="button" className="aldeia-premio" onClick={() => aoEscolher(i)}>
              <Avatar aparencia={comItem(vista.aluno.aparencia, i)} escala={2} animar={false} rotulo="" />
              <strong>{ALDEIA.premios.itens[i] ?? i}</strong>
            </button>
          ))}
        </div>
        <div className="text-center">
          <Botao variante="discreto" onClick={aoDepois}>{D.depois}</Botao>
        </div>
      </div>
    </Modal>
  );
}

function Ganhou({ item, aoVestir, aoDepois }: { item: string; aoVestir: () => void; aoDepois: () => void }) {
  const { vista } = useAldeia();
  const D = ALDEIA.interface.desbloqueio;
  return (
    <Modal titulo={D.ganhaste.replace("{item}", ALDEIA.premios.itens[item] ?? item)} aoFechar={aoDepois} largura={560}>
      <div className="grid gap-3 justify-items-center text-center aldeia-ganhou">
        <Avatar aparencia={comItem(vista.aluno.aparencia, item)} anim="celebrar" escala={3} rotulo="" />
        <span className="etiqueta">{D.missaoConcluida}</span>
        <h2 className="text-2xl">{D.ganhaste.replace("{item}", ALDEIA.premios.itens[item] ?? item)}</h2>
        <p className="m-0">{preencherAluno(D.fica, vista.aluno)}</p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Botao onClick={aoVestir}>{D.vestir}</Botao>
          <Botao variante="contorno" onClick={aoDepois}>{D.depois}</Botao>
        </div>
      </div>
    </Modal>
  );
}

function CapituloConcluido({ n, aoFechar }: { n: number; aoFechar: () => void }) {
  const { ciclo } = useAldeia();
  const D = ALDEIA.interface.desbloqueio;
  const cap = (ALDEIA.capitulos as Record<string, { titulo: string; fecho: { c1: string } }>)[`c${n}`];
  const categoria: Record<number, string> = { 0: "paredes", 1: "portas", 2: "telhados", 3: "jardim", 4: "papel", 5: "chao", 6: "vitrine", 8: "moldura" };
  const nomeCat: Record<string, string> = { paredes: ALDEIA.interface.casa.paredesCasa, portas: ALDEIA.interface.casa.porta, telhados: ALDEIA.interface.casa.telhado, jardim: ALDEIA.interface.casa.jardim, papel: ALDEIA.interface.casa.paredes, chao: ALDEIA.interface.casa.chao, vitrine: ALDEIA.interface.casa.vitrine, moldura: ALDEIA.interface.casa.moldura };
  return (
    <Modal titulo={D.novoCapitulo} aoFechar={aoFechar}>
      <div className="grid gap-3 justify-items-center text-center">
        <img src={urlPixel(`mundo/interior/trofeus/trofeu-estatueta-cap-${n}`)} alt="" width={80} height={104} style={{ imageRendering: "pixelated" }} />
        <span className="etiqueta">{D.novoCapitulo}</span>
        <h2 className="text-2xl">{`${n} · ${cap?.titulo ?? ""}`}</h2>
        {cap && <p className="m-0">{texto(cap.fecho, ciclo)}</p>}
        <p className="m-0">{D.trofeu.replace("{trofeu}", `${ALDEIA.premios.trofeus.estatueta.replace("{n}", String(n)).replace("{titulo}", cap?.titulo ?? "")}`)}</p>
        {categoria[n] && <p className="m-0 font-bold">{D.novaCategoria.replace("{categoria}", nomeCat[categoria[n]])}</p>}
        <Botao onClick={aoFechar}>{ALDEIA.tutorial.continuar}</Botao>
      </div>
    </Modal>
  );
}
