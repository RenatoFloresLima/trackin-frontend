export interface FuncaoRequest {
  nome: string;
  descricao?: string;
  status?: "ATIVA" | "INATIVA";
}

export interface FuncaoResponse {
  id: number;
  nome: string;
  descricao?: string;
  status: "ATIVA" | "INATIVA";
}


