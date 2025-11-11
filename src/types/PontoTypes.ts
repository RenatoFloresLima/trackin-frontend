// src/types/PontoTypes.ts (OU SEU ARQUIVO DE TYPES)

// ... (Outras interfaces existentes)

/**
 * DTO de Filtro para buscar registros de ponto por período.
 * Corresponde ao FiltroPontoFuncionarioDTO.java
 */
export interface FiltroPontoFuncionarioDTO {
  dataInicio: string; // Formato YYYY-MM-DD
  dataFim: string; // Formato YYYY-MM-DD
}

/**
 * DTO de Resposta de Detalhes do Registro de Ponto para o Perfil.
 * Corresponde ao RegistroPontoDetalheResponse.java
 */
export interface RegistroPontoDetalheResponse {
  id: number;

  // 🔑 CAMPOS CORRIGIDOS PARA O BACKEND
  dataRegistro: string; // Ex: 2025-11-04
  horaRegistro: string; // Ex: 01:17
  horaSaida: string | null; // Novo campo
  status: "PENDENTE" | "APROVADO_AUTOMATICO" | "APROVADO_MANUAL" | "REPROVADO";
  tipoRegistro: string; // Ex: INICIO_INTERVALO

  // Outros campos
  temSolicitacaoAjuste: boolean;
}
