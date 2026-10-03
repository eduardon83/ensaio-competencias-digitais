import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./styles/app.css";
import { App } from "./App";
import { PreferenciasProvider, aplicarNoDocumento, lerPreferencias } from "./preferencias/preferencias";
import { carregarAgora } from "./ui/registo-agora";
import "./textos/registo";
import { carregarTextos } from "./textos/sistema";

async function arrancar() {
  const prefs = lerPreferencias();
  aplicarNoDocumento(prefs);
  // O formato Mosaico carrega o Ágora Design System (componentes + CSS) só quando está selecionado.
  // Textos editados no backoffice (Worker) e, no aspeto Mosaico, o Ágora: carregados em paralelo antes de desenhar.
  await Promise.all([carregarTextos(), prefs.formato === "mosaico" ? carregarAgora() : Promise.resolve()]);
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
