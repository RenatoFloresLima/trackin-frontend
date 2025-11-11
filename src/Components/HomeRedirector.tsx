// src/Components/HomeRedirector.tsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const HomeRedirector: React.FC = () => {
  // 🔑 Assumindo que useAuth fornece o user (que tem a role) e o estado de carregamento
  const { user, authLoading } = useAuth();

  // 1. Mostra um spinner enquanto o contexto está carregando
  if (authLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // 2. Se não houver usuário logado (deveria ser pego pelo PrivateRoute, mas é uma segurança)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔑 3. Redirecionamento Condicional Principal
  // Assumindo que a role é uma string (ex: "ROLE_ADMIN")
  const userRole = user.role;

  if (userRole === "ROLE_ADMIN") {
    // Redireciona ADMIN para a tela de aprovação
    return <Navigate to="/aprovacao-pontos" replace />;
  } else {
    // Redireciona FUNCIONÁRIO (ou qualquer outro perfil) para Meu Perfil
    return <Navigate to="/meu-perfil" replace />;
  }
};

export default HomeRedirector;
