import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
// ❌ REMOVA: import axios from "axios";
// ✅ ADICIONE: Importa a instância configurada com o token JWT
import api from "../../services/api";
import "./Cadastro.css";

// ------------------------------------------
// Constantes de API
// ------------------------------------------
// Usamos apenas o path relativo, pois o baseURL (http://localhost:8080) já está no api.ts
const API_BASE_URL = "/api";
const API_FUNCIONARIOS = `${API_BASE_URL}/funcionarios`;
const API_SEDES = `${API_BASE_URL}/sedes`;
const API_FUNCOES = `${API_BASE_URL}/funcoes`;

// ------------------------------------------
// Interfaces de Tipagem
// ------------------------------------------

interface Sede {
  id: number;
  nome: string;
  endereco: string;
  identificadorUnico: string;
}

interface Funcao {
  id: number;
  nome: string;
  descricao: string;
}

interface IFormInput {
  nome: string;
  endereco: string;
  telefone: string;
  cpf: string;
  email: string;
  sedePrincipalId: string; // IDs vêm como string do select
  funcaoId: string; // IDs vêm como string do select
  dataContratacao: string;
  role: "ROLE_FUNCIONARIO" | "ROLE_ADMIN";
}

const Cadastro = () => {
  // Hooks do Formulário
  const { register, handleSubmit, reset } = useForm<IFormInput>();

  // Estados para Dados Dinâmicos
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);

  // Estados para Feedback
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // ------------------------------------------
  // Lógica de Carregamento de Dados (useEffect)
  // ------------------------------------------
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // 🎯 CORREÇÃO 1: Usando 'api' para buscar dados
        const [sedesResponse, funcoesResponse] = await Promise.all([
          api.get<Sede[]>(API_SEDES),
          api.get<Funcao[]>(API_FUNCOES),
        ]);

        setSedes(sedesResponse.data);
        setFuncoes(funcoesResponse.data);

        setStatus("");
      } catch (error) {
        console.error("Erro ao carregar dados de Sedes ou Funções:", error);
        // Feedback para o usuário caso falhe a busca inicial (Exige ROLE_FUNCIONARIO ou ROLE_ADMIN)
        setStatus(
          "Erro ao carregar dados essenciais. Verifique o backend ou sua permissão de acesso."
        );
      } finally {
        setDataLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  // ------------------------------------------
  // Lógica de Submissão do Formulário
  // ------------------------------------------
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setStatus("");
    setLoading(true);

    try {
      // Converte os IDs de string (vindo do <select>) para number para o payload
      const payload = {
        ...data,
        sedePrincipalId: parseInt(data.sedePrincipalId),
        funcaoId: parseInt(data.funcaoId),
        role: data.role, // O valor é diretamente 'ROLE_ADMIN' ou 'ROLE_FUNCIONARIO'
      };

      console.log("Payload sendo enviado:", payload);

      // 🎯 CORREÇÃO 2: Usando 'api' para o POST de cadastro (injeta o token)
      const response = await api.post(API_FUNCIONARIOS, payload);

      setStatus(
        `✅ Sucesso! Funcionário ${response.data.nome} (ID: ${response.data.id}) cadastrado.`
      );
      reset(); // Limpa o formulário
    } catch (error: any) {
      console.error("Erro no cadastro:", error);

      let errorMessage = "Erro desconhecido.";
      if (error.response) {
        // Se o erro for 403, o motivo mais provável é a falta de Authority ROLE_ADMIN
        errorMessage = `Erro ${error.response.status}: ${
          error.response.status === 403
            ? "Permissão negada (403). Você precisa ser ROLE_ADMIN para cadastrar."
            : error.response.data.message || "Dados inválidos."
        }`;
      } else if (error.request) {
        errorMessage =
          "Erro de rede: O servidor backend pode estar offline ou inacessível.";
      }

      setStatus(`❌ Falha no Cadastro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Renderiza uma mensagem de loading enquanto busca os dados
  if (dataLoading) {
    return (
      <div className="container">
        <h1>Carregando...</h1>
        <p>Buscando dados de Sedes e Funções...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Cadastro de Funcionário</h1>

      {/* Feedback de Status */}
      {status && (
        <div
          style={{
            padding: "10px",
            margin: "15px 0",
            borderRadius: "4px",
            backgroundColor: status.includes("Sucesso") ? "#d4edda" : "#f8d7da",
            color: status.includes("Sucesso") ? "#155724" : "#721c24",
          }}
        >
          {status}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Campos de Texto */}
        <div className="form-group">
          <label>Nome:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite o nome"
            {...register("nome", { required: true })}
          />
        </div>
        <div className="form-group">
          <label>Endereço:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite a endereço"
            {...register("endereco", { required: true })}
          />
        </div>
        <div className="form-group">
          <label>Telefone:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite o telefone"
            {...register("telefone", { required: true })}
          />
        </div>
        <div className="form-group">
          <label>CPF:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite o CPF"
            {...register("cpf", { required: true })}
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            className="form-control"
            placeholder="Digite o email"
            {...register("email", { required: true })}
          />
        </div>

        <div className="form-group">
          <label>Data de Contratação:</label>
          <input
            type="date" // Use 'date' para o seletor de data
            className="form-control"
            {...register("dataContratacao", { required: true })}
          />
        </div>

        {/* SELECT SEDE (Renderizado com dados da API) */}
        <div className="form-group">
          <label>Sede:</label>
          <select
            {...register("sedePrincipalId", { required: true })}
            className="form-control"
          >
            <option value="">Selecione uma Sede</option>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id.toString()}>
                {sede.nome}
              </option>
            ))}
          </select>
        </div>

        {/* SELECT FUNÇÃO (Renderizado com dados da API) */}
        <div className="form-group">
          <label>Função:</label>
          <select
            {...register("funcaoId", { required: true })}
            className="form-control"
          >
            <option value="">Selecione uma Função</option>
            {funcoes.map((funcao) => (
              <option key={funcao.id} value={funcao.id.toString()}>
                {funcao.nome}
              </option>
            ))}
          </select>
        </div>

        {/* SELECT ROLE */}
        <div className="form-group">
          <label>Perfil de Acesso:</label>
          <select
            {...register("role", { required: true })}
            className="form-control"
          >
            <option value="ROLE_FUNCIONARIO">Funcionário Comum</option>
            <option value="ROLE_ADMIN">Administrador</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || dataLoading}
          className="btn btn-primary"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
};

export default Cadastro;
