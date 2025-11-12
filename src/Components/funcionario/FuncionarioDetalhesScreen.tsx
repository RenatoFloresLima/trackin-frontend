import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Box, // Importado Box
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { useAuth } from "../../contexts/AuthContext";
import { FuncionarioAPIService } from "../../services/FuncionarioAPIService";
import type {
  FuncionarioDetalheResponse,
  FuncionarioDadosMutaveisRequest,
} from "../../types/FuncionarioTypes";

// Componentes criados anteriormente
import DadosPessoais from "../funcionario/DadosPessoais";
import ListaRegistrosPonto from "../funcionario/ListaRegistrosPonto";
import RedefinirSenhaModal from "../funcionario/RedefinirSenhaModal";

const FuncionarioDetalhesScreen: React.FC = () => {
  const { user } = useAuth();

  const userLogado = user?.login;

  const [funcionarioId, setFuncionarioId] = useState<number | null>(null);

  const [funcionario, setFuncionario] =
    useState<FuncionarioDetalheResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSenhaModalOpen, setIsSenhaModalOpen] = useState(false);

  // ------------------------------------------
  // LÓGICA DE FETCH DE DADOS
  // ------------------------------------------
  const fetchFuncionarioData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFuncionario(null);

    if (!userLogado) {
      setError("Autenticação necessária: ID do Usuário logado não encontrado.");
      setLoading(false);
      return;
    }

    let resolvedFuncId = funcionarioId;

    try {
      if (!resolvedFuncId) {
        const result =
          await FuncionarioAPIService.getFuncionarioIdDoUsuarioLogado();
        resolvedFuncId = result.funcionarioId;
        
        if (!resolvedFuncId) {
          setError(
            "Funcionário não encontrado. Verifique se o usuário está associado a um funcionário."
          );
          setLoading(false);
          return;
        }
        
        setFuncionarioId(resolvedFuncId);
      }

      const data = await FuncionarioAPIService.getDetalhesFuncionario(
        resolvedFuncId
      );
      setFuncionario(data);
    } catch (err: any) {
      console.error("Erro ao buscar perfil:", err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.";
      setError(`Falha ao carregar perfil: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [userLogado, funcionarioId]);

  useEffect(() => {
    fetchFuncionarioData();
  }, [fetchFuncionarioData]);

  // ------------------------------------------
  // LÓGICA DE ATUALIZAÇÃO
  // ------------------------------------------
  const handleUpdate = async (novosDados: FuncionarioDadosMutaveisRequest) => {
    if (!funcionario)
      return {
        success: false,
        message: "Dados do funcionário não carregados.",
      };

    try {
      const updatedFuncionario =
        await FuncionarioAPIService.updateDadosMutaveis(
          funcionario.id,
          novosDados
        );

      setFuncionario(updatedFuncionario);
      return { success: true, message: "Dados atualizados com sucesso!" };
    } catch (err: any) {
      console.error("Erro na atualização:", err);
      const errorMessage =
        err.response?.data?.message || "Erro desconhecido ao salvar dados.";
      return { success: false, message: errorMessage };
    }
  };

  if (loading)
    return (
      <Container sx={{ mt: 4 }}>
        <CircularProgress /> <Typography>Carregando perfil...</Typography>
      </Container>
    );
  if (error)
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  if (!funcionario)
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Perfil não encontrado.</Alert>
      </Container>
    );

  // 2. Renderização da Tela
  return (
    <Box sx={{ p: 4, minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      <Container maxWidth="xl">
        <Typography
          variant="h4"
          gutterBottom
          component="h1"
          sx={{ color: "#333" }}
        >
          <AccountCircleIcon
            fontSize="inherit"
            sx={{ mr: 1, verticalAlign: "middle" }}
          />
          Meu Perfil
        </Typography>

        <Grid container spacing={3}>
          {/* Dados Pessoais - Fica acima, ocupando toda a largura */}
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid #ddd", mb: 3 }}
            >
              <DadosPessoais
                funcionario={funcionario}
                onUpdate={handleUpdate}
                onOpenSenhaModal={() => setIsSenhaModalOpen(true)}
              />
            </Paper>
          </Grid>

          {/* Tabela de Pontos - Fica abaixo dos dados pessoais, ocupando toda a largura */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 3, border: "1px solid #ddd" }}>
              <ListaRegistrosPonto funcionarioId={funcionario.id} />
            </Paper>
          </Grid>
        </Grid>

        <RedefinirSenhaModal
          open={isSenhaModalOpen}
          onClose={() => setIsSenhaModalOpen(false)}
          funcionarioId={funcionario.id}
        />
      </Container>
    </Box>
  );
};

export default FuncionarioDetalhesScreen;
