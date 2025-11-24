import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useForm } from "react-hook-form";

import type { EmpresaFormValues } from "../../types/EmpresaTypes";
import {
  atualizarEmpresa,
  buscarEmpresaPorId,
  criarEmpresa,
} from "../../services/EmpresaService";

const defaultValues: EmpresaFormValues = {
  nome: "",
  cnpj: "",
  razaoSocial: "",
};

const EmpresaFormPage = () => {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const isEdit = useMemo(() => Boolean(params.id), [params.id]);
  const empresaId = params.id ? Number(params.id) : null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmpresaFormValues>({
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
    if (!isEdit || !empresaId) {
      reset(defaultValues);
      setLoading(false);
      return;
    }

    const carregar = async () => {
      try {
        setLoading(true);
        setApiError(null);
        const data = await buscarEmpresaPorId(empresaId);
        reset({
          nome: data.nome ?? "",
          cnpj: data.cnpj ?? "",
          razaoSocial: data.razaoSocial ?? "",
        });
      } catch (err) {
        console.error("[Empresa] Erro ao carregar:", err);
        setApiError("Não foi possível carregar os dados da empresa.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [isEdit, empresaId, reset]);

  const onSubmit = async (data: EmpresaFormValues) => {
    try {
      setApiError(null);
      if (isEdit && empresaId) {
        await atualizarEmpresa(empresaId, data);
        setFeedback({
          open: true,
          message: "Empresa atualizada com sucesso!",
          severity: "success",
        });
      } else {
        await criarEmpresa(data);
        setFeedback({
          open: true,
          message: "Empresa criada com sucesso!",
          severity: "success",
        });
      }
      setTimeout(() => navigate("/empresas"), 1500);
    } catch (err: any) {
      console.error("[Empresa] Erro ao salvar:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Não foi possível salvar a empresa. Tente novamente.";
      setApiError(errorMessage);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={() => navigate("/empresas")} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={600}>
          {isEdit ? "Editar Empresa" : "Nova Empresa"}
        </Typography>
      </Stack>

      <Paper elevation={0} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {apiError && (
              <Alert severity="error" onClose={() => setApiError(null)}>
                {apiError}
              </Alert>
            )}

            <TextField
              label="Nome"
              fullWidth
              required
              {...register("nome", { required: "O nome é obrigatório" })}
              error={!!errors.nome}
              helperText={errors.nome?.message}
            />

            <TextField
              label="CNPJ"
              fullWidth
              placeholder="XX.XXX.XXX/XXXX-XX"
              {...register("cnpj")}
              error={!!errors.cnpj}
              helperText={errors.cnpj?.message || "Opcional"}
            />

            <TextField
              label="Razão Social"
              fullWidth
              {...register("razaoSocial")}
              error={!!errors.razaoSocial}
              helperText={errors.razaoSocial?.message || "Opcional"}
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate("/empresas")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>

      <Snackbar
        open={feedback.open}
        autoHideDuration={3000}
        onClose={() => setFeedback({ ...feedback, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={feedback.severity} onClose={() => setFeedback({ ...feedback, open: false })}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EmpresaFormPage;

