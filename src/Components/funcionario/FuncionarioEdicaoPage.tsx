// src/Components/funcionario/EdicaoFuncionario.tsx (FINAL CORRIGIDO)

import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";
import type { FC } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import type { SedeDTO } from "../../types/SedeTypes";

const API_BASE_URL = "/api";
const API_FUNCIONARIOS = `${API_BASE_URL}/funcionarios`;
const API_SEDES = `${API_BASE_URL}/sedes`;
const API_FUNCOES = `${API_BASE_URL}/funcoes`;
const API_TURNOS = `${API_BASE_URL}/turnos/ativos`;

interface Funcao {
  id: number;
  nome: string;
}

interface Turno {
  id: number;
  nome: string;
  horaInicio: string;
  horaFim: string;
}

// Interface que reflete o DTO de resposta do GET /api/funcionarios/{id}
interface FuncionarioResponse {
  id: number;
  nome: string;
  matricula: string;
  email: string;
  endereco: string;
  telefone: string;
  cpf: string;
  sedePrincipalId: number;
  funcaoId: number;
  turnoId?: number;
  turnoNome?: string;
  turnoHoraInicio?: string;
  turnoHoraFim?: string;
  cargaHoraria?: number;
  // 🔑 Campo correto vindo da API
  role: string; // O backend retorna "role" (não "roleEnum")
  // O backend também envia: funcaoNome, sedePrincipalNome, status, dataAdmissao
}

// Interface de Input (o que o formulário espera para registro/submissão)
interface IFormInput {
  nome: string;
  endereco: string;
  telefone: string;
  cpf: string;
  email: string;
  sedePrincipalId: string;
  funcaoId: string;
  turnoId?: string;
  cargaHoraria?: string;
  // 🔑 Nome da propriedade de submissão
  role: "FUNCIONARIO" | "ADMIN";
}

