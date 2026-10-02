// ─── Atividade 2 · O Painel / A Consola (literacia de interfaces) ────────────
// Um sítio simulado com controlos reais (não imagens). As instruções aparecem uma a uma.
// Pontuação: 1 ponto à primeira, 0,5 à segunda, 0 depois; menos até 10 por tempo parado acima de 20 s por tarefa.

import { useEffect, useMemo, useRef, useState } from "react";
import type { Contexto } from "../../preferencias/preferencias";
import { definir, limitar, type PropsAtividade } from "../../motor/tipos";
import { Instrucao } from "../../motor/util";
import { Botao, BotaoRadio, CaixaVerificacao, Interruptor, Seletor } from "../../ui";

export interface ConfigPainel {
  tarefas: string[]; // ids em TAREFAS
}

interface Estado {
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

const INICIAL: Estado = {
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
  artigo: string;
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
    artigo: "Torneio de futebol: final no sábado",
    distritoRotulo: "Distrito da escola",
    acordeoes: [
      { id: "horario", titulo: "Horário", texto: "A redação abre às 13h30 e fecha às 17h00." },
      { id: "entregas", titulo: "Entregas", texto: "Os textos entram até quinta-feira." },
      { id: "fotos", titulo: "Fotografias", texto: "Fotos em JPG, mínimo 1200 px." },
    ],
    menu: ["Início", "Edições", "Contactos", "Sobre o jornal"],
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
    artigo: "Amostra A-104: leitura concluída",
    distritoRotulo: "Distrito do laboratório",
    acordeoes: [
      { id: "horario", titulo: "Horário", texto: "O laboratório abre às 9h00 e fecha às 18h00." },
      { id: "entregas", titulo: "Reagentes", texto: "Pedidos até quarta-feira." },
      { id: "fotos", titulo: "Segurança", texto: "Bata e óculos obrigatórios." },
    ],
    menu: ["Início", "Sessões", "Contactos", "Sobre o laboratório"],
    rascunho: "Rascunho: Registo da amostra B-7",
    pesquisaAlvo: "horário",
    volumeRotulo: "Volume do alarme",
  },
};

interface Tarefa {
  id: string;
  instrucao: (r: Rotulos) => string;
  preparar?: (e: Estado) => Estado;
  verificar: (e: Estado) => boolean;
}

