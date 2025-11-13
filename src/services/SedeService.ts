import api from "./api";
import type { SedeDTO, SedeFormValues } from "../types/SedeTypes";

export async function listarSedes(): Promise<SedeDTO[]> {
  const response = await api.get<SedeDTO[]>("/sedes");
  return response.data ?? [];
}

export async function buscarSedePorId(id: number): Promise<SedeDTO> {
  const response = await api.get<SedeDTO>(`/sedes/${id}`);
  return response.data;
}

export async function criarSede(payload: SedeFormValues): Promise<SedeDTO> {
  const response = await api.post<SedeDTO>("/sedes", payload);
  return response.data;
}

export async function atualizarSede(
  id: number,
  payload: SedeFormValues
): Promise<SedeDTO> {
  const response = await api.put<SedeDTO>(`/sedes/${id}`, payload);
  return response.data;
}

