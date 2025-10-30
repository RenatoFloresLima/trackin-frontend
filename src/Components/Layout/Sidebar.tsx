// src/Components/Layout/Sidebar.tsx

import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Para saber se é Admin
import { FaClock, FaUserPlus, FaSignOutAlt, FaHome } from "react-icons/fa";

import "./Sidebar.css"; // Vamos criar este CSS a seguir

const Sidebar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const userRole = user?.role; // Ex: 'ROLE_ADMIN' ou 'ROLE_FUNCIONARIO'

  // Itens de navegação padrão
  const navItems = [
    {
      path: "/",
      label: "Início",
      icon: FaHome,
      roles: ["ROLE_ADMIN", "ROLE_FUNCIONARIO"],
    },
    {
      path: "/ponto",
      label: "Bater Ponto",
      icon: FaClock,
      roles: ["ROLE_ADMIN", "ROLE_FUNCIONARIO"],
    },
    // A rota de Cadastro só aparece para ROLE_ADMIN
    {
      path: "/cadastro",
      label: "Cadastro Func.",
      icon: FaUserPlus,
      roles: ["ROLE_ADMIN"],
    },
    {
      path: "/lista-funcionarios",
      label: "Funcionários",
      icon: FaUserPlus,
      roles: ["ROLE_ADMIN"],
    },
  ];

  // Filtra os itens com base na role do usuário
  const filteredNavItems = navItems.filter((item) => {
    // Se for ROLE_ADMIN, permite acesso aos itens dele
    if (!isAuthenticated || !userRole) {
      return false;
    }
    // Se for ROLE_FUNCIONARIO, permite acesso aos itens dele (e itens comuns)
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
            {/* NavLink para destacar o link ativo */}
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
