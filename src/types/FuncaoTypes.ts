export interface FuncaoDTO {
  id: number;
  nome: string;
  descricao?: string | null;
}

export interface FuncaoFormValues {
  nome: string;
  descricao?: string | null;
}

