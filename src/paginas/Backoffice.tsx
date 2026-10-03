// ─── Backoffice de textos (temporário) ───────────────────────────────────────
// Para um professor adaptar os textos sem mexer no código. Precisa do Worker (Cloudflare ou `npm run worker:dev`).
// A chave (CHAVE_EDICAO ou CHAVE_ADMIN) fica só na sessão deste separador. Os originais continuam no código; o que se
// guarda aqui são só as alterações. "Exportar" gera o ficheiro para passar a versão final para o código.
import { useEffect, useMemo, useState } from "react";
import { Caminho } from "../componentes/Caminho";
import { aplicar, catalogo, textosAplicados, type EntradaTexto } from "../textos/sistema";
import { Botao, CampoTexto } from "../ui";

const SESSAO = "ecd.backoffice.chave";
const API = `${import.meta.env.BASE_URL}api`;

type Papel = "editor" | "admin";
interface Historico {
  versao: number;
  atualizadoEm: string;
  papel?: Papel;
  alterados: number;
  nota?: string;
}

const variaveis = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
const lerSessao = () => {
  try {
    return sessionStorage.getItem(SESSAO) ?? "";
  } catch {
    return "";
  }
};

async function pedir<T>(caminho: string, chave: string, init: RequestInit = {}): Promise<{ ok: true; dados: T } | { ok: false; estado: number; erro: string }> {
  try {
    const r = await fetch(`${API}${caminho}`, { ...init, headers: { "content-type": "application/json", authorization: `Bearer ${chave}`, ...(init.headers ?? {}) } });
    const tipo = r.headers.get("content-type") ?? "";
    if (!tipo.includes("json")) return { ok: false, estado: r.status, erro: "sem-worker" };
    const dados = await r.json();
    return r.ok ? { ok: true, dados } : { ok: false, estado: r.status, erro: dados.erro ?? "erro" };
  } catch {
    return { ok: false, estado: 0, erro: "rede" };
  }
}

/** "niveis.1.texto.jornal.0" → "níveis › 1 › texto › jornal › 1.º" (mais legível para quem edita). */
function rotulo(caminho: string): string {
  return caminho
    .split(".")
    .map((p) => (/^\d+$/.test(p) ? `#${Number(p) + 1}` : p.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()))
    .join(" › ");
}

