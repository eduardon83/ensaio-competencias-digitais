// ─── Atividade 2 · O Painel / A Consola (literacia de interfaces) ────────────
// Um sítio simulado com controlos reais (não imagens). As instruções aparecem uma a uma.
// Pontuação: 1 ponto à primeira, 0,5 à segunda, 0 depois; menos até 10 por tempo parado acima de 20 s por tarefa.

import { useEffect, useMemo, useRef, useState } from "react";
import type { Contexto } from "../../preferencias/preferencias";
import { definir, limitar, type PropsAtividade } from "../../motor/tipos";
import { Botao, BotaoRadio, CaixaVerificacao, ForcarClaro, Interruptor, Seletor } from "../../ui";

export interface ConfigPainel {
  /** Tarefas possíveis neste nível; em cada tentativa sorteiam-se `n`, por ordem aleatória, uma por grupo de controlo. */
  pool: string[];
  n: number;
  /** Nível mais alto: instruções sem pistas (sem "☰", sem indicar onde fica o controlo). */
  dificil?: boolean;
}

export interface Estado {
  notificacoes: boolean;
  distrito: string;
  janelaAberta: boolean;
  pagina: number;
  secao: string;
  artigoAberto: boolean;
  usouCaminho: boolean;
  newsletter: boolean;
  tamanho: string;
  menuAberto: boolean;
  menuEscolha: string | null;
  acordeao: string | null;
  termos: boolean;
  enviado: boolean;
  rascunhoApagado: boolean;
  desfeito: boolean;
  volume: number;
  pesquisa: string;
  pesquisaEnviada: string | null;
  ligacaoAberta: string | null;
  data: string;
  separador: string;
  tentouEnviarBloqueado: boolean;
}

export const INICIAL: Estado = {
  notificacoes: false,
  distrito: "",
  janelaAberta: false,
  pagina: 1,
  secao: "inicio",
  artigoAberto: false,
  usouCaminho: false,
  newsletter: false,
  tamanho: "medio",
  menuAberto: false,
  menuEscolha: null,
  acordeao: null,
  termos: false,
  enviado: false,
  rascunhoApagado: false,
  desfeito: false,
  volume: 20,
  pesquisa: "",
  pesquisaEnviada: null,
  ligacaoAberta: null,
  data: "",
  separador: "noticias",
  tentouEnviarBloqueado: false,
};

interface Rotulos {
  sitio: string;
  secoes: { id: string; nome: string }[];
  separadores: { id: string; nome: string }[];
  artigos: string[]; // título do artigo aberto em cada secção (índices 1..3)
  distritoRotulo: string;
  acordeoes: { id: string; titulo: string; texto: string }[];
  menu: string[];
  rascunho: string;
  pesquisaAlvo: string;
  volumeRotulo: string;
}

const ROTULOS: Record<Contexto, Rotulos> = {
  jornal: {
    sitio: "O Recreio · jornal da escola",
    secoes: [
      { id: "inicio", nome: "Início" },
      { id: "desporto", nome: "Desporto" },
      { id: "cultura", nome: "Cultura" },
      { id: "escola", nome: "Escola" },
    ],
    separadores: [
      { id: "noticias", nome: "Notícias" },
      { id: "cultura", nome: "Cultura" },
      { id: "opiniao", nome: "Opinião" },
    ],
    artigos: ["", "Torneio de futebol: final no sábado", "Concerto de primavera esgota bilhetes", "Novo horário da cantina a partir de segunda"],
    distritoRotulo: "Distrito da escola",
    acordeoes: [
      { id: "horario", titulo: "Horário", texto: "A redação abre às 13h30 e fecha às 17h00." },
      { id: "entregas", titulo: "Entregas", texto: "Os textos entram até quinta-feira." },
      { id: "fotos", titulo: "Fotografias", texto: "Fotos em JPG, mínimo 1200 px." },
      { id: "assinaturas", titulo: "Assinaturas", texto: "Todos os textos levam o nome do autor." },
    ],
    menu: ["Início", "Edições", "Contactos", "Arquivo", "Sobre o jornal"],
    rascunho: "Rascunho: Visita ao museu",
    pesquisaAlvo: "horário",
    volumeRotulo: "Volume do podcast",
  },
  laboratorio: {
    sitio: "Laboratório 3 · consola",
    secoes: [
      { id: "inicio", nome: "Início" },
      { id: "desporto", nome: "Amostras" },
      { id: "cultura", nome: "Resultados" },
      { id: "escola", nome: "Equipamento" },
    ],
    separadores: [
      { id: "noticias", nome: "Ensaios" },
      { id: "cultura", nome: "Resultados" },
      { id: "opiniao", nome: "Notas" },
    ],
    artigos: ["", "Amostra A-104: leitura concluída", "Ensaio de pH: resultados da semana", "Microscópio MX-200 de volta à bancada"],
    distritoRotulo: "Distrito do laboratório",
    acordeoes: [
      { id: "horario", titulo: "Horário", texto: "O laboratório abre às 9h00 e fecha às 18h00." },
      { id: "entregas", titulo: "Reagentes", texto: "Pedidos até quarta-feira." },
      { id: "fotos", titulo: "Segurança", texto: "Bata e óculos obrigatórios." },
      { id: "assinaturas", titulo: "Resíduos", texto: "Cada resíduo vai para o contentor da sua cor." },
    ],
    menu: ["Início", "Sessões", "Contactos", "Inventário", "Sobre o laboratório"],
    rascunho: "Rascunho: Registo da amostra B-7",
    pesquisaAlvo: "horário",
    volumeRotulo: "Volume do alarme",
  },
};

