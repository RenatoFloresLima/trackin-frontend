import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings";
import { useForm, Controller } from "react-hook-form";

import type { EmpresaJornadaRegraFormValues, TipoEscalaEnum, ModoFechamentoDiaEnum } from "../../types/JornadaTypes";
import {
  buscarRegrasPorEmpresaId,
  criarRegras,
  atualizarRegras,
} from "../../services/JornadaRegraService";
import { buscarEmpresaPorId } from "../../services/EmpresaService";

const defaultValues: EmpresaJornadaRegraFormValues = {
  tipoEscala: "ESCALA_8X5",
  horasPrevistasPorTurno: 8.0,
  toleranciaEntradaMin: 5,
  toleranciaSaidaMin: 5,
  limiteExtraDiaria: 2.0,
  limiteTotalDia: 10.0,
  obrigatoriedadeIntervalo: true,
  intervaloMinimo: 60,
  modoFechamentoDia: "CIVIL",
};

const TIPO_ESCALA_OPTIONS: { value: TipoEscalaEnum; label: string }[] = [
  { value: "ESCALA_8X5", label: "8x5 (8 horas por dia, 5 dias por semana)" },
  { value: "ESCALA_12X36", label: "12x36 (12 horas trabalhadas, 36 horas de descanso)" },
  { value: "ESCALA_24X48", label: "24x48 (24 horas trabalhadas, 48 horas de descanso)" },
  { value: "PERSONALIZADA", label: "Personalizada" },
];

const MODO_FECHAMENTO_OPTIONS: { value: ModoFechamentoDiaEnum; label: string }[] = [
  { value: "CIVIL", label: "Civil (00h às 23h59)" },
  { value: "OPERACIONAL", label: "Operacional (pode estender para o dia seguinte)" },
];

