import api from "./api";
import type { FuncaoRequest, FuncaoResponse } from "../types/FuncaoTypes";

const API_FUNCOES = "/api/funcoes";

export const FuncaoAPIService = {
  /**
   * Lista apenas funções ativas (para usuários autenticados)
   */
  listarAtivas: async (): Promise<FuncaoResponse[]> => {
    const response = await api.get<FuncaoResponse[]>(API_FUNCOES);
    return response.data;
  },

  /**
   * Lista todas as funções (incluindo inativas) - apenas ADMIN
   */
  listarTodas: async (): Promise<FuncaoResponse[]> => {
    const response = await api.get<FuncaoResponse[]>(`${API_FUNCOES}/todas`);
    return response.data;
  },

  /**
   * Busca uma função por ID
   */
  buscarPorId: async (id: number): Promise<FuncaoResponse> => {
    const response = await api.get<FuncaoResponse>(`${API_FUNCOES}/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova função - apenas ADMIN
   */
  criar: async (funcao: FuncaoRequest): Promise<FuncaoResponse> => {
    const response = await api.post<FuncaoResponse>(API_FUNCOES, funcao);
    return response.data;
  },

  /**
   * Atualiza uma função existente - apenas ADMIN
   */
  atualizar: async (id: number, funcao: FuncaoRequest): Promise<FuncaoResponse> => {
    const response = await api.put<FuncaoResponse>(`${API_FUNCOES}/${id}`, funcao);
    return response.data;
  },

  /**
   * Desativa uma função (não exclui, apenas marca como inativa) - apenas ADMIN
   */
  desativar: async (id: number): Promise<void> => {
    await api.delete(`${API_FUNCOES}/${id}`);
  },
};

