import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./styles/app.css";
import { App } from "./App";
import { PreferenciasProvider, aplicarNoDocumento, lerPreferencias } from "./preferencias/preferencias";
import { carregarAgora } from "./ui/registo-agora";

async function arrancar() {
  const prefs = lerPreferencias();
  aplicarNoDocumento(prefs);
  // O formato Mosaico carrega o Ágora Design System (componentes + CSS) só quando está selecionado.
  if (prefs.formato === "mosaico") {
    await carregarAgora();
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
