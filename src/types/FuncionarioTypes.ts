// src/types/FuncionarioTypes.ts

/**
 * 1. DTO de Resposta para a tela "Meu Perfil" (GET /api/funcionarios/{id})
 * Corresponde ao FuncionarioDetalheResponse do backend.
 */
export interface FuncionarioDetalheResponse {
  id: number;
  matricula: string;
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string; // Formato yyyy-MM-dd
  dataContratacao: string; // Formato yyyy-MM-dd

  // Campos Mutáveis
  telefone: string | null;
  endereco: string | null;

  // Detalhes da Função e Sede
  funcaoNome: string;
  sedeNome: string; // Assumindo que o DTO do backend tem 'sedeNome'

  // Detalhes de Acesso
  role: string;
  status: "ATIVO" | "DESLIGADO" | "INATIVO" | "AFASTADO";
}

/**
 * 2. DTO de Requisição para o PATCH de Dados Mutáveis
 * (PATCH /api/funcionarios/{id}/dados-mutaveis)
 * Corresponde ao FuncionarioDadosMutaveisRequest do backend.
 */
export interface FuncionarioDadosMutaveisRequest {
  email: string;
  telefone: string;
  endereco: string;
}

/**
 * 3. DTO de Requisição para Alteração de Senha
 * (PATCH /api/funcionarios/{id}/alterar-senha)
 * Corresponde ao SenhaUpdateFuncionarioRequest do backend.
 */
export interface SenhaUpdateFuncionarioRequest {
  senhaAtual: string;
  novaSenha: string;
  confirmacaoNovaSenha: string;
}

// -----------------------------------------------------
// TIPOS DE PONTO (para ListaRegistrosPonto.tsx)
// -----------------------------------------------------

/**
 * Enum para Status de Ponto
 */
export enum StatusPontoEnum {
  APROVADO_AUTOMATICO = "APROVADO_AUTOMATICO",
  APROVADO_MANUAL = "APROVADO_MANUAL",
  PENDENTE_APROVACAO = "PENDENTE_APROVACAO",
  REJEITADO = "REJEITADO",
}

/**
 * DTO de Resposta para a lista de pontos
 */
export interface RegistroPontoDetalheResponse {
  id: number;
  dataRegistro: string; // yyyy-MM-dd
  horaRegistro: string; // HH:mm:ss
  horaSaida: string | null; // HH:mm:ss
  status: StatusPontoEnum;
  temSolicitacaoAjuste: boolean;
}

/**
 * DTO de Requisição para o Filtro de Ponto
 */
export interface FiltroPontoFuncionarioDTO {
  dataInicio: string; // yyyy-MM-dd
  dataFim: string; // yyyy-MM-dd
}
