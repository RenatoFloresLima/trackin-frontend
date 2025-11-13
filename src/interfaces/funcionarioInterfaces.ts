// src/interfaces/funcionarioInterfaces.ts

export interface FuncionarioAPI {
  id: number;
  nome: string;
  matricula: string;
  email: string;
  endereco: string | null;
  telefone: string | null;
  cpf: string;
  sedePrincipalId: number;
  sedePrincipalNome: string;
  funcaoId: number;
  funcaoNome: string;
  templateDigitalCadastrado: boolean;
  usuarioAssociado: boolean;
  login: string | null;
  role: "ADMIN" | "FUNCIONARIO" | "SUPER_ADMIN" | null;
  status: string;
}

export interface FiltrosFuncionario {
  termoBusca: string; // Para pesquisa por nome, matrícula, e-mail (geral)
  funcaoNome: string | null;
  sedePrincipalId: number | null;
  apenasMinhaSede: boolean;
}
// Interface simulada para o Admin logado (substitua pelo seu Contexto real)
export interface UserContext {
  id: number;
  perfil: "ADMIN" | "USER" | "SUPER_ADMIN";
  sede_id: number;
  nomeSede: string;
}

export interface FuncionarioDetalheDTO {
  id: number;
  nome: string;
  matricula: string; // Imutável
  email: string; // Imutável
  cpf: string; // Imutável
  endereco: string; // Mutável
  telefone: string; // Mutável
  funcaoNome: string; // Imutável (da entidade Funcao)
  sedePrincipalNome: string; // Imutável (da entidade Sede)
  status: "ATIVO" | "INATIVO" | "AFASTADO" | "DESLIGADO"; // Imutável
  dataAdmissao: string; // 'yyyy-mm-dd' - Imutável
}

export interface Sede {
  id: number;
  nome: string;
}

export interface Funcao {
  id: number;
  nome: string;
}