export interface Tarefa {
  id: string;
  instrucao: string;
  /** Estado aplicado ao começar a tarefa, para que nunca comece já cumprida (os controlos são partilhados). */
  repor: Partial<Estado>;
  verificar: (e: Estado) => boolean;
}

const DISTRITOS = ["Aveiro", "Braga", "Coimbra", "Faro", "Lisboa", "Porto", "Setúbal", "Viseu"].map((d) => ({ valor: d.toLowerCase(), texto: d }));
const SEPARADORES = ["noticias", "cultura", "opiniao"];
const SECOES = ["inicio", "desporto", "cultura", "escola"];
const ACORDEOES = ["horario", "entregas", "fotos", "assinaturas"];
export const BLOCOS_DEFINICOES = ["notificacoes", "distrito", "tamanho", "newsletter", "volume", "data"];
const NOME_TAMANHO: Record<string, string> = { pequeno: "Pequeno", medio: "Médio", grande: "Grande" };

/** Alvos e disposição sorteados em cada tentativa. */
export interface Parametros {
  distrito: number;
  pagina: number; // 2..5
  tamanho: "pequeno" | "grande";
  separador: 1 | 2;
  acordeao: number; // 0..3
  volume: number;
  secao: 1 | 2 | 3;
  menu: number; // 1..4
  dia: number;
  pesquisa: number; // índice da pergunta frequente cujo título se pesquisa
  trocarColunas: boolean;
  ordemDefinicoes: string[];
  ordemFaq: number[];
}