const TAREFAS: Record<string, Tarefa> = {
  notificacoes: { id: "notificacoes", instrucao: () => "Ativa as notificações.", verificar: (e) => e.notificacoes },
  distrito: { id: "distrito", instrucao: () => "Escolhe o distrito do Porto.", verificar: (e) => e.distrito === "porto" },
  fechar: { id: "fechar", instrucao: () => "Fecha esta janela.", preparar: (e) => ({ ...e, janelaAberta: true }), verificar: (e) => !e.janelaAberta },
  pagina3: { id: "pagina3", instrucao: () => "Vai para a página 3 dos resultados.", preparar: (e) => ({ ...e, pagina: 1 }), verificar: (e) => e.pagina === 3 },
  caminho: {
    id: "caminho",
    instrucao: (r) => `Volta à secção ${r.secoes[1].nome} usando o caminho no topo (o "rasto" de ligações).`,
    preparar: (e) => ({ ...e, secao: "desporto", artigoAberto: true, usouCaminho: false }),
    verificar: (e) => e.usouCaminho && !e.artigoAberto && e.secao === "desporto",
  },
  newsletter: { id: "newsletter", instrucao: () => "Marca a opção para receber a newsletter.", verificar: (e) => e.newsletter },
  tamanho: { id: "tamanho", instrucao: () => "Escolhe o tamanho de texto Grande.", verificar: (e) => e.tamanho === "grande" },
  separador: { id: "separador", instrucao: (r) => `Abre o separador ${r.separadores[1].nome}.`, preparar: (e) => ({ ...e, separador: "noticias" }), verificar: (e) => e.separador === "cultura" },
  menu: { id: "menu", instrucao: () => "Abre o menu (☰) e escolhe Contactos.", preparar: (e) => ({ ...e, menuAberto: false, menuEscolha: null }), verificar: (e) => e.menuEscolha === "Contactos" },
  acordeao: { id: "acordeao", instrucao: () => "Nas perguntas frequentes, abre a secção Horário.", preparar: (e) => ({ ...e, acordeao: null }), verificar: (e) => e.acordeao === "horario" },
  enviar: {
    id: "enviar",
    instrucao: () => "Carrega em Enviar. Se não conseguires, descobre porquê e resolve.",
    preparar: (e) => ({ ...e, termos: false, enviado: false, tentouEnviarBloqueado: false }),
    verificar: (e) => e.enviado,
  },
  desfazer: {
    id: "desfazer",
    instrucao: () => "Apaga o rascunho e depois anula a ação com o botão da mensagem que aparece.",
    preparar: (e) => ({ ...e, rascunhoApagado: false, desfeito: false }),
    verificar: (e) => e.desfeito,
  },
  volume: { id: "volume", instrucao: (r) => `Põe o ${r.volumeRotulo.toLowerCase()} em 50 (entre 45 e 55 conta).`, preparar: (e) => ({ ...e, volume: 20 }), verificar: (e) => e.volume >= 45 && e.volume <= 55 },
  pesquisar: { id: "pesquisar", instrucao: (r) => `Pesquisa "${r.pesquisaAlvo}" na caixa de pesquisa e carrega em Enter.`, preparar: (e) => ({ ...e, pesquisa: "", pesquisaEnviada: null }), verificar: (e) => (e.pesquisaEnviada ?? "").toLowerCase().includes("hor") },
  ligacao: { id: "ligacao", instrucao: (r) => `Abre a ligação "${r.menu[3]}" no rodapé (é uma ligação, não um botão).`, preparar: (e) => ({ ...e, ligacaoAberta: null }), verificar: (e) => e.ligacaoAberta === "sobre" },
  data: { id: "data", instrucao: () => "No campo de data, escolhe o dia 15 de qualquer mês.", preparar: (e) => ({ ...e, data: "" }), verificar: (e) => /-15$/.test(e.data) },
};

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigPainel> = {
  1: { tarefas: ["notificacoes", "fechar", "newsletter", "pagina3", "separador", "tamanho", "notificacoes_off", "volume"] },
  2: { tarefas: ["notificacoes", "distrito", "fechar", "pagina3", "tamanho", "separador", "caminho", "newsletter", "acordeao", "volume"] },
  3: { tarefas: ["notificacoes", "distrito", "fechar", "pagina3", "caminho", "tamanho", "separador", "acordeao", "enviar", "data", "pesquisar", "volume", "newsletter", "ligacao"] },
  4: { tarefas: ["menu", "distrito", "fechar", "pagina3", "caminho", "tamanho", "separador", "acordeao", "enviar", "desfazer", "data", "pesquisar", "volume", "ligacao", "newsletter", "notificacoes"] },
  5: { tarefas: ["menu", "desfazer", "enviar", "caminho", "data", "pesquisar", "acordeao", "distrito", "fechar", "pagina3", "separador", "ligacao", "volume", "tamanho", "notificacoes", "newsletter", "menu_sobre", "notificacoes_off"] },
};

// Variantes ligeiras
TAREFAS.notificacoes_off = { id: "notificacoes_off", instrucao: () => "Desativa as notificações.", preparar: (e) => ({ ...e, notificacoes: true }), verificar: (e) => !e.notificacoes };
TAREFAS.menu_sobre = { id: "menu_sobre", instrucao: (r) => `Abre o menu (☰) e escolhe "${r.menu[3]}".`, preparar: (e) => ({ ...e, menuAberto: false, menuEscolha: null }), verificar: (e) => e.menuEscolha?.startsWith("Sobre") === true };

const DISTRITOS = ["Aveiro", "Braga", "Coimbra", "Faro", "Lisboa", "Porto", "Setúbal", "Viseu"].map((d) => ({ valor: d.toLowerCase(), texto: d }));

