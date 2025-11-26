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
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Navigate, useNavigate } from "react-router-dom";

// Componentes da lista
import FiltroFuncionarios from "./FiltroFuncionarios";
import LinhaFuncionario from "./LinhaFuncionario";
import DesligamentoModal from "./DesligamentoModal"; // 🔑 Importado o Modal

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
  const { isAuthenticated, isAdmin, isCompanyAdmin } = useAuth();
  const navigate = useNavigate();

  // ----------------------------------------------------
  // ESTADOS
  // ----------------------------------------------------

  const estadoInicialFiltros: FiltrosFuncionario = {
    termoBusca: "",
    funcaoNome: null,
    sedePrincipalId: null,
    apenasMinhaSede: false,
  };

  const [funcionarios, setFuncionarios] = useState<FuncionarioAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filtros, setFiltros] =
    useState<FiltrosFuncionario>(estadoInicialFiltros);

  // 🔑 Estado do Modal
  const [funcionarioADesligar, setFuncionarioADesligar] =
    useState<FuncionarioAPI | null>(null);

  // ----------------------------------------------------
  // LÓGICA DE CARREGAMENTO
  // ----------------------------------------------------
  const carregarFuncionarios = useCallback(
    async (currentFiltros: FiltrosFuncionario) => {
      if (!isAuthenticated) return;

      setLoading(true);

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

      console.log(
        `-> [API] GET ${API_FUNCIONARIOS} com params:`,
        Object.fromEntries(params.entries())
      );

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
        alert(`❌ ${errorMessage}`);
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
    }, 300); // Debounce de 300ms

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

  // 🔑 HANDLER: Abre o modal de desligamento
  const handleDesligar = (funcionario: FuncionarioAPI) => {
    // Abre o modal de desligamento com os dados do funcionário
    setFuncionarioADesligar(funcionario);
  };

  // 🔑 HANDLER: Chamado pelo modal após sucesso na API
  const handleDesligamentoSucesso = () => {
    alert(
      `✅ Funcionário ${funcionarioADesligar?.nome} desligado com sucesso!`
    );
    setFuncionarioADesligar(null); // Fecha o modal
    carregarFuncionarios(filtros); // Recarrega a lista
  };

  // 🔑 HANDLER: Fecha o modal (chamado pelo botão Cancelar)
  const handleCloseModal = () => {
    setFuncionarioADesligar(null);
  };


  // ----------------------------------------------------
  // RENDERIZAÇÃO
  // ----------------------------------------------------

  // Permite acesso para ADMIN e COMPANY_ADMIN
  if (!isAdmin && !isCompanyAdmin) {
    return <Navigate to="/ponto" replace />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Funcionários
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os funcionários cadastrados no sistema.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate("/cadastro")}
        >
          Novo Funcionário
        </Button>
      </Stack>

      <FiltroFuncionarios
        filtros={filtros}
        onFiltroChange={handleFiltroChange}
      />

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e0e0" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : funcionarios.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              Nenhum funcionário encontrado.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Matrícula</TableCell>
                  <TableCell>Sede</TableCell>
                  <TableCell>Função</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {funcionarios.map((funcionario) => (
                  <LinhaFuncionario
                    key={funcionario.id}
                    funcionario={funcionario}
                    onDesligar={() => handleDesligar(funcionario)}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* 🔑 Modal de Desligamento */}
      {funcionarioADesligar && (
        <DesligamentoModal
          funcionario={funcionarioADesligar}
          onClose={handleCloseModal}
          onSuccess={handleDesligamentoSucesso}
        />
      )}
    </Container>
  );
};

export default ListaFuncionarios;