const EdicaoFuncionario: FC = () => {
  const { isAdmin } = useAuth();
  const { id } = useParams<{ id: string }>();
  const funcionarioId = Number(id);

  const { register, handleSubmit, reset } = useForm<IFormInput>();

  const [sedes, setSedes] = useState<SedeDTO[]>([]);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [matricula, setMatricula] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // ------------------------------------------
  // Lógica de Carregamento de Dados (useEffect)
  // ------------------------------------------
  const fetchInitialData = useCallback(async () => {
    if (isNaN(funcionarioId)) {
      setStatus("ID de funcionário inválido para edição.");
      setDataLoading(false);
      return;
    }

    try {
      // 1. Carregar Dados Auxiliares (Sedes, Funções e Turnos)
      const [sedesResponse, funcoesResponse, turnosResponse, funcionarioResponse] =
        await Promise.all([
          api.get<SedeDTO[]>(API_SEDES),
          api.get<Funcao[]>(API_FUNCOES),
          api.get<Turno[]>(API_TURNOS),
          // 2. Carregar Dados do Funcionário por ID
          api.get<FuncionarioResponse>(`${API_FUNCIONARIOS}/${funcionarioId}`),
        ]);

      setSedes(sedesResponse.data ?? []);
      setFuncoes(funcoesResponse.data);
      setTurnos(turnosResponse.data ?? []);

      const funcionario = funcionarioResponse.data;
      console.log("ROLE Vindo da API:", funcionario.role);

      // 3. Preencher o Formulário e Matrícula
      setMatricula(funcionario.matricula);
      setCpf(funcionario.cpf);

      // Reseta e preenche o formulário com os dados existentes
      reset({
        nome: funcionario.nome,
        endereco: funcionario.endereco,
        telefone: funcionario.telefone,
        cpf: funcionario.cpf,
        email: funcionario.email,
        sedePrincipalId: funcionario.sedePrincipalId.toString(),
        funcaoId: funcionario.funcaoId.toString(),
        turnoId: funcionario.turnoId?.toString() || "",
        cargaHoraria: funcionario.cargaHoraria?.toString() || "",
        // 🔑 CORREÇÃO: O backend retorna "role" (ex: "ROLE_FUNCIONARIO", "ROLE_ADMIN")
        // Precisamos mapear para "FUNCIONARIO" ou "ADMIN" para o formulário
        role: funcionario.role?.replace("ROLE_", "") as "FUNCIONARIO" | "ADMIN" || "FUNCIONARIO",
      });

      setStatus("");
    } catch (error: any) {
      console.error("Erro ao carregar dados iniciais:", error);
      const msg =
        error.response?.data?.message ||
        "Erro ao carregar dados. Verifique a permissão.";
      setStatus(`❌ Falha na Carga: ${msg}`);
    } finally {
      setDataLoading(false);
    }
  }, [funcionarioId, reset]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // ------------------------------------------
  // Lógica de Submissão do Formulário (PUT)
  // ------------------------------------------
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setStatus("");
    setLoading(true);

    try {
      // Prepara o payload para o PUT (o DTO FuncionarioUpdateRequest no backend)
      // Nota: FuncionarioUpdateRequest não inclui 'role', então não enviamos
      const payload = {
        nome: data.nome,
        email: data.email,
        endereco: data.endereco,
        telefone: data.telefone,
        cpf: data.cpf,
        // Os IDs devem ser passados como number para o DTO do backend
        sedePrincipalId: parseInt(data.sedePrincipalId),
        funcaoId: parseInt(data.funcaoId),
        turnoId: data.turnoId ? parseInt(data.turnoId) : null,
        cargaHoraria: data.cargaHoraria ? parseFloat(data.cargaHoraria) : null,
      };

      console.log("Payload de atualização sendo enviado:", payload);

      const response = await api.put(
        `${API_FUNCIONARIOS}/${funcionarioId}`,
        payload
      );

      setStatus(
        `✅ Sucesso! Funcionário ${response.data.nome} (ID: ${funcionarioId}) atualizado.`
      );
    } catch (error: any) {
      console.error("Erro na atualização:", error);
      let errorMessage = "Erro desconhecido.";
      if (error.response) {
        errorMessage = `Erro ${error.response.status}: ${
          error.response.status === 403
            ? "Permissão negada (403). Você precisa ser ROLE_ADMIN para editar."
            : error.response.data.message || "Dados inválidos."
        }`;
      } else if (error.request) {
        errorMessage =
          "Erro de rede: O servidor backend pode estar offline ou inacessível.";
      }

      setStatus(`❌ Falha na Atualização: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Renderiza uma mensagem de loading enquanto busca os dados
  if (dataLoading) {
    return (
      <div className="container">
        <h1>Carregando...</h1>
        <p>Buscando dados do funcionário, Sedes e Funções...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Editar Cadastro de Funcionário</h1>

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
        {/* ... (Matrícula e campos de texto) ... */}

        <div className="form-group">
          <label>Matrícula:</label>
          <input
            type="text"
            className="form-control"
            value={matricula}
            readOnly
            style={{ backgroundColor: "#f0f0f0" }}
          />
        </div>

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
            value={cpf}
            readOnly
            style={{ backgroundColor: "#f0f0f0" }}
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

        {/* SELECT SEDE */}
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

        {/* SELECT FUNÇÃO */}
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

        {/* SELECT ROLE (Perfil de Acesso) */}
        <div className="form-group">
          <label>Perfil de Acesso:</label>
          <select
            {...register("role", { required: true })}
            className="form-control"
            disabled={!isAdmin}
          >
            {/* ✅ Valores correspondem ao retorno da API (ADMIN/FUNCIONARIO) */}
            <option value="FUNCIONARIO">Funcionário Comum</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        {/* SELECT TURNO */}
        <div className="form-group">
          <label>Turno (Opcional):</label>
          <select
            {...register("turnoId")}
            className="form-control"
          >
            <option value="">Nenhum (usará turno da função ou empresa)</option>
            {turnos.map((turno) => (
              <option key={turno.id} value={turno.id.toString()}>
                {turno.nome} ({turno.horaInicio} - {turno.horaFim})
              </option>
            ))}
          </select>
        </div>

        {/* CARGA HORÁRIA */}
        <div className="form-group">
          <label>Carga Horária (Opcional):</label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="24"
            className="form-control"
            placeholder="Ex: 8.0, 6.0, 12.0"
            {...register("cargaHoraria", {
              validate: (value) => {
                if (value && (parseFloat(value) < 0 || parseFloat(value) > 24)) {
                  return "A carga horária deve estar entre 0 e 24 horas";
                }
                return true;
              },
            })}
          />
          <small className="form-text text-muted">
            Horas trabalhadas por dia (ex: 8.0). Se não informado, usará a carga horária da empresa.
          </small>
        </div>

        <button
          type="submit"
          disabled={loading || dataLoading}
          className="btn btn-success"
        >
          {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
    </div>
  );
};

export default EdicaoFuncionario;
