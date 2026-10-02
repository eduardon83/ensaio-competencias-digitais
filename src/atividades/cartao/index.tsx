// ─── Atividade 5 · Cartão de Imprensa / Ficha de Segurança (formulários) ─────
// Ficha de dados (pessoa fictícia gerada) à esquerda, formulário à direita, numa interface simulada.
// Validação como nos sítios reais: erros junto ao campo e resumo no topo com ligações.
// score = 100 × (0,7 × campos certos / campos + 0,2 × erros corrigidos / erros mostrados + 0,1 × [≤ 2 submissões])
import { useEffect, useMemo, useRef, useState } from "react";
import { definir, limitar, type PropsAtividade } from "../../motor/tipos";
import { Instrucao } from "../../motor/util";
import { misturar } from "../../motor/aleatorio";
import { Botao, ForcarClaro } from "../../ui";
import { camposDoNivel, esperado, formatarTelefone, gerarPessoa, iguais, validar, type Campo, type Pessoa } from "./dados";

export interface ConfigCartao {
  nivel: number; // define os campos (dados.ts)
  erroPlantado: boolean; // um campo vem preenchido com um valor errado
  reformatar: boolean; // telemóvel com espaços automáticos
  sessao: boolean; // aviso de sessão a expirar
}

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigCartao> = {
  1: { nivel: 1, erroPlantado: false, reformatar: false, sessao: false },
  2: { nivel: 2, erroPlantado: true, reformatar: false, sessao: false },
  3: { nivel: 3, erroPlantado: true, reformatar: false, sessao: false },
  4: { nivel: 4, erroPlantado: true, reformatar: true, sessao: false },
  5: { nivel: 5, erroPlantado: true, reformatar: true, sessao: true },
};

const ROTULO_FICHA: Partial<Record<keyof Pessoa, string>> = {
  nome: "Nome", idade: "Idade", nascimento: "Data de nascimento", turma: "Turma", email: "Email", telefone: "Telemóvel",
  rua: "Morada", codigoPostal: "Código postal", localidade: "Localidade", concelho: "Concelho", distrito: "Distrito",
  cor: "Cor preferida", funcao: "Função", seccao: "Secção / área", nif: "NIF", curso: "Curso", ano: "Ano", irmaos: "Irmãos a estudar", numeroIrmaos: "Quantos irmãos", bolsaAnterior: "Bolsa no ano anterior",
};

