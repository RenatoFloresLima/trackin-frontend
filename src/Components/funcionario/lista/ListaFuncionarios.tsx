// src/Components/funcionario/lista/ListaFuncionarios.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import PageContainer from "../../UI/PageContainer";

// Componentes da lista
import FiltroFuncionarios from "./FiltroFuncionarios";
import LinhaFuncionario from "./LinhaFuncionario";
import DesligamentoModal from "./DesligamentoModal";

// Tipagens
import {
  type FuncionarioAPI,
  type FiltrosFuncionario,
} from "../../../interfaces/funcionarioInterfaces";
import api from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";

// ----------------------------------------------------
// VARIÁVEIS DE ROTA
// ----------------------------------------------------
const API_BASE_URL = "/api";
const API_FUNCIONARIOS = `${API_BASE_URL}/funcionarios`;

// ----------------------------------------------------
// LÓGICA DO COMPONENTE PRINCIPAL
// ----------------------------------------------------
const ListaFuncionarios: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // ----------------------------------------------------
  // ESTADOS
  // ----------------------------------------------------

  const estadoInicialFiltros: FiltrosFuncionario = {
    termoBusca: "",
    funcaoNome: "",
    sedePrincipalId: null,
    apenasMinhaSede: false,
  };

  const [funcionarios, setFuncionarios] = useState<FuncionarioAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] =
    useState<FiltrosFuncionario>(estadoInicialFiltros);

  const [funcionarioADesligar, setFuncionarioADesligar] =
    useState<FuncionarioAPI | null>(null);

  // ----------------------------------------------------
  // LÓGICA DE CARREGAMENTO
  // ----------------------------------------------------
  const carregarFuncionarios = useCallback(
    async (currentFiltros: FiltrosFuncionario) => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (
        currentFiltros.termoBusca &&
        currentFiltros.termoBusca.trim() !== ""
      ) {
        params.append("termoBusca", currentFiltros.termoBusca);
      }

      if (currentFiltros.funcaoNome) {
        params.append("funcao", currentFiltros.funcaoNome);
      }

      if (currentFiltros.sedePrincipalId !== null) {
        params.append("sedeId", String(currentFiltros.sedePrincipalId));
      }

      try {
        const response = await api.get<FuncionarioAPI[]>(API_FUNCIONARIOS, {
          params: params,
        });

        setFuncionarios(response.data);
      } catch (error: any) {
        console.error("Erro ao buscar funcionários na API:", error);

        let errorMessage = "Erro ao carregar a lista.";
        if (error.response) {
          errorMessage = `Erro ${error.response.status}: ${
            error.response.status === 403
              ? "Permissão insuficiente para esta busca."
              : error.response.data.message || "Falha na comunicação."
          }`;
        }
        setError(errorMessage);
        setFuncionarios([]);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      carregarFuncionarios(filtros);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [filtros, carregarFuncionarios]);

  // ----------------------------------------------------
  // HANDLERS DE AÇÃO
  // ----------------------------------------------------

  const handleFiltroChange = (novosFiltros: Partial<FiltrosFuncionario>) => {
    setFiltros((prev) => ({ ...prev, ...novosFiltros }));
  };

  const handleDesligar = (funcionario: FuncionarioAPI) => {
    setFuncionarioADesligar(funcionario);
  };

  const handleDesligamentoSucesso = () => {
    setFuncionarioADesligar(null);
    carregarFuncionarios(filtros);
  };

  const handleCloseModal = () => {
    setFuncionarioADesligar(null);
  };

  const handleInformacoes = (funcionarioId: number) => {
    navigate(`/funcionarios/perfil/${funcionarioId}`);
  };

  // ----------------------------------------------------
  // RENDERIZAÇÃO
  // ----------------------------------------------------

  if (!isAdmin) {
    return <Navigate to="/ponto" replace />;
  }

  return (
    <PageContainer
      title="Gestão de Funcionários"
      subtitle="Gerencie os funcionários da empresa"
      breadcrumbs={[
        { label: "Início", path: "/" },
        { label: "Funcionários" },
      ]}
    >
      <Box>
        <FiltroFuncionarios
          filtros={filtros}
          onFiltroChange={handleFiltroChange}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Paper
            elevation={2}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <TableContainer>
              <Table aria-label="lista de funcionários">
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#f8f9fa",
                      "& th": {
                        fontWeight: 600,
                        color: "#2c3e50",
                        borderBottom: "2px solid #e9ecef",
                      },
                    }}
                  >
                    <TableCell>Nome</TableCell>
                    <TableCell>Matrícula</TableCell>
                    <TableCell>Sede</TableCell>
                    <TableCell>Função</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center" sx={{ width: "150px" }}>
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                          <CircularProgress size={24} />
                          <Typography variant="body2" color="text.secondary">
                            Carregando funcionários...
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : funcionarios.length > 0 ? (
                    funcionarios.map((funcionario) => (
                      <LinhaFuncionario
                        key={funcionario.id}
                        funcionario={funcionario}
                        onDesligar={() => handleDesligar(funcionario)}
                        onInformacoes={handleInformacoes}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Nenhum funcionário encontrado.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {funcionarioADesligar && (
          <DesligamentoModal
            funcionario={funcionarioADesligar}
            onClose={handleCloseModal}
            onSuccess={handleDesligamentoSucesso}
          />
        )}
      </Box>
    </PageContainer>
  );
};

export default ListaFuncionarios;
