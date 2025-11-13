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
} from "@mui/material";
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
import "./Lista.css";

// ----------------------------------------------------
// VARIÁVEIS DE ROTA
// ----------------------------------------------------
const API_BASE_URL = "/api";
const API_FUNCIONARIOS = `${API_BASE_URL}/funcionarios`;

// ----------------------------------------------------
// LÓGICA DO COMPONENTE PRINCIPAL
// ----------------------------------------------------
const ListaFuncionarios: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
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

  const handleInformacoes = (funcionarioId: number) => {
    console.log(
      `[Navegação] Redirecionar para /funcionarios/perfil/${funcionarioId}`
    );
    navigate(`/funcionarios/perfil/${funcionarioId}`);
  };

  // ----------------------------------------------------
  // RENDERIZAÇÃO
  // ----------------------------------------------------

  if (!isAdmin) {
    return <Navigate to="/ponto" replace />;
  }

  return (
    <Container className="container" maxWidth="xl" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" gutterBottom>
        Gestão de Funcionários
      </Typography>

      <FiltroFuncionarios
        filtros={filtros}
        onFiltroChange={handleFiltroChange}
      />

      <Box sx={{ mt: 3 }}>
        <Paper elevation={3}>
          <TableContainer>
            <Table aria-label="lista de funcionários">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Matrícula</TableCell>
                  <TableCell>Sede</TableCell>
                  <TableCell>Função</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : funcionarios.length > 0 ? (
                  funcionarios.map((funcionario) => (
                    <LinhaFuncionario
                      key={funcionario.id}
                      funcionario={funcionario}
                      // Passa a função que abre o modal com o objeto correto
                      onDesligar={() => handleDesligar(funcionario)}
                      onInformacoes={handleInformacoes}
                    />
                  ))
                ) : (
                  // ✅ CORREÇÃO APLICADA: Bloco JSX válido para dados vazios
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Nenhum funcionário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* 🔑 NOVO: Modal de Desligamento */}
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
