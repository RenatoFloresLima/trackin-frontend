import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useForm } from "react-hook-form";

import { TurnoAPIService, type TurnoRequest, type TurnoResponse } from "../../services/TurnoAPIService";

interface TurnoFormValues {
  nome: string;
  horaInicio: string; // HH:mm
  horaFim: string; // HH:mm
  ativo: boolean;
}

const defaultValues: TurnoFormValues = {
  nome: "",
  horaInicio: "08:00",
  horaFim: "17:00",
  ativo: true,
};

const TurnoFormPage = () => {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const isEdit = useMemo(() => Boolean(params.id), [params.id]);
  const turnoId = params.id ? Number(params.id) : null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TurnoFormValues>({
    defaultValues,
  });

  const ativo = watch("ativo");

  const [loading, setLoading] = useState(isEdit);
  const [apiError, setApiError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (!isEdit || !turnoId) {
      reset(defaultValues);
      setLoading(false);
      return;
    }

    const carregar = async () => {
      try {
        setLoading(true);
        setApiError(null);
        const data: TurnoResponse = await TurnoAPIService.buscarPorId(turnoId);
        reset({
          nome: data.nome ?? "",
          horaInicio: data.horaInicio ?? "08:00",
          horaFim: data.horaFim ?? "17:00",
          ativo: data.ativo ?? true,
        });
      } catch (err) {
        console.error("[TurnoForm] Erro ao carregar turno:", err);
        setApiError("Não foi possível carregar os dados do turno.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [isEdit, reset, turnoId]);

  const onSubmit = async (values: TurnoFormValues) => {
    if (isEdit && !turnoId) return;
    try {
      setApiError(null);
      const payload: TurnoRequest = {
        nome: values.nome.trim(),
        horaInicio: values.horaInicio,
        horaFim: values.horaFim,
        ativo: values.ativo,
      };

      if (isEdit && turnoId) {
        await TurnoAPIService.atualizar(turnoId, payload);
        setFeedback({
          open: true,
          message: "Turno atualizado com sucesso!",
          severity: "success",
        });
      } else {
        await TurnoAPIService.cadastrar(payload);
        setFeedback({
          open: true,
          message: "Turno criado com sucesso!",
          severity: "success",
        });
        reset(defaultValues);
      }

      // Redireciona após breve atraso
      setTimeout(() => navigate("/turnos"), 800);
    } catch (err: any) {
      console.error("[TurnoForm] Erro ao salvar turno:", err);
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.mensagem ??
        "Não foi possível salvar o turno. Verifique os dados informados.";
      setApiError(message);
      setFeedback({
        open: true,
        message,
        severity: "error",
      });
    }
  };

  const titulo = isEdit ? "Editar turno" : "Novo turno";
  const subtitulo = isEdit
    ? "Atualize as informações do turno."
    : "Informe os dados do novo turno.";

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <Tooltip title="Voltar para a lista">
          <IconButton color="primary" onClick={() => navigate("/turnos")}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            {titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitulo}
          </Typography>
        </Box>
      </Stack>

      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
        </Alert>
      )}

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e0e0", p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome do Turno"
                placeholder="Ex: Comercial, Plantão, Noturno"
                {...register("nome", {
                  required: "O nome do turno é obrigatório",
                  minLength: {
                    value: 2,
                    message: "O nome deve ter pelo menos 2 caracteres",
                  },
                })}
                error={!!errors.nome}
                helperText={errors.nome?.message}
                disabled={loading || isSubmitting}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Horário de Início"
                type="time"
                InputLabelProps={{ shrink: true }}
                {...register("horaInicio", {
                  required: "O horário de início é obrigatório",
                })}
                error={!!errors.horaInicio}
                helperText={errors.horaInicio?.message}
                disabled={loading || isSubmitting}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Horário de Fim"
                type="time"
                InputLabelProps={{ shrink: true }}
                {...register("horaFim", {
                  required: "O horário de fim é obrigatório",
                  validate: (value) => {
                    const inicio = watch("horaInicio");
                    if (inicio && value && value <= inicio) {
                      return "O horário de fim deve ser posterior ao horário de início";
                    }
                    return true;
                  },
                })}
                error={!!errors.horaFim}
                helperText={errors.horaFim?.message}
                disabled={loading || isSubmitting}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={ativo}
                    onChange={(e) => setValue("ativo", e.target.checked)}
                    disabled={loading || isSubmitting}
                  />
                }
                label="Turno ativo"
              />
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate("/turnos")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || isSubmitting}
                >
                  {isSubmitting ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={() => setFeedback({ ...feedback, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setFeedback({ ...feedback, open: false })}
          severity={feedback.severity}
          sx={{ width: "100%" }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TurnoFormPage;

