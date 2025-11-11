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
 * Corresponde ao RegistroPontoFullDTO.java
 */
export interface RegistroPontoDetalheResponse {
  id: number;
  horario: string; // LocalDateTime no formato ISO
  tipo: string; // TipoRegistro enum
  status: string; // StatusPontoEnum
  observacao: string | null;
  funcionarioId: number;
  funcionarioNome: string;
  matricula: string;
  sedeId: number | null;
  sedeNome: string | null;
  usuarioAprovadorId: number | null;
  usuarioAprovadorLogin: string | null;
  horarioCriacao: string | null; // LocalDateTime no formato ISO
  usuarioOperadorId: number | null;
  usuarioOperadorLogin: string | null;
}
