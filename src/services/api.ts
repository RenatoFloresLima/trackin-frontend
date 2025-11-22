import axios from "axios";

/**
 * Detecta o ambiente e define a URL base da API
 * Prioridade:
 * 1. Variável de ambiente VITE_API_BASE_URL (configurada no build ou runtime)
 * 2. Detecção automática: usa o mesmo hostname/porta do frontend com porta 8081 do backend
 * 3. Fallback: localhost para desenvolvimento local
 */
const getApiBaseUrl = (): string => {
  // 1. Prioridade: variável de ambiente (configurada no .env ou no momento do build)
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    console.log("🔧 Usando URL da API de variável de ambiente:", envUrl);
    return envUrl;
  }

  // 2. Detecta automaticamente baseado no hostname atual
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    const isLocalhost = 
      hostname === "localhost" || 
      hostname === "127.0.0.1" ||
      hostname.includes("localhost");

    if (!isLocalhost) {
      // Em produção (VPS), usa o mesmo IP/domínio com a porta do backend (8081)
      // Se estiver na mesma VPS, pode usar hostname, senão precisa do IP completo
      const baseUrl = `${protocol}//${hostname}:8081`;
      console.log("🔧 Detectada produção, usando URL da API:", baseUrl);
      return baseUrl;
    }
  }

  // 3. Desenvolvimento local - padrão
  const localUrl = "http://localhost:8080";
  console.log("🔧 Usando URL da API de desenvolvimento:", localUrl);
  return localUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Log sempre visível para debug em produção
console.log("🌐 API Base URL configurada:", API_BASE_URL);
console.log("🌐 Variável de ambiente VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL || "não definida");

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
