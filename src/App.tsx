import { Navigate, Route, Routes } from "react-router";
import { Layout } from "./componentes/Layout";
import { Inicio, Treinar } from "./paginas/Inicio";
import { EscolherNivel, Percurso } from "./paginas/Teste";
import { Catalogo, Treino } from "./paginas/Catalogo";
import { AtividadePagina } from "./paginas/AtividadePagina";
import { Observatorio, Resultados } from "./paginas/Conta";
import { Acessibilidade, Licenca, Privacidade, Sobre } from "./paginas/Textos";
import { Definicoes } from "./paginas/Definicoes";
import { Admin } from "./paginas/Admin";
import { Professor, ResultadosProfessor } from "./paginas/Professor";
import { Codigo } from "./paginas/Codigo";
import { Tutorial } from "./paginas/Tutorial";
import { CartaoCarimbos } from "./paginas/CartaoCarimbos";

export function App() {
  return (
    <Routes>
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
        <Route path="tutorial" element={<Tutorial />} />
        <Route path="observatorio" element={<Observatorio />} />
        <Route path="resultados" element={<Resultados />} />
        <Route path="cartao" element={<CartaoCarimbos />} />
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
