// src/Components/Layout/Sidebar.tsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaClock,
  FaUserPlus,
  FaSignOutAlt,
  FaHome,
  FaCheckCircle,
  FaUserCircle,
  FaBuilding,
} from "react-icons/fa";
import { Box, Typography, Avatar, Divider, Tooltip } from "@mui/material";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const userRole = user?.role;

  const navItems = [
    {
      path: "/meu-perfil",
      label: "Meu Perfil",
      icon: FaUserCircle,
      roles: ["ROLE_ADMIN", "ROLE_FUNCIONARIO"],
    },
    {
      path: "/ponto",
      label: "Bater Ponto",
      icon: FaClock,
      roles: ["ROLE_ADMIN", "ROLE_FUNCIONARIO"],
    },
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
      icon: FaHome,
      roles: ["ROLE_ADMIN"],
    },
    {
      path: "/sedes",
      label: "Sedes",
      icon: FaBuilding,
      roles: ["ROLE_ADMIN"],
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!isAuthenticated || !userRole) return false;
    return item.roles.includes(userRole);
  });

  const userDisplayName = user?.login ?? "Usuário";

  const getUserInitials = () => {
    if (!userDisplayName) return "U";
    const parts = userDisplayName.split(/[\s.@_-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return userDisplayName.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="sidebar-container">
      <Box className="sidebar-header">
        <Box className="logo-container">
          <Box className="logo-icon">T</Box>
          <Typography variant="h5" className="logo-text">
            Trackin
          </Typography>
        </Box>
      </Box>

      <Divider className="sidebar-divider" />

      <Box className="sidebar-user-info">
        <Avatar className="user-avatar" sx={{ bgcolor: "#1abc9c" }}>
          {getUserInitials()}
        </Avatar>
        <Box className="user-details">
          <Typography variant="body2" className="user-name" noWrap>
            {userDisplayName}
          </Typography>
          <Typography variant="caption" className="user-role" noWrap>
            {userRole === "ROLE_ADMIN" ? "Administrador" : "Funcionário"}
          </Typography>
        </Box>
      </Box>

      <Divider className="sidebar-divider" />

      <Box className="sidebar-menu" component="ul">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <li key={item.path} className="sidebar-menu-item">
              <Tooltip title={item.label} placement="right" arrow>
                <NavLink
                  to={item.path}
                  className={`nav-link ${isActive ? "nav-link-active" : ""}`}
                >
                  <item.icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  {isActive && <span className="active-indicator" />}
                </NavLink>
              </Tooltip>
            </li>
          );
        })}
      </Box>

      <Box className="sidebar-footer">
        <Divider className="sidebar-divider" />
        <Tooltip title="Sair" placement="right" arrow>
          <button onClick={logout} className="logout-button">
            <FaSignOutAlt className="nav-icon" />
            <span className="nav-label">Sair</span>
          </button>
        </Tooltip>
      </Box>
    </nav>
  );
};

export default Sidebar;
