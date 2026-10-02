// ─── Tutorial: passos curtos que mostram as funcionalidades. Pode saltar-se a qualquer momento. ──
import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { CONTEXTOS } from "../contextos";
import { FAIXAS } from "../motor/tipos";
import { Botao } from "../ui";

const CHAVE_VISTO = "ecd.tutorial.visto.v1";
export function tutorialVisto(): boolean {
  try {
    return localStorage.getItem(CHAVE_VISTO) === "1";
  } catch {
    return true;
  }
}
export function marcarTutorialVisto() {
  try {
    localStorage.setItem(CHAVE_VISTO, "1");
  } catch {
    /* nada */
  }
}

/** Pequenas ilustrações (HTML, não imagens) para o passo "Treinar: três maneiras". Decorativas: aria-hidden. */
function IlustracaoTeste() {
  const barras: [string, number][] = [["Teclado", 82], ["Interfaces", 64], ["Leitura", 91], ["Matemática", 47]];
  return (
    <div aria-hidden="true" className="rounded-lg p-3 grid gap-2" style={{ background: "var(--fundo)", border: "1px solid var(--linha)" }}>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tabular-nums" style={{ color: "var(--acento)", fontFamily: "var(--fonte-titulo)" }}>71</span>
        <span className="text-xs" style={{ color: "var(--suave)" }}>em 100 · Confiante</span>
      </div>
      {barras.map(([n, v]) => (
        <div key={n} className="grid gap-0.5 text-xs">
          <div className="flex justify-between"><span>{n}</span><span className="tabular-nums">{v}</span></div>
          <div className="barra" style={{ height: 6 }}><div style={{ width: `${v}%`, background: v >= 85 ? "var(--b4)" : v >= 65 ? "var(--b3)" : v >= 40 ? "var(--b2)" : "var(--b1)" }} /></div>
        </div>
      ))}
    </div>
  );
}
function IlustracaoAtividade() {
  const fonte = "A turma visitou o museu.";
  const escritos = 14;
  return (
    <div aria-hidden="true" className="rounded-lg p-3 grid gap-2" style={{ background: "var(--fundo)", border: "1px solid var(--linha)" }}>
      <div className="flex gap-1 flex-wrap">
        <span className="etiqueta">Teclado</span>
        <span className="etiqueta">Nível 2 · Base</span>
      </div>
      <div className="dactilo" style={{ fontSize: ".95rem", lineHeight: 1.6 }}>
        {Array.from(fonte).map((c, i) => (
          <span key={i} className={i < escritos ? (i === 9 ? "errado" : "certo") : i === escritos ? "atual" : ""}>{c}</span>
        ))}
      </div>
      <div className="barra" style={{ height: 6 }}><div style={{ width: "62%" }} /></div>
      <div className="text-xs" style={{ color: "var(--suave)" }}>★★☆ · melhor 78</div>
    </div>
  );
}
function IlustracaoCodigo() {
  return (
    <div aria-hidden="true" className="rounded-lg p-3 grid gap-2 justify-items-center text-center" style={{ background: "var(--fundo)", border: "1px solid var(--linha)" }}>
      <span className="text-xs" style={{ color: "var(--suave)" }}>Código do professor</span>
      <span className="text-2xl font-extrabold tracking-wider" style={{ fontFamily: "var(--fonte-mono)" }}>TEC7·4F7KQ2</span>
      <span className="text-xs" style={{ color: "var(--suave)" }}>Nível 3 · 4 atividades</span>
      <span className="botao" style={{ minHeight: 32, padding: "4px 12px", fontSize: ".85rem" }}>Entrar</span>
    </div>
  );
}

function Mini({ titulo, children, figura }: { titulo: string; children: ReactNode; figura?: ReactNode }) {
  return (
    <div className="cartao p-4 grid gap-2 content-start">
      {figura}
      <strong style={{ fontFamily: "var(--fonte-titulo)" }}>{titulo}</strong>
      <span className="text-sm" style={{ color: "var(--suave)" }}>
        {children}
      </span>
    </div>
  );
}

