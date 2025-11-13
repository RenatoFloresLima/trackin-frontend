import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import PlaceIcon from "@mui/icons-material/Place";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useForm } from "react-hook-form";

import type { SedeFormValues } from "../../types/SedeTypes";
import {
  atualizarSede,
  buscarSedePorId,
  criarSede,
} from "../../services/SedeService";

const defaultValues: SedeFormValues = {
  nome: "",
  endereco: "",
  identificadorUnico: "",
  latitude: -23.55052, // exemplo São Paulo
  longitude: -46.633308,
  raioPermitido: 100,
};

const SedeFormPage = () => {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const isEdit = useMemo(() => Boolean(params.id), [params.id]);
  const sedeId = params.id ? Number(params.id) : null;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SedeFormValues>({
    defaultValues,
  });

  const [loading, setLoading] = useState(isEdit);
  const [apiError, setApiError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (!isEdit || !sedeId) {
      reset(defaultValues);
      setLoading(false);
      return;
    }

    const carregar = async () => {
      try {
        setLoading(true);
        setApiError(null);
        const data = await buscarSedePorId(sedeId);
        reset({
          nome: data.nome ?? "",
          endereco: data.endereco ?? "",
          identificadorUnico: data.identificadorUnico ?? "",
          latitude: data.latitude ?? defaultValues.latitude,
          longitude: data.longitude ?? defaultValues.longitude,
          raioPermitido: data.raioPermitido ?? defaultValues.raioPermitido,
        });
      } catch (err) {
        console.error("[SedeForm] Erro ao carregar sede:", err);
        setApiError("Não foi possível carregar os dados da sede.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [isEdit, reset, sedeId]);

  const onSubmit = async (values: SedeFormValues) => {
    if (isEdit && !sedeId) return;
    try {
      setApiError(null);
      const payload: SedeFormValues = {
        ...values,
        raioPermitido: Number(values.raioPermitido),
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
      };

      if (isEdit && sedeId) {
        await atualizarSede(sedeId, payload);
        setFeedback({
          open: true,
          message: "Sede atualizada com sucesso!",
          severity: "success",
        });
      } else {
        await criarSede(payload);
        setFeedback({
          open: true,
          message: "Sede criada com sucesso!",
          severity: "success",
        });
        reset(defaultValues);
      }

      // Redireciona após breve atraso
      setTimeout(() => navigate("/sedes"), 800);
    } catch (err: any) {
      console.error("[SedeForm] Erro ao salvar sede:", err);
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.mensagem ??
        "Não foi possível salvar a sede. Verifique os dados informados.";
      setApiError(message);
      setFeedback({
        open: true,
        message,
        severity: "error",
      });
    }
  };

  const preencherComLocalizacaoAtual = () => {
    if (!navigator.geolocation) {
      setFeedback({
        open: true,
        message:
          "Este navegador não suporta geolocalização. Informe manualmente.",
        severity: "error",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", Number(position.coords.latitude.toFixed(6)), {
          shouldDirty: true,
        });
        setValue("longitude", Number(position.coords.longitude.toFixed(6)), {
          shouldDirty: true,
        });
        setFeedback({
          open: true,
          message: "Localização preenchida automaticamente.",
          severity: "success",
        });
      },
      (error) => {
        console.error("[SedeForm] Geolocalização não disponível:", error);
        setFeedback({
          open: true,
          message:
            "Não foi possível obter a localização. Verifique as permissões do navegador.",
          severity: "error",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const titulo = isEdit ? "Editar sede" : "Nova sede";
  const subtitulo = isEdit
    ? "Atualize as informações e o perímetro para habilitar a aprovação automática."
    : "Informe os dados da unidade e o perímetro permitido para o registro automático.";

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <Tooltip title="Voltar para a lista">
          <IconButton color="primary" onClick={() => navigate("/sedes")}>
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
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <Typography>Carregando dados...</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Nome da sede"
                fullWidth
                placeholder="Ex.: Matriz São Paulo"
                {...register("nome", { required: "Informe o nome da sede." })}
                error={Boolean(errors.nome)}
                helperText={errors.nome?.message}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Endereço"
                fullWidth
                placeholder="Rua Exemplo, 123 - Bairro"
                {...register("endereco")}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Identificador interno"
                fullWidth
                placeholder="Código ou apelido utilizado no hardware"
                {...register("identificadorUnico")}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" justifyContent={{ md: "flex-end" }}>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<MyLocationIcon />}
                  onClick={preencherComLocalizacaoAtual}
                >
                  Usar minha localização
                </Button>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Latitude"
                type="number"
                fullWidth
                inputProps={{ step: 0.000001 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PlaceIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                {...register("latitude", {
                  required: "Informe a latitude.",
                  valueAsNumber: true,
                  min: { value: -90, message: "A latitude mínima é -90." },
                  max: { value: 90, message: "A latitude máxima é 90." },
                })}
                error={Boolean(errors.latitude)}
                helperText={
                  errors.latitude?.message ||
                  "Use valores decimais. Ex.: -23.550520"
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Longitude"
                type="number"
                fullWidth
                inputProps={{ step: 0.000001 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PlaceIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                {...register("longitude", {
                  required: "Informe a longitude.",
                  valueAsNumber: true,
                  min: { value: -180, message: "A longitude mínima é -180." },
                  max: { value: 180, message: "A longitude máxima é 180." },
                })}
                error={Boolean(errors.longitude)}
                helperText={
                  errors.longitude?.message ||
                  "Use valores decimais. Ex.: -46.633308"
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Raio permitido (metros)"
                type="number"
                fullWidth
                inputProps={{ step: 1, min: 1 }}
                {...register("raioPermitido", {
                  required: "Informe o raio permitido.",
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: "O raio deve ser de pelo menos 1 metro.",
                  },
                })}
                error={Boolean(errors.raioPermitido)}
                helperText={
                  errors.raioPermitido?.message ||
                  "Campos dentro desse raio serão aprovados automaticamente."
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="flex-end"
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate("/sedes")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || loading}
                >
                  {isEdit ? "Salvar alterações" : "Cadastrar sede"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        )}
      </Paper>

      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() =>
          setFeedback((prev) => ({ ...prev, open: false }))
        }
      >
        <Alert
          severity={feedback.severity}
          onClose={() =>
            setFeedback((prev) => ({ ...prev, open: false }))
          }
          sx={{ width: "100%" }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SedeFormPage;

