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
import { ThemeProvider, CssBaseline, GlobalStyles } from "@mui/material";
import Box from "@mui/material/Box";

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
import HomeRedirector from "./Components/HomeRedirector";
import SedesListPage from "./Components/sede/SedesListPage";
import SedeFormPage from "./Components/sede/SedeFormPage";
import FuncoesListPage from "./Components/funcao/FuncoesListPage";
import FuncaoFormPage from "./Components/funcao/FuncaoFormPage";
import EmpresasListPage from "./Components/empresa/EmpresasListPage";
import EmpresaFormPage from "./Components/empresa/EmpresaFormPage";
import CompanyAdminsListPage from "./Components/empresa/CompanyAdminsListPage";
import CompanyAdminFormPage from "./Components/empresa/CompanyAdminFormPage";
import JornadaRegraFormPage from "./Components/empresa/JornadaRegraFormPage";
import TurnosListPage from "./Components/turno/TurnosListPage";
import TurnoFormPage from "./Components/turno/TurnoFormPage";

// Estilos Globais
import "./App.css";
import theme from "./theme/theme";

// -----------------------------------------------------
// Layout para rotas autenticadas com Sidebar
// -----------------------------------------------------
const AppLayout: React.FC = () => (
  <Box className="main-app-layout">
    <Sidebar />
    <Box component="main" className="main-content">
      <Outlet />
    </Box>
  </Box>
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
          <Route path="/funcionarios/editar/:id" element={<EditarFuncionario />} />

          {/* Rotas de Empresas */}
          {/* Listar todas e criar: apenas SYSTEM_ADMIN */}
          <Route
            path="/empresas"
            element={
              <PrivateRoute roles={["ROLE_SYSTEM_ADMIN"]}>
                <EmpresasListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/empresas/nova"
            element={
              <PrivateRoute roles={["ROLE_SYSTEM_ADMIN"]}>
                <EmpresaFormPage />
              </PrivateRoute>
            }
          />
          {/* Editar: SYSTEM_ADMIN (qualquer) ou COMPANY_ADMIN (apenas sua) */}
          <Route
            path="/empresas/:id/editar"
            element={
              <PrivateRoute roles={["ROLE_SYSTEM_ADMIN", "ROLE_COMPANY_ADMIN"]}>
                <EmpresaFormPage />
              </PrivateRoute>
            }
          />
          {/* Ver detalhes: SYSTEM_ADMIN (qualquer) ou COMPANY_ADMIN (apenas sua) */}
          <Route
            path="/empresas/:id"
            element={
              <PrivateRoute roles={["ROLE_SYSTEM_ADMIN", "ROLE_COMPANY_ADMIN"]}>
                <EmpresaFormPage />
              </PrivateRoute>
            }
          />
          {/* Regras de Jornada: SYSTEM_ADMIN (qualquer) ou COMPANY_ADMIN (apenas sua) */}
          <Route
            path="/empresas/:empresaId/jornada-regras"
            element={
              <PrivateRoute roles={["ROLE_SYSTEM_ADMIN", "ROLE_COMPANY_ADMIN"]}>
                <JornadaRegraFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/company-admins"
            element={
              <PrivateRoute roles={["ROLE_SYSTEM_ADMIN"]}>
                <CompanyAdminsListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/company-admins/novo"
            element={
              <PrivateRoute roles={["ROLE_SYSTEM_ADMIN"]}>
                <CompanyAdminFormPage />
              </PrivateRoute>
            }
          />

          {/* Rotas Admin e Company Admin (Proteção Dupla via PrivateRoute aninhada) */}
          <Route
            path="/cadastro"
            element={
              <PrivateRoute roles={["ROLE_ADMIN", "ROLE_COMPANY_ADMIN"]}>
                <CadastroFuncionario />
              </PrivateRoute>
            }
          />
          <Route
            path="/lista-funcionarios"
            element={
              <PrivateRoute roles={["ROLE_ADMIN", "ROLE_COMPANY_ADMIN"]}>
                <ListaFuncionarios />
              </PrivateRoute>
            }
          />
          <Route
            path="/aprovacao-pontos"
            element={
              <PrivateRoute roles={["ROLE_ADMIN", "ROLE_COMPANY_ADMIN"]}>
                <AprovacaoPontoPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/sedes"
            element={
              <PrivateRoute roles={["ROLE_ADMIN", "ROLE_COMPANY_ADMIN"]}>
                <SedesListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/sedes/nova"
            element={
              <PrivateRoute roles={["ROLE_ADMIN", "ROLE_COMPANY_ADMIN"]}>
                <SedeFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/sedes/:id/editar"
            element={
              <PrivateRoute roles={["ROLE_ADMIN", "ROLE_COMPANY_ADMIN"]}>
                <SedeFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/funcoes"
            element={
              <PrivateRoute roles={["ROLE_ADMIN", "ROLE_COMPANY_ADMIN"]}>
                <FuncoesListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/funcoes/nova"
            element={
              <PrivateRoute roles={["ROLE_ADMIN", "ROLE_COMPANY_ADMIN"]}>
                <FuncaoFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/funcoes/:id/editar"
            element={
              <PrivateRoute roles={["ROLE_ADMIN", "ROLE_COMPANY_ADMIN"]}>
                <FuncaoFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/turnos"
            element={
              <PrivateRoute roles={["ROLE_ADMIN", "ROLE_COMPANY_ADMIN"]}>
                <TurnosListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/turnos/novo"
            element={
              <PrivateRoute roles={["ROLE_ADMIN", "ROLE_COMPANY_ADMIN"]}>
                <TurnoFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/turnos/:id/editar"
            element={
              <PrivateRoute roles={["ROLE_ADMIN", "ROLE_COMPANY_ADMIN"]}>
                <TurnoFormPage />
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{ body: { backgroundColor: "#f4f6f8" } }} />
      <AuthProvider>
        <RouterProvider router={appRouter} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
