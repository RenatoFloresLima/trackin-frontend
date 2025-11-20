import axios from "axios";

/**
 * Detecta o ambiente e define a URL base da API
 * Prioridade:
 * 1. Variável de ambiente VITE_API_BASE_URL (configurada no Vercel)
 * 2. Detecção automática: se estiver em produção (não localhost), usa o backend em produção
 * 3. Fallback: localhost para desenvolvimento local
 */
const getApiBaseUrl = (): string => {
  // 1. Prioridade: variável de ambiente (configurada no Vercel ou .env)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2. Detecta se está em produção (Vercel ou outro servidor)
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isProduction = 
      hostname !== "localhost" && 
      hostname !== "127.0.0.1" &&
      !hostname.includes("localhost");

    if (isProduction) {
      // URL do backend em produção (Render)
      return "https://trackin-4aao.onrender.com";
    }
  }

  // 3. Desenvolvimento local
  return "http://localhost:8080";
};

const API_BASE_URL = getApiBaseUrl();

// Log para debug (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log("🔧 API Base URL configurada:", API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // Não envia cookies, mas permite headers de autorização
  headers: {
    "Content-Type": "application/json",
  },
});

// Adiciona um interceptor de requisição para injetar o token JWT
api.interceptors.request.use(
  (config) => {
    // Busca o token do localStorage (usando a chave correta 'authToken')
    const token = localStorage.getItem("authToken");

    if (token) {
      // Injeta o token no cabeçalho Authorization de cada requisição
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se for erro de CORS, loga informações úteis
    if (error.code === "ERR_NETWORK" || error.message.includes("CORS")) {
      console.error("Erro de CORS detectado:", {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
