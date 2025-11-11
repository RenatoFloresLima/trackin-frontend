export interface SedeRequest {
  nome: string;
  endereco?: string;
  identificadorUnico?: string;
  status?: "ATIVA" | "INATIVA";
}

export interface SedeResponse {
  id: number;
  nome: string;
  endereco?: string;
  identificadorUnico?: string;
  status: "ATIVA" | "INATIVA";
}

