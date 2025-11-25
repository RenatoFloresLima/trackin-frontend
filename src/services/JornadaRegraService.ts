import api from "./api";
import type { EmpresaJornadaRegraDTO, EmpresaJornadaRegraFormValues } from "../types/JornadaTypes";

export async function buscarRegrasPorEmpresaId(empresaId: number): Promise<EmpresaJornadaRegraDTO> {
  const response = await api.get<EmpresaJornadaRegraDTO>(
    `/api/empresas/${empresaId}/jornada-regras`
  );
  return response.data;
}

export async function criarRegras(
  empresaId: number,
  payload: EmpresaJornadaRegraFormValues
): Promise<EmpresaJornadaRegraDTO> {
  const response = await api.post<EmpresaJornadaRegraDTO>(
    `/api/empresas/${empresaId}/jornada-regras`,
    payload
  );
  return response.data;
}

export async function atualizarRegras(
  empresaId: number,
  payload: EmpresaJornadaRegraFormValues
): Promise<EmpresaJornadaRegraDTO> {
  const response = await api.put<EmpresaJornadaRegraDTO>(
    `/api/empresas/${empresaId}/jornada-regras`,
    payload
  );
  return response.data;
}


