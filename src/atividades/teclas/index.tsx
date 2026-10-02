// ─── Atividade 8 · Teclas Mágicas (atalhos de teclado) ───────────────────────
// Tarefas de edição numa caixa de texto. Detetamos se foram feitas por atalho (1 ponto) ou pelos botões/rato (0,5).
// Atalhos reservados pelo navegador (Ctrl+W, Ctrl+T, Alt+Tab) nunca são pedidos: aparecem como perguntas de reconhecimento.
import { useEffect, useMemo, useRef, useState } from "react";
import { E_MAC, TECLA_CTRL } from "../../preferencias/preferencias";
import { definir, limitar, type PropsAtividade } from "../../motor/tipos";
import { Instrucao } from "../../motor/util";
import { misturar } from "../../motor/aleatorio";
import { Botao, BotaoRadio } from "../../ui";

type BotaoEdicao = "copiar" | "colar" | "cortar" | "desfazer" | "refazer" | "selecionarTudo" | "apagar";

type Tarefa =
  | { tipo: "editar"; instrucao: string; inicial: string; esperado: string | string[]; atalhos: string[]; selecionar?: [number, number]; exigeAlteracao?: boolean; botoes: BotaoEdicao[] }
  | { tipo: "foco"; instrucao: string; atalhos: string[]; inverso?: boolean }
  | { tipo: "reconhecer"; pergunta: string; opcoes: string[]; correta: number };

export interface ConfigTeclas {
  tarefas: Tarefa[];
}

