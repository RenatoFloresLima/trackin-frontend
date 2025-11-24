// src/Components/PrivateRoute.tsx (CÓDIGO COMPLETO A SER UTILIZADO)

import React, { type ReactNode } from "react"; // 🔑 ADICIONE ReactNode
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface PrivateRouteProps {
  roles?: ("ROLE_ADMIN" | "ROLE_FUNCIONARIO" | "ROLE_SYSTEM_ADMIN" | "ROLE_COMPANY_ADMIN" | string)[];
  children?: ReactNode; // 🔑 NOVO: Para suportar o componente aninhado
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ roles, children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // 1. CHECAGEM DE AUTENTICAÇÃO
  if (!isAuthenticated) {
    // Redireciona para o login (salvando o local que ele tentou acessar)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. CHECAGEM DE AUTORIZAÇÃO (Se a rota exige uma role específica)
  if (roles && user && !roles.includes(user.role)) {
    // Se logado mas sem a permissão correta, redireciona para a tela padrão.
    let redirectPath = "/meu-perfil";
    if (user.role === "ROLE_ADMIN" || user.role === "ROLE_COMPANY_ADMIN") {
      redirectPath = "/aprovacao-pontos";
    } else if (user.role === "ROLE_SYSTEM_ADMIN") {
      redirectPath = "/empresas";
    }

    // Garante que não redireciona infinitamente se tentar acessar a própria rota de redirecionamento.
    if (location.pathname === redirectPath) {
      // Se já está na rota de redirecionamento, apenas mostra um erro ou a própria tela.
      return children ? <>{children}</> : <Outlet />;
    }

    return <Navigate to={redirectPath} replace />;
  }

  // 3. RENDERIZAÇÃO: Decide se renderiza 'children' ou o 'Outlet'
  // Se 'children' existir, significa que ele foi usado como filtro de permissão.
  // Se não, ele foi usado como Layout Wrapper para rotas filhas.
  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
