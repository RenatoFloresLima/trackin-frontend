// src/services/FuncionarioService.ts

import api from "./api"; // Assumindo que o arquivo './api' exporta o axios/fetch configurado
import type {
  FuncionarioDetalheResponse,
  FuncionarioDadosMutaveisRequest,
  SenhaUpdateFuncionarioRequest,
  RegistroPontoDetalheResponse,
  FiltroPontoFuncionarioDTO,
  UsuarioPerfilResponse,
  UsuarioRedefinirSenhaRequest,
} from "../types/FuncionarioTypes"; // Ajuste o caminho se necessário

// ------------------------------------------
// Endpoints do Backend
// ------------------------------------------
const API_FUNCIONARIOS = "/api/funcionarios";
const API_REGISTROS_PONTO = "/api/registros-ponto";

/**
 * Interface que espelha o DTO de Detalhes Completo do Backend.
 * (FuncionarioDetalheResponse, criada no passo anterior)
 */
// export interface FuncionarioDetalheResponse { ... }
// (Tipos devem vir do arquivo types/FuncionarioTypes.ts)

export const FuncionarioAPIService = {
  /**
   * 1. GET /api/funcionarios/{id} - Busca os detalhes completos do funcionário.
   */
  getDetalhesFuncionario: async (
    funcionarioId: number
  ): Promise<FuncionarioDetalheResponse> => {
    const response = await api.get<FuncionarioDetalheResponse>(
      `${API_FUNCIONARIOS}/${funcionarioId}`
    );
    return response.data;
  },

  /**
   * 2. PATCH /api/funcionarios/{id}/dados-mutaveis - Atualiza telefone e endereço.
   */
  updateDadosMutaveis: async (
    funcionarioId: number,
    dados: FuncionarioDadosMutaveisRequest
  ): Promise<FuncionarioDetalheResponse> => {
    const response = await api.patch<FuncionarioDetalheResponse>(
      `${API_FUNCIONARIOS}/${funcionarioId}/dados-mutaveis`,
      dados
    );
    return response.data;
  },

  /**
   * 3. PATCH /api/funcionarios/{id}/alterar-senha - Redefine a senha do usuário.
   */
  updateSenha: async (
    funcionarioId: number,
    dados: SenhaUpdateFuncionarioRequest
  ): Promise<void> => {
    // O backend retorna 204 No Content para sucesso
    await api.patch(
      `${API_FUNCIONARIOS}/${funcionarioId}/alterar-senha`,
      dados
    );
  },

  /**
   * 4. GET /api/registros-ponto/funcionario/{id}?dataInicio=... - Busca histórico de ponto.
   */
  getHistoricoPonto: async (
    funcionarioId: number,
    filtro: FiltroPontoFuncionarioDTO
  ): Promise<RegistroPontoDetalheResponse[]> => {
    // Converte o objeto de filtro para query string (dataInicio=2024-01-01&dataFim=2024-01-31)
    const params = new URLSearchParams({
      dataInicio: filtro.dataInicio,
      dataFim: filtro.dataFim,
    }).toString();

    const response = await api.get<RegistroPontoDetalheResponse[]>(
      `${API_REGISTROS_PONTO}/funcionario/${funcionarioId}?${params}`
    );
    return response.data;
  },
  /**
   * MÉTODO CORRIGIDO E SEGURO: Busca o ID do Funcionário logado, sem passar o ID/Login na URL.
   * O backend resolve o Login do User logado via token.
   */
  getFuncionarioIdDoUsuarioLogado: async (): Promise<{
    funcionarioId: number;
  }> => {
    // 🔑 NOVO ENDPOINT: /api/funcionarios/perfil-logado/id-funcionario
    const response = await api.get<{ funcionarioId: number }>(
      `/api/funcionarios/perfil-logado/id-funcionario`
    );
    return response.data;
  },

  /**
   * Busca os detalhes completos do funcionário logado ou perfil de usuário.
   * Retorna FuncionarioDetalheResponse se houver funcionarioId, ou UsuarioPerfilResponse caso contrário.
   * Usa o endpoint /api/funcionarios/perfil-logado/detalhes que não requer ROLE_ADMIN.
   */
  getDetalhesFuncionarioLogado: async (): Promise<FuncionarioDetalheResponse | UsuarioPerfilResponse> => {
    const response = await api.get<FuncionarioDetalheResponse | UsuarioPerfilResponse>(
      `/api/funcionarios/perfil-logado/detalhes`
    );
    return response.data;
  },

  /**
   * Redefine a senha do usuário logado (para SYSTEM_ADMIN, COMPANY_ADMIN ou qualquer usuário).
   */
  redefinirSenhaUsuario: async (
    dados: UsuarioRedefinirSenhaRequest
  ): Promise<void> => {
    await api.post(`/api/funcionarios/perfil-logado/redefinir-senha`, dados);
  },
};
