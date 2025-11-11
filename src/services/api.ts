import axios from "axios";

// Usa variável de ambiente ou fallback para localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
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

export default api;
