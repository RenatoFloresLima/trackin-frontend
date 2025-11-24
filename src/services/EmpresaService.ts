import api from "./api";
import type { EmpresaDTO, EmpresaFormValues } from "../types/EmpresaTypes";

export async function listarEmpresas(): Promise<EmpresaDTO[]> {
  const response = await api.get<EmpresaDTO[]>("/api/empresas");
  return response.data ?? [];
}

export async function buscarEmpresaPorId(id: number): Promise<EmpresaDTO> {
  const response = await api.get<EmpresaDTO>(`/api/empresas/${id}`);
  return response.data;
}

export async function criarEmpresa(payload: EmpresaFormValues): Promise<EmpresaDTO> {
  const response = await api.post<EmpresaDTO>("/api/empresas", payload);
  return response.data;
}

export async function atualizarEmpresa(
  id: number,
  payload: EmpresaFormValues
): Promise<EmpresaDTO> {
  const response = await api.put<EmpresaDTO>(`/api/empresas/${id}`, payload);
  return response.data;
}

export async function desativarEmpresa(id: number): Promise<void> {
  await api.delete(`/api/empresas/${id}`);
}

export async function ativarEmpresa(id: number): Promise<void> {
  await api.patch(`/api/empresas/${id}/ativar`);
}


