// src/Components/Layout/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaClock,
  FaUserPlus,
  FaSignOutAlt,
  FaHome,
  FaCheckCircle,
  FaUserCircle, // NOVO: Ícone para o perfil
} from "react-icons/fa";

import "./Sidebar.css"; // Assumindo que este arquivo de estilos existe

const Sidebar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const userRole = user?.role; // 'ROLE_ADMIN' ou 'ROLE_FUNCIONARIO'

  // Itens de navegação padrão
  const navItems = [
    // 🔑 ITEM ATUALIZADO: "Início" agora aponta para o Perfil
    {
      path: "/meu-perfil",
      label: "Meu Perfil",
      icon: FaUserCircle, // Usamos o ícone de perfil
      roles: ["ROLE_ADMIN", "ROLE_FUNCIONARIO"],
    },
    {
      path: "/ponto",
      label: "Bater Ponto",
      icon: FaClock,
      roles: ["ROLE_ADMIN", "ROLE_FUNCIONARIO"],
    },
    // Apenas admins veem Aprovação de Pontos
    {
      path: "/aprovacao-pontos",
      label: "Aprovação de Pontos",
      icon: FaCheckCircle,
      roles: ["ROLE_ADMIN"],
    },
    {
      path: "/cadastro",
      label: "Cadastro Func.",
      icon: FaUserPlus,
      roles: ["ROLE_ADMIN"],
    },
    {
      path: "/lista-funcionarios",
      label: "Funcionários",
      icon: FaHome, // Mudando o ícone, já que FaUserPlus foi para cadastro
      roles: ["ROLE_ADMIN"],
    },
  ];

  // Filtra itens com base na role do usuário
  const filteredNavItems = navItems.filter((item) => {
    if (!isAuthenticated || !userRole) return false;
    return item.roles.includes(userRole);
  });

  return (
    <nav className="sidebar-container">
      <div className="sidebar-header">
        <h2>Trackin</h2>
      </div>
      <ul className="sidebar-menu">
        {filteredNavItems.map((item) => (
          <li key={item.path} className="sidebar-menu-item">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-link-active" : "nav-link"
              }
            >
              <item.icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-button">
          <FaSignOutAlt className="nav-icon" />
          <span className="nav-label">Sair</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
