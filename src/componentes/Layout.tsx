// ─── Estrutura comum: ligação de salto, cabeçalho curto (Início · Sobre · Definições), rodapé ──
import { NavLink, Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { usePreferencias } from "../preferencias/preferencias";
import { AUTORIA, VERSAO } from "../versao";

const LIGACOES = [
  { para: "/", texto: "Início" },
  { para: "/sobre", texto: "Sobre" },
  { para: "/definicoes", texto: "Definições" },
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
        Saltar para o conteúdo
      </a>
      {prefs.formato === "mosaico" && (
        <div className="text-xs px-4 py-1" style={{ background: "#021c51", color: "#fff" }}>
          Aspeto Mosaico · Ágora Design System (AMA)
        </div>
      )}
      <header className="border-b" style={{ borderColor: "var(--linha)", background: "var(--superficie)" }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <NavLink to="/" className="no-underline flex items-center gap-2" style={{ color: "var(--tinta)" }}>
            <span aria-hidden="true" className="grid place-items-center rounded-lg font-extrabold" style={{ width: 36, height: 36, background: "var(--acento)", color: "var(--acento-tinta)", fontFamily: "var(--fonte-titulo)" }}>
              E
            </span>
            <span className="font-extrabold text-lg leading-tight" style={{ fontFamily: "var(--fonte-titulo)" }}>
              Ensaio às Competências Digitais
            </span>
          </NavLink>
          <nav aria-label="Principal" className="flex flex-wrap gap-1 ml-auto">
            {LIGACOES.map((l) => (
              <NavLink key={l.para} to={l.para} end={l.para === "/"} className="px-3 py-2 rounded-lg no-underline font-bold text-sm" style={({ isActive }) => ({ color: isActive ? "var(--acento)" : "var(--tinta)", background: isActive ? "var(--acento-suave)" : "transparent", minHeight: 44, display: "inline-flex", alignItems: "center" })}>
                {l.texto}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1} className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 outline-none">
        <Outlet />
      </main>
      <footer className="border-t mt-12" style={{ borderColor: "var(--linha)", color: "var(--suave)" }}>
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm flex flex-wrap gap-x-6 gap-y-2">
          <span>
            Ensaio às Competências Digitais · v{VERSAO} · Ferramenta gratuita desenvolvida por {AUTORIA} para uso pelo Estado Português · <NavLink to="/licenca">Licença</NavLink>
          </span>
          <NavLink to="/resultados">Os meus resultados</NavLink>
          <NavLink to="/tutorial">Tutorial</NavLink>
          <NavLink to="/privacidade">Privacidade</NavLink>
          <NavLink to="/acessibilidade">Acessibilidade</NavLink>
          <NavLink to="/admin">Administração</NavLink>
          <a href="https://mosaico.gov.pt/ferramentas/agora-design-system" target="_blank" rel="noreferrer">
            Ágora Design System
          </a>
        </div>
      </footer>
    </div>
  );
}