function escolher<T>(l: readonly T[], r: () => number): T {
  return l[Math.floor(r() * l.length)];
}
function baralharCom<T>(l: T[], r: () => number): T[] {
  const a = [...l];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function gerarParametros(r: () => number = Math.random): Parametros {
  return {
    distrito: Math.floor(r() * DISTRITOS.length),
    pagina: escolher([2, 3, 4, 5], r),
    tamanho: escolher(["pequeno", "grande"] as const, r),
    separador: escolher([1, 2] as const, r),
    acordeao: Math.floor(r() * 4),
    volume: escolher([40, 50, 60, 70, 80], r),
    secao: escolher([1, 2, 3] as const, r),
    menu: escolher([1, 2, 3, 4], r),
    dia: escolher([3, 8, 12, 15, 21, 27], r),
    pesquisa: Math.floor(r() * 4),
    trocarColunas: r() < 0.5,
    ordemDefinicoes: baralharCom(BLOCOS_DEFINICOES, r),
    ordemFaq: baralharCom([0, 1, 2, 3], r),
  };
}

function semAcentos(t: string): string {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Tarefas desta tentativa: alvos vêm dos parâmetros; nomes vêm do cenário; `dificil` retira as pistas. */
export function criarTarefas(p: Parametros, r: Rotulos, dificil = false): Record<string, Tarefa> {
  const d = DISTRITOS[p.distrito];
  const menu = r.menu[p.menu];
  const pesquisa = r.acordeoes[p.pesquisa].titulo;
  const t = (id: string, repor: Partial<Estado>, verificar: (e: Estado) => boolean, instrucao: string): Tarefa => ({ id, repor, verificar, instrucao });
  return {
    termos: t("termos", { termos: false }, (e) => e.termos, "Marca a caixa “Li e aceito os termos”."),
    notificacoes: t("notificacoes", { notificacoes: false }, (e) => e.notificacoes, "Ativa as notificações."),
    notificacoes_off: t("notificacoes_off", { notificacoes: true }, (e) => !e.notificacoes, "Desativa as notificações."),
    distrito: t("distrito", { distrito: "" }, (e) => e.distrito === d.valor, `Escolhe o distrito de ${d.texto}.`),
    fechar: t("fechar", { janelaAberta: true }, (e) => !e.janelaAberta, dificil ? "Fecha a janela que apareceu." : "Fecha esta janela (procura o botão Fechar ou clica fora dela)."),
    pagina: t("pagina", { pagina: 1 }, (e) => e.pagina === p.pagina, `Vai para a página ${p.pagina} dos resultados.`),
    caminho: t(
      "caminho",
      { secao: SECOES[p.secao], artigoAberto: true, usouCaminho: false },
      (e) => e.usouCaminho && !e.artigoAberto && e.secao === SECOES[p.secao],
      dificil ? `Volta à lista da secção ${r.secoes[p.secao].nome} sem usar as secções do topo.` : `Volta à secção ${r.secoes[p.secao].nome} usando o caminho por cima do artigo (o “rasto” de ligações).`,
    ),
    newsletter: t("newsletter", { newsletter: false }, (e) => e.newsletter, "Marca a opção para receber a newsletter."),
    newsletter_off: t("newsletter_off", { newsletter: true }, (e) => !e.newsletter, "Deixa de receber a newsletter."),
    tamanho: t("tamanho", { tamanho: "medio" }, (e) => e.tamanho === p.tamanho, `Escolhe o tamanho de texto ${NOME_TAMANHO[p.tamanho]}.`),
    separador: t("separador", { separador: "noticias" }, (e) => e.separador === SEPARADORES[p.separador], `Abre o separador ${r.separadores[p.separador].nome}.`),
    menu: t("menu", { menuAberto: false, menuEscolha: null }, (e) => e.menuEscolha === menu, dificil ? `Usa o menu principal para abrir “${menu}”.` : `Abre o menu (☰) e escolhe “${menu}”.`),
    acordeao: t("acordeao", { acordeao: null }, (e) => e.acordeao === ACORDEOES[p.acordeao], `Nas perguntas frequentes, abre a secção “${r.acordeoes[p.acordeao].titulo}”.`),
    enviar: t("enviar", { termos: false, enviado: false }, (e) => e.enviado, dificil ? "Envia o formulário dos termos." : "Carrega em Enviar. Se não conseguires, descobre porquê e resolve."),
    desfazer: t("desfazer", { rascunhoApagado: false, desfeito: false }, (e) => e.desfeito, dificil ? "Apaga o rascunho e anula a ação." : "Apaga o rascunho e depois anula a ação com o botão da mensagem que aparece."),
    volume: t("volume", { volume: 20 }, (e) => Math.abs(e.volume - p.volume) <= 5, `Põe o ${r.volumeRotulo.toLowerCase()} em ${p.volume} (até 5 a mais ou a menos conta).`),
    pesquisar: t(
      "pesquisar",
      { pesquisa: "", pesquisaEnviada: null },
      (e) => semAcentos(e.pesquisaEnviada ?? "").includes(semAcentos(pesquisa).slice(0, 4)),
      `Pesquisa “${pesquisa.toLowerCase()}” na caixa de pesquisa e carrega em Enter.`,
    ),
    ligacao: t("ligacao", { ligacaoAberta: null }, (e) => e.ligacaoAberta === "sobre", dificil ? `Abre “${r.menu[4]}” no fundo da página.` : `Abre a ligação “${r.menu[4]}” no rodapé (é uma ligação, não um botão).`),
    data: t("data", { data: "" }, (e) => new RegExp(`-${String(p.dia).padStart(2, "0")}$`).test(e.data), `No campo de data, escolhe o dia ${p.dia} de qualquer mês.`),
  };
}

/** Tarefas que usam o mesmo controlo: só sai uma de cada grupo por tentativa. */
const GRUPOS: Record<string, string> = { notificacoes_off: "notificacoes", newsletter_off: "newsletter", termos: "enviar" };

export function sortearTarefas(c: ConfigPainel, r: () => number = Math.random): string[] {
  const escolhidas: string[] = [];
  const grupos = new Set<string>();
  for (const id of baralharCom(c.pool, r)) {
    const g = GRUPOS[id] ?? id;
    if (grupos.has(g)) continue;
    grupos.add(g);
    escolhidas.push(id);
    if (escolhidas.length >= c.n) break;
  }
  return escolhidas;
}

const BASE1 = ["notificacoes", "notificacoes_off", "fechar", "newsletter", "newsletter_off", "pagina", "separador", "tamanho", "volume", "acordeao"];
const BASE2 = [...BASE1, "distrito", "caminho"];
const BASE3 = [...BASE2, "enviar", "data", "pesquisar", "ligacao"];
const BASE4 = [...BASE3, "menu", "desfazer"];
export const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigPainel> = {
  1: { pool: BASE1, n: 6 },
  2: { pool: BASE2, n: 9 },
  3: { pool: BASE3, n: 12 },
  4: { pool: BASE4, n: 14 },
  5: { pool: BASE4, n: 16, dificil: true },
};

export function prepararTarefa(t: Tarefa | undefined, e: Estado): Estado {
  return t ? { ...e, ...t.repor } : e;
}

function Painel({ config, contexto, aoTerminar }: PropsAtividade<ConfigPainel>) {
  const rot = ROTULOS[contexto];
  // Alvos, ordem das tarefas e disposição sorteados uma vez por tentativa.
  const [param] = useState(() => gerarParametros());
  const [ids] = useState(() => sortearTarefas(config));
  const tarefas = useMemo(() => {
    const mapa = criarTarefas(param, rot, !!config.dificil);
    return ids.map((id) => mapa[id]).filter(Boolean);
  }, [param, rot, ids, config.dificil]);
  const [indice, setIndice] = useState(0);
  const [estado, setEstadoReact] = useState<Estado>(() => prepararTarefa(tarefas[0], INICIAL));
  // Estado atual numa ref, para verificar a tarefa fora do "updater" do React (que corre duas vezes em StrictMode).
  const estadoRef = useRef(estado);
  const setEstado = (f: (e: Estado) => Estado) => {
    estadoRef.current = f(estadoRef.current);
    setEstadoReact(estadoRef.current);
  };
  const [erros, setErros] = useState(0);
  const pontos = useRef(0);
  const penalizacao = useRef(0);
  const inicioTarefa = useRef(performance.now());
  const inicioTudo = useRef(performance.now());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const tarefa = tarefas[indice];

  function alterar(parcial: Partial<Estado>) {
    const atual = estadoRef.current;
    const novo = { ...atual, ...parcial };
    setEstado(() => novo);
    if (!tarefa || concluindo.current) return;
    if (tarefa.verificar(novo)) concluir();
    else if (Object.keys(parcial).length > 0) setErros((n) => n + 1);
  }

  const concluindo = useRef(false);
  function concluir() {
    if (concluindo.current) return;
    concluindo.current = true;
    const dur = (performance.now() - inicioTarefa.current) / 1000;
    const p = erros === 0 ? 1 : erros === 1 ? 0.5 : 0;
    pontos.current += p;
    if (dur > 20) penalizacao.current = Math.min(10, penalizacao.current + Math.min(2, (dur - 20) / 10));
    setFeedback(p === 1 ? "Certo à primeira." : p === 0.5 ? "Certo à segunda." : "Concluído, mas com várias tentativas.");
    window.setTimeout(() => {
      concluindo.current = false;
      setFeedback(null);
      setToast(false);
      const prox = indice + 1;
      if (prox >= tarefas.length) {
        aoTerminar({
          pontuacao: limitar(100 * (pontos.current / tarefas.length) - penalizacao.current),
          duracaoMs: performance.now() - inicioTudo.current,
          metricas: { pontos: pontos.current, tarefas: tarefas.length, penalizacaoTempo: Math.round(penalizacao.current) },
        });
        return;
      }
      setIndice(prox);
      setErros(0);
      inicioTarefa.current = performance.now();
      setEstado((e) => prepararTarefa(tarefas[prox], e));
    }, 900);
  }

  useEffect(() => {
    // Tarefa que precisa de mostrar a janela: já vem preparada no estado.
  }, [indice]);

  if (!tarefa) return null;

  const blocosDefinicoes: Record<string, React.ReactNode> = {
    notificacoes: (
      <Interruptor id="sim-notif" rotulo="Notificações" checked={estado.notificacoes} onChange={(e) => alterar({ notificacoes: e.target.checked })} />
    ),
    distrito: (
      <Seletor id="sim-distrito" rotulo={rot.distritoRotulo} opcoes={DISTRITOS} vazio="Escolhe um distrito" value={estado.distrito} onChange={(e) => alterar({ distrito: e.target.value })} />
    ),
    tamanho: (
      <fieldset className="grid gap-1 border-0 p-0 m-0">
                    <legend className="font-bold text-sm">Tamanho do texto</legend>
                    {["pequeno", "medio", "grande"].map((t) => (
                      <BotaoRadio key={t} id={`sim-tam-${t}`} name="sim-tam" rotulo={t === "medio" ? "Médio" : t[0].toUpperCase() + t.slice(1)} checked={estado.tamanho === t} onChange={() => alterar({ tamanho: t })} />
                    ))}
                  </fieldset>
    ),
    newsletter: (
      <CaixaVerificacao id="sim-news" rotulo="Quero receber a newsletter" checked={estado.newsletter} onChange={(e) => alterar({ newsletter: e.target.checked })} />
    ),
    volume: (
      <div className="campo">
                    <label htmlFor="sim-vol">
                      {rot.volumeRotulo}: {estado.volume}
                    </label>
                    <input id="sim-vol" type="range" min={0} max={100} step={5} value={estado.volume} onChange={(e) => setEstado((s) => ({ ...s, volume: Number(e.target.value) }))} onPointerUp={() => alterar({})} onKeyUp={() => alterar({})} />
                  </div>
    ),
    data: (
      <div className="campo">
                    <label htmlFor="sim-data">Data</label>
                    <input id="sim-data" type="date" value={estado.data} onChange={(e) => alterar({ data: e.target.value })} />
                  </div>
    ),
  };
  const artigo = rot.artigos[Math.max(1, SECOES.indexOf(estado.secao))];
  const endereco = contexto === "laboratorio" ? "laboratorio3.escola.pt/consola" : "orecreio.escola.pt";
  return (
    <div className="grid gap-4">
      <p className="m-0" style={{ color: "var(--suave)" }}>
        É apresentada uma interface abaixo. Deverás seguir as instruções corretamente nessa interface para demonstrar conhecimento das instruções e dos diferentes processos de interação.
      </p>
      <div className="cartao p-4 grid gap-1" role="status" aria-live="polite" style={{ borderLeft: "6px solid var(--acento)", background: feedback ? "var(--acento-suave)" : undefined }}>
        <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--suave)" }}>
          Tarefa {indice + 1} de {tarefas.length} · na interface abaixo
        </div>
        <div className="text-xl font-bold flex items-center gap-3" style={{ fontFamily: "var(--fonte-titulo)" }}>
          <span aria-hidden="true">{feedback ? "✓" : "→"}</span>
          <span>{feedback ?? tarefa.instrucao}</span>
        </div>
      </div>

      <ForcarClaro>
      <div className="janela-simulada" role="region" aria-label="Interface simulada da tarefa">
      <div className="janela-barra" aria-hidden="true">
        <span className="pontos"><span /><span /><span /></span>
        <span className="endereco">https://{endereco}</span>
        <span className="etiqueta">Interface simulada</span>
      </div>
      <div className="simulado superficie-clara" style={{ border: 0, borderRadius: 0 }}>
        <div className="topo">
          <Botao variante="discreto" aria-label="Abrir menu" aria-expanded={estado.menuAberto} onClick={() => alterar({ menuAberto: !estado.menuAberto })}>
            ☰
          </Botao>
          <strong style={{ fontFamily: "var(--fonte-titulo)" }}>{rot.sitio}</strong>
          <form
            className="ml-auto flex gap-2 items-center"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              alterar({ pesquisaEnviada: estado.pesquisa });
            }}
          >
            <label htmlFor="sim-pesquisa" className="sr-only">
              Pesquisar
            </label>
            <input id="sim-pesquisa" type="search" placeholder="Pesquisar" value={estado.pesquisa} onChange={(e) => setEstado((s) => ({ ...s, pesquisa: e.target.value }))} className="px-2 py-1 rounded border" style={{ borderColor: "var(--tecla-borda)", background: "var(--superficie)", color: "var(--tinta)", minHeight: 40 }} />
          </form>
        </div>
        {estado.menuAberto && (
          <nav aria-label="Menu principal" className="p-3 border-b" style={{ borderColor: "var(--linha)" }}>
            <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
              {rot.menu.map((m) => (
                <li key={m}>
                  <Botao variante="contorno" onClick={() => alterar({ menuAberto: false, menuEscolha: m })}>
                    {m}
                  </Botao>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <nav aria-label="Secções" className="flex gap-1 px-3 pt-2 flex-wrap">
          {rot.secoes.map((s) => (
            <button key={s.id} type="button" className="separador" aria-current={estado.secao === s.id && !estado.artigoAberto ? "page" : undefined} data-ativo={estado.secao === s.id && !estado.artigoAberto} onClick={() => alterar({ secao: s.id, artigoAberto: false, usouCaminho: false })}>
              {s.nome}
            </button>
          ))}
        </nav>
        <div className="p-4 grid gap-4">
          <nav aria-label="Caminho" className="text-sm" style={{ color: "var(--suave)" }}>
            <button type="button" className="palavra" style={{ color: "var(--acento)", textDecoration: "underline" }} onClick={() => alterar({ secao: "inicio", artigoAberto: false, usouCaminho: true })}>
              Início
            </button>
            {estado.secao !== "inicio" && (
              <>
                {" › "}
                <button type="button" className="palavra" style={{ color: "var(--acento)", textDecoration: "underline" }} onClick={() => alterar({ artigoAberto: false, usouCaminho: true })}>
                  {rot.secoes.find((s) => s.id === estado.secao)?.nome}
                </button>
              </>
            )}
            {estado.artigoAberto && <> › {artigo}</>}
          </nav>

          {estado.artigoAberto ? (
            <article className="cartao p-4">
              <h3 className="text-xl">{artigo}</h3>
              <p>Texto do artigo. Para voltar à secção, usa o caminho no topo.</p>
            </article>
          ) : (
            <>
              <div role="tablist" aria-label="Separadores" className="flex gap-1 border-b" style={{ borderColor: "var(--linha)" }}>
                {rot.separadores.map((s) => (
                  <button key={s.id} type="button" role="tab" className="separador" aria-selected={estado.separador === s.id} onClick={() => alterar({ separador: s.id })}>
                    {s.nome}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <section className="grid gap-3 content-start" aria-label="Definições" style={{ order: param.trocarColunas ? 2 : 1 }}>
                  <h3 className="text-base">Definições</h3>
                  {param.ordemDefinicoes.map((b) => (
                    <div key={b}>{blocosDefinicoes[b]}</div>
                  ))}
                </section>
                <section className="grid gap-3 content-start" aria-label="Conteúdo" style={{ order: param.trocarColunas ? 1 : 2 }}>
                  <h3 className="text-base">Perguntas frequentes</h3>
                  {param.ordemFaq.map((i) => rot.acordeoes[i]).map((a) => (
                    <div key={a.id} className="cartao">
                      <h4 className="m-0">
                        <button type="button" className="w-full text-left p-3 font-bold" style={{ background: "transparent", border: 0, color: "inherit", font: "inherit", minHeight: 44, cursor: "pointer" }} aria-expanded={estado.acordeao === a.id} aria-controls={`sim-ac-${a.id}`} onClick={() => alterar({ acordeao: estado.acordeao === a.id ? null : a.id })}>
                          {estado.acordeao === a.id ? "▾" : "▸"} {a.titulo}
                        </button>
                      </h4>
                      {estado.acordeao === a.id && (
                        <div id={`sim-ac-${a.id}`} className="px-3 pb-3">
                          {a.texto}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="cartao p-3 grid gap-2">
                    <strong>{rot.rascunho}</strong>
                    {!estado.rascunhoApagado ? (
                      <Botao
                        variante="perigo"
                        onClick={() => {
                          alterar({ rascunhoApagado: true });
                          setToast(true);
                        }}
                      >
                        Apagar rascunho
                      </Botao>
                    ) : (
                      <span style={{ color: "var(--suave)" }}>Rascunho apagado.</span>
                    )}
                  </div>
                  <div className="cartao p-3 grid gap-2">
                    <CaixaVerificacao id="sim-termos" rotulo="Li e aceito os termos" checked={estado.termos} onChange={(e) => alterar({ termos: e.target.checked })} />
                    <div>
                      <Botao disabled={!estado.termos} aria-describedby="sim-enviar-ajuda" onClick={() => alterar({ enviado: true })}>
                        Enviar
                      </Botao>
                    </div>
                    <span id="sim-enviar-ajuda" className="text-sm" style={{ color: "var(--suave)" }}>
                      {estado.termos ? "Pronto a enviar." : "O botão fica ativo depois de aceitares os termos."}
                    </span>
                  </div>
                  <nav aria-label="Páginas de resultados" className="flex gap-1 items-center flex-wrap">
                    <span className="text-sm mr-2">Resultados:</span>
                    {[1, 2, 3, 4, 5].map((p) => (
                      <button key={p} type="button" className="botao botao--contorno" style={{ minWidth: 44, padding: "6px 10px", ...(estado.pagina === p ? { background: "var(--acento)", color: "var(--acento-tinta)" } : {}) }} aria-current={estado.pagina === p ? "page" : undefined} onClick={() => alterar({ pagina: p })}>
                        {p}
                      </button>
                    ))}
                  </nav>
                </section>
              </div>
            </>
          )}
        </div>
        <footer className="px-4 py-2 border-t text-sm flex gap-6 flex-wrap items-center" style={{ borderColor: "var(--linha)", color: "var(--suave)" }}>
          <a
            className="ligacao-simples"
            href="#sobre"
            onClick={(e) => {
              e.preventDefault();
              alterar({ ligacaoAberta: "sobre" });
            }}
          >
            {rot.menu[4]}
          </a>
          <button type="button" className="ligacao-simples" onClick={() => alterar({ ligacaoAberta: "botao" })}>
            Contactar
          </button>
        </footer>
      </div>
      </div>

      {estado.janelaAberta && (
        <div className="modal-fundo" onClick={() => alterar({ janelaAberta: false })}>
          <div className="modal superficie-clara grid gap-3" role="dialog" aria-modal="true" aria-labelledby="sim-modal-t" onClick={(e) => e.stopPropagation()}>
            <h3 id="sim-modal-t" className="text-lg">
              Novidades desta edição
            </h3>
            <p>Esta janela está a tapar o conteúdo. Fecha-a para continuar.</p>
            <div className="flex justify-end">
              <Botao onClick={() => alterar({ janelaAberta: false })} aria-label="Fechar janela">
                Fechar
              </Botao>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          <span>Rascunho apagado.</span>
          <button
            type="button"
            onClick={() => {
              setToast(false);
              alterar({ rascunhoApagado: false, desfeito: true });
            }}
          >
            Anular
          </button>
        </div>
      )}
      </ForcarClaro>
    </div>
  );
}

export const definicao = definir<ConfigPainel>({
  slug: "painel",
  numero: 2,
  dominio: "interface",
  titulo: { jornal: "O Painel", laboratorio: "A Consola" },
  descricao: "Seguir instruções num sítio simulado: botões, caixas, menus, separadores, caminhos, paginação, janelas e avisos.",
  duracao: "3 a 5 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ pool: ["termos"], n: 1 }),
  Componente: Painel,
  dica: (m) => {
    if (Number(m.penalizacaoTempo) >= 4) return "Quando não encontras um controlo, lê os rótulos de cima para baixo: menus, separadores e caminho no topo, definições ao lado.";
    return "Repara nos estados: um botão cinzento está desativado e, quase sempre, há uma caixa para marcar antes.";
  },
});
