import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import api from "../../services/api";
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
  descricao: string;
}

interface Turno {
  id: number;
  nome: string;
  horaInicio: string;
  horaFim: string;
}

interface IFormInput {
  nome: string;
  endereco: string;
  telefone: string;
  cpf: string;
  email: string;
  sedePrincipalId: string;
  funcaoId: string;
  dataContratacao: string;
  role: "ROLE_FUNCIONARIO" | "ROLE_ADMIN";
  turnoId?: string;
  cargaHoraria?: string;
}

const Cadastro = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<IFormInput>();

  const [sedes, setSedes] = useState<SedeDTO[]>([]);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [sedesResponse, funcoesResponse, turnosResponse] = await Promise.all([
          api.get<SedeDTO[]>(API_SEDES),
          api.get<Funcao[]>(API_FUNCOES),
          api.get<Turno[]>(API_TURNOS),
        ]);

        setSedes(sedesResponse.data ?? []);
        setFuncoes(funcoesResponse.data ?? []);
        setTurnos(turnosResponse.data ?? []);
        setApiError(null);
      } catch (error: any) {
        console.error("Erro ao carregar dados de Sedes, Funções ou Turnos:", error);
        const errorMessage = error.response?.data?.message || "Erro ao carregar dados essenciais. Verifique o backend ou sua permissão de acesso.";
        setApiError(errorMessage);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setApiError(null);
    setLoading(true);

    try {
      const payload = {
        ...data,
        sedePrincipalId: parseInt(data.sedePrincipalId),
        funcaoId: parseInt(data.funcaoId),
        role: data.role,
        turnoId: data.turnoId ? parseInt(data.turnoId) : null,
        cargaHoraria: data.cargaHoraria ? parseFloat(data.cargaHoraria) : null,
      };

      const response = await api.post(API_FUNCIONARIOS, payload);

      setFeedback({
        open: true,
        message: `Funcionário ${response.data.nome} cadastrado com sucesso!`,
        severity: "success",
      });
      reset();
      
      // Redireciona após 1.5 segundos
      setTimeout(() => {
        navigate("/lista-funcionarios");
      }, 1500);
    } catch (error: any) {
      console.error("Erro no cadastro:", error);

      let errorMessage = "Erro desconhecido ao cadastrar funcionário.";
      
      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        if (status === 409) {
          // Conflito - CPF ou Email já cadastrado
          errorMessage = responseData.message || "CPF ou Email já está cadastrado em outro funcionário.";
        } else if (status === 403) {
          errorMessage = "Permissão negada. Você precisa ser ROLE_ADMIN para cadastrar funcionários.";
        } else if (status === 400) {
          // Erros de validação
          if (responseData.errors) {
            const validationErrors = Object.entries(responseData.errors)
              .map(([field, message]) => `${field}: ${message}`)
              .join(", ");
            errorMessage = `Erro de validação: ${validationErrors}`;
          } else {
            errorMessage = responseData.message || "Dados inválidos. Verifique os campos preenchidos.";
          }
        } else {
          errorMessage = responseData.message || `Erro ${status}: Não foi possível cadastrar o funcionário.`;
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

  if (dataLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography>Carregando dados de Sedes e Funções...</Typography>
          </Stack>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeader
        title="Cadastro de Funcionário"
        subtitle="Preencha os dados para cadastrar um novo funcionário no sistema"
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
            startIcon={<PersonAddIcon />}
            onClick={handleSubmit(onSubmit)}
            disabled={loading || isSubmitting}
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
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

            {/* CPF */}
            <TextField
              label="CPF"
              fullWidth
              required
              placeholder="000.000.000-00"
              sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}
              {...register("cpf", {
                required: "O CPF é obrigatório",
              })}
              error={Boolean(errors.cpf)}
              helperText={errors.cpf?.message || "Formato: 000.000.000-00"}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
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
            {/* Data de Contratação */}
            <TextField
              label="Data de Contratação"
              type="date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}
              {...register("dataContratacao", { required: "A data de contratação é obrigatória" })}
              error={Boolean(errors.dataContratacao)}
              helperText={errors.dataContratacao?.message}
            />

            {/* Sede */}
            <FormControl fullWidth required error={Boolean(errors.sedePrincipalId)} sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}>
              <InputLabel>Sede</InputLabel>
              <Select
                label="Sede"
                {...register("sedePrincipalId", { required: "Selecione uma sede" })}
                defaultValue=""
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

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {/* Função */}
            <FormControl fullWidth required error={Boolean(errors.funcaoId)} sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}>
              <InputLabel>Função</InputLabel>
              <Select
                label="Função"
                {...register("funcaoId", { required: "Selecione uma função" })}
                defaultValue=""
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
                {...register("role", { required: "Selecione um perfil de acesso" })}
                defaultValue="ROLE_FUNCIONARIO"
              >
                <MenuItem value="ROLE_FUNCIONARIO">Funcionário Comum</MenuItem>
                <MenuItem value="ROLE_ADMIN">Administrador</MenuItem>
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
                {...register("turnoId")}
                defaultValue=""
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
              sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}
              {...register("cargaHoraria", {
                validate: (value) => {
                  if (value && (parseFloat(value) < 0 || parseFloat(value) > 24)) {
                    return "A carga horária deve estar entre 0 e 24 horas";
                  }
                  return true;
                },
              })}
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
              startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
            >
              {loading ? "Cadastrando..." : "Cadastrar Funcionário"}
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

export default Cadastro;
