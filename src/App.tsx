import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { Layout } from "./componentes/Layout";
import { Inicio, Treinar } from "./paginas/Inicio";
import { EscolherNivel, Percurso } from "./paginas/Teste";
import { Catalogo, Treino } from "./paginas/Catalogo";
import { AtividadePagina } from "./paginas/AtividadePagina";
import { Resultados } from "./paginas/Conta";
import { Observatorio } from "./paginas/Observatorio";
import { Acessibilidade, Licenca, Privacidade, Sobre } from "./paginas/Textos";
import { Definicoes } from "./paginas/Definicoes";
import { Admin } from "./paginas/Admin";
import { Professor, ResultadosProfessor } from "./paginas/Professor";
import { Codigo } from "./paginas/Codigo";
import { Tutorial } from "./paginas/Tutorial";
import { CartaoCarimbos } from "./paginas/CartaoCarimbos";
import { JogoPagina, Jogos } from "./paginas/Jogos";
import { Seguranca, SegurancaTema, SegurancaTeste } from "./paginas/Seguranca";
import { Espera } from "./aldeia/arte/espera";

// Backoffice de textos (temporário): carregado só quando se abre.
const Backoffice = lazy(() => import("./paginas/Backoffice"));
// Aldeia Digital: o jogo do aluno e as páginas do professor carregam à parte.
const AldeiaApp = lazy(() => import("./aldeia/ecras/AldeiaApp"));
const AldeiaInicio = lazy(() => import("./aldeia/ecras/AldeiaApp").then((m) => ({ default: m.AldeiaInicio })));
const PainelAldeia = lazy(() => import("./aldeia/professor/Painel"));
const EmailAldeia = lazy(() => import("./aldeia/professor/Documentos").then((m) => ({ default: m.EmailAldeia })));
const TermosAldeia = lazy(() => import("./aldeia/professor/Documentos").then((m) => ({ default: m.Termos })));
const TratamentoAldeia = lazy(() => import("./aldeia/professor/Documentos").then((m) => ({ default: m.Tratamento })));
const espera = <Espera />;

export function App() {
  return (
    <Routes>
      <Route path="aldeia" element={<Suspense fallback={espera}><AldeiaInicio /></Suspense>} />
      <Route path="aldeia/:codigo/*" element={<Suspense fallback={espera}><AldeiaApp /></Suspense>} />
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="treinar" element={<Treinar />} />
        <Route path="teste" element={<EscolherNivel />} />
        <Route path="teste/:ciclo" element={<Percurso />} />
        <Route path="treino" element={<Treino />} />
        <Route path="atividades" element={<Catalogo />} />
        <Route path="atividades/:slug/:nivel" element={<AtividadePagina />} />
        <Route path="codigo" element={<Codigo />} />
        <Route path="codigo/:codigo" element={<Codigo />} />
        <Route path="professor" element={<Professor />} />
        <Route path="professor/resultados" element={<ResultadosProfessor />} />
        <Route path="professor/aldeia/painel" element={<Suspense fallback={espera}><PainelAldeia /></Suspense>} />
        <Route path="professor/aldeia/email" element={<Suspense fallback={espera}><EmailAldeia /></Suspense>} />
        <Route path="professor/aldeia/termos" element={<Suspense fallback={espera}><TermosAldeia /></Suspense>} />
        <Route path="professor/aldeia/tratamento" element={<Suspense fallback={espera}><TratamentoAldeia /></Suspense>} />
        <Route path="tutorial" element={<Tutorial />} />
        <Route path="observatorio" element={<Observatorio />} />
        <Route path="resultados" element={<Resultados />} />
        <Route path="cartao" element={<CartaoCarimbos />} />
        <Route path="jogos" element={<Jogos />} />
        <Route path="jogos/:slug/:nivel" element={<JogoPagina />} />
        <Route path="backoffice" element={<Suspense fallback={espera}><Backoffice /></Suspense>} />
        <Route path="seguranca" element={<Seguranca />} />
        <Route path="seguranca/:tema" element={<SegurancaTema />} />
        <Route path="seguranca/:tema/teste/:nivel" element={<SegurancaTeste />} />
        <Route path="conta" element={<Navigate to="/resultados" replace />} />
        <Route path="admin" element={<Admin />} />
        <Route path="acessibilidade" element={<Acessibilidade />} />
        <Route path="sobre" element={<Sobre />} />
        <Route path="privacidade" element={<Privacidade />} />
        <Route path="licenca" element={<Licenca />} />
        <Route path="definicoes" element={<Definicoes />} />
        <Route
          path="*"
          element={
            <div className="grid gap-2">
              <h1 className="text-3xl">Página não encontrada</h1>
              <p className="m-0">
                <a href="/">Voltar ao início</a>
              </p>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
