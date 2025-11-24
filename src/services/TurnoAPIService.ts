import api from "./api";

export interface TurnoRequest {
  nome: string;
  horaInicio: string; // Formato HH:mm
  horaFim: string; // Formato HH:mm
  ativo?: boolean;
}

export interface TurnoResponse {
  id: number;
  nome: string;
  horaInicio: string;
  horaFim: string;
  empresaId: number;
  empresaNome: string;
  ativo: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export const TurnoAPIService = {
  async listarTodos(): Promise<TurnoResponse[]> {
    const response = await api.get<TurnoResponse[]>("/api/turnos");
    return response.data;
  },

  async listarAtivos(): Promise<TurnoResponse[]> {
    const response = await api.get<TurnoResponse[]>("/api/turnos/ativos");
    return response.data;
  },

  async buscarPorId(id: number): Promise<TurnoResponse> {
    const response = await api.get<TurnoResponse>(`/api/turnos/${id}`);
    return response.data;
  },

  async cadastrar(turno: TurnoRequest): Promise<TurnoResponse> {
    const response = await api.post<TurnoResponse>("/api/turnos", turno);
    return response.data;
  },

  async atualizar(id: number, turno: TurnoRequest): Promise<TurnoResponse> {
    const response = await api.put<TurnoResponse>(`/api/turnos/${id}`, turno);
    return response.data;
  },

  async deletar(id: number): Promise<void> {
    await api.delete(`/api/turnos/${id}`);
  },
};

