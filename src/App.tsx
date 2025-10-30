// src/App.tsx
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";

// 🔑 Páginas
import Login from "./Components/Login/Login";
import CadastroFuncionario from "./Components/funcionario/Cadastro";
import RegistroPonto from "./Components/Ponto/RegistroPonto";
import PrivateRoute from "./Components/PrivateRoute";
import ListaFuncionarios from "./Components/funcionario/lista/ListaFuncionarios";
import EditarFuncionario from "./Components/funcionario/FuncionarioEdicaoPage";

import Sidebar from "./Components/Layout/Sidebar"; // Importado

// Estilos Globais
import "./App.css";
// Certifique-se de que Layout.css (ou o CSS com main-app-layout) está importado

// -----------------------------------------------------
// 1. Componente de Layout para Rotas AUTENTICADAS (COM Sidebar)
// -----------------------------------------------------
// Este componente é o 'element' da rota protegida.
// Ele só será renderizado se o PrivateRoute permitir.

const AppLayout: React.FC = () => {
  // Não precisa checar autenticação aqui, o PrivateRoute faz isso.
  return (
    // As classes 'main-app-layout' e 'main-content' devem ser definidas no seu CSS
    <div className="App">
      {/* 🔑 Sidebar: Aparece SEMPRE que o AppLayout for alcançado */}
      <Sidebar />

      <main className="main-content">
        {/* O Outlet renderiza o componente da rota filha (/ponto, /cadastro, etc.) */}
        <Outlet />
      </main>
    </div>
  );
};

// -----------------------------------------------------
// 2. Defina o Roteador
// -----------------------------------------------------

const appRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={
        <div className="App">
          <Outlet />
        </div>
      }
    >
      {/* Rota inicial / redireciona para /login (PÚBLICA) */}
      <Route index element={<Navigate to="/login" replace />} />

      {/* ROTA PÚBLICA (Login): Não usa AppLayout, nem Sidebar */}
      <Route path="/login" element={<Login />} />

      {/* 🛑 INÍCIO DAS ROTAS PROTEGIDAS 🛑 */}
      {/* Rota 1: Checa o Token (PrivateRoute) E Define o Layout (AppLayout) */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          {/* 1. Rotas com Sidebar (Funcionário padrão/logado) */}
          <Route path="/ponto" element={<RegistroPonto />} />
          <Route
            path="/funcionarios/editar/:id"
            element={<EditarFuncionario />}
          />

          {/* 2. Rota de Cadastro (APENAS ADMIN): 
                 O PrivateRoute AGORA É O ELEMENTO DA ROTA. */}
          <Route
            path="/cadastro"
            // 🔑 NOVO USO: PrivateRoute é um filtro para o componente CadastroFuncionario
            element={
              <PrivateRoute roles={["ROLE_ADMIN"]}>
                {/* O CadastroFuncionario HERDA o layout AppLayout */}
                <CadastroFuncionario />
              </PrivateRoute>
            }
          />
          <Route
            path="/lista-funcionarios"
            // 🔑 NOVO USO: PrivateRoute é um filtro para o componente CadastroFuncionario
            element={
              <PrivateRoute roles={["ROLE_ADMIN"]}>
                {/* O CadastroFuncionario HERDA o layout AppLayout */}
                <ListaFuncionarios />
              </PrivateRoute>
            }
          />
        </Route>
      </Route>

      {/* Rota 404 (Acessível publicamente) */}
      <Route path="*" element={<div>404: Página Não Encontrada</div>} />
    </Route>
  )
);
// -----------------------------------------------------
// 3. Componente App (Provedor do Roteador)
// -----------------------------------------------------

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={appRouter} />
    </AuthProvider>
  );
}

export default App;
