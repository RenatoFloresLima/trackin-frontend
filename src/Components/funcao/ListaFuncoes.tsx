import React, { useState, useEffect } from "react";
import {
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
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PageContainer from "../UI/PageContainer";
import { FuncaoAPIService } from "../../services/FuncaoAPIService";
import type { FuncaoRequest, FuncaoResponse } from "../../types/FuncaoTypes";
import { useAuth } from "../../contexts/AuthContext";

const ListaFuncoes: React.FC = () => {
  const { isAdmin } = useAuth();
  const [funcoes, setFuncoes] = useState<FuncaoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDesativarDialog, setOpenDesativarDialog] = useState(false);
  const [funcaoSelecionada, setFuncaoSelecionada] = useState<FuncaoResponse | null>(null);
  const [formData, setFormData] = useState<FuncaoRequest>({
    nome: "",
    descricao: "",
    status: undefined,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      carregarFuncoes();
    }
  }, [isAdmin]);

  const carregarFuncoes = async () => {
    try {
      setLoading(true);
      setError(null);
      // Lista todas as funções (incluindo inativas) para a tela de cadastro
      const data = await FuncaoAPIService.listarTodas();
      setFuncoes(data);
    } catch (err: any) {
      console.error("Erro ao carregar funções:", err);
      setError(
        err.response?.data?.message ||
        "Erro ao carregar funções. Por favor, tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (funcao?: FuncaoResponse) => {
    if (funcao) {
      setFuncaoSelecionada(funcao);
      setFormData({
        nome: funcao.nome || "",
        descricao: funcao.descricao || "",
        status: funcao.status,
      });
    } else {
      setFuncaoSelecionada(null);
      setFormData({
        nome: "",
        descricao: "",
        status: undefined,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFuncaoSelecionada(null);
    setFormData({
      nome: "",
      descricao: "",
      status: undefined,
    });
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      setError("O nome da função é obrigatório");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Prepara os dados para envio
      const dadosParaEnvio: FuncaoRequest = {
        nome: formData.nome,
        descricao: formData.descricao || undefined,
      };

      // Inclui status apenas na edição (mantém o atual se não foi alterado)
      if (funcaoSelecionada) {
        dadosParaEnvio.status = formData.status || funcaoSelecionada.status;
      }

      if (funcaoSelecionada) {
        // Atualizar
        await FuncaoAPIService.atualizar(funcaoSelecionada.id, dadosParaEnvio);
      } else {
        // Criar (sempre cria como ATIVA)
        await FuncaoAPIService.criar(dadosParaEnvio);
      }

      handleCloseDialog();
      carregarFuncoes();
    } catch (err: any) {
      console.error("Erro ao salvar função:", err);
      setError(
        err.response?.data?.message ||
        `Erro ao ${funcaoSelecionada ? "atualizar" : "criar"} função. Por favor, tente novamente.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDesativarDialog = (funcao: FuncaoResponse) => {
    setFuncaoSelecionada(funcao);
    setOpenDesativarDialog(true);
  };

  const handleCloseDesativarDialog = () => {
    setOpenDesativarDialog(false);
    setFuncaoSelecionada(null);
  };

  const handleDesativar = async () => {
    if (!funcaoSelecionada) return;

    try {
      setSubmitting(true);
      setError(null);
      await FuncaoAPIService.desativar(funcaoSelecionada.id);
      handleCloseDesativarDialog();
      carregarFuncoes();
    } catch (err: any) {
      console.error("Erro ao desativar função:", err);
      setError(
        err.response?.data?.message ||
        "Erro ao desativar função. Por favor, tente novamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChipColor = (status: string) => {
    return status === "ATIVA" ? "success" : "error";
  };

  const getStatusLabel = (status: string) => {
    return status === "ATIVA" ? "Ativa" : "Inativa";
  };

  if (!isAdmin) {
    return (
      <PageContainer title="Acesso Negado">
        <Alert severity="error">Você não tem permissão para acessar esta página.</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Cadastro de Funções"
      subtitle="Gerencie as funções da empresa"
      breadcrumbs={[
        { label: "Início", path: "/" },
        { label: "Funções" },
      ]}
    >
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
          sx={{ minWidth: 150 }}
        >
          Nova Função
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 300 }}>Descrição</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, minWidth: 200 }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : funcoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma função cadastrada
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                funcoes.map((funcao) => (
                  <TableRow key={funcao.id} hover>
                    <TableCell>{funcao.nome}</TableCell>
                    <TableCell>{funcao.descricao || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(funcao.status)}
                        color={getStatusChipColor(funcao.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar Função">
                        <IconButton
                          onClick={() => handleOpenDialog(funcao)}
                          color="primary"
                          size="small"
                          sx={{
                            "&:hover": {
                              backgroundColor: "primary.light",
                              color: "common.white",
                            },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {funcao.status === "ATIVA" && (
                        <Tooltip title="Desativar Função">
                          <IconButton
                            onClick={() => handleOpenDesativarDialog(funcao)}
                            color="error"
                            size="small"
                            sx={{
                              "&:hover": {
                                backgroundColor: "error.light",
                                color: "common.white",
                              },
                            }}
                          >
                            <BlockIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {funcao.status === "INATIVA" && (
                        <Tooltip title="Reativar Função">
                          <IconButton
                            onClick={() => {
                              setFuncaoSelecionada(funcao);
                              setFormData({
                                nome: funcao.nome || "",
                                descricao: funcao.descricao || "",
                                status: "ATIVA",
                              });
                              setOpenDialog(true);
                            }}
                            color="success"
                            size="small"
                            sx={{
                              "&:hover": {
                                backgroundColor: "success.light",
                                color: "common.white",
                              },
                            }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {funcaoSelecionada ? "Editar Função" : "Nova Função"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Nome da Função"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              error={!formData.nome.trim()}
              helperText={!formData.nome.trim() ? "O nome é obrigatório" : ""}
            />
            <TextField
              fullWidth
              label="Descrição"
              multiline
              rows={3}
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
            {funcaoSelecionada && (
              <>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    label="Status"
                    value={formData.status || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "ATIVA" | "INATIVA",
                      })
                    }
                  >
                    <MenuItem value="ATIVA">Ativa</MenuItem>
                    <MenuItem value="INATIVA">Inativa</MenuItem>
                  </Select>
                </FormControl>
                {formData.status === "INATIVA" && funcaoSelecionada.status === "ATIVA" && (
                  <Alert severity="warning">
                    Ao desativar esta função, certifique-se de que não há funcionários ativos
                    associados a ela. Caso contrário, a operação será bloqueada.
                  </Alert>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !formData.nome.trim()}
          >
            {submitting ? <CircularProgress size={20} /> : funcaoSelecionada ? "Atualizar" : "Cadastrar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Desativação */}
      <Dialog open={openDesativarDialog} onClose={handleCloseDesativarDialog}>
        <DialogTitle>Desativar Função</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja desativar a função <strong>{funcaoSelecionada?.nome}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            A função não poderá ser desativada se possuir funcionários ativos associados a ela.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDesativarDialog} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDesativar}
            variant="contained"
            color="error"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : "Desativar"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ListaFuncoes;


