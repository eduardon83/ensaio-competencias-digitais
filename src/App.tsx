import { Navigate, Route, Routes } from "react-router";
import { Layout } from "./componentes/Layout";
import { Inicio } from "./paginas/Inicio";
import { EscolherNivel, Percurso } from "./paginas/Teste";
import { Catalogo, Treino } from "./paginas/Catalogo";
import { AtividadePagina } from "./paginas/AtividadePagina";
import { Observatorio, Resultados } from "./paginas/Conta";
import { Acessibilidade, Codigo, Privacidade, Professor, Sobre } from "./paginas/Textos";
import { Definicoes } from "./paginas/Definicoes";
import { Admin } from "./paginas/Admin";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="teste" element={<EscolherNivel />} />
        <Route path="teste/:ciclo" element={<Percurso />} />
        <Route path="atividades" element={<Catalogo />} />
        <Route path="atividades/:slug/:nivel" element={<AtividadePagina />} />
        <Route path="treino" element={<Treino />} />
        <Route path="codigo" element={<Codigo />} />
        <Route path="professor" element={<Professor />} />
        <Route path="resultados" element={<Resultados />} />
        <Route path="conta" element={<Navigate to="/resultados" replace />} />
        <Route path="observatorio" element={<Observatorio />} />
        <Route path="admin" element={<Admin />} />
        <Route path="acessibilidade" element={<Acessibilidade />} />
        <Route path="sobre" element={<Sobre />} />
        <Route path="privacidade" element={<Privacidade />} />
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
