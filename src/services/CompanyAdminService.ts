import api from "./api";
import type { CompanyAdminDTO, CompanyAdminFormValues } from "../types/EmpresaTypes";

export async function listarCompanyAdmins(): Promise<CompanyAdminDTO[]> {
  const response = await api.get<CompanyAdminDTO[]>("/api/usuarios/company-admin");
  return response.data ?? [];
}

export async function buscarCompanyAdminPorId(id: number): Promise<CompanyAdminDTO> {
  const response = await api.get<CompanyAdminDTO>(`/api/usuarios/company-admin/${id}`);
  return response.data;
}

export async function criarCompanyAdmin(payload: CompanyAdminFormValues): Promise<CompanyAdminDTO> {
  const response = await api.post<CompanyAdminDTO>("/api/usuarios/company-admin", payload);
  return response.data;
}

export async function deletarCompanyAdmin(id: number): Promise<void> {
  await api.delete(`/api/usuarios/company-admin/${id}`);
}

export async function desativarCompanyAdmin(id: number): Promise<void> {
  await api.patch(`/api/usuarios/company-admin/${id}/desativar`);
}

export async function ativarCompanyAdmin(id: number): Promise<void> {
  await api.patch(`/api/usuarios/company-admin/${id}/ativar`);
}

