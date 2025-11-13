export interface SedeDTO {
  id: number;
  nome: string;
  endereco?: string | null;
  identificadorUnico?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  raioPermitido?: number | null;
}

export interface SedeFormValues {
  nome: string;
  endereco?: string | null;
  identificadorUnico?: string | null;
  latitude: number;
  longitude: number;
  raioPermitido: number;
}

