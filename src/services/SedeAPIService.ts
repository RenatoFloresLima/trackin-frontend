import api from "./api";
import type { SedeRequest, SedeResponse } from "../types/SedeTypes";

const API_SEDES = "/api/sedes";

export const SedeAPIService = {
  /**
   * Lista todas as sedes
   */
  listarTodas: async (): Promise<SedeResponse[]> => {
    const response = await api.get<SedeResponse[]>(API_SEDES);
    return response.data;
  },

  /**
   * Busca uma sede por ID
   */
  buscarPorId: async (id: number): Promise<SedeResponse> => {
    const response = await api.get<SedeResponse>(`${API_SEDES}/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova sede
   */
  criar: async (sede: SedeRequest): Promise<SedeResponse> => {
    const response = await api.post<SedeResponse>(API_SEDES, sede);
    return response.data;
  },

  /**
   * Atualiza uma sede existente
   */
  atualizar: async (id: number, sede: SedeRequest): Promise<SedeResponse> => {
    const response = await api.put<SedeResponse>(`${API_SEDES}/${id}`, sede);
    return response.data;
  },

  /**
   * Desativa uma sede (não exclui, apenas marca como inativa)
   */
  desativar: async (id: number): Promise<void> => {
    await api.delete(`${API_SEDES}/${id}`);
  },
};
