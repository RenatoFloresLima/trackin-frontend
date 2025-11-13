// src/services/pontoService.ts
import api from "./api";

/* ------------------------- Tipos ------------------------- */

export type FiltrosPonto = {
  nome?: string;
  matricula?: string;
  status?: "AMBOS" | "PENDENTE_APROVACAO" | "APROVADO" | "REJEITADO";
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
  status: "PENDENTE_APROVACAO" | "APROVADO" | "REJEITADO" | string;
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