const C = TECLA_CTRL; // "Ctrl" ou "⌘"

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigTeclas> = {
  1: {
    tarefas: [
      { tipo: "editar", instrucao: "Escreve a letra A maiúscula no fim do texto (usa Shift).", inicial: "casa ", esperado: "casa A", atalhos: ["Shift", "CapsLock"], botoes: [] },
      { tipo: "editar", instrucao: "Apaga a última letra com a tecla Backspace (a tecla ←, por cima do Enter).", inicial: "casas", esperado: "casa", atalhos: ["Backspace"], botoes: ["apagar"] },
      { tipo: "editar", instrucao: "Faz uma nova linha no fim (tecla Enter) e escreve ok.", inicial: "olá", esperado: "olá\nok", atalhos: ["Enter"], botoes: [] },
      { tipo: "editar", instrucao: "Escreve um espaço e a palavra sol no fim.", inicial: "O", esperado: "O sol", atalhos: ["Space"], botoes: [] },
      { tipo: "editar", instrucao: "Leva o cursor ao início do texto com as setas (ou a tecla Home) e escreve O e um espaço.", inicial: "gato", esperado: "O gato", atalhos: ["ArrowLeft", "Home"], botoes: [] },
    ],
  },
  2: {
    tarefas: [
      { tipo: "editar", instrucao: `Copia a frase destacada (${C}+C), vai para o fim e cola-a (${C}+V).`, inicial: "A Lia escreveu a frase.", selecionar: [0, 23], esperado: "A Lia escreveu a frase. A Lia escreveu a frase.", atalhos: [`${C}+C`, `${C}+V`], botoes: ["copiar", "colar"] },
      { tipo: "editar", instrucao: `Escreve a palavra preto no fim e depois desfaz (${C}+Z) até o texto voltar ao original.`, inicial: "O gato ", esperado: "O gato ", exigeAlteracao: true, atalhos: [`${C}+Z`], botoes: ["desfazer"] },
      { tipo: "foco", instrucao: "O cursor está no primeiro campo. Passa para o campo seguinte sem usar o rato (tecla Tab) e escreve ok.", atalhos: ["Tab"] },
      { tipo: "editar", instrucao: "Apaga a última letra com Backspace.", inicial: "jornall", esperado: "jornal", atalhos: ["Backspace"], botoes: ["apagar"] },
      { tipo: "reconhecer", pergunta: "Qual destes atalhos copia o texto selecionado?", opcoes: [`${C}+C`, `${C}+V`, `${C}+X`], correta: 0 },
      { tipo: "reconhecer", pergunta: "Que tecla serve para saltar para o campo seguinte num formulário?", opcoes: ["Tab", "Esc", "Enter"], correta: 0 },
    ],
  },
  3: {
    tarefas: [
      { tipo: "editar", instrucao: `Seleciona tudo (${C}+A) e apaga.`, inicial: "Este texto vai desaparecer todo.", esperado: "", atalhos: [`${C}+A`], botoes: ["selecionarTudo", "apagar"] },
      { tipo: "editar", instrucao: `Corta a palavra destacada (${C}+X) e cola-a no fim (${C}+V).`, inicial: "vermelho carro", selecionar: [0, 8], esperado: ["carro vermelho", "carrovermelho", " carro vermelho"], atalhos: [`${C}+X`, `${C}+V`], botoes: ["cortar", "colar"] },
      { tipo: "editar", instrucao: `Copia a frase destacada e cola-a duas vezes no fim.`, inicial: "Bis.", selecionar: [0, 4], esperado: "Bis. Bis. Bis.", atalhos: [`${C}+C`, `${C}+V`], botoes: ["copiar", "colar"] },
      { tipo: "foco", instrucao: "Estás no segundo campo. Volta ao primeiro sem usar o rato (Shift+Tab) e escreve ok.", atalhos: ["Shift+Tab"], inverso: true },
      { tipo: "editar", instrucao: `Escreve azul no fim e depois desfaz (${C}+Z) até ficar como estava.`, inicial: "Céu ", esperado: "Céu ", exigeAlteracao: true, atalhos: [`${C}+Z`], botoes: ["desfazer"] },
      { tipo: "reconhecer", pergunta: `Que atalho abre a caixa de procura numa página ou documento?`, opcoes: [`${C}+F`, `${C}+P`, `${C}+S`], correta: 0 },
      { tipo: "reconhecer", pergunta: "Que tecla fecha uma janela ou menu aberto, sem guardar nada?", opcoes: ["Esc", "Enter", "Delete"], correta: 0 },
    ],
  },
  4: {
    tarefas: [
      { tipo: "editar", instrucao: `Seleciona a primeira palavra só com o teclado (${C}+Shift+→) e apaga-a.`, inicial: "Rápido jornal digital", esperado: ["jornal digital", " jornal digital"], atalhos: [`${C}+Shift+ArrowRight`, "Shift+ArrowRight", "Shift+End"], botoes: ["apagar"] },
      { tipo: "editar", instrucao: `Escreve azul no fim, desfaz (${C}+Z) e volta a refazer (${C}+Y ou ${C}+Shift+Z).`, inicial: "Mar ", esperado: "Mar azul", atalhos: [`${C}+Y`, `${C}+Shift+Z`], exigeAlteracao: true, botoes: ["desfazer", "refazer"] },
      { tipo: "editar", instrucao: "Vai ao início do texto com a tecla Home e escreve Hoje e um espaço.", inicial: "o jornal sai.", esperado: "Hoje o jornal sai.", atalhos: ["Home", `${C}+Home`], botoes: [] },
      { tipo: "editar", instrucao: "Vai ao fim do texto com a tecla End e escreve um ponto final.", inicial: "A edição fechou", esperado: "A edição fechou.", atalhos: ["End", `${C}+End`], botoes: [] },
      { tipo: "editar", instrucao: `Seleciona tudo (${C}+A), corta (${C}+X), escreve Título: e cola (${C}+V).`, inicial: "Eleições", esperado: ["Título: Eleições", "Título:Eleições"], atalhos: [`${C}+A`, `${C}+X`, `${C}+V`], botoes: ["selecionarTudo", "cortar", "colar"] },
      { tipo: "foco", instrucao: "Passa para o campo seguinte com Tab e escreve ok.", atalhos: ["Tab"] },
      { tipo: "reconhecer", pergunta: "Que atalho alterna entre janelas abertas no computador?", opcoes: ["Alt+Tab (Windows) / ⌘+Tab (Mac)", `${C}+Tab`, "Shift+Tab"], correta: 0 },
      { tipo: "reconhecer", pergunta: "Que atalho fecha o separador atual do navegador?", opcoes: [`${C}+W`, `${C}+Q`, `${C}+E`], correta: 0 },
    ],
  },
  5: {
    tarefas: [
      { tipo: "editar", instrucao: `Apaga a última palavra de uma vez (${E_MAC ? "⌥" : "Ctrl"}+Backspace).`, inicial: "fecho de edição amanhã", esperado: ["fecho de edição ", "fecho de edição"], atalhos: ["Ctrl+Backspace", "Alt+Backspace"], botoes: ["apagar"] },
      { tipo: "editar", instrucao: `Seleciona do cursor até ao fim da linha (Shift+End) e apaga.`, inicial: "Manter | apagar isto", selecionar: [7, 7], esperado: "Manter ", atalhos: ["Shift+End", `${C}+Shift+End`], botoes: ["apagar"] },
      { tipo: "editar", instrucao: `Seleciona do cursor até ao início (Shift+Home) e escreve Início: por cima.`, inicial: "apaga isto | manter", selecionar: [12, 12], esperado: ["Início: manter", "Início:manter"], atalhos: ["Shift+Home", `${C}+Shift+Home`], botoes: [] },
      { tipo: "editar", instrucao: `Duplica a linha: seleciona tudo, copia, vai ao fim, Enter e cola.`, inicial: "Linha única", esperado: "Linha única\nLinha única", atalhos: [`${C}+A`, `${C}+C`, `${C}+V`], botoes: ["selecionarTudo", "copiar", "colar"] },
      { tipo: "editar", instrucao: `Escreve X no fim, desfaz com ${C}+Z, escreve Y no fim.`, inicial: "Fim ", esperado: "Fim Y", exigeAlteracao: true, atalhos: [`${C}+Z`], botoes: ["desfazer"] },
      { tipo: "foco", instrucao: "Volta ao primeiro campo com Shift+Tab e escreve ok.", atalhos: ["Shift+Tab"], inverso: true },
      { tipo: "reconhecer", pergunta: "Que atalho reabre o último separador fechado por engano?", opcoes: [`${C}+Shift+T`, `${C}+Shift+N`, `${C}+R`], correta: 0 },
      { tipo: "reconhecer", pergunta: "Que tecla recarrega a página num navegador?", opcoes: ["F5", "F1", "F11"], correta: 0 },
      { tipo: "reconhecer", pergunta: "Que atalho leva o cursor à barra de endereço do navegador?", opcoes: [`${C}+L`, `${C}+B`, `${C}+U`], correta: 0 },
    ],
  },
};

