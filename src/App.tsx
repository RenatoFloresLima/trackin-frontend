// src/App.tsx
import { AuthProvider } from "./contexts/AuthContext";
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

// Estilos Globais
import "./App.css";

// -----------------------------------------------------
// 1. Crie o Componente de Layout PRIMEIRO
// -----------------------------------------------------

// Este componente é o 'element' da rota pai "/"
const AppLayout: React.FC = () => {
  return (
    // Sua div de layout que usa o App.css
    <div className="App">
      {/* O Outlet renderiza o componente da rota filha (/login, /cadastro, etc.) */}
      <Outlet />
    </div>
  );
};

// -----------------------------------------------------
// 2. Defina o Roteador DEPOIS (usando o AppLayout)
// -----------------------------------------------------

const appRouter = createBrowserRouter(
  createRoutesFromElements(
    // 🛑 AGORA AppLayout está definido e pode ser usado
    <Route path="/" element={<AppLayout />}>
      {/* Rota inicial / redireciona para /login */}
      <Route index element={<Navigate to="/login" replace />} />

      {/* Rotas Públicas */}
      <Route path="/login" element={<Login />} />

      <Route element={<PrivateRoute />}>
        {/* Todas as rotas abaixo só podem ser acessadas com token válido */}

        {/* Rota Padrão (Funcionário Comum, ou fallback) */}
        <Route path="/ponto" element={<RegistroPonto />} />

        {/* Rota ADMINISTRATIVA: Proteção extra por ROLE */}
        <Route element={<PrivateRoute roles={["ROLE_ADMIN"]} />}>
          <Route path="/cadastro" element={<CadastroFuncionario />} />
        </Route>
      </Route>

      {/* Rota 404 */}
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
