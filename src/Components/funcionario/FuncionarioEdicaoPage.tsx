// src/Components/funcionario/FuncionarioEdicaoPage.tsx

import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";
import type { FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import type { SedeDTO } from "../../types/SedeTypes";
import PageHeader from "../Layout/PageHeader";

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
  role: string; // O backend retorna "role" (não "roleEnum")
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
  role: "FUNCIONARIO" | "ADMIN";
}

const EdicaoFuncionario: FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { id } = useParams<{ id: string }>();
  const funcionarioId = Number(id);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<IFormInput>();

  const [sedes, setSedes] = useState<SedeDTO[]>([]);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [matricula, setMatricula] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // ------------------------------------------
  // Lógica de Carregamento de Dados (useEffect)
  // ------------------------------------------
  const fetchInitialData = useCallback(async () => {
    if (isNaN(funcionarioId)) {
      setApiError("ID de funcionário inválido para edição.");
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
        // CORREÇÃO: O backend retorna "role" (ex: "ROLE_FUNCIONARIO", "ROLE_ADMIN")
        // Precisamos mapear para "FUNCIONARIO" ou "ADMIN" para o formulário
        role: funcionario.role?.replace("ROLE_", "") as "FUNCIONARIO" | "ADMIN" || "FUNCIONARIO",
      });

      setApiError(null);
    } catch (error: any) {
      console.error("Erro ao carregar dados iniciais:", error);
      const msg =
        error.response?.data?.message ||
        "Erro ao carregar dados. Verifique a permissão.";
      setApiError(msg);
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
    setApiError(null);
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

      setFeedback({
        open: true,
        message: `Funcionário ${response.data.nome} atualizado com sucesso!`,
        severity: "success",
      });

      // Redireciona após 1.5 segundos
      setTimeout(() => {
        navigate("/lista-funcionarios");
      }, 1500);
    } catch (error: any) {
      console.error("Erro na atualização:", error);
      let errorMessage = "Erro desconhecido.";
      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        if (status === 403) {
          errorMessage = "Permissão negada. Você precisa ser ROLE_ADMIN para editar.";
        } else if (status === 400) {
          if (responseData.errors) {
            const validationErrors = Object.entries(responseData.errors)
              .map(([field, message]) => `${field}: ${message}`)
              .join(", ");
            errorMessage = `Erro de validação: ${validationErrors}`;
          } else {
            errorMessage = responseData.message || "Dados inválidos. Verifique os campos preenchidos.";
          }
        } else {
          errorMessage = responseData.message || `Erro ${status}: Não foi possível atualizar o funcionário.`;
        }
      } else if (error.request) {
        errorMessage = "Erro de rede: O servidor backend pode estar offline ou inacessível.";
      }

      setApiError(errorMessage);
      setFeedback({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderiza uma mensagem de loading enquanto busca os dados
  if (dataLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography>Buscando dados do funcionário, Sedes e Funções...</Typography>
          </Stack>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeader
        title="Editar Funcionário"
        subtitle={`Editando funcionário ID: ${funcionarioId}`}
        leading={
          <Tooltip title="Voltar para a lista">
            <IconButton color="primary" onClick={() => navigate("/lista-funcionarios")}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        }
        action={
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleSubmit(onSubmit)}
            disabled={loading || isSubmitting}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        }
      />

      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      <Paper
        component="form"
        elevation={0}
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          borderRadius: 3,
          border: "1px solid #e0e0e0",
          p: { xs: 3, md: 4 },
        }}
      >
        <Stack spacing={3}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {/* Matrícula (Read-only) */}
            <TextField
              label="Matrícula"
              fullWidth
              value={matricula}
              InputProps={{ readOnly: true }}
              sx={{ 
                flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" },
                "& .MuiInputBase-root": { backgroundColor: "#f5f5f5" }
              }}
            />

            {/* CPF (Read-only) */}
            <TextField
              label="CPF"
              fullWidth
              value={cpf}
              InputProps={{ readOnly: true }}
              sx={{ 
                flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" },
                "& .MuiInputBase-root": { backgroundColor: "#f5f5f5" }
              }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {/* Nome */}
            <TextField
              label="Nome"
              fullWidth
              required
              placeholder="Digite o nome completo"
              sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}
              {...register("nome", { required: "O nome é obrigatório" })}
              error={Boolean(errors.nome)}
              helperText={errors.nome?.message}
            />

            {/* Email */}
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              placeholder="exemplo@email.com"
              sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}
              {...register("email", {
                required: "O email é obrigatório",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email inválido",
                },
              })}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {/* Telefone */}
            <TextField
              label="Telefone"
              fullWidth
              required
              placeholder="(00) 00000-0000"
              sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}
              {...register("telefone", { required: "O telefone é obrigatório" })}
              error={Boolean(errors.telefone)}
              helperText={errors.telefone?.message}
            />

            {/* Sede */}
            <FormControl fullWidth required error={Boolean(errors.sedePrincipalId)} sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}>
              <InputLabel>Sede</InputLabel>
              <Select
                label="Sede"
                value={watch("sedePrincipalId") || ""}
                {...register("sedePrincipalId", { required: "Selecione uma sede" })}
                onChange={(e) => setValue("sedePrincipalId", e.target.value)}
              >
                <MenuItem value="">
                  <em>Selecione uma Sede</em>
                </MenuItem>
                {sedes.map((sede) => (
                  <MenuItem key={sede.id} value={sede.id.toString()}>
                    {sede.nome}
                  </MenuItem>
                ))}
              </Select>
              {errors.sedePrincipalId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.sedePrincipalId.message}
                </Typography>
              )}
            </FormControl>
          </Box>

          {/* Endereço */}
          <TextField
            label="Endereço"
            fullWidth
            required
            placeholder="Rua, número, bairro, cidade"
            {...register("endereco", { required: "O endereço é obrigatório" })}
            error={Boolean(errors.endereco)}
            helperText={errors.endereco?.message}
          />

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {/* Função */}
            <FormControl fullWidth required error={Boolean(errors.funcaoId)} sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}>
              <InputLabel>Função</InputLabel>
              <Select
                label="Função"
                value={watch("funcaoId") || ""}
                {...register("funcaoId", { required: "Selecione uma função" })}
                onChange={(e) => setValue("funcaoId", e.target.value)}
              >
                <MenuItem value="">
                  <em>Selecione uma Função</em>
                </MenuItem>
                {funcoes.map((funcao) => (
                  <MenuItem key={funcao.id} value={funcao.id.toString()}>
                    {funcao.nome}
                  </MenuItem>
                ))}
              </Select>
              {errors.funcaoId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.funcaoId.message}
                </Typography>
              )}
            </FormControl>

            {/* Perfil de Acesso */}
            <FormControl fullWidth required error={Boolean(errors.role)} sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}>
              <InputLabel>Perfil de Acesso</InputLabel>
              <Select
                label="Perfil de Acesso"
                value={watch("role") || "FUNCIONARIO"}
                {...register("role", { required: "Selecione um perfil de acesso" })}
                onChange={(e) => setValue("role", e.target.value as "FUNCIONARIO" | "ADMIN")}
                disabled={!isAdmin}
              >
                <MenuItem value="FUNCIONARIO">Funcionário Comum</MenuItem>
                <MenuItem value="ADMIN">Administrador</MenuItem>
              </Select>
              {errors.role && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.role.message}
                </Typography>
              )}
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {/* Turno */}
            <FormControl fullWidth error={Boolean(errors.turnoId)} sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}>
              <InputLabel>Turno (Opcional)</InputLabel>
              <Select
                label="Turno (Opcional)"
                value={watch("turnoId") || ""}
                {...register("turnoId")}
                onChange={(e) => setValue("turnoId", e.target.value)}
              >
                <MenuItem value="">
                  <em>Nenhum (usará turno da função ou empresa)</em>
                </MenuItem>
                {turnos.map((turno) => (
                  <MenuItem key={turno.id} value={turno.id.toString()}>
                    {turno.nome} ({turno.horaInicio} - {turno.horaFim})
                  </MenuItem>
                ))}
              </Select>
              {errors.turnoId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.turnoId.message}
                </Typography>
              )}
            </FormControl>

            {/* Carga Horária */}
            <TextField
              label="Carga Horária (Opcional)"
              type="number"
              fullWidth
              placeholder="Ex: 8.0, 6.0, 12.0"
              inputProps={{ step: "0.5", min: "0", max: "24" }}
              value={watch("cargaHoraria") || ""}
              sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}
              {...register("cargaHoraria", {
                validate: (value) => {
                  if (value && (parseFloat(value) < 0 || parseFloat(value) > 24)) {
                    return "A carga horária deve estar entre 0 e 24 horas";
                  }
                  return true;
                },
              })}
              onChange={(e) => setValue("cargaHoraria", e.target.value)}
              error={Boolean(errors.cargaHoraria)}
              helperText={errors.cargaHoraria?.message || "Horas trabalhadas por dia (ex: 8.0)"}
            />
          </Box>

          {/* Botões de Ação */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate("/lista-funcionarios")}
              disabled={loading || isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || isSubmitting}
              startIcon={loading ? <CircularProgress size={20} /> : <EditIcon />}
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={feedback.severity}
          onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EdicaoFuncionario;
