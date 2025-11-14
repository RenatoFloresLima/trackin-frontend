import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
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
import PageHeader from "../Layout/PageHeader";

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
        setFuncionarioId(resolvedFuncId);
      }

      const data = await FuncionarioAPIService.getDetalhesFuncionario(
        resolvedFuncId
      );
      setFuncionario(data);
    } catch (err: any) {
      console.error("Erro ao buscar perfil:", err);
      setError(
        "Falha ao carregar perfil: " +
          (err.response?.data?.message ||
            "Verifique se o usuário está associado a um funcionário ou o status do servidor.")
      );
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="Meu Perfil"
        subtitle="Visualize e gerencie seus dados pessoais e registros de ponto"
        leading={<AccountCircleIcon sx={{ fontSize: 32, color: "primary.main" }} />}
      />

      <Grid container spacing={3}>
        {/* Card de Dados Pessoais - Ocupa toda a largura */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid #e0e0e0",
            }}
          >
            <DadosPessoais
              funcionario={funcionario}
              onUpdate={handleUpdate}
              onOpenSenhaModal={() => setIsSenhaModalOpen(true)}
            />
          </Paper>
        </Grid>

        {/* Tabela de Registros de Ponto - Ocupa toda a largura */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid #e0e0e0",
            }}
          >
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
  );
};

export default FuncionarioDetalhesScreen;
