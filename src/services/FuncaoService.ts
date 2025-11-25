import api from "./api";
import type { FuncaoDTO, FuncaoFormValues } from "../types/FuncaoTypes";

export async function listarFuncoes(): Promise<FuncaoDTO[]> {
  const response = await api.get<FuncaoDTO[]>("/api/funcoes");
  return response.data ?? [];
}

export async function buscarFuncaoPorId(id: number): Promise<FuncaoDTO> {
  const response = await api.get<FuncaoDTO>(`/api/funcoes/${id}`);
  return response.data;
}

export async function criarFuncao(payload: FuncaoFormValues): Promise<FuncaoDTO> {
  const response = await api.post<FuncaoDTO>("/api/funcoes", payload);
  return response.data;
}

export async function atualizarFuncao(
  id: number,
  payload: FuncaoFormValues
): Promise<FuncaoDTO> {
  const response = await api.put<FuncaoDTO>(`/api/funcoes/${id}`, payload);
  return response.data;
}

export async function deletarFuncao(id: number): Promise<void> {
  await api.delete(`/api/funcoes/${id}`);
}


