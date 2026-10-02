import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./styles/app.css";
import { App } from "./App";
import { PreferenciasProvider, aplicarNoDocumento, lerPreferencias } from "./preferencias/preferencias";

async function arrancar() {
  const prefs = lerPreferencias();
  aplicarNoDocumento(prefs);
  // O formato Mosaico carrega o Ágora Design System (tokens + componentes) só quando está selecionado.
  if (prefs.formato === "mosaico") {
    await import("./styles/mosaico.css");
  }
  createRoot(document.getElementById("raiz")!).render(
    <StrictMode>
      <PreferenciasProvider iniciais={prefs}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PreferenciasProvider>
    </StrictMode>,
  );
}

void arrancar();