function Painel({ config, contexto, aoTerminar }: PropsAtividade<ConfigPainel>) {
  const rot = ROTULOS[contexto];
  const tarefas = useMemo(() => config.tarefas.map((id) => TAREFAS[id]).filter(Boolean), [config.tarefas]);
  const [indice, setIndice] = useState(0);
  const [estado, setEstado] = useState<Estado>(() => (tarefas[0]?.preparar ? tarefas[0].preparar(INICIAL) : INICIAL));
  const [erros, setErros] = useState(0);
  const pontos = useRef(0);
  const penalizacao = useRef(0);
  const inicioTarefa = useRef(performance.now());
  const inicioTudo = useRef(performance.now());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const tarefa = tarefas[indice];

  function alterar(parcial: Partial<Estado>) {
    setEstado((atual) => {
      const novo = { ...atual, ...parcial };
      if (tarefa && tarefa.verificar(novo)) {
        concluir();
      } else if (tarefa && !tarefa.verificar(atual)) {
        setErros((n) => n + 1);
      }
      return novo;
    });
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
      setEstado((e) => (tarefas[prox].preparar ? tarefas[prox].preparar(e) : e));
    }, 900);
  }

  useEffect(() => {
    // Tarefa que precisa de mostrar a janela: já vem preparada no estado.
  }, [indice]);

  if (!tarefa) return null;

  return (
    <div className="grid gap-4">
      <Instrucao numero={indice + 1} total={tarefas.length}>
        {feedback ?? tarefa.instrucao(rot)}
      </Instrucao>

      <div className="simulado" aria-label="Sítio simulado">
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
            <button key={s.id} type="button" className="separador" aria-selected={estado.secao === s.id && !estado.artigoAberto} role="tab" onClick={() => alterar({ secao: s.id, artigoAberto: false, usouCaminho: false })}>
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
            {estado.artigoAberto && <> › {rot.artigo}</>}
          </nav>

          {estado.artigoAberto ? (
            <article className="cartao p-4">
              <h3 className="text-xl">{rot.artigo}</h3>
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
                <section className="grid gap-3" aria-label="Definições">
                  <h3 className="text-base">Definições</h3>
                  <Interruptor id="sim-notif" rotulo="Notificações" checked={estado.notificacoes} onChange={(e) => alterar({ notificacoes: e.target.checked })} />
                  <Seletor id="sim-distrito" rotulo={rot.distritoRotulo} opcoes={DISTRITOS} vazio="Escolhe um distrito" value={estado.distrito} onChange={(e) => alterar({ distrito: e.target.value })} />
                  <fieldset className="grid gap-1 border-0 p-0 m-0">
                    <legend className="font-bold text-sm">Tamanho do texto</legend>
                    {["pequeno", "medio", "grande"].map((t) => (
                      <BotaoRadio key={t} id={`sim-tam-${t}`} name="sim-tam" rotulo={t === "medio" ? "Médio" : t[0].toUpperCase() + t.slice(1)} checked={estado.tamanho === t} onChange={() => alterar({ tamanho: t })} />
                    ))}
                  </fieldset>
                  <CaixaVerificacao id="sim-news" rotulo="Quero receber a newsletter" checked={estado.newsletter} onChange={(e) => alterar({ newsletter: e.target.checked })} />
                  <div className="campo">
                    <label htmlFor="sim-vol">
                      {rot.volumeRotulo}: {estado.volume}
                    </label>
                    <input id="sim-vol" type="range" min={0} max={100} step={5} value={estado.volume} onChange={(e) => setEstado((s) => ({ ...s, volume: Number(e.target.value) }))} onPointerUp={() => alterar({})} onKeyUp={() => alterar({})} />
                  </div>
                  <div className="campo">
                    <label htmlFor="sim-data">Data</label>
                    <input id="sim-data" type="date" value={estado.data} onChange={(e) => alterar({ data: e.target.value })} />
                  </div>
                </section>
                <section className="grid gap-3" aria-label="Conteúdo">
                  <h3 className="text-base">Perguntas frequentes</h3>
                  {rot.acordeoes.map((a) => (
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
        <footer className="p-3 border-t text-sm flex gap-4 flex-wrap" style={{ borderColor: "var(--linha)", color: "var(--suave)" }}>
          <a
            href="#sobre"
            onClick={(e) => {
              e.preventDefault();
              alterar({ ligacaoAberta: "sobre" });
            }}
          >
            {rot.menu[3]}
          </a>
          <Botao variante="discreto" onClick={() => alterar({ ligacaoAberta: "botao" })}>
            Contactar
          </Botao>
        </footer>
      </div>

      {estado.janelaAberta && (
        <div className="modal-fundo" onClick={() => alterar({ janelaAberta: false })}>
          <div className="modal grid gap-3" role="dialog" aria-modal="true" aria-labelledby="sim-modal-t" onClick={(e) => e.stopPropagation()}>
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
  pratica: () => ({ tarefas: ["notificacoes", "pagina3"] }),
  Componente: Painel,
  dica: (m) => {
    if (Number(m.penalizacaoTempo) >= 4) return "Quando não encontras um controlo, lê os rótulos de cima para baixo: menus, separadores e caminho no topo, definições ao lado.";
    return "Repara nos estados: um botão cinzento está desativado e, quase sempre, há uma caixa para marcar antes.";
  },
});
