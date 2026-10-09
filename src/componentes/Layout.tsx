// ─── Estrutura comum: ligação de salto, cabeçalho curto (Início · Sobre · Definições), rodapé ──
import { NavLink, Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { usePreferencias } from "../preferencias/preferencias";
import { AUTORIA, VERSAO } from "../versao";
import { PAGINAS } from "../textos/paginas";

const G = PAGINAS.geral;
// Lido ao desenhar (e não ao importar), para apanhar os textos editados no backoffice.
const ligacoes = () => [
  { para: "/", texto: G.menu.inicio },
  { para: "/sobre", texto: G.menu.sobre },
  { para: "/definicoes", texto: G.menu.definicoes },
];

export function Layout() {
  const { prefs } = usePreferencias();
  const local = useLocation();

  useEffect(() => {
    document.getElementById("conteudo")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [local.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#conteudo" className="sr-only focus:not-sr-only" style={{ position: "absolute", top: 8, left: 8, zIndex: 100, background: "var(--acento)", color: "var(--acento-tinta)", padding: "8px 12px", borderRadius: 8 }}>
        {G.saltar}
      </a>
      {prefs.formato === "mosaico" && (
        <div className="text-xs px-4 py-1" style={{ background: "#021c51", color: "#fff" }}>
          {G.faixaMosaico}
        </div>
      )}
      <header className="border-b" style={{ borderColor: "var(--linha)", background: "var(--superficie)" }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <NavLink to="/" className="no-underline flex items-center gap-2" style={{ color: "var(--tinta)" }}>
            <span aria-hidden="true" className="grid place-items-center rounded-lg font-extrabold" style={{ width: 36, height: 36, background: "var(--acento)", color: "var(--acento-tinta)", fontFamily: "var(--fonte-titulo)" }}>
              E
            </span>
            <span className="font-extrabold text-lg leading-tight" style={{ fontFamily: "var(--fonte-titulo)" }}>
              {G.nomeApp}
            </span>
          </NavLink>
          <nav aria-label="Principal" className="flex flex-wrap gap-1 ml-auto">
            {ligacoes().map((l) => (
              <NavLink key={l.para} to={l.para} end={l.para === "/"} className="px-3 py-2 rounded-lg no-underline font-bold text-sm" style={({ isActive }) => ({ color: isActive ? "var(--acento)" : "var(--tinta)", background: isActive ? "var(--acento-suave)" : "transparent", minHeight: 44, display: "inline-flex", alignItems: "center" })}>
                {l.texto}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1} className="flex-1 max-w-6xl w-full mx-auto px-4 py-[2rem] outline-none">
        <Outlet />
      </main>
      <footer className="border-t mt-12" style={{ borderColor: "var(--linha)", color: "var(--suave)" }}>
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm flex flex-wrap items-center gap-x-6 gap-y-0">
          <span>
            {G.nomeApp} · v{VERSAO} · {G.rodape.replace("{autoria}", AUTORIA)} · <NavLink to="/licenca">{G.ligacoesRodape.licenca}</NavLink>
          </span>
          <NavLink to="/resultados" className="ligacao-alvo">{G.ligacoesRodape.resultados}</NavLink>
          <NavLink to="/cartao" className="ligacao-alvo">{G.ligacoesRodape.cartao}</NavLink>
          <NavLink to="/seguranca" className="ligacao-alvo">{G.ligacoesRodape.seguranca}</NavLink>
          <NavLink to="/tutorial" className="ligacao-alvo">{G.ligacoesRodape.tutorial}</NavLink>
          <NavLink to="/privacidade" className="ligacao-alvo">{G.ligacoesRodape.privacidade}</NavLink>
          <NavLink to="/acessibilidade" className="ligacao-alvo">{G.ligacoesRodape.acessibilidade}</NavLink>
          <NavLink to="/admin" className="ligacao-alvo">{G.ligacoesRodape.admin}</NavLink>
          <a href="https://mosaico.gov.pt/ferramentas/agora-design-system" target="_blank" rel="noreferrer" className="ligacao-alvo">
            Ágora Design System
          </a>
        </div>
      </footer>
    </div>
  );
}
