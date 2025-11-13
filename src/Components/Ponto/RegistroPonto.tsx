import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { format } from "date-fns";

// 🔑 IMPORTAÇÕES DO MUI
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  InputLabel,
  FormControl,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import SendIcon from "@mui/icons-material/Send";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import type { SedeDTO } from "../../types/SedeTypes";

// ------------------------------------------
// Constantes e Interfaces de Tipagem
// ------------------------------------------

const API_REGISTROS = "/api/registros-ponto/manual";
const API_SEDES = "/api/sedes";

type TipoRegistro = "ENTRADA" | "SAIDA" | "INICIO_INTERVALO" | "FIM_INTERVALO";

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

// ------------------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------------------

const RegistroPonto: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<IFormInput>({
    defaultValues: {
      dataRegistro: format(new Date(), "yyyy-MM-dd"),
      horaRegistro: format(new Date(), "HH:mm"),
      tipo: "ENTRADA",
      sedeId: "",
    },
  });

  const [sedes, setSedes] = useState<SedeDTO[]>([]);
  const [status, setStatus] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // ------------------------------------------
  // Lógica de Carregamento de Sedes
  // ------------------------------------------
  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await api.get<SedeDTO[]>(API_SEDES);
        setSedes(response.data ?? []);
      } catch (error) {
        console.error("Erro ao carregar sedes:", error);
        setStatus("Erro ao carregar sedes. Verifique se você está logado.");
        setIsSuccess(false);
      } finally {
        setDataLoading(false);
      }
    };
    fetchSedes();
  }, [setValue]);

  // ------------------------------------------
  // Lógica de Submissão
  // ------------------------------------------
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setStatus("");
    setLoading(true);

    try {
      const horarioCompleto = `${data.dataRegistro}T${data.horaRegistro}:00`;

      const payload = {
        matricula: data.matricula,
        senha: data.senha,
        sedeId: parseInt(data.sedeId),
        tipo: data.tipo,
        horario: horarioCompleto,
        observacao: data.justificativa,
      };

      const response = await api.post(API_REGISTROS, payload);

      setStatus(`Ponto registrado! ${response.data.mensagem}`);
      setIsSuccess(true);
      reset({
        dataRegistro: format(new Date(), "yyyy-MM-dd"),
        horaRegistro: format(new Date(), "HH:mm"),
        tipo: data.tipo,
        sedeId: data.sedeId,
      });
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

      setStatus(`Falha no Ponto: ${errorMessage}`);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------
  // RENDERIZAÇÃO
  // ------------------------------------------

  if (dataLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Carregando dados de Sedes...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* BOX DO TÍTULO COM FUNDO BRANCO E SOMBRA */}
      <Box
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          p: 2,
          mb: 3,
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          component="h1"
          sx={{
            color: "#333",
            textAlign: "center",
            fontWeight: 600,
            mb: 0,
          }}
        >
          <AccessTimeIcon
            fontSize="inherit"
            sx={{ mr: 1, verticalAlign: "middle" }}
          />
          Registro de Ponto Manual
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{ p: 4, border: "1px solid #ddd", borderRadius: "8px" }}
      >
        {status && (
          <Alert severity={isSuccess ? "success" : "error"} sx={{ mb: 3 }}>
            {status}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* O Grid PARENTAL DEVE TER APENAS a prop 'container' */}
          <Grid container spacing={3}>
            {/* 1. LINHA FIXA 1: Sede(4), Tipo(2), Data(3), Hora(3) = 12 */}

            {/* 1.1 Sede (sm=4) - ADICIONADO component="div" para tentar corrigir o erro de tipagem */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth error={!!errors.sedeId}>
                <InputLabel
                  id="sede-label"
                  sx={{
                    maxWidth: "90%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  Sede
                </InputLabel>
                <Select
                  labelId="sede-label"
                  label="Sede"
                  variant="outlined"
                  fullWidth
                  {...register("sedeId", {
                    required: "A sede é obrigatória",
                  })}
                  disabled={loading}
                  sx={{
                    borderRadius: "8px",
                    "& .MuiSelect-select": {
                      paddingTop: "10px",
                      paddingBottom: "10px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    },
                  }}
                >
                  <MenuItem value="">Selecione a sede da batida</MenuItem>
                  {sedes.map((sede) => (
                    <MenuItem key={sede.id} value={sede.id.toString()}>
                      <Box
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          width: "100%",
                        }}
                      >
                        {sede.nome}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.sedeId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.sedeId.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* 1.2 Tipo de Registro (sm=2) */}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth error={!!errors.tipo}>
                <InputLabel id="tipo-label">Tipo</InputLabel>
                <Select
                  labelId="tipo-label"
                  label="Tipo"
                  variant="outlined"
                  fullWidth
                  {...register("tipo", {
                    required: "O tipo de registro é obrigatório",
                  })}
                  disabled={loading}
                  sx={{
                    borderRadius: "8px",
                    "& .MuiSelect-select": {
                      paddingTop: "10px",
                      paddingBottom: "10px",
                    },
                  }}
                >
                  <MenuItem value="ENTRADA">Entrada</MenuItem>
                  <MenuItem value="SAIDA">Saída</MenuItem>
                  <MenuItem value="INICIO_INTERVALO">
                    Intervalo (Início)
                  </MenuItem>
                  <MenuItem value="FIM_INTERVALO">Intervalo (Fim)</MenuItem>
                </Select>
                {errors.tipo && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.tipo.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* 1.3 Data da Batida (sm=3) */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Data"
                type="date"
                fullWidth
                error={!!errors.dataRegistro}
                helperText={errors.dataRegistro?.message}
                InputLabelProps={{ shrink: true }}
                {...register("dataRegistro", {
                  required: "A data é obrigatória",
                })}
                disabled={loading}
                InputProps={{
                  sx: {
                    borderRadius: "8px",
                    paddingTop: "3px",
                    paddingBottom: "3px",
                  },
                }}
              />
            </Grid>

            {/* 1.4 Hora da Batida (sm=3) */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Hora"
                type="time"
                fullWidth
                error={!!errors.horaRegistro}
                helperText={errors.horaRegistro?.message}
                InputLabelProps={{ shrink: true }}
                {...register("horaRegistro", {
                  required: "A hora é obrigatória",
                })}
                disabled={loading}
                InputProps={{
                  sx: {
                    borderRadius: "8px",
                    paddingTop: "3px",
                    paddingBottom: "3px",
                  },
                }}
              />
            </Grid>

            {/* 2. LINHA FIXA 2: Matrícula(6) e Senha(6) = 12 */}

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Matrícula do Funcionário"
                type="text"
                fullWidth
                placeholder="Digite a matrícula do funcionário"
                error={!!errors.matricula}
                helperText={errors.matricula?.message}
                {...register("matricula", {
                  required: "A matrícula é obrigatória",
                })}
                disabled={loading}
                InputProps={{
                  sx: {
                    borderRadius: "8px",
                    paddingTop: "3px",
                    paddingBottom: "3px",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Senha do Funcionário"
                type="password"
                fullWidth
                placeholder="Digite a senha do funcionário"
                error={!!errors.senha}
                helperText={errors.senha?.message}
                {...register("senha", { required: "A senha é obrigatória" })}
                disabled={loading}
                InputProps={{
                  sx: {
                    borderRadius: "8px",
                    paddingTop: "3px",
                    paddingBottom: "3px",
                  },
                }}
              />
            </Grid>

            {/* 3. LINHA FIXA 3: Justificativa (12) */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Justificativa (Observação)"
                multiline
                rows={3}
                fullWidth
                placeholder="Justifique seu ponto (Obrigatório)"
                error={!!errors.justificativa}
                helperText={errors.justificativa?.message}
                {...register("justificativa", {
                  required: "A justificativa é obrigatória",
                })}
                disabled={loading}
                sx={{
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                }}
              />
            </Grid>

            {/* 4. LINHA FIXA 4: Botão (Centralizado) */}
            <Grid size={{ xs: 12 }} sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SendIcon />
                  )
                }
                sx={{
                  mt: 2,
                  borderRadius: "8px",
                  py: 1.5,
                  fontWeight: 600,
                  width: { xs: "100%", sm: "400px" },
                }}
              >
                {loading ? "Registrando..." : "Registrar Ponto Manual"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default RegistroPonto;
