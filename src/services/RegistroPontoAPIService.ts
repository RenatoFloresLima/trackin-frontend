// src/services/RegistroPontoAPIService.ts

import api from "./api";
import type {
  FiltroPontoFuncionarioDTO,
  RegistroPontoFullDTO,
} from "../types/PontoTypes";

const API_PONTO = "/api/registros-ponto";

export const RegistroPontoAPIService = {
  // ... (outros métodos como registrarPontoAutomatico)

  /**
   * Busca registros de ponto de um funcionário.
   * Chama o endpoint GET /api/registros-ponto/funcionario/{funcionarioId}
   * Nota: O backend retorna os últimos 30 dias por padrão e não aceita filtros de data via query params
   */
  buscarRegistrosPorFuncionarioEPeriodo: async (
    funcionarioId: number,
    filtro?: FiltroPontoFuncionarioDTO
  ): Promise<RegistroPontoFullDTO[]> => {
    const response = await api.get<RegistroPontoFullDTO[]>(
      `${API_PONTO}/funcionario/${funcionarioId}`
    );

    // Filtrar no frontend se necessário (já que o backend não aceita query params)
    let registros = response.data;
    
    if (filtro?.dataInicio || filtro?.dataFim) {
      registros = registros.filter((registro) => {
        if (!registro.horario) return false;
        
        const registroDate = new Date(registro.horario).toISOString().split("T")[0];
        
        if (filtro.dataInicio && registroDate < filtro.dataInicio) {
          return false;
        }
        
        if (filtro.dataFim && registroDate > filtro.dataFim) {
          return false;
        }
        
        return true;
      });
    }

    return registros;
  },
};
