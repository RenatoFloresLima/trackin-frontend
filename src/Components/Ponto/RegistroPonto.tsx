import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { format } from "date-fns";
import PageContainer from "../UI/PageContainer";

// 🔑 IMPORTAÇÕES DO MUI
import {
  Paper,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  Alert,
  InputLabel,
  FormControl,
  Select,
} from "@mui/material";

import SendIcon from "@mui/icons-material/Send";

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
    control,
  } = useForm<IFormInput>({
    defaultValues: {
      dataRegistro: format(new Date(), "yyyy-MM-dd"),
      horaRegistro: format(new Date(), "HH:mm"),
      tipo: "ENTRADA",
      sedeId: "",
    },
  });

  const [sedes, setSedes] = useState<Sede[]>([]);
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
        const response = await api.get<Sede[]>(API_SEDES);
        setSedes(response.data);
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
      <PageContainer title="Registro de Ponto Manual">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Carregando dados de Sedes...
            </Typography>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Registro de Ponto Manual"
      subtitle="Registre um ponto manual para um funcionário"
      breadcrumbs={[
        { label: "Início", path: "/" },
        { label: "Bater Ponto" },
      ]}
    >
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 3,
        }}
      >
        {status && (
          <Alert severity={isSuccess ? "success" : "error"} sx={{ mb: 3 }}>
            {status}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Sede - Linha separada com label estático */}
            <Grid size={12}>
              <Controller
                name="sedeId"
                control={control}
                rules={{ required: "A sede é obrigatória" }}
                defaultValue=""
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    error={!!errors.sedeId}
                    sx={{ minHeight: '56px' }}
                  >
                    <InputLabel 
                      id="sede-label" 
                      shrink={false}
                      sx={{ 
                        fontSize: '1rem',
                        transform: 'none',
                        position: 'static',
                        marginBottom: '8px',
                        fontWeight: 500,
                        color: 'text.primary',
                      }}
                    >
                      Sede
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="sede-label"
                      displayEmpty
                      disabled={loading}
                      renderValue={(selected) => {
                        if (!selected || selected === '') {
                          return <span style={{ color: '#9e9e9e' }}>Selecione a sede da batida</span>;
                        }
                        const sede = sedes.find(s => s.id.toString() === selected);
                        return sede ? sede.nome : '';
                      }}
                      sx={{
                        minHeight: '56px',
                        fontSize: '1rem',
                        borderRadius: '10px',
                        '& .MuiSelect-select': {
                          padding: '14px 14px',
                          fontSize: '1rem',
                          minHeight: '56px',
                          display: 'flex',
                          alignItems: 'center',
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                            '& .MuiMenuItem-root': {
                              fontSize: '1rem',
                              padding: '12px 16px',
                              minHeight: '48px',
                            },
                          },
                        },
                      }}
                    >
                      {sedes.map((sede) => (
                        <MenuItem 
                          key={sede.id} 
                          value={sede.id.toString()}
                          sx={{ fontSize: '1rem', minHeight: '48px' }}
                        >
                          {sede.nome}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.sedeId && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.sedeId.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Tipo de Registro - Linha separada com label estático */}
            <Grid size={12}>
              <Controller
                name="tipo"
                control={control}
                rules={{ required: "O tipo de registro é obrigatório" }}
                defaultValue="ENTRADA"
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    error={!!errors.tipo}
                    sx={{ minHeight: '56px' }}
                  >
                    <InputLabel 
                      id="tipo-label" 
                      shrink={false}
                      sx={{ 
                        fontSize: '1rem',
                        transform: 'none',
                        position: 'static',
                        marginBottom: '8px',
                        fontWeight: 500,
                        color: 'text.primary',
                      }}
                    >
                      Tipo de Registro
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="tipo-label"
                      disabled={loading}
                      sx={{
                        minHeight: '56px',
                        fontSize: '1rem',
                        borderRadius: '10px',
                        '& .MuiSelect-select': {
                          padding: '14px 14px',
                          fontSize: '1rem',
                          minHeight: '56px',
                          display: 'flex',
                          alignItems: 'center',
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            '& .MuiMenuItem-root': {
                              fontSize: '1rem',
                              padding: '12px 16px',
                              minHeight: '48px',
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="ENTRADA" sx={{ fontSize: '1rem', minHeight: '48px' }}>
                        Entrada
                      </MenuItem>
                      <MenuItem value="SAIDA" sx={{ fontSize: '1rem', minHeight: '48px' }}>
                        Saída
                      </MenuItem>
                      <MenuItem value="INICIO_INTERVALO" sx={{ fontSize: '1rem', minHeight: '48px' }}>
                        Intervalo (Início)
                      </MenuItem>
                      <MenuItem value="FIM_INTERVALO" sx={{ fontSize: '1rem', minHeight: '48px' }}>
                        Intervalo (Fim)
                      </MenuItem>
                    </Select>
                    {errors.tipo && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.tipo.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Data e Hora da Batida */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Data da Batida"
                type="date"
                fullWidth
                error={!!errors.dataRegistro}
                helperText={errors.dataRegistro?.message}
                InputLabelProps={{ shrink: true }}
                {...register("dataRegistro", {
                  required: "A data é obrigatória",
                })}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Hora da Batida"
                type="time"
                fullWidth
                error={!!errors.horaRegistro}
                helperText={errors.horaRegistro?.message}
                InputLabelProps={{ shrink: true }}
                {...register("horaRegistro", {
                  required: "A hora é obrigatória",
                })}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
            </Grid>

            {/* Matrícula e Senha do Funcionário */}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
            </Grid>

            {/* Justificativa */}
            <Grid size={12}>
              <TextField
                label="Justificativa (Observação)"
                multiline
                rows={4}
                fullWidth
                placeholder="Justifique seu ponto (Obrigatório)"
                error={!!errors.justificativa}
                helperText={errors.justificativa?.message}
                {...register("justificativa", {
                  required: "A justificativa é obrigatória",
                })}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
            </Grid>

            {/* Botão de Submit */}
            <Grid size={12}>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SendIcon />
                    )
                  }
                  sx={{
                    borderRadius: '10px',
                    py: 1.5,
                    px: 4,
                    fontWeight: 600,
                    minWidth: { xs: "100%", sm: "300px" },
                  }}
                >
                  {loading ? "Registrando..." : "Registrar Ponto Manual"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </PageContainer>
  );
};

export default RegistroPonto;
