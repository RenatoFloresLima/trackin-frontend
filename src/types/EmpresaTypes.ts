export interface EmpresaDTO {
  id: number;
  nome: string;
  cnpj?: string | null;
  razaoSocial?: string | null;
  status: "ATIVA" | "INATIVA";
  dataCriacao: string;
  dataAtualizacao?: string | null;
}

export interface EmpresaFormValues {
  nome: string;
  cnpj?: string | null;
  razaoSocial?: string | null;
}

export interface CompanyAdminDTO {
  id: number;
  login: string;
  empresaId: number;
  empresaNome: string;
  enabled: boolean;
}

export interface CompanyAdminFormValues {
  login: string;
  senha: string;
  empresaId: number;
}


