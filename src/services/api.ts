import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

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
