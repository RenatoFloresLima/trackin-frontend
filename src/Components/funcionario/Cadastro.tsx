import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import PageContainer from "../UI/PageContainer";

// Constantes de API
const API_BASE_URL = "/api";
const API_FUNCIONARIOS = `${API_BASE_URL}/funcionarios`;
const API_SEDES = `${API_BASE_URL}/sedes`;
const API_FUNCOES = `${API_BASE_URL}/funcoes`;

// Interfaces
interface Sede {
  id: number;
  nome: string;
  endereco: string;
  identificadorUnico: string;
}

interface Funcao {
  id: number;
  nome: string;
  descricao: string;
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
}

const Cadastro: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors }, control } = useForm<IFormInput>();

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [sedesResponse, funcoesResponse] = await Promise.all([
          api.get<Sede[]>(API_SEDES),
          api.get<Funcao[]>(API_FUNCOES),
        ]);

        setSedes(sedesResponse.data);
        setFuncoes(funcoesResponse.data);
        setStatus(null);
      } catch (error) {
        console.error("Erro ao carregar dados de Sedes ou Funções:", error);
        setStatus({
          type: "error",
          message: "Erro ao carregar dados essenciais. Verifique o backend ou sua permissão de acesso.",
        });
      } finally {
        setDataLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setStatus(null);
    setLoading(true);

    try {
      const payload = {
        ...data,
        sedePrincipalId: parseInt(data.sedePrincipalId),
        funcaoId: parseInt(data.funcaoId),
        role: data.role,
      };

      const response = await api.post(API_FUNCIONARIOS, payload);

      setStatus({
        type: "success",
        message: `Funcionário ${response.data.nome} (ID: ${response.data.id}) cadastrado com sucesso!`,
      });
      reset();
    } catch (error: any) {
      console.error("Erro no cadastro:", error);

      let errorMessage = "Erro desconhecido.";
      if (error.response) {
        errorMessage = `Erro ${error.response.status}: ${
          error.response.status === 403
            ? "Permissão negada. Você precisa ser ROLE_ADMIN para cadastrar."
            : error.response.data.message || "Dados inválidos."
        }`;
      } else if (error.request) {
        errorMessage = "Erro de rede: O servidor backend pode estar offline ou inacessível.";
      }

      setStatus({
        type: "error",
        message: `Falha no Cadastro: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <PageContainer title="Cadastro de Funcionário">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Carregando dados...
            </Typography>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Cadastro de Funcionário"
      subtitle="Preencha os dados para cadastrar um novo funcionário"
      breadcrumbs={[
        { label: "Início", path: "/" },
        { label: "Funcionários", path: "/lista-funcionarios" },
        { label: "Cadastro" },
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
          <Alert severity={status.type} sx={{ mb: 3 }}>
            {status.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Nome */}
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                placeholder="Digite o nome completo"
                {...register("nome", { required: "Nome é obrigatório" })}
                error={!!errors.nome}
                helperText={errors.nome?.message}
                variant="outlined"
              />
            </Grid>

            {/* CPF */}
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="CPF"
                placeholder="000.000.000-00"
                {...register("cpf", { required: "CPF é obrigatório" })}
                error={!!errors.cpf}
                helperText={errors.cpf?.message}
                variant="outlined"
              />
            </Grid>

            {/* Email */}
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                placeholder="email@exemplo.com"
                {...register("email", { 
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido"
                  }
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                variant="outlined"
              />
            </Grid>

            {/* Telefone */}
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                placeholder="(00) 00000-0000"
                {...register("telefone", { required: "Telefone é obrigatório" })}
                error={!!errors.telefone}
                helperText={errors.telefone?.message}
                variant="outlined"
              />
            </Grid>

            {/* Endereço */}
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Endereço"
                placeholder="Digite o endereço completo"
                {...register("endereco", { required: "Endereço é obrigatório" })}
                error={!!errors.endereco}
                helperText={errors.endereco?.message}
                variant="outlined"
              />
            </Grid>

            {/* Data de Contratação */}
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Data de Contratação"
                InputLabelProps={{
                  shrink: true,
                }}
                {...register("dataContratacao", { required: "Data de contratação é obrigatória" })}
                error={!!errors.dataContratacao}
                helperText={errors.dataContratacao?.message}
                variant="outlined"
              />
            </Grid>

            {/* Perfil de Acesso */}
            <Grid xs={12} md={6}>
              <Controller
                name="role"
                control={control}
                rules={{ required: "Perfil de acesso é obrigatório" }}
                defaultValue="ROLE_FUNCIONARIO"
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    error={!!errors.role}
                    sx={{ minHeight: '56px' }}
                  >
                    <InputLabel id="role-label" sx={{ fontSize: '1rem' }}>
                      Perfil de Acesso
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="role-label"
                      label="Perfil de Acesso"
                      sx={{
                        minHeight: '56px',
                        fontSize: '1rem',
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
                      <MenuItem value="ROLE_FUNCIONARIO" sx={{ fontSize: '1rem', minHeight: '48px' }}>
                        Funcionário Comum
                      </MenuItem>
                      <MenuItem value="ROLE_ADMIN" sx={{ fontSize: '1rem', minHeight: '48px' }}>
                        Administrador
                      </MenuItem>
                    </Select>
                    {errors.role && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.role.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Sede - Linha separada com mais espaço */}
            <Grid xs={12}>
              <Controller
                name="sedePrincipalId"
                control={control}
                rules={{ required: "Sede é obrigatória" }}
                defaultValue=""
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    error={!!errors.sedePrincipalId}
                    sx={{ 
                      minHeight: '56px',
                    }}
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
                      Sede Principal
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="sede-label"
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected || selected === '') {
                          return <span style={{ color: '#9e9e9e' }}>Selecione uma Sede</span>;
                        }
                        const sede = sedes.find(s => s.id.toString() === selected);
                        return sede ? sede.nome : '';
                      }}
                      sx={{
                        minHeight: '56px',
                        fontSize: '1rem',
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
                    {errors.sedePrincipalId && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.sedePrincipalId.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Função - Linha separada com mais espaço */}
            <Grid xs={12}>
              <Controller
                name="funcaoId"
                control={control}
                rules={{ required: "Função é obrigatória" }}
                defaultValue=""
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    error={!!errors.funcaoId}
                    sx={{ 
                      minHeight: '56px',
                    }}
                  >
                    <InputLabel 
                      id="funcao-label" 
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
                      Função
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="funcao-label"
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected || selected === '') {
                          return <span style={{ color: '#9e9e9e' }}>Selecione uma Função</span>;
                        }
                        const funcao = funcoes.find(f => f.id.toString() === selected);
                        return funcao ? funcao.nome : '';
                      }}
                      sx={{
                        minHeight: '56px',
                        fontSize: '1rem',
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
                      {funcoes.map((funcao) => (
                        <MenuItem 
                          key={funcao.id} 
                          value={funcao.id.toString()}
                          sx={{ fontSize: '1rem', minHeight: '48px' }}
                        >
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
                )}
              />
            </Grid>

            {/* Botões - Abaixo dos campos Sede e Função */}
            <Grid xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => reset()}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  Limpar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || dataLoading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{ minWidth: 150 }}
                >
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </PageContainer>
  );
};

export default Cadastro;
