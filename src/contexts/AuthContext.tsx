// src/contexts/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../services/api";

// -----------------------------------------------------
// 1. Tipagem
// -----------------------------------------------------

interface User {
  login: string;
  role: "ROLE_ADMIN" | "ROLE_FUNCIONARIO" | string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  // 🔑 CRÍTICO: Agora a função login retorna a ROLE como string para uso imediato no Login.tsx
  login: (login: string, senha: string) => Promise<string>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// -----------------------------------------------------
// 2. Provedor do Contexto
// -----------------------------------------------------

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔑 Lógica de persistência: Carregar dados do localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  // 1. Função de Login
  const login = async (loginInput: string, senha: string) => {
    try {
      // Endpoint mantido em /api/auth/login conforme sua última confirmação
      const response = await api.post("/api/auth/login", {
        login: loginInput,
        senha,
      });

      const { token, login: userLogin, role } = response.data;

      const newUser: User = { login: userLogin, role };

      // Armazenar no estado e no localStorage
      setToken(token);
      setUser(newUser);

      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(newUser));

      // Configurar o Axios
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 🔑 CRÍTICO: Retorna a role imediatamente para o componente de login
      return role;
    } catch (error) {
      const errorMessage =
        error.response && error.response.status === 401
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
    delete api.defaults.headers.common["Authorization"];
  };

  // 🔑 Variáveis computadas
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ROLE_ADMIN";

  if (loading) {
    return <div>Carregando sessão...</div>;
  }

  // 3. Retorno do Provedor
  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 4. Hook Customizado para usar o Contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
