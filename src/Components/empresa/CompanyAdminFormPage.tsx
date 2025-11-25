import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useForm } from "react-hook-form";

import type { CompanyAdminFormValues, EmpresaDTO } from "../../types/EmpresaTypes";
import { criarCompanyAdmin } from "../../services/CompanyAdminService";
import { listarEmpresas } from "../../services/EmpresaService";

const CompanyAdminFormPage = () => {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<EmpresaDTO[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CompanyAdminFormValues>({
    defaultValues: {
      login: "",
      senha: "",
      empresaId: 0,
    },
  });

  const empresaId = watch("empresaId");

  const [apiError, setApiError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        const data = await listarEmpresas();
        // Filtra apenas empresas ativas
        const empresasAtivas = data.filter((e) => e.status === "ATIVA");
        setEmpresas(empresasAtivas);
        if (empresasAtivas.length > 0) {
          setValue("empresaId", empresasAtivas[0].id);
        }
      } catch (err) {
        console.error("[CompanyAdmin] Erro ao carregar empresas:", err);
        setApiError("Não foi possível carregar as empresas.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [setValue]);

  const onSubmit = async (data: CompanyAdminFormValues) => {
    if (!data.empresaId || data.empresaId === 0) {
      setApiError("Selecione uma empresa.");
      return;
    }

    try {
      setApiError(null);
      await criarCompanyAdmin(data);
      setFeedback({
        open: true,
        message: "Administrador criado com sucesso!",
        severity: "success",
      });
      setTimeout(() => navigate("/company-admins"), 1500);
    } catch (err: any) {
      console.error("[CompanyAdmin] Erro ao criar:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Não foi possível criar o administrador. Tente novamente.";
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
        <IconButton onClick={() => navigate("/company-admins")} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={600}>
          Novo Administrador de Empresa
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

            <FormControl fullWidth required error={!!errors.empresaId}>
              <InputLabel>Empresa</InputLabel>
              <Select
                value={empresaId || ""}
                label="Empresa"
                {...register("empresaId", {
                  required: "Selecione uma empresa",
                  valueAsNumber: true,
                })}
                onChange={(e) => setValue("empresaId", Number(e.target.value))}
              >
                {empresas.map((empresa) => (
                  <MenuItem key={empresa.id} value={empresa.id}>
                    {empresa.nome}
                  </MenuItem>
                ))}
              </Select>
              {errors.empresaId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.empresaId.message}
                </Typography>
              )}
            </FormControl>

            <TextField
              label="Login"
              fullWidth
              required
              {...register("login", {
                required: "O login é obrigatório",
                minLength: {
                  value: 3,
                  message: "O login deve ter no mínimo 3 caracteres",
                },
              })}
              error={!!errors.login}
              helperText={errors.login?.message}
            />

            <TextField
              label="Senha"
              fullWidth
              required
              type={showPassword ? "text" : "password"}
              {...register("senha", {
                required: "A senha é obrigatória",
                minLength: {
                  value: 6,
                  message: "A senha deve ter no mínimo 6 caracteres",
                },
              })}
              error={!!errors.senha}
              helperText={errors.senha?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate("/company-admins")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "Criando..." : "Criar"}
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
        <Alert
          severity={feedback.severity}
          onClose={() => setFeedback({ ...feedback, open: false })}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CompanyAdminFormPage;

