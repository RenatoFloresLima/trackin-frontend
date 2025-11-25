// src/services/pontoService.ts
import api from "./api";

/* ------------------------- Tipos ------------------------- */

export type FiltrosPonto = {
  nome?: string;
  matricula?: string;
  status?: "AMBOS" | "PENDENTE_APROVACAO" | "PENDENTE_APROVACAO_EXCESSO_HORAS" | "APROVADO" | "REJEITADO";
  dataInicio?: string;
  dataFim?: string;
  aba?: "dia" | "pendentes" | "todos";
};

export type RegistroPonto = {
  id: number;
  funcionarioId: number;
  funcionarioNome: string;
  matricula: string;
  tipo: string;
  status: "PENDENTE_APROVACAO" | "PENDENTE_APROVACAO_EXCESSO_HORAS" | "APROVADO_AUTOMATICO" | "APROVADO_MANUAL" | "APROVADO" | "REJEITADO" | string;
  horario: string | null;
  horarioCriacao: string | null;
  sedeId: number | null;
  sedeNome: string | null;
  entrada?: string | null;
  saida?: string | null;
};

/* ------------------------- Funções ------------------------- */

export const buscarPontos = async (
  filtros: FiltrosPonto
): Promise<RegistroPonto[]> => {
  const { data } = await api.get<RegistroPonto[]>(
    "api/registros-ponto/aprovacao",
    {
      params: filtros,
    }
  );
  return data || [];
};

export const aprovarPonto = async (
  registroPontoId: number,
  observacaoAdmin?: string
): Promise<void> => {
  await api.patch("api/registros-ponto/aprovar", {
    registroPontoId,
    observacaoAdmin,
  });
};

export type ConfirmacaoRegistroPontoDTO = {
  funcionarioId?: number;
  sedeId: number;
  tipoRegistro: string;
  observacao?: string;
  fotoBase64?: string;
  latitude?: number;
  longitude?: number;
  precisao?: number;
  confirmado: boolean;
  // Campos para registro manual
  matricula?: string;
  senha?: string;
  horario?: string;
};

export type RegistroPontoResponse = {
  id?: number;
  mensagem: string;
  requerConfirmacao?: boolean;
  mensagemConfirmacao?: string;
  foraTolerancia?: boolean;
  horasExtras?: number;
  excessoHoras?: boolean;
  status?: string;
};

export const confirmarPonto = async (
  confirmacao: ConfirmacaoRegistroPontoDTO
): Promise<RegistroPontoResponse> => {
  const { data } = await api.post<RegistroPontoResponse>(
    "api/registros-ponto/confirmar",
    confirmacao
  );
  return data;
};