/** Transforma um evento de tecla em texto do tipo "Ctrl+Shift+ArrowRight" (⌘ conta como Ctrl). */
export function nomeTecla(e: { key: string; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; altKey: boolean }): string {
  const partes: string[] = [];
  if (e.ctrlKey || e.metaKey) partes.push("Ctrl");
  if (e.altKey) partes.push("Alt");
  if (e.shiftKey && !["Shift"].includes(e.key)) partes.push("Shift");
  let k = e.key === " " ? "Space" : e.key;
  if (k.length === 1) k = k.toUpperCase();
  partes.push(k);
  return partes.join("+");
}
function normalizarAtalho(a: string): string {
  return a.replace("⌘", "Ctrl").replace("⌥", "Alt");
}
/** Compara ignorando espaços e quebras de linha. */
function iguais(a: string, b: string): boolean {
  return a.replace(/\s+/g, "") === b.replace(/\s+/g, "");
}

function Teclas({ config, aoTerminar }: PropsAtividade<ConfigTeclas>) {
  const [indice, setIndice] = useState(0);
  const pontos = useRef(0);
  const detalhe = useRef({ atalho: 0, rato: 0, falhou: 0 });
  const inicio = useRef(performance.now());
  // Ordem das tarefas diferente em cada tentativa (as perguntas de reconhecimento ficam no fim).
  const [lista] = useState(() => [...misturar(config.tarefas.filter((t) => t.tipo !== "reconhecer")), ...misturar(config.tarefas.filter((t) => t.tipo === "reconhecer"))]);
  const tarefa = lista[indice];

  function concluir(p: 1 | 0.5 | 0) {
    pontos.current += p;
    if (p === 1) detalhe.current.atalho++;
    else if (p === 0.5) detalhe.current.rato++;
    else detalhe.current.falhou++;
    const prox = indice + 1;
    if (prox >= lista.length) {
      aoTerminar({ pontuacao: limitar((100 * pontos.current) / lista.length), duracaoMs: performance.now() - inicio.current, metricas: { ...detalhe.current, tarefas: lista.length } });
      return;
    }
    setIndice(prox);
  }

  return (
    <div className="grid gap-4">
      {tarefa.tipo === "editar" && <TarefaEditar key={indice} numero={indice + 1} total={lista.length} t={tarefa} aoConcluir={concluir} />}
      {tarefa.tipo === "foco" && <TarefaFoco key={indice} numero={indice + 1} total={lista.length} t={tarefa} aoConcluir={concluir} />}
      {tarefa.tipo === "reconhecer" && <TarefaReconhecer key={indice} numero={indice + 1} total={lista.length} t={tarefa} aoConcluir={concluir} />}
    </div>
  );
}

