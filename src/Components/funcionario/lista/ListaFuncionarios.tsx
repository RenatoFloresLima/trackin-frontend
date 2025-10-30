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
// 🔑 NOVO/ATUALIZADO: Importa 'useNavigate' para a navegação programática
import { Navigate, useNavigate } from "react-router-dom";

// Componentes da lista
import FiltroFuncionarios from "./FiltroFuncionarios";
// LinhaFuncionario NÃO PRECISA MAIS DE onEdit se ele for auto-navegável (como ajustamos antes)
import LinhaFuncionario from "./LinhaFuncionario";

// Tipagens
import {
  type FuncionarioAPI,
  type FiltrosFuncionario,
} from "../../../interfaces/funcionarioInterfaces";
// ✅ Importa a instância configurada do seu serviço de API (Axios)
import api from "../../../services/api";
// ✅ Importa o hook real de autenticação
import { useAuth } from "../../../contexts/AuthContext";
import "./Lista.css";

// ----------------------------------------------------
// VARIÁVEIS DE ROTA
// ----------------------------------------------------
const API_BASE_URL = "/api";
const API_FUNCIONARIOS = `${API_BASE_URL}/funcionarios`;
const API_DESLIGAMENTO = `${API_BASE_URL}/solicitacoes/desligamento`;

// ----------------------------------------------------
// LÓGICA DO COMPONENTE PRINCIPAL
// ----------------------------------------------------
const ListaFuncionarios: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  // 🔑 ADICIONADO: Inicializa o hook de navegação
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

  // ... (função carregarFuncionarios e useEffect permanecem inalterados) ...
  const carregarFuncionarios = useCallback(
    async (currentFiltros: FiltrosFuncionario) => {
      // [Lógica da função carregarFuncionarios]
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
  // HANDLERS DE AÇÃO E FILTROS
  // ----------------------------------------------------

  const handleFiltroChange = (novosFiltros: Partial<FiltrosFuncionario>) => {
    setFiltros((prev) => ({ ...prev, ...novosFiltros }));
  };

  const handleDesligar = async (funcionarioId: number) => {
    // [Lógica de Desligamento]
    if (!user) return;

    if (
      window.confirm(
        `Confirma a solicitação de desligamento do Funcionário ID ${funcionarioId}?`
      )
    ) {
      try {
        await api.post(API_DESLIGAMENTO, {
          funcionarioId,
          solicitanteLogin: user.login,
        });
        alert(
          "✅ Solicitação de Desligamento enviada com sucesso para aprovação!"
        );
        carregarFuncionarios(filtros);
      } catch (error) {
        console.error("Erro ao solicitar desligamento:", error);
        alert(
          "❌ Falha ao enviar solicitação de desligamento. Verifique permissões."
        );
      }
    }
  };

  // ❌ REMOVER: Esta função não é mais necessária, pois a navegação é feita no LinhaFuncionario.tsx
  // No entanto, se LinhaFuncionario.tsx ainda espera onEdit, você deve mantê-la e fazê-la chamar navigate.
  // Pelo ajuste anterior, LinhaFuncionario.tsx já faz a navegação interna e não precisa de onEdit.
  /*
  const handleEdit = (funcionarioId: number) => {
    console.log(
      `[Navegação] Redirecionar para /funcionarios/editar/${funcionarioId}`
    );
    navigate(`/funcionarios/editar/${funcionarioId}`); // 🔑 IMPLEMENTADO
  };
  */

  const handleInformacoes = (funcionarioId: number) => {
    console.log(
      `[Navegação] Redirecionar para /funcionarios/perfil/${funcionarioId}`
    );
    // 🔑 IMPLEMENTADO: Redireciona para a tela de perfil/detalhes
    navigate(`/funcionarios/perfil/${funcionarioId}`);
  };

  // ----------------------------------------------------
  // RENDERIZAÇÃO
  // ----------------------------------------------------
  // ... (O restante do componente permanece inalterado) ...

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
                      onDesligar={handleDesligar}
                      onInformacoes={handleInformacoes}
                      // 🔑 REMOVIDO: onEdit não é mais passado, pois a navegação é interna em LinhaFuncionario
                      // Se LinhaFuncionario ainda espera onEdit, descomente a função handleEdit e passe-a aqui.
                      // Se LinhaFuncionario foi ajustado como na resposta anterior, essa linha está correta.
                    />
                  ))
                ) : (
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
    </Container>
  );
};

export default ListaFuncionarios;
