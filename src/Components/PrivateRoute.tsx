// src/Components/PrivateRoute.tsx (Revisão)

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface PrivateRouteProps {
  roles?: ("ROLE_ADMIN" | "ROLE_FUNCIONARIO" | string)[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ roles }) => {
  const { isAuthenticated, user } = useAuth();

  // 🔑 1. CHECAGEM DE AUTENTICAÇÃO
  if (!isAuthenticated) {
    // NÃO AUTENTICADO: Redireciona para o login
    return <Navigate to="/login" replace />;
  }

  // 🔑 2. CHECAGEM DE AUTORIZAÇÃO (Se a rota exige uma role específica)
  if (roles && user && !roles.includes(user.role)) {
    // Autenticado, mas sem a ROLE necessária.

    // Fallback: Redireciona para a tela padrão do funcionário, se não for admin
    if (user.role !== "ROLE_ADMIN") {
      return <Navigate to="/ponto" replace />;
    }
    // Se for admin, mas tentou acessar algo que não deveria, pode ir para uma tela de erro ou a principal do admin.
    return <Navigate to="/cadastro" replace />; // Ou para o destino principal do Admin
  }

  // AUTENTICADO E AUTORIZADO: Permite a navegação para o componente filho (Outlet)
  return <Outlet />;
};

export default PrivateRoute;