function TarefaEditar({ t, numero, total, aoConcluir }: { t: Extract<Tarefa, { tipo: "editar" }>; numero: number; total: number; aoConcluir: (p: 1 | 0.5 | 0) => void }) {
  const area = useRef<HTMLTextAreaElement>(null);
  const atalhoVisto = useRef(false);
  const botaoUsado = useRef(false);
  const alterou = useRef(false);
  const historico = useRef<string[]>([t.inicial]);
  const refazer = useRef<string[]>([]);
  const prancheta = useRef("");
  const [feito, setFeito] = useState(false);
  const esperados = useMemo(() => (Array.isArray(t.esperado) ? t.esperado : [t.esperado]), [t.esperado]);
  const atalhos = useMemo(() => t.atalhos.map(normalizarAtalho), [t.atalhos]);

  useEffect(() => {
    const a = area.current;
    if (!a) return;
    a.value = t.inicial;
    a.focus();
    if (t.selecionar) a.setSelectionRange(t.selecionar[0], t.selecionar[1]);
    else a.setSelectionRange(a.value.length, a.value.length);
  }, [t]);

  function verificar() {
    const v = area.current?.value ?? "";
    if (v !== t.inicial) alterou.current = true;
    const ok = esperados.some((e) => iguais(e, v)) && (!t.exigeAlteracao || alterou.current);
    if (ok && !feito) {
      setFeito(true);
      window.setTimeout(() => aoConcluir(atalhoVisto.current ? 1 : 0.5), 500);
    }
  }
  function aoTecla(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const nome = nomeTecla(e);
    if (atalhos.includes(nome) || atalhos.includes(e.key)) atalhoVisto.current = true;
    // Enter/Space/Backspace como "atalhos" dos níveis iniciais.
    if (atalhos.includes("Space") && e.key === " ") atalhoVisto.current = true;
    if (atalhos.includes("Shift") && e.key === "Shift") atalhoVisto.current = true;
  }
  function aoInput() {
    const v = area.current?.value ?? "";
    historico.current.push(v);
    refazer.current = [];
    verificar();
  }
  function botao(acao: BotaoEdicao) {
    const a = area.current;
    if (!a) return;
    botaoUsado.current = true;
    const ini = a.selectionStart,
      fim = a.selectionEnd;
    const v = a.value;
    const sel = v.slice(ini, fim);
    const definir = (novo: string, cursor: number) => {
      a.value = novo;
      a.setSelectionRange(cursor, cursor);
      historico.current.push(novo);
      refazer.current = [];
    };
    switch (acao) {
      case "copiar":
        prancheta.current = sel;
        break;
      case "cortar":
        prancheta.current = sel;
        definir(v.slice(0, ini) + v.slice(fim), ini);
        break;
      case "colar":
        definir(v.slice(0, ini) + prancheta.current + v.slice(fim), ini + prancheta.current.length);
        break;
      case "selecionarTudo":
        a.setSelectionRange(0, v.length);
        break;
      case "apagar":
        if (ini !== fim) definir(v.slice(0, ini) + v.slice(fim), ini);
        else if (ini > 0) definir(v.slice(0, ini - 1) + v.slice(fim), ini - 1);
        break;
      case "desfazer": {
        if (historico.current.length > 1) {
          refazer.current.push(historico.current.pop()!);
          const ant = historico.current[historico.current.length - 1];
          a.value = ant;
          a.setSelectionRange(ant.length, ant.length);
        }
        break;
      }
      case "refazer": {
        const r = refazer.current.pop();
        if (r !== undefined) {
          historico.current.push(r);
          a.value = r;
          a.setSelectionRange(r.length, r.length);
        }
        break;
      }
    }
    a.focus();
    if (a.value !== t.inicial) alterou.current = true;
    verificar();
  }
  const ROTULO: Record<BotaoEdicao, string> = { copiar: "Copiar", colar: "Colar", cortar: "Cortar", desfazer: "Desfazer", refazer: "Refazer", selecionarTudo: "Selecionar tudo", apagar: "Apagar" };

  return (
    <div className="grid gap-3">
      <Instrucao numero={numero} total={total}>
        {feito ? (atalhoVisto.current ? "Feito com atalho. Ponto completo." : "Feito com o rato ou os botões. Meio ponto.") : t.instrucao}
      </Instrucao>
      <label htmlFor="caixa-teclas" className="sr-only">
        Caixa de edição
      </label>
      <textarea id="caixa-teclas" ref={area} rows={4} className="cartao p-4 w-full" style={{ fontFamily: "var(--fonte-mono)", fontSize: "1.1rem" }} defaultValue={t.inicial} onKeyDown={aoTecla} onInput={aoInput} spellCheck={false} autoCapitalize="off" disabled={feito} />
      {t.botoes.length > 0 && (
        <div className="flex gap-2 flex-wrap" aria-label="Alternativa com o rato">
          {t.botoes.map((b) => (
            <Botao key={b} variante="contorno" onClick={() => botao(b)} disabled={feito}>
              {ROTULO[b]}
            </Botao>
          ))}
        </div>
      )}
      <div>
        <Botao variante="discreto" onClick={() => aoConcluir(0)} disabled={feito}>
          Saltar esta tarefa
        </Botao>
      </div>
    </div>
  );
}