const PASSOS: { titulo: string; corpo: ReactNode }[] = [
  {
    titulo: "Bem-vindo ao Ensaio às Competências Digitais",
    corpo: (
      <>
        <p className="m-0">As provas são cada vez mais feitas no computador. Aqui treinas o que essas provas pressupõem: escrever no teclado, ler ecrãs, usar menus e formulários, arrastar, usar atalhos, procurar num texto longo e escrever matemática.</p>
        <p className="m-0">É gratuito e não tem contas. Demora dois minutos a ver este tutorial. Podes saltá-lo quando quiseres.</p>
      </>
    ),
  },
  {
    titulo: "Treinar: três maneiras",
    corpo: (
      <div className="grid gap-3 md:grid-cols-3">
        <Mini titulo="Teste" figura={<IlustracaoTeste />}>Uma sequência de atividades para o teu nível de ensino. No fim recebes o teu perfil de competências.</Mini>
        <Mini titulo="Atividade" figura={<IlustracaoAtividade />}>Escolhes uma atividade e um de cinco níveis, do 1 (Iniciação) ao 5 (Perito). Repetes à vontade.</Mini>
        <Mini titulo="Código" figura={<IlustracaoCodigo />}>O professor montou uma prova e deu-te um código. Escreves o código e fazes essa prova.</Mini>
      </div>
    ),
  },
  {
    titulo: "Escolhe o cenário",
    corpo: (
      <>
        <p className="m-0">Antes de começar escolhes onde se passa a história. O cenário muda as personagens, os títulos e os textos das tarefas. As regras e a pontuação são iguais.</p>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.values(CONTEXTOS).map((c) => (
            <Mini key={c.id} titulo={c.nome}>
              {c.descricao} Personagens: {c.personagens.responsavel}, {c.personagens.ficheiros}, {c.personagens.revisao}, {c.personagens.relogio}.
            </Mini>
          ))}
        </div>
      </>
    ),
  },
  {
    titulo: "Como corre uma atividade",
    corpo: (
      <ol className="grid gap-3 md:grid-cols-4 list-none m-0 p-0">
        {[
          ["1. Briefing", "Uma personagem explica a tarefa em uma frase."],
          ["2. Prática", "Um item curto que não conta, para perceberes o que fazer."],
          ["3. Avaliação", "A tarefa a sério. Algumas têm um relógio suave."],
          ["4. Resultado", "Pontuação de 0 a 100, estrelas e uma dica concreta."],
        ].map(([t, d]) => (
          <li key={t}>
            <Mini titulo={t}>{d}</Mini>
          </li>
        ))}
      </ol>
    ),
  },
  {
    titulo: "Pontuação",
    corpo: (
      <>
        <p className="m-0">Cada atividade dá uma pontuação de 0 a 100. Abaixo de 50 pontos, convém tentar novamente. De 50 a 74 ganhas uma estrela, de 75 a 90 duas e de 91 a 100 três. O teu melhor resultado em cada nível fica guardado neste navegador.</p>
        <div className="faixa" role="list">
          {FAIXAS.map((f) => (
            <div key={f.nome} role="listitem">
              <b style={{ fontFamily: "var(--fonte-titulo)" }}>{f.nome}</b>
              <br />
              <span className="text-xs tabular-nums" style={{ color: "var(--suave)" }}>
                {f.min} a {f.max}
              </span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    titulo: "Ajusta à tua medida",
    corpo: (
      <>
        <p className="m-0">Em Definições podes mudar o aspeto (Original ou Mosaico), o tema claro ou escuro, o tamanho do texto e o tempo alargado.</p>
        <p className="m-0">Tudo funciona só com o teclado. Quando há arrastar, há sempre outra maneira: tocar no item e depois no destino.</p>
      </>
    ),
  },
  {
    titulo: "Para professores",
    corpo: (
      <div className="grid gap-3 md:grid-cols-3">
        <Mini titulo="Montar">Escolhe o nível, as atividades e como os alunos se identificam (número de turma, alcunha ou nada).</Mini>
        <Mini titulo="Partilhar">Recebe um código e um QR para projetar na sala.</Mini>
        <Mini titulo="Acompanhar">Recebe os resultados por email, se quiser, e consulta-os numa página privada com exportação CSV.</Mini>
      </div>
    ),
  },
  {
    titulo: "Os teus dados",
    corpo: (
      <>
        <p className="m-0">Não há contas. Os teus resultados ficam no teu navegador. Cada atividade envia um registo anónimo, sem nome nem IP, para estatísticas sobre as competências que faltam. Podes desligar isso em Definições.</p>
        <p className="m-0">Os números de todos aparecem no Observatório. Grupos com menos de 20 tentativas ficam ocultos.</p>
      </>
    ),
  },
];

export function Tutorial() {
  const [i, setI] = useState(0);
  const navegar = useNavigate();
  const ultimo = i === PASSOS.length - 1;

  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      const alvo = e.target as HTMLElement;
      if (alvo.closest("input, textarea, select")) return;
      if (e.key === "ArrowRight") setI((x) => Math.min(PASSOS.length - 1, x + 1));
      if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, []);

  useEffect(() => {
    if (ultimo) marcarTutorialVisto();
  }, [ultimo]);

  function saltar() {
    marcarTutorialVisto();
    navegar("/");
  }

  return (
    <div className="grid gap-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm" style={{ color: "var(--suave)" }}>
          Tutorial · passo {i + 1} de {PASSOS.length}
        </span>
        <Botao variante="discreto" className="ml-auto" onClick={saltar}>
          Saltar o tutorial
        </Botao>
      </div>
      <section className="cartao p-6 md:p-8 grid gap-4" aria-live="polite" aria-labelledby="tut-titulo" style={{ minHeight: 320 }}>
        <h1 id="tut-titulo" className="text-3xl md:text-4xl">
          {PASSOS[i].titulo}
        </h1>
        {PASSOS[i].corpo}
      </section>
      <div className="flex items-center gap-2 justify-center" role="tablist" aria-label="Passos do tutorial">
        {PASSOS.map((p, k) => (
          <button key={p.titulo} type="button" role="tab" aria-selected={k === i} aria-label={`Passo ${k + 1}: ${p.titulo}`} onClick={() => setI(k)} style={{ minWidth: 28, height: 28, border: 0, cursor: "pointer", background: "transparent", padding: 0, display: "grid", placeItems: "center" }}>
            <span aria-hidden="true" style={{ display: "block", width: k === i ? 28 : 12, height: 12, borderRadius: 99, background: k === i ? "var(--acento)" : "var(--tecla-borda)", transition: "width .2s" }} />
          </button>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap justify-between">
        <Botao variante="contorno" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>
          Anterior
        </Botao>
        {ultimo ? (
          <Link to="/" className="botao botao--grande">
            Voltar ao início
          </Link>
        ) : (
          <Botao onClick={() => setI((x) => x + 1)}>Seguinte</Botao>
        )}
      </div>
      <p className="text-center text-xs m-0" style={{ color: "var(--suave)" }}>
        Podes usar as setas ← → do teclado para mudar de passo.
      </p>
    </div>
  );
}

/** Aviso discreto na página inicial, só na primeira visita. */
export function AvisoTutorial() {
  const [visivel, setVisivel] = useState(() => !tutorialVisto());
  if (!visivel) return null;
  return (
    <div className="cartao p-4 flex flex-wrap items-center gap-3 max-w-4xl w-full mx-auto" role="region" aria-label="Primeira visita" style={{ borderColor: "var(--acento)", borderWidth: 2 }}>
      <span className="flex-1 min-w-48 font-bold">Como funciona o ECD?</span>
      <Link to="/tutorial" className="botao">
        Ver o tutorial
      </Link>
      <Botao
        variante="discreto"
        onClick={() => {
          marcarTutorialVisto();
          setVisivel(false);
        }}
      >
        Agora não
      </Botao>
    </div>
  );
}
