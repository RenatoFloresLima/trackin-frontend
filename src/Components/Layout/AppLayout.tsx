// src/Components/Layout/AppLayout.tsx

import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "./Sidebar";

import "./Layout.css"; // Estilos para o layout

const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // A tela de login, por exemplo, usa este layout, mas não precisa do Sidebar.
  // Você pode usar uma lógica aqui, mas a maneira mais limpa é o roteamento.
  // Como o AppLayout é o elemento principal da Rota "/", ele sempre renderiza.

  return (
    <div className="main-app-layout">
      {/* Renderiza o Sidebar apenas se o usuário estiver autenticado */}
      {isAuthenticated && <Sidebar />}

      <main className="main-content">
        {/* O Outlet renderiza a página atual (/ponto, /cadastro, etc) */}
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
