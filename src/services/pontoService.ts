// src/services/pontoService.ts
import api from "./api";

/* ------------------------- Tipos ------------------------- */

export type FiltrosPonto = {
  nome?: string;
  matricula?: string;
  status?: "AMBOS" | "PENDENTE" | "APROVADO";
  dataInicio?: string;
  dataFim?: string;
  aba?: "dia" | "pendentes" | "todos";
};

export type RegistroPonto = {
  id: number;
  funcionarioNome: string;
  matricula: string;
  horario: string;
  entrada: string;
  saida: string;
  status: "PENDENTE" | "APROVADO";
  sedeId: number;
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
