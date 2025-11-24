import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { AxiosError } from "axios"; // Importa o tipo de erro do Axios
import api from "../services/api"; // O caminho de importação ajustado

// -----------------------------------------------------
// 1. Tipagem
// -----------------------------------------------------

interface User {
  login: string;
  // É comum que a role no front-end seja simplificada, mas 'ROLE_' é padrão Spring Security
  role: "ROLE_ADMIN" | "ROLE_FUNCIONARIO" | "ROLE_SYSTEM_ADMIN" | "ROLE_COMPANY_ADMIN" | string;
  nome?: string | null; // Primeiro nome do funcionário
  funcaoNome?: string | null; // Nome da função do funcionário
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (login: string, senha: string) => Promise<string>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSystemAdmin: boolean;
  isCompanyAdmin: boolean;
  authLoading: boolean;
}

// -----------------------------------------------------
// 2. Definição do Contexto
// -----------------------------------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// -----------------------------------------------------
// 3. Provedor do Contexto
// -----------------------------------------------------

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setAuthLoading(false);
  }, []);

  // 1. Função de Login
  const login = async (loginInput: string, senha: string) => {
    try {
      const response = await api.post("/api/auth/login", {
        login: loginInput,
        senha,
      });

      const { token, login: userLogin, role, nome, funcaoNome } = response.data;

      const newUser: User = { 
        login: userLogin, 
        role,
        nome: nome || null,
        funcaoNome: funcaoNome || null
      };

      // Armazenar no estado e no localStorage
      setToken(token);
      setUser(newUser);

      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(newUser));

      return role;
    } catch (error) {
      // ✅ Aprimoramento na captura do erro
      const axiosError = error as AxiosError;

      const errorMessage =
        axiosError.response && axiosError.response.status === 401
          ? "Usuário ou senha inválidos."
          : "Falha na conexão ou erro desconhecido.";

      console.error("Erro de login:", error);
      throw new Error(errorMessage);
    }
  };

  // 2. Função de Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    // O Interceptor no api.ts garante que o token não será enviado mais
  };

  // 🔑 Variáveis computadas
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ROLE_ADMIN";
  const isSystemAdmin = user?.role === "ROLE_SYSTEM_ADMIN";
  const isCompanyAdmin = user?.role === "ROLE_COMPANY_ADMIN";

  if (authLoading) {
    return <div>Carregando sessão...</div>;
  }

  // 3. Retorno do Provedor
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isSystemAdmin,
        isCompanyAdmin,
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// -----------------------------------------------------
// 4. Hook Customizado para usar o Contexto
// -----------------------------------------------------

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
