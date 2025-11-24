export interface SedeDTO {
  id: number;
  nome: string;
  endereco?: string | null;
  identificadorUnico?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  raioPermitido?: number | null;
  empresaId?: number | null;
  empresaNome?: string | null;
}

export interface SedeFormValues {
  nome: string;
  endereco?: string | null;
  identificadorUnico?: string | null;
  latitude: number;
  longitude: number;
  raioPermitido: number;
  empresaId?: number | null; // Opcional: para ADMIN/SYSTEM_ADMIN especificarem
}

