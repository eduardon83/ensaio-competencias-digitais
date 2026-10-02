// ─── Estrutura comum: ligação de salto, cabeçalho, navegação, rodapé ─────────
import { NavLink, Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { usePreferencias } from "../preferencias/preferencias";
import { contexto as defContexto } from "../contextos";
import { VERSAO } from "../versao";

const LIGACOES = [
  { para: "/", texto: "Início" },
  { para: "/teste", texto: "Teste" },
  { para: "/treino", texto: "Treino" },
  { para: "/atividades", texto: "Atividades" },
  { para: "/observatorio", texto: "Observatório" },
  { para: "/acessibilidade", texto: "Acessibilidade" },
];

export function Layout() {
  const { prefs, definir } = usePreferencias();
  const ctx = defContexto(prefs.contexto);
  const local = useLocation();

  useEffect(() => {
    // Foco no conteúdo a cada navegação (leitores de ecrã) e scroll ao topo.
    document.getElementById("conteudo")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [local.pathname]);

  return (
    <div className="min-h-screen grid" style={{ gridTemplateRows: "auto 1fr auto" }}>
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
            <NavLink to="/definicoes" className="px-3 py-2 rounded-lg no-underline font-bold text-sm" style={({ isActive }) => ({ color: isActive ? "var(--acento)" : "var(--tinta)", background: isActive ? "var(--acento-suave)" : "transparent", minHeight: 44, display: "inline-flex", alignItems: "center" })} aria-label="Definições: aspeto, contexto, tempo">
              ⚙ Definições
            </NavLink>
          </nav>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "var(--suave)" }}>
          <span>
            Contexto: <strong>{ctx.nome}</strong>
          </span>
          <button type="button" className="underline" style={{ background: "none", border: 0, color: "var(--acento)", cursor: "pointer", font: "inherit", padding: 0 }} onClick={() => definir({ contexto: prefs.contexto === "jornal" ? "laboratorio" : "jornal" })}>
            Trocar para {prefs.contexto === "jornal" ? "laboratório" : "redação"}
          </button>
          <span>·</span>
          <span>
            Aspeto: <strong>{prefs.formato === "kendir" ? "Kendir" : "Mosaico"}</strong>
          </span>
          <button type="button" className="underline" style={{ background: "none", border: 0, color: "var(--acento)", cursor: "pointer", font: "inherit", padding: 0 }} onClick={() => definir({ formato: prefs.formato === "kendir" ? "mosaico" : "kendir" })}>
            Trocar para {prefs.formato === "kendir" ? "Mosaico" : "Kendir"}
          </button>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1} className="max-w-6xl w-full mx-auto px-4 py-8 outline-none">
        <Outlet />
      </main>
      <footer className="border-t mt-12" style={{ borderColor: "var(--linha)", color: "var(--suave)" }}>
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm flex flex-wrap gap-x-6 gap-y-2">
          <span>Ensaio às Competências Digitais · v{VERSAO} · Kendir Studios / Worlds4Education</span>
          <NavLink to="/sobre">Sobre</NavLink>
          <NavLink to="/privacidade">Privacidade</NavLink>
          <NavLink to="/acessibilidade">Declaração de acessibilidade</NavLink>
          <a href="https://mosaico.gov.pt/ferramentas/agora-design-system" target="_blank" rel="noreferrer">
            Ágora Design System
          </a>
        </div>
      </footer>
    </div>
  );
}