function TarefaFoco({ t, numero, total, aoConcluir }: { t: Extract<Tarefa, { tipo: "foco" }>; numero: number; total: number; aoConcluir: (p: 1 | 0.5 | 0) => void }) {
  const a = useRef<HTMLInputElement>(null);
  const b = useRef<HTMLInputElement>(null);
  const atalho = useRef(false);
  const [feito, setFeito] = useState(false);
  const alvo = t.inverso ? a : b;
  const origem = t.inverso ? b : a;
  useEffect(() => {
    origem.current?.focus();
  }, [origem]);
  function tecla(e: React.KeyboardEvent) {
    const n = nomeTecla(e);
    if (t.atalhos.includes(n) || t.atalhos.includes(e.key)) atalho.current = true;
  }
  function verificar() {
    if (feito) return;
    if ((alvo.current?.value ?? "").trim().toLowerCase() === "ok") {
      setFeito(true);
      window.setTimeout(() => aoConcluir(atalho.current ? 1 : 0.5), 500);
    }
  }
  return (
    <div className="grid gap-3">
      <Instrucao numero={numero} total={total}>
        {feito ? (atalho.current ? "Feito com o teclado. Ponto completo." : "Mudaste de campo com o rato. Meio ponto.") : t.instrucao}
      </Instrucao>
      <div className="cartao p-4 grid gap-3 md:grid-cols-2">
        <div className="campo">
          <label htmlFor="foco-a">Primeiro campo</label>
          <input id="foco-a" ref={a} onKeyDown={tecla} onInput={verificar} disabled={feito} autoComplete="off" />
        </div>
        <div className="campo">
          <label htmlFor="foco-b">Segundo campo</label>
          <input id="foco-b" ref={b} onKeyDown={tecla} onInput={verificar} disabled={feito} autoComplete="off" />
        </div>
      </div>
      <div>
        <Botao variante="discreto" onClick={() => aoConcluir(0)} disabled={feito}>
          Saltar esta tarefa
        </Botao>
      </div>
    </div>
  );
}

