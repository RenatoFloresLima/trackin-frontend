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
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useForm } from "react-hook-form";

import type { FuncaoFormValues } from "../../types/FuncaoTypes";
import {
  atualizarFuncao,
  buscarFuncaoPorId,
  criarFuncao,
} from "../../services/FuncaoService";

const defaultValues: FuncaoFormValues = {
  nome: "",
  descricao: "",
};

const FuncaoFormPage = () => {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const isEdit = useMemo(() => Boolean(params.id), [params.id]);
  const funcaoId = params.id ? Number(params.id) : null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FuncaoFormValues>({
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
    if (!isEdit || !funcaoId) {
      reset(defaultValues);
      setLoading(false);
      return;
    }

    const carregar = async () => {
      try {
        setLoading(true);
        setApiError(null);
        const data = await buscarFuncaoPorId(funcaoId);
        reset({
          nome: data.nome ?? "",
          descricao: data.descricao ?? "",
        });
      } catch (err) {
        console.error("[FuncaoForm] Erro ao carregar função:", err);
        setApiError("Não foi possível carregar os dados da função.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [isEdit, reset, funcaoId]);

  const onSubmit = async (values: FuncaoFormValues) => {
    if (isEdit && !funcaoId) return;
    try {
      setApiError(null);
      const payload: FuncaoFormValues = {
        nome: values.nome.trim(),
        descricao: values.descricao?.trim() || null,
      };

      if (isEdit && funcaoId) {
        await atualizarFuncao(funcaoId, payload);
        setFeedback({
          open: true,
          message: "Função atualizada com sucesso!",
          severity: "success",
        });
      } else {
        await criarFuncao(payload);
        setFeedback({
          open: true,
          message: "Função criada com sucesso!",
          severity: "success",
        });
        reset(defaultValues);
      }

      // Redireciona após breve atraso
      setTimeout(() => navigate("/funcoes"), 800);
    } catch (err: any) {
      console.error("[FuncaoForm] Erro ao salvar função:", err);
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.mensagem ??
        "Não foi possível salvar a função. Verifique os dados informados.";
      setApiError(message);
      setFeedback({
        open: true,
        message,
        severity: "error",
      });
    }
  };

  const titulo = isEdit ? "Editar função" : "Nova função";
  const subtitulo = isEdit
    ? "Atualize as informações da função."
    : "Informe os dados da nova função.";

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <Tooltip title="Voltar para a lista">
          <IconButton color="primary" onClick={() => navigate("/funcoes")}>
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
                label="Nome da função"
                fullWidth
                placeholder="Ex.: Recepcionista, Gerente de Vendas"
                {...register("nome", {
                  required: "Informe o nome da função.",
                  maxLength: {
                    value: 100,
                    message: "O nome não pode exceder 100 caracteres.",
                  },
                })}
                error={Boolean(errors.nome)}
                helperText={errors.nome?.message}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={4}
                placeholder="Descreva as responsabilidades e características desta função (opcional)"
                {...register("descricao", {
                  maxLength: {
                    value: 255,
                    message: "A descrição não pode exceder 255 caracteres.",
                  },
                })}
                error={Boolean(errors.descricao)}
                helperText={errors.descricao?.message}
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
                  onClick={() => navigate("/funcoes")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || loading}
                >
                  {isEdit ? "Salvar alterações" : "Cadastrar função"}
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

export default FuncaoFormPage;