const JornadaRegraFormPage = () => {
  const params = useParams<{ empresaId: string }>();
  const navigate = useNavigate();
  const empresaId = params.empresaId ? Number(params.empresaId) : null;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EmpresaJornadaRegraFormValues>({
    defaultValues,
  });

  const obrigatoriedadeIntervalo = watch("obrigatoriedadeIntervalo");

  const [loading, setLoading] = useState(true);
  const [empresaNome, setEmpresaNome] = useState<string>("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [hasRegras, setHasRegras] = useState(false);

  useEffect(() => {
    if (!empresaId) {
      setApiError("ID da empresa não fornecido.");
      setLoading(false);
      return;
    }

    const carregar = async () => {
      try {
        setLoading(true);
        setApiError(null);

        // Carrega dados da empresa
        const empresa = await buscarEmpresaPorId(empresaId);
        setEmpresaNome(empresa.nome);

        // Tenta carregar regras existentes
        try {
          const regras = await buscarRegrasPorEmpresaId(empresaId);
          reset({
            tipoEscala: regras.tipoEscala,
            horasPrevistasPorTurno: regras.horasPrevistasPorTurno,
            toleranciaEntradaMin: regras.toleranciaEntradaMin,
            toleranciaSaidaMin: regras.toleranciaSaidaMin,
            limiteExtraDiaria: regras.limiteExtraDiaria,
            limiteTotalDia: regras.limiteTotalDia,
            obrigatoriedadeIntervalo: regras.obrigatoriedadeIntervalo,
            intervaloMinimo: regras.intervaloMinimo,
            modoFechamentoDia: regras.modoFechamentoDia,
          });
          setHasRegras(true);
        } catch (err: any) {
          // Se não encontrar regras, mantém os valores padrão
          if (err.response?.status !== 404) {
            console.error("[JornadaRegra] Erro ao carregar regras:", err);
          }
          setHasRegras(false);
        }
      } catch (err: any) {
        console.error("[JornadaRegra] Erro ao carregar:", err);
        setApiError("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [empresaId, reset]);

  const onSubmit = async (data: EmpresaJornadaRegraFormValues) => {
    if (!empresaId) return;

    try {
      setApiError(null);
      if (hasRegras) {
        await atualizarRegras(empresaId, data);
        setFeedback({
          open: true,
          message: "Regras de jornada atualizadas com sucesso!",
          severity: "success",
        });
      } else {
        await criarRegras(empresaId, data);
        setFeedback({
          open: true,
          message: "Regras de jornada criadas com sucesso!",
          severity: "success",
        });
        setHasRegras(true);
      }
    } catch (err: any) {
      console.error("[JornadaRegra] Erro ao salvar:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Não foi possível salvar as regras. Tente novamente.";
      setApiError(errorMessage);
      setFeedback({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={() => navigate(-1)} size="small">
          <ArrowBackIcon />
        </IconButton>
        <SettingsIcon sx={{ fontSize: 32, color: "primary.main" }} />
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Regras de Jornada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {empresaNome}
          </Typography>
        </Box>
      </Stack>

      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Tipo de Escala */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.tipoEscala}>
                <InputLabel>Tipo de Escala</InputLabel>
                <Controller
                  name="tipoEscala"
                  control={control}
                  rules={{ required: "O tipo de escala é obrigatório" }}
                  render={({ field }) => (
                    <Select {...field} label="Tipo de Escala">
                      {TIPO_ESCALA_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.tipoEscala && (
                  <FormHelperText>{errors.tipoEscala.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Modo de Fechamento do Dia */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.modoFechamentoDia}>
                <InputLabel>Modo de Fechamento do Dia</InputLabel>
                <Controller
                  name="modoFechamentoDia"
                  control={control}
                  rules={{ required: "O modo de fechamento é obrigatório" }}
                  render={({ field }) => (
                    <Select {...field} label="Modo de Fechamento do Dia">
                      {MODO_FECHAMENTO_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.modoFechamentoDia && (
                  <FormHelperText>{errors.modoFechamentoDia.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Horas e Limites
              </Typography>
            </Grid>

            {/* Horas Previstas por Turno */}
            <Grid item xs={12} md={6}>
              <Controller
                name="horasPrevistasPorTurno"
                control={control}
                rules={{
                  required: "As horas previstas são obrigatórias",
                  min: { value: 0.01, message: "Deve ser maior que zero" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Horas Previstas por Turno"
                    type="number"
                    fullWidth
                    inputProps={{ step: 0.5, min: 0.01 }}
                    error={!!errors.horasPrevistasPorTurno}
                    helperText={errors.horasPrevistasPorTurno?.message}
                  />
                )}
              />
            </Grid>

            {/* Limite Total do Dia */}
            <Grid item xs={12} md={6}>
              <Controller
                name="limiteTotalDia"
                control={control}
                rules={{
                  required: "O limite total do dia é obrigatório",
                  min: { value: 0.01, message: "Deve ser maior que zero" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Limite Total do Dia (horas)"
                    type="number"
                    fullWidth
                    inputProps={{ step: 0.5, min: 0.01 }}
                    error={!!errors.limiteTotalDia}
                    helperText={errors.limiteTotalDia?.message}
                  />
                )}
              />
            </Grid>

            {/* Limite de Extra Diária */}
            <Grid item xs={12} md={6}>
              <Controller
                name="limiteExtraDiaria"
                control={control}
                rules={{
                  min: { value: 0, message: "Não pode ser negativo" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Limite de Extra Diária (horas)"
                    type="number"
                    fullWidth
                    inputProps={{ step: 0.5, min: 0 }}
                    error={!!errors.limiteExtraDiaria}
                    helperText={errors.limiteExtraDiaria?.message || "Opcional"}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Tolerâncias
              </Typography>
            </Grid>

            {/* Tolerância de Entrada */}
            <Grid item xs={12} md={6}>
              <Controller
                name="toleranciaEntradaMin"
                control={control}
                rules={{
                  required: "A tolerância de entrada é obrigatória",
                  min: { value: 0, message: "Não pode ser negativa" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tolerância de Entrada (minutos)"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0 }}
                    error={!!errors.toleranciaEntradaMin}
                    helperText={errors.toleranciaEntradaMin?.message}
                  />
                )}
              />
            </Grid>

            {/* Tolerância de Saída */}
            <Grid item xs={12} md={6}>
              <Controller
                name="toleranciaSaidaMin"
                control={control}
                rules={{
                  required: "A tolerância de saída é obrigatória",
                  min: { value: 0, message: "Não pode ser negativa" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tolerância de Saída (minutos)"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0 }}
                    error={!!errors.toleranciaSaidaMin}
                    helperText={errors.toleranciaSaidaMin?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Intervalo
              </Typography>
            </Grid>

            {/* Obrigatoriedade de Intervalo */}
            <Grid item xs={12}>
              <Controller
                name="obrigatoriedadeIntervalo"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Intervalo obrigatório"
                  />
                )}
              />
            </Grid>

            {/* Intervalo Mínimo */}
            {obrigatoriedadeIntervalo && (
              <Grid item xs={12} md={6}>
                <Controller
                  name="intervaloMinimo"
                  control={control}
                  rules={{
                    min: { value: 0, message: "Não pode ser negativo" },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Intervalo Mínimo (minutos)"
                      type="number"
                      fullWidth
                      inputProps={{ min: 0 }}
                      error={!!errors.intervaloMinimo}
                      helperText={errors.intervaloMinimo?.message || "Duração mínima do intervalo"}
                    />
                  )}
                />
              </Grid>
            )}

            {/* Botões */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : hasRegras ? "Atualizar Regras" : "Criar Regras"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() => setFeedback({ ...feedback, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={feedback.severity}
          onClose={() => setFeedback({ ...feedback, open: false })}
          sx={{ width: "100%" }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default JornadaRegraFormPage;

