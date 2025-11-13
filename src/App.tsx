// src/App.tsx

import { AuthProvider } from "./contexts/AuthContext";
import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Outlet,
} from "react-router-dom";

// 🔑 Páginas
import Login from "./Components/Login/Login";
import CadastroFuncionario from "./Components/funcionario/Cadastro";
import RegistroPonto from "./Components/Ponto/RegistroPonto";
import PrivateRoute from "./Components/PrivateRoute";
import ListaFuncionarios from "./Components/funcionario/lista/ListaFuncionarios";
import EditarFuncionario from "./Components/funcionario/FuncionarioEdicaoPage";
import AprovacaoPontoPage from "./Components/Ponto/AprovacaoPontoPage";
import Sidebar from "./Components/Layout/Sidebar";
import FuncionarioDetalhesScreen from "./Components/funcionario/FuncionarioDetalhesScreen";
import HomeRedirector from "./Components/HomeRedirector"; // 🔑 IMPORTANDO O NOVO COMPONENTE
import SedesListPage from "./Components/sede/SedesListPage";
import SedeFormPage from "./Components/sede/SedeFormPage";

// Estilos Globais
import "./App.css";

// -----------------------------------------------------
// Layout para rotas autenticadas com Sidebar
// -----------------------------------------------------
const AppLayout: React.FC = () => (
  // Classe principal para rotas autenticadas (com sidebar)
  <div className="main-app-layout">
    <Sidebar />
    <main className="main-content">
      <Outlet />
    </main>
  </div>
);

// -----------------------------------------------------
// Roteamento
// -----------------------------------------------------
const appRouter = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* 🔑 GRUPO 1: Rota pública de Login (SEM LAYOUT) */}
      <Route path="/login" element={<Login />} />

      {/* 🔑 GRUPO 2: Rotas Protegidas (com Layout) */}
      <Route element={<PrivateRoute />}>
        {/* Rota raiz (/) protegida: usa HomeRedirector para enviar para o perfil correto */}
        <Route index element={<HomeRedirector />} />

        {/* Rota aninhada que aplica o Sidebar e o main-content */}
        <Route element={<AppLayout />}>
          {/* Rotas gerais (funcionário/admin) */}
          <Route path="/meu-perfil" element={<FuncionarioDetalhesScreen />} />
          <Route path="/ponto" element={<RegistroPonto />} />
          <Route
            path="/funcionarios/editar/:id"
            element={<EditarFuncionario />}
          />

          {/* Rotas Admin (Proteção Dupla via PrivateRoute aninhada) */}
          <Route
            path="/cadastro"
            element={
              <PrivateRoute roles={["ROLE_ADMIN"]}>
                <CadastroFuncionario />
              </PrivateRoute>
            }
          />
          <Route
            path="/lista-funcionarios"
            element={
              <PrivateRoute roles={["ROLE_ADMIN"]}>
                <ListaFuncionarios />
              </PrivateRoute>
            }
          />
          <Route
            path="/aprovacao-pontos"
            element={
              <PrivateRoute roles={["ROLE_ADMIN"]}>
                <AprovacaoPontoPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/sedes"
            element={
              <PrivateRoute roles={["ROLE_ADMIN"]}>
                <SedesListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/sedes/nova"
            element={
              <PrivateRoute roles={["ROLE_ADMIN"]}>
                <SedeFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/sedes/:id/editar"
            element={
              <PrivateRoute roles={["ROLE_ADMIN"]}>
                <SedeFormPage />
              </PrivateRoute>
            }
          />
        </Route>
      </Route>

      {/* 🔑 GRUPO 3: Rota 404 (Fallback) */}
      <Route path="*" element={<div>404: Página Não Encontrada</div>} />
    </>
  )
);

// -----------------------------------------------------
// Componente App
// -----------------------------------------------------
function App() {
  return (
    <AuthProvider>
      <RouterProvider router={appRouter} />
    </AuthProvider>
  );
}

export default App;
