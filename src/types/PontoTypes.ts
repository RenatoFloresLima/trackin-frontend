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
 * Corresponde ao RegistroPontoDetalheResponse.java (legado)
 */
export interface RegistroPontoDetalheResponse {
  id: number;
  dataRegistro: string; // Ex: 2025-11-04
  horaRegistro: string; // Ex: 01:17
  horaSaida: string | null;
  status: "PENDENTE_APROVACAO" | "APROVADO_AUTOMATICO" | "APROVADO_MANUAL" | "REJEITADO" | "PENDENTE" | "APROVADO";
  tipoRegistro: string; // Ex: INICIO_INTERVALO
  temSolicitacaoAjuste: boolean;
  observacao?: string | null;
}

/**
 * DTO completo de Registro de Ponto retornado pelo backend.
 * Corresponde ao RegistroPontoFullDTO.java
 */
export interface RegistroPontoFullDTO {
  id: number;
  horario: string; // LocalDateTime no formato ISO
  tipo: string; // TipoRegistro enum
  status: string; // StatusPontoEnum
  observacao?: string | null;
  funcionarioId: number;
  funcionarioNome?: string;
  sedeId?: number;
  sedeNome?: string;
  usuarioAprovadorId?: number;
  usuarioAprovadorLogin?: string;
  horarioCriacao?: string; // LocalDateTime no formato ISO
  usuarioOperadorId?: number;
  usuarioOperadorLogin?: string;
  fotoBase64?: string;
  latitude?: number;
  longitude?: number;
  precisaoGps?: number;
}
