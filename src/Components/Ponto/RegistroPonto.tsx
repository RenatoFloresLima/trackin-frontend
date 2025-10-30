import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
// 🎯 CORREÇÃO: Importação explícita de useState e useEffect do React
import React, { useState, useEffect } from "react";
// ⚠️ ATENÇÃO: Verifique o caminho real para o seu arquivo api.ts
import api from "../../services/api";
import { format } from "date-fns";
import "./RegistroPonto.css";

// ------------------------------------------
// Constantes e Interfaces de Tipagem
// ------------------------------------------

const API_REGISTROS = "/api/registros-ponto/manual";
const API_SEDES = "/api/sedes";

type TipoRegistro = "ENTRADA" | "SAIDA" | "INICIO_INTERVALO" | "FIM_INTERVALO";

interface Sede {
  id: number;
  nome: string;
}

interface IFormInput {
  // Campos de Autenticação da Batida
  matricula: string;
  senha: string;

  // Campos do Registro
  sedeId: string; // ID da Sede (string do select)
  tipo: TipoRegistro;
  justificativa: string;

  // Campos de Data e Hora da Batida (Retroativa)
  dataRegistro: string;
  horaRegistro: string;
}

const RegistroPonto = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IFormInput>({
    defaultValues: {
      // Preenche com data/hora atual por padrão
      dataRegistro: format(new Date(), "yyyy-MM-dd"),
      horaRegistro: format(new Date(), "HH:mm"),
      tipo: "ENTRADA",
    },
  });

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // ------------------------------------------
  // Lógica de Carregamento de Sedes (Exige JWT)
  // ------------------------------------------
  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await api.get<Sede[]>(API_SEDES);
        setSedes(response.data);
      } catch (error) {
        console.error("Erro ao carregar sedes:", error);
        setStatus("❌ Erro ao carregar sedes. Verifique se você está logado.");
      } finally {
        setDataLoading(false);
      }
    };
    fetchSedes();
  }, []);

  // ------------------------------------------
  // Lógica de Submissão (Usa JWT do Operador e Matrícula/Senha do Funcionário)
  // ------------------------------------------
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setStatus("");
    setLoading(true);

    try {
      // Combina data e hora para o formato ISO exigido pelo backend (LocalDateTime)
      const horarioCompleto = `${data.dataRegistro}T${data.horaRegistro}:00`;

      const payload = {
        matricula: data.matricula,
        senha: data.senha,
        sedeId: parseInt(data.sedeId),
        tipo: data.tipo,
        horario: horarioCompleto,
        observacao: data.justificativa, // Mapeado como 'observacao' no DTO do backend
      };

      console.log("Payload de ponto manual:", payload);

      // 🎯 CRÍTICO: Usa a instância 'api' que injeta o token JWT do Operador
      const response = await api.post(API_REGISTROS, payload);

      setStatus(`✅ Ponto registrado! ${response.data.mensagem}`);
      reset();
    } catch (error: any) {
      console.error("Erro ao registrar ponto:", error);
      const statusCode = error.response?.status;
      let errorMessage = "Erro desconhecido ao comunicar com o servidor.";

      if (statusCode === 401) {
        errorMessage =
          "Matrícula ou senha inválida. Verifique as credenciais do funcionário.";
      } else if (statusCode === 403) {
        errorMessage =
          "Permissão Negada (403): Seu login não tem acesso para registrar ponto manual.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setStatus(`❌ Falha no Ponto: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="container">
        <h1>Carregando...</h1>
        <p>Buscando dados de Sedes...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Registro de Ponto Manual</h1>

      {/* Feedback de Status */}
      {status && (
        <div
          style={{
            padding: "10px",
            margin: "15px 0",
            borderRadius: "4px",
            backgroundColor: status.includes("✅") ? "#d4edda" : "#f8d7da",
            color: status.includes("✅") ? "#155724" : "#721c24",
          }}
        >
          {status}
        </div>
      )}

      {/* ⚠️ Alteração: Usando handleSubmit do react-hook-form no form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 1. SELECT SEDE */}
        <div className="form-group">
          <label>Sede:</label>
          <select
            className="form-control"
            {...register("sedeId", { required: "A sede é obrigatória" })}
            disabled={loading}
          >
            <option value="">Selecione a sede da batida</option>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id.toString()}>
                {sede.nome}
              </option>
            ))}
          </select>
          {errors.sedeId && (
            <p className="error-message">{errors.sedeId.message}</p>
          )}
        </div>

        {/* 2. SELECT TIPO DE REGISTRO (NOVO CAMPO) */}
        <div className="form-group">
          <label>Tipo de Registro:</label>
          <select
            className="form-control"
            {...register("tipo", {
              required: "O tipo de registro é obrigatório",
            })}
            disabled={loading}
          >
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
            <option value="INICIO_INTERVALO">Início de Intervalo</option>
            <option value="FIM_INTERVALO">Fim de Intervalo</option>
          </select>
          {errors.tipo && (
            <p className="error-message">{errors.tipo.message}</p>
          )}
        </div>

        {/* 3. MATRÍCULA */}
        <div className="form-group">
          <label>Matrícula do Funcionário:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite a matrícula do funcionário"
            {...register("matricula", {
              required: "A matrícula é obrigatória",
            })}
            disabled={loading}
          />
          {errors.matricula && (
            <p className="error-message">{errors.matricula.message}</p>
          )}
        </div>

        {/* 4. SENHA */}
        <div className="form-group">
          <label>Senha:</label>
          <input
            type="password"
            className="form-control"
            placeholder="Digite a senha do funcionário"
            {...register("senha", { required: "A senha é obrigatória" })}
            disabled={loading}
          />
          {errors.senha && (
            <p className="error-message">{errors.senha.message}</p>
          )}
        </div>

        {/* 5. DATA E HORA DA BATIDA (NOVO CAMPO - Mantendo padrão de layout com duas colunas implícitas) */}
        <div
          className="form-group-datetime"
          style={{ display: "flex", gap: "20px" }}
        >
          <div className="form-group" style={{ flex: 1 }}>
            <label>Data da Batida:</label>
            <input
              type="date"
              className="form-control"
              {...register("dataRegistro", {
                required: "A data é obrigatória",
              })}
              disabled={loading}
            />
            {errors.dataRegistro && (
              <p className="error-message">{errors.dataRegistro.message}</p>
            )}
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Hora da Batida:</label>
            <input
              type="time"
              className="form-control"
              {...register("horaRegistro", {
                required: "A hora é obrigatória",
              })}
              disabled={loading}
            />
            {errors.horaRegistro && (
              <p className="error-message">{errors.horaRegistro.message}</p>
            )}
          </div>
        </div>

        {/* 6. JUSTIFICATIVA */}
        <div className="form-group">
          <label>Justificativa:</label>
          {/* Ajustado para textarea para melhor inserção de justificativa e mantendo o padrão de classe */}
          <textarea
            className="form-control"
            placeholder="Justifique seu ponto (Obrigatório)"
            {...register("justificativa", {
              required: "A justificativa é obrigatória",
            })}
            rows={3}
            disabled={loading}
          />
          {errors.justificativa && (
            <p className="error-message">{errors.justificativa.message}</p>
          )}
        </div>

        {/* 7. BOTÃO DE SUBMISSÃO */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Registrando..." : "Registrar Ponto Manual"}
        </button>
      </form>
    </div>
  );
};

export default RegistroPonto;