function Cartao({ config, contexto, aoTerminar }: PropsAtividade<ConfigCartao>) {
  const adulto = config.nivel >= 4;
  const [pessoa] = useState(() => gerarPessoa(contexto, adulto));
  const campos = useMemo(() => camposDoNivel(config.nivel, contexto), [config.nivel, contexto]);
  const passos = Math.max(...campos.map((c) => c.passo));
  // Erro plantado: um campo de texto/telemóvel/email já vem preenchido com um valor quase certo.
  const [plantado] = useState(() => {
    if (!config.erroPlantado) return null;
    const c = misturar(campos.filter((x) => ["telefone", "email", "nome"].includes(x.id)))[0];
    if (!c) return null;
    const certo = esperado(c, pessoa);
    const errado = c.id === "telefone" ? certo.slice(0, 4) + certo[5] + certo[4] + certo.slice(6) : c.id === "email" ? certo.replace("@", "s@") : certo.split(" ").slice(0, -1).join(" ") + " Silvestre";
    return { id: c.id, valor: errado === certo ? certo + "x" : errado };
  });
  const [valores, setValores] = useState<Record<string, string>>(() => (plantado ? { [plantado.id]: c(plantado.id, plantado.valor) } : {}));
  function c(id: string, v: string) {
    return id === "telefone" && config.reformatar ? formatarTelefone(v) : v;
  }
  const [passo, setPasso] = useState(1);
  const [erros, setErros] = useState<Record<string, string>>({});
  const errosMostrados = useRef<Set<string>>(new Set(plantado ? [plantado.id] : []));
  const submissoes = useRef(0);
  const inicio = useRef(performance.now());
  const [ficheirosAbertos, setFicheirosAbertos] = useState(false);
  const resumo = useRef<HTMLDivElement>(null);
  const [terminado, setTerminado] = useState(false);

  // Aviso de sessão (nível 5): aparece aos 60 s; se não renovar, expira aos 180 s mas os dados ficam guardados.
  const [sessao, setSessao] = useState<"ok" | "aviso" | "expirada">("ok");
  const renovacoes = useRef(0);
  useEffect(() => {
    if (!config.sessao || terminado) return;
    if (sessao === "ok") {
      const t = window.setTimeout(() => setSessao("aviso"), 60_000);
      return () => window.clearTimeout(t);
    }
    if (sessao === "aviso") {
      const t = window.setTimeout(() => setSessao("expirada"), 120_000);
      return () => window.clearTimeout(t);
    }
  }, [sessao, config.sessao, terminado]);

  const visiveis = campos.filter((x) => !x.se || valores[x.se.campo] === x.se.valor);
  const doPasso = visiveis.filter((x) => x.passo === passo);

  function validarPasso(lista: Campo[]) {
    const e: Record<string, string> = {};
    for (const x of lista) {
      const m = validar(x, valores[x.id] ?? "");
      if (m) {
        e[x.id] = m;
        errosMostrados.current.add(x.id);
      }
    }
    setErros(e);
    if (Object.keys(e).length) window.setTimeout(() => resumo.current?.focus(), 0);
    return Object.keys(e).length === 0;
  }

  function seguinte() {
    if (validarPasso(doPasso)) setPasso(passo + 1);
  }
  function submeter() {
    submissoes.current++;
    if (!validarPasso(doPasso)) return;
    setTerminado(true);
    const contados = visiveis;
    const certos = contados.filter((x) => iguais(x, valores[x.id] ?? "", esperado(x, pessoa))).length;
    const mostrados = [...errosMostrados.current];
    const corrigidos = mostrados.filter((id) => {
      const x = campos.find((k) => k.id === id);
      return x ? iguais(x, valores[id] ?? "", esperado(x, pessoa)) : false;
    }).length;
    const pontuacao = limitar(100 * (0.7 * (certos / contados.length) + 0.2 * (mostrados.length ? corrigidos / mostrados.length : 1) + 0.1 * (submissoes.current <= 2 ? 1 : 0)));
    aoTerminar({
      pontuacao,
      duracaoMs: performance.now() - inicio.current,
      metricas: { certos, campos: contados.length, errosMostrados: mostrados.length, errosCorrigidos: corrigidos, submissoes: submissoes.current, sessaoRenovada: renovacoes.current > 0, erroPlantadoCorrigido: plantado ? iguais(campos.find((k) => k.id === plantado.id)!, valores[plantado.id] ?? "", esperado(campos.find((k) => k.id === plantado.id)!, pessoa)) : "nao_aplicavel" },
    });
  }

  const definir = (id: string, v: string) => {
    setValores((s) => ({ ...s, [id]: c(id, v) }));
    if (erros[id]) setErros((e) => { const n = { ...e }; delete n[id]; return n; });
  };
  const ficheiros = useMemo(() => misturar([`foto_${pessoa.primeiro.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()}.jpg`, "fundo_ecra.png", "documento_digitalizado.pdf", "foto_grupo_turma.jpg"]), [pessoa]);

  const fichaCampos = useMemo(() => {
    const ids = new Set(campos.map((x) => x.id));
    return (Object.keys(ROTULO_FICHA) as (keyof Pessoa)[]).filter((k) => ids.has(k) || (k === "idade" && ids.has("idade")));
  }, [campos]);

  return (
    <div className="grid gap-3">
      <Instrucao>
        Preenche o pedido com os dados da ficha. {config.erroPlantado && "Atenção: um dos campos já vem preenchido e pode estar errado. "}Os campos marcados com * são obrigatórios.
      </Instrucao>
      <ForcarClaro>
        <div className="janela-simulada" role="region" aria-label="Interface simulada da tarefa">
          <div className="janela-barra" aria-hidden="true">
            <span className="pontos"><span /><span /><span /></span>
            <span className="endereco">https://{contexto === "laboratorio" ? "acesso.laboratorio3.escola.pt/pedido" : "imprensa.orecreio.escola.pt/pedido"}</span>
            <span className="etiqueta">Interface simulada</span>
          </div>
          <div className="superficie-clara grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <aside className="p-4 border-r" style={{ borderColor: "var(--linha)", background: "#fffbea" }} aria-label="Ficha de dados">
              <h3 className="text-base mb-2" style={{ fontFamily: "var(--fonte-titulo)" }}>Ficha (papel)</h3>
              <dl className="grid gap-1 text-sm m-0" style={{ gridTemplateColumns: "auto 1fr", columnGap: 12, fontFamily: "Georgia, serif" }}>
                {fichaCampos.map((k) => (
                  <div key={k} className="contents">
                    <dt style={{ color: "var(--suave)" }}>{ROTULO_FICHA[k]}</dt>
                    <dd className="m-0">{k === "telefone" ? formatarTelefone(pessoa.telefone) : String(pessoa[k])}</dd>
                  </div>
                ))}
              </dl>
            </aside>
            <form className="p-4 grid gap-3 content-start" noValidate onSubmit={(e) => { e.preventDefault(); if (passo < passos) seguinte(); else submeter(); }}>
              <div className="flex justify-between items-baseline flex-wrap gap-2">
                <h3 className="text-lg" style={{ fontFamily: "var(--fonte-titulo)" }}>{contexto === "jornal" ? "Pedido de cartão de imprensa" : "Pedido de cartão de acesso"}</h3>
                {passos > 1 && <span className="text-sm" style={{ color: "var(--suave)" }}>Passo {passo} de {passos}</span>}
              </div>
              {sessao === "aviso" && (
                <div role="alert" className="cartao p-3 flex gap-3 items-center flex-wrap" style={{ borderColor: "var(--aviso)", borderWidth: 2 }}>
                  <span className="flex-1">A sessão expira em 2 minutos por inatividade.</span>
                  <Botao variante="contorno" onClick={() => { renovacoes.current++; setSessao("ok"); }}>Continuar sessão</Botao>
                </div>
              )}
              {sessao === "expirada" && (
                <div role="alert" className="cartao p-3" style={{ borderColor: "var(--errado)", borderWidth: 2 }}>
                  A sessão expirou. Os dados que escreveste foram guardados; podes continuar.
                  <Botao variante="discreto" onClick={() => setSessao("ok")}>Entrar de novo</Botao>
                </div>
              )}
              {Object.keys(erros).length > 0 && (
                <div ref={resumo} tabIndex={-1} role="alert" className="cartao p-3 grid gap-1" style={{ borderColor: "var(--errado)", borderWidth: 2 }}>
                  <strong>Há {Object.keys(erros).length} {Object.keys(erros).length === 1 ? "problema" : "problemas"} no formulário:</strong>
                  <ul className="m-0 pl-5">
                    {Object.entries(erros).map(([id, m]) => (
                      <li key={id}>
                        <a href={`#f-${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(`f-${id}`)?.focus(); }}>
                          {campos.find((x) => x.id === id)?.rotulo}: {m}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {doPasso.map((x) => (
                <CampoForm key={x.id} campo={x} valor={valores[x.id] ?? ""} erro={erros[x.id]} aoMudar={(v) => definir(x.id, v)} ficheiros={ficheiros} abrirFicheiros={ficheirosAbertos} setAbrirFicheiros={setFicheirosAbertos} />
              ))}
              <div className="flex gap-2 flex-wrap">
                {passo > 1 && <Botao variante="contorno" onClick={() => { setErros({}); setPasso(passo - 1); }}>Anterior</Botao>}
                <Botao type="submit" disabled={terminado}>{passo < passos ? "Seguinte" : "Submeter pedido"}</Botao>
              </div>
            </form>
          </div>
        </div>
      </ForcarClaro>
    </div>
  );
}

function CampoForm({ campo: x, valor, erro, aoMudar, ficheiros, abrirFicheiros, setAbrirFicheiros }: { campo: Campo; valor: string; erro?: string; aoMudar: (v: string) => void; ficheiros: string[]; abrirFicheiros: boolean; setAbrirFicheiros: (v: boolean) => void }) {
  const id = `f-${x.id}`;
  const obrigatorio = x.tipo !== "opcional";
  const descr = [x.ajuda ? `${id}-ajuda` : "", erro ? `${id}-erro` : ""].filter(Boolean).join(" ") || undefined;
  const rotulo = (
    <>
      {x.rotulo}
      {obrigatorio && <span aria-hidden="true"> *</span>}
      {obrigatorio && <span className="sr-only"> (obrigatório)</span>}
    </>
  );
  const extra = (
    <>
      {x.ajuda && <div id={`${id}-ajuda`} className="ajuda">{x.ajuda}</div>}
      {erro && <div id={`${id}-erro`} className="erro">{erro}</div>}
    </>
  );
  if (x.tipo === "select")
    return (
      <div className={`campo ${erro ? "campo--erro" : ""}`}>
        <label htmlFor={id}>{rotulo}</label>
        <select id={id} value={valor} onChange={(e) => aoMudar(e.target.value)} aria-describedby={descr} aria-invalid={erro ? true : undefined}>
          <option value="">Escolhe</option>
          {x.opcoes!.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {extra}
      </div>
    );
  if (x.tipo === "radio")
    return (
      <fieldset className={`campo border-0 p-0 m-0 ${erro ? "campo--erro" : ""}`} aria-describedby={descr}>
        <legend className="font-bold text-sm mb-1">{rotulo}</legend>
        <div className="flex flex-wrap gap-x-4">
          {x.opcoes!.map((o, i) => (
            <label key={o} className="opcao">
              <input id={i === 0 ? id : undefined} type="radio" name={id} value={o} checked={valor === o} onChange={() => aoMudar(o)} />
              <span>{o}</span>
            </label>
          ))}
        </div>
        {extra}
      </fieldset>
    );
  if (x.tipo === "checkbox")
    return (
      <div className={`campo ${erro ? "campo--erro" : ""}`}>
        <label className="opcao" htmlFor={id}>
          <input id={id} type="checkbox" checked={valor === "sim"} onChange={(e) => aoMudar(e.target.checked ? "sim" : "")} aria-describedby={descr} />
          <span>{rotulo}</span>
        </label>
        {extra}
      </div>
    );
  if (x.tipo === "ficheiro")
    return (
      <div className={`campo ${erro ? "campo--erro" : ""}`}>
        <span className="font-bold text-sm">{rotulo}</span>
        <div className="flex gap-2 items-center flex-wrap">
          <button id={id} type="button" className="botao botao--contorno" onClick={() => setAbrirFicheiros(!abrirFicheiros)} aria-expanded={abrirFicheiros} aria-describedby={descr}>Escolher ficheiro…</button>
          <span className="text-sm">{valor || "Nenhum ficheiro escolhido"}</span>
        </div>
        {abrirFicheiros && (
          <ul className="list-none m-0 p-2 cartao grid gap-1" aria-label="Ficheiros no computador">
            {ficheiros.map((f) => (
              <li key={f}>
                <button type="button" className="w-full text-left px-2 rounded" style={{ minHeight: 36, border: 0, background: valor === f ? "var(--acento-suave)" : "transparent", color: "var(--tinta)", font: "inherit", cursor: "pointer" }} onClick={() => { aoMudar(f); setAbrirFicheiros(false); }}>📄 {f}</button>
              </li>
            ))}
          </ul>
        )}
        {extra}
      </div>
    );
  const tipoInput = x.tipo === "email" ? "email" : x.tipo === "telefone" ? "tel" : "text";
  const modo = x.tipo === "numero" || x.tipo === "telefone" || x.tipo === "nif" ? "numeric" : undefined;
  return (
    <div className={`campo ${erro ? "campo--erro" : ""}`}>
      <label htmlFor={id}>{rotulo}</label>
      <input id={id} type={tipoInput} inputMode={modo} value={valor} onChange={(e) => aoMudar(e.target.value)} aria-describedby={descr} aria-invalid={erro ? true : undefined} autoComplete="off" />
      {extra}
    </div>
  );
}

export const definicao = definir<ConfigCartao>({
  slug: "cartao",
  numero: 5,
  dominio: "formularios",
  titulo: { jornal: "Cartão de Imprensa", laboratorio: "Cartão de Acesso" },
  descricao: "Preencher um formulário a partir de uma ficha, com formatos portugueses (data, código postal, telemóvel), e corrigir os erros de validação.",
  duracao: "3 a 5 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ nivel: 1, erroPlantado: false, reformatar: false, sessao: false }),
  Componente: Cartao,
  dica: (m) => {
    if (Number(m.errosMostrados) > 0 && Number(m.errosCorrigidos) < Number(m.errosMostrados)) return "Quando aparece o resumo de erros no topo, clica em cada um: leva-te ao campo e diz como corrigir.";
    if (m.erroPlantadoCorrigido === false) return "Um campo já vinha preenchido com um erro. Confirma sempre os campos pré-preenchidos contra a ficha.";
    if (Number(m.certos) < Number(m.campos)) return "Copia os dados exatamente como estão na ficha: o mesmo formato de data, o código postal com hífen, o email completo.";
    return "Bom trabalho. Nos formulários reais, deixa vazios os campos opcionais que não precisas de preencher.";
  },
});
