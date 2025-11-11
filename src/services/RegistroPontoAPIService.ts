// src/services/RegistroPontoAPIService.ts

import api from "./api";
import type {
  FiltroPontoFuncionarioDTO,
  RegistroPontoDetalheResponse,
} from "../types/PontoTypes";

const API_PONTO = "/api/registros-ponto";

export const RegistroPontoAPIService = {
  // ... (outros métodos como registrarPontoAutomatico)

  /**
   * Busca registros de ponto de um funcionário em um período específico.
   * Chama o endpoint GET /api/registros-ponto/funcionario/{funcionarioId}
   */
  buscarRegistrosPorFuncionarioEPeriodo: async (
    funcionarioId: number,
    filtro: FiltroPontoFuncionarioDTO
  ): Promise<RegistroPontoDetalheResponse[]> => {
    // Converte o DTO de filtro para query params
    const params = new URLSearchParams(filtro as any).toString();

    const response = await api.get<RegistroPontoDetalheResponse[]>(
      `${API_PONTO}/funcionario/${funcionarioId}?${params}`
    );

    return response.data;
  },
};
