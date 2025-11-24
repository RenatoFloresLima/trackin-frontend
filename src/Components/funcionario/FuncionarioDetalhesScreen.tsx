import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { useAuth } from "../../contexts/AuthContext";
import { FuncionarioAPIService } from "../../services/FuncionarioAPIService";
import type {
  FuncionarioDetalheResponse,
  FuncionarioDadosMutaveisRequest,
  UsuarioPerfilResponse,
} from "../../types/FuncionarioTypes";
import RedefinirSenhaUsuarioModal from "./RedefinirSenhaUsuarioModal";

// Componentes criados anteriormente
import DadosPessoais from "../funcionario/DadosPessoais";
import ListaRegistrosPonto from "../funcionario/ListaRegistrosPonto";
import RedefinirSenhaModal from "../funcionario/RedefinirSenhaModal";
import PageHeader from "../Layout/PageHeader";

const FuncionarioDetalhesScreen: React.FC = () => {
  const { user } = useAuth();

  const userLogado = user?.login;

  const [funcionario, setFuncionario] =
    useState<FuncionarioDetalheResponse | UsuarioPerfilResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSenhaModalOpen, setIsSenhaModalOpen] = useState(false);
  const [isSenhaUsuarioModalOpen, setIsSenhaUsuarioModalOpen] = useState(false);

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

    try {
      // Usa o novo endpoint que retorna os detalhes completos do funcionário logado
      const data = await FuncionarioAPIService.getDetalhesFuncionarioLogado();
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
  }, [userLogado]);

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

    // Se for UsuarioPerfilResponse, não permite atualização (não tem funcionarioId)
    if ("usuarioId" in funcionario) {
      return {
        success: false,
        message: "Usuários administrativos não podem atualizar dados pessoais aqui.",
      };
    }

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

  // Verifica se é perfil de usuário (não funcionário)
  const isUsuarioPerfil = (perfil: FuncionarioDetalheResponse | UsuarioPerfilResponse): perfil is UsuarioPerfilResponse => {
    return "usuarioId" in perfil;
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
  const isUsuario = isUsuarioPerfil(funcionario);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="Meu Perfil"
        subtitle={
          isUsuario
            ? "Visualize seus dados de usuário"
            : "Visualize e gerencie seus dados pessoais e registros de ponto"
        }
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
            {isUsuario ? (
              // Perfil de usuário (SYSTEM_ADMIN, COMPANY_ADMIN)
              <Box>
                <Typography variant="h6" gutterBottom>
                  Dados do Usuário
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Login
                    </Typography>
                    <Typography variant="body1">{funcionario.login}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nome
                    </Typography>
                    <Typography variant="body1">{funcionario.nome}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Perfil
                    </Typography>
                    <Typography variant="body1">{funcionario.role}</Typography>
                  </Grid>
                  {funcionario.empresaNome && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Empresa
                      </Typography>
                      <Typography variant="body1">{funcionario.empresaNome}</Typography>
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body1">
                      {funcionario.enabled ? "Ativo" : "Inativo"}
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setIsSenhaUsuarioModalOpen(true)}
                  >
                    Alterar Senha
                  </Button>
                </Box>
              </Box>
            ) : (
              // Perfil de funcionário
              <>
                <DadosPessoais
                  funcionario={funcionario}
                  onUpdate={handleUpdate}
                  onOpenSenhaModal={() => setIsSenhaModalOpen(true)}
                />
              </>
            )}
          </Paper>
        </Grid>

        {/* Tabela de Registros de Ponto - Apenas para funcionários */}
        {!isUsuario && (
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
        )}
      </Grid>

      {/* Modal de redefinição de senha - Apenas para funcionários */}
      {!isUsuario && (
        <RedefinirSenhaModal
          open={isSenhaModalOpen}
          onClose={() => setIsSenhaModalOpen(false)}
          funcionarioId={funcionario.id}
        />
      )}

      {/* Modal de redefinição de senha - Para usuários administrativos */}
      {isUsuario && (
        <RedefinirSenhaUsuarioModal
          open={isSenhaUsuarioModalOpen}
          onClose={() => setIsSenhaUsuarioModalOpen(false)}
        />
      )}
    </Container>
  );
};

export default FuncionarioDetalhesScreen;