function TarefaReconhecer({ t, numero, total, aoConcluir }: { t: Extract<Tarefa, { tipo: "reconhecer" }>; numero: number; total: number; aoConcluir: (p: 1 | 0.5 | 0) => void }) {
  const [escolha, setEscolha] = useState<number | null>(null);
  const [feito, setFeito] = useState(false);
  const ordem = useMemo(() => misturar(t.opcoes.map((_, i) => i)), [t.opcoes]);
  return (
    <div className="grid gap-3">
      <Instrucao numero={numero} total={total}>
        {feito ? (escolha === t.correta ? "Certo." : `Errado. A resposta era ${t.opcoes[t.correta]}.`) : t.pergunta}
      </Instrucao>
      <fieldset className="cartao p-4 grid gap-1 border-0">
        <legend className="sr-only">Opções</legend>
        {ordem.map((i) => (
          <BotaoRadio key={i} id={`rec-${i}`} name="rec" rotulo={t.opcoes[i]} checked={escolha === i} disabled={feito} onChange={() => setEscolha(i)} />
        ))}
      </fieldset>
      <div>
        <Botao
          disabled={escolha === null || feito}
          onClick={() => {
            setFeito(true);
            window.setTimeout(() => aoConcluir(escolha === t.correta ? 1 : 0), 900);
          }}
        >
          Responder
        </Botao>
      </div>
    </div>
  );
}

export const definicao = definir<ConfigTeclas>({
  slug: "teclas",
  numero: 8,
  dominio: "atalhos",
  titulo: { jornal: "Teclas Mágicas", laboratorio: "Teclas de Laboratório" },
  descricao: `Pequenas edições com o teclado: copiar, colar, desfazer, selecionar, saltar de campo. Mac mostra ⌘ em vez de Ctrl.`,
  duracao: "2 a 4 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ tarefas: [{ tipo: "editar", instrucao: "Apaga a última letra com Backspace.", inicial: "olá!", esperado: "olá", atalhos: ["Backspace"], botoes: ["apagar"] }] }),
  Componente: Teclas,
  dica: (m) => {
    if (Number(m.rato) >= Number(m.atalho)) return `Experimenta fazer as mesmas ações só com o teclado: ${TECLA_CTRL}+C copia, ${TECLA_CTRL}+V cola, ${TECLA_CTRL}+Z desfaz. Poupa segundos em cada resposta.`;
    return "Já dominas os atalhos básicos. O próximo passo é a seleção com Shift e as setas, sem levantar as mãos do teclado.";
  },
});