export default function Backoffice() {
  const [chave, setChave] = useState(lerSessao);
  const [entrada, setEntrada] = useState("");
  const [papel, setPapel] = useState<Papel | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  const [guardados, setGuardados] = useState<Record<string, string>>({}); // o que está no Worker
  const [rascunho, setRascunho] = useState<Record<string, string>>({}); // alterações por guardar (chave → texto)
  const [seccao, setSeccao] = useState<string | null>(null);
  const [procura, setProcura] = useState("");
  const [soAlterados, setSoAlterados] = useState(false);
  const [historico, setHistorico] = useState<Historico[] | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [aGuardar, setAGuardar] = useState(false);
  const cat = useMemo(() => catalogo(), []);
  const porChave = useMemo(() => new Map(cat.map((e) => [e.chave, e])), [cat]);

  async function entrar(c: string) {
    setErro(null);
    const r = await pedir<{ papel: Papel }>("/sessao", c);
    if (!r.ok) {
      setPapel(null);
      setErro(r.erro === "sem-worker" || r.erro === "rede" ? "O backoffice precisa do Worker: abra o sítio publicado na Cloudflare, ou corra “npm run worker:dev”." : r.erro === "fechado" ? "A edição de textos está fechada nesta instalação." : "Chave incorreta.");
      return;
    }
    try {
      sessionStorage.setItem(SESSAO, c);
    } catch {
      /* nada */
    }
    setChave(c);
    setPapel(r.dados.papel);
    await recarregar(c);
  }

  async function recarregar(c = chave) {
    const r = await fetch(`${API}/textos`, { cache: "no-store" }).then((x) => x.json()).catch(() => null);
    if (r?.valores) {
      setGuardados(r.valores);
      setVersao(r.versao ?? 0);
      aplicar(r.valores);
    }
    const h = await pedir<Historico[]>("/textos/historico", c);
    if (h.ok) setHistorico(h.dados);
  }

  useEffect(() => {
    if (chave) void entrar(chave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Valor atual de cada texto: rascunho → guardado → original do código.
  const valor = (e: EntradaTexto) => rascunho[e.chave] ?? guardados[e.chave] ?? e.padrao;
  const alterado = (e: EntradaTexto) => valor(e) !== e.padrao;
  const porGuardar = Object.keys(rascunho).filter((k) => rascunho[k] !== (guardados[k] ?? porChave.get(k)?.padrao)).length;
  const problemas = cat.filter((e) => {
    const v = valor(e);
    return v.trim() === "" || variaveis(e.padrao).some((x) => !v.includes(`{${x}}`));
  });

  const seccoes = useMemo(() => {
    const m = new Map<string, { grupo: string; seccao: string; n: number }>();
    for (const e of cat) {
      const k = `${e.grupo}|${e.seccao}`;
      const s = m.get(k) ?? { grupo: e.grupo, seccao: e.seccao, n: 0 };
      s.n++;
      m.set(k, s);
    }
    return [...m.entries()];
  }, [cat]);
  const grupos = [...new Set(seccoes.map(([, s]) => s.grupo))];

  const termo = procura.trim().toLowerCase();
  const visiveis = cat.filter((e) => {
    if (termo) return e.padrao.toLowerCase().includes(termo) || valor(e).toLowerCase().includes(termo) || e.chave.toLowerCase().includes(termo);
    if (soAlterados) return alterado(e);
    return seccao === `${e.grupo}|${e.seccao}`;
  });
  const MOSTRAR = 150;

  async function gravar() {
    if (problemas.length) {
      setMensagem(`Há ${problemas.length} texto(s) vazios ou sem as variáveis obrigatórias ({…}). Corrija antes de guardar.`);
      return;
    }
    setAGuardar(true);
    // Guarda só o que difere do código (assim, repor o original é apagar a alteração).
    const valores: Record<string, string> = {};
    for (const e of cat) {
      const v = valor(e);
      if (v !== e.padrao) valores[e.chave] = v;
    }
    const r = await pedir<{ versao: number }>("/textos", chave, { method: "PUT", body: JSON.stringify({ valores, base: versao }) });
    setAGuardar(false);
    if (!r.ok) {
      setMensagem(r.estado === 409 ? "Outra pessoa guardou entretanto. Recarregue a página para ver a versão mais recente (as suas alterações por guardar perdem-se)." : `Não foi possível guardar (${r.erro}).`);
      return;
    }
    setRascunho({});
    setMensagem(`Guardado (versão ${r.dados.versao}). As alterações já aparecem no sítio para todos.`);
    await recarregar();
  }

  function exportar() {
    const valores: Record<string, string> = {};
    for (const e of cat) if (alterado(e)) valores[e.chave] = valor(e);
    const blob = new Blob([JSON.stringify({ exportadoEm: new Date().toISOString(), versao, valores }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ecd-textos-v${versao}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importar(f: File) {
    try {
      const d = JSON.parse(await f.text()) as { valores?: Record<string, string> };
      const novos: Record<string, string> = {};
      let ignorados = 0;
      for (const [k, v] of Object.entries(d.valores ?? {})) {
        if (porChave.has(k) && typeof v === "string") novos[k] = v;
        else ignorados++;
      }
      setRascunho((r) => ({ ...r, ...novos }));
      setMensagem(`Importados ${Object.keys(novos).length} textos para o rascunho${ignorados ? ` (${ignorados} ignorados: já não existem)` : ""}. Reveja e carregue em Guardar.`);
    } catch {
      setMensagem("Ficheiro inválido.");
    }
  }

  async function repor(v: number) {
    if (!window.confirm(`Voltar à versão ${v}? Fica guardada como uma versão nova; pode desfazer depois.`)) return;
    const r = await pedir<{ versao: number }>("/textos/repor", chave, { method: "POST", body: JSON.stringify({ versao: v }) });
    setMensagem(r.ok ? `Reposta a versão ${v} (agora versão ${r.dados.versao}).` : "Não foi possível repor.");
    setRascunho({});
    await recarregar();
  }

  if (!papel)
    return (
      <div className="grid gap-5 max-w-xl">
        <Caminho atual="Backoffice de textos" />
        <h1 className="text-4xl">Backoffice de textos</h1>
        <p className="m-0">Área para adaptar os textos do Ensaio às Competências Digitais sem mexer no código. Entre com a chave de edição que recebeu.</p>
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void entrar(entrada.trim());
          }}
        >
          <CampoTexto id="chave-bo" rotulo="Chave de edição" type="password" autoComplete="current-password" value={entrada} onChange={(e) => setEntrada(e.target.value)} erro={erro ?? undefined} />
          <div>
            <Botao type="submit" disabled={!entrada.trim()}>
              Entrar
            </Botao>
          </div>
        </form>
      </div>
    );

  return (
    <div className="grid gap-5">
      <Caminho atual="Backoffice de textos" />
      <header className="grid gap-2">
        <h1 className="text-4xl">Backoffice de textos</h1>
        <p className="m-0">
          {cat.length} textos editáveis · {cat.filter(alterado).length} diferentes do original · versão {versao} · entrou como <strong>{papel === "admin" ? "super admin" : "editor"}</strong>.
        </p>
        <details className="text-sm">
          <summary>Como escrever</summary>
          <ul className="m-0 pl-5 grid gap-1 mt-2">
            <li>
              <code>**texto**</code> fica a negrito; <code>[texto](/treinar)</code> é uma ligação; <code>^1^</code> é um número em índice superior.
            </li>
            <li>
              Palavras entre chavetas, como <code>{"{pontos}"}</code> ou <code>{"{versao}"}</code>, são preenchidas pela aplicação: mantenha-as.
            </li>
            <li>Nada muda no sítio até carregar em Guardar. Pode sempre repor o original de cada texto ou voltar a uma versão anterior.</li>
          </ul>
        </details>
      </header>

      <div className="cartao p-3 flex gap-2 flex-wrap items-center lg:sticky lg:top-2 z-10" style={{ background: "var(--superficie)" }}>
        <Botao onClick={() => void gravar()} disabled={!porGuardar || aGuardar}>
          {aGuardar ? "A guardar…" : `Guardar${porGuardar ? ` (${porGuardar})` : ""}`}
        </Botao>
        <Botao variante="contorno" disabled={!porGuardar} onClick={() => setRascunho({})}>
          Descartar
        </Botao>
        <Botao variante="contorno" onClick={exportar}>
          Exportar
        </Botao>
        <label className="botao botao--contorno" style={{ cursor: "pointer" }}>
          Importar
          <input type="file" accept="application/json" className="sr-only" onChange={(e) => e.target.files?.[0] && void importar(e.target.files[0])} />
        </label>
        <a className="botao botao--discreto" href={import.meta.env.BASE_URL} target="_blank" rel="noreferrer">
          Ver o sítio ↗
        </a>
        <Botao
          variante="discreto"
          onClick={() => {
            try {
              sessionStorage.removeItem(SESSAO);
            } catch {
              /* nada */
            }
            setPapel(null);
            setChave("");
            aplicar(textosAplicados());
          }}
        >
          Sair
        </Botao>
        <p className="m-0 text-sm basis-full" aria-live="polite" style={{ color: mensagem?.startsWith("Guardado") || mensagem?.startsWith("Reposta") || mensagem?.startsWith("Importados") ? "var(--certo)" : "var(--errado)" }}>
          {mensagem}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[18rem_1fr] items-start">
        <nav aria-label="Secções de textos" className="cartao p-3 grid gap-3 lg:sticky lg:top-28" style={{ maxHeight: "75vh", overflowY: "auto" }}>
          <CampoTexto id="procura-bo" rotulo="Procurar em todos os textos" value={procura} onChange={(e) => setProcura(e.target.value)} />
          <label className="flex gap-2 items-center text-sm">
            <input type="checkbox" checked={soAlterados} onChange={(e) => setSoAlterados(e.target.checked)} /> Só os textos alterados
          </label>
          {grupos.map((g) => (
            <div key={g} className="grid gap-1">
              <strong className="text-sm">{g}</strong>
              {seccoes
                .filter(([, s]) => s.grupo === g)
                .map(([k, s]) => {
                  const nAlt = cat.filter((e) => `${e.grupo}|${e.seccao}` === k && alterado(e)).length;
                  return (
                    <button key={k} type="button" className="separador text-left text-sm" style={{ minHeight: 36, padding: "4px 8px" }} data-ativo={seccao === k && !termo && !soAlterados} aria-current={seccao === k ? "true" : undefined} onClick={() => { setSeccao(k); setProcura(""); setSoAlterados(false); }}>
                      {s.seccao} <span style={{ color: "var(--suave)" }}>· {s.n}{nAlt ? ` · ${nAlt} alterados` : ""}</span>
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>

        <section aria-label="Textos" className="grid gap-3">
          {!seccao && !termo && !soAlterados && <p className="m-0">Escolha uma secção à esquerda ou procure um texto.</p>}
          {visiveis[0]?.aviso && !termo && <p className="m-0 cartao p-3 text-sm" style={{ borderColor: "var(--aviso)" }}>⚠ {visiveis[0].aviso}</p>}
          {visiveis.length > MOSTRAR && <p className="m-0 text-sm">A mostrar {MOSTRAR} de {visiveis.length}. Refine a procura.</p>}
          {visiveis.slice(0, MOSTRAR).map((e) => {
            const v = valor(e);
            const faltam = variaveis(e.padrao).filter((x) => !v.includes(`{${x}}`));
            const id = `t-${e.chave.replace(/[^\w-]/g, "_")}`;
            return (
              <div key={e.chave} className="cartao p-3 grid gap-1" style={alterado(e) ? { borderLeft: "4px solid var(--acento)" } : undefined}>
                <label htmlFor={id} className="text-sm font-bold">
                  {termo || soAlterados ? `${e.seccao} · ` : ""}
                  {rotulo(e.caminho)}
                </label>
                {e.longo ? (
                  <textarea id={id} rows={Math.min(8, Math.ceil(v.length / 90) + 1)} value={v} onChange={(x) => setRascunho((r) => ({ ...r, [e.chave]: x.target.value }))} style={{ font: "inherit", border: "2px solid var(--tecla-borda)", borderRadius: 8, padding: "6px 10px", background: "var(--superficie)", color: "var(--tinta)" }} />
                ) : (
                  <input id={id} value={v} onChange={(x) => setRascunho((r) => ({ ...r, [e.chave]: x.target.value }))} style={{ font: "inherit", border: "2px solid var(--tecla-borda)", borderRadius: 8, padding: "6px 10px", minHeight: 40, background: "var(--superficie)", color: "var(--tinta)" }} />
                )}
                {(faltam.length > 0 || !v.trim()) && (
                  <span className="text-sm font-bold" style={{ color: "var(--errado)" }}>
                    {!v.trim() ? "O texto não pode ficar vazio." : `Falta: ${faltam.map((x) => `{${x}}`).join(", ")}`}
                  </span>
                )}
                {alterado(e) && (
                  <div className="flex gap-2 items-baseline flex-wrap text-sm">
                    <span style={{ color: "var(--suave)" }}>Original: {e.padrao}</span>
                    <button type="button" className="ligacao-simples" onClick={() => setRascunho((r) => ({ ...r, [e.chave]: e.padrao }))}>
                      Repor o original
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>

      {historico && historico.length > 0 && (
        <section className="cartao p-4 grid gap-2" aria-labelledby="hist-t">
          <h2 id="hist-t" className="text-xl">Versões guardadas</h2>
          <ul className="m-0 p-0 list-none grid gap-1 text-sm">
            {historico.map((h) => (
              <li key={h.versao} className="flex gap-3 items-center flex-wrap">
                <strong>Versão {h.versao}</strong>
                <span>{new Date(h.atualizadoEm).toLocaleString("pt-PT")}</span>
                <span style={{ color: "var(--suave)" }}>
                  {h.alterados} textos alterados · {h.papel === "admin" ? "super admin" : "editor"}
                  {h.nota ? ` · ${h.nota}` : ""}
                </span>
                {h.versao !== versao && (
                  <button type="button" className="ligacao-simples" onClick={() => void repor(h.versao)}>
                    Voltar a esta versão
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
