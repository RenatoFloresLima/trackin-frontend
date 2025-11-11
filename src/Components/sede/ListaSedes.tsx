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
import PageContainer from "../UI/PageContainer";
import { SedeAPIService } from "../../services/SedeAPIService";
import type { SedeRequest, SedeResponse } from "../../types/SedeTypes";
import { useAuth } from "../../contexts/AuthContext";

const ListaSedes: React.FC = () => {
  const { isAdmin } = useAuth();
  const [sedes, setSedes] = useState<SedeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDesativarDialog, setOpenDesativarDialog] = useState(false);
  const [sedeSelecionada, setSedeSelecionada] = useState<SedeResponse | null>(null);
  const [formData, setFormData] = useState<SedeRequest>({
    nome: "",
    endereco: "",
    identificadorUnico: "",
    status: undefined,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      carregarSedes();
    }
  }, [isAdmin]);

  const carregarSedes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SedeAPIService.listarTodas();
      setSedes(data);
    } catch (err: any) {
      console.error("Erro ao carregar sedes:", err);
      setError(
        err.response?.data?.message ||
        "Erro ao carregar sedes. Por favor, tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (sede?: SedeResponse) => {
    if (sede) {
      setSedeSelecionada(sede);
      setFormData({
        nome: sede.nome || "",
        endereco: sede.endereco || "",
        identificadorUnico: sede.identificadorUnico || "",
        status: sede.status,
      });
    } else {
      setSedeSelecionada(null);
      setFormData({
        nome: "",
        endereco: "",
        identificadorUnico: "",
        status: undefined,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSedeSelecionada(null);
    setFormData({
      nome: "",
      endereco: "",
      identificadorUnico: "",
      status: undefined,
    });
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      setError("O nome da sede é obrigatório");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Prepara os dados para envio
      const dadosParaEnvio: SedeRequest = {
        nome: formData.nome,
        endereco: formData.endereco || undefined,
        identificadorUnico: formData.identificadorUnico || undefined,
      };

      // Inclui status apenas na edição (mantém o atual se não foi alterado)
      if (sedeSelecionada) {
        dadosParaEnvio.status = formData.status || sedeSelecionada.status;
      }

      if (sedeSelecionada) {
        // Atualizar
        await SedeAPIService.atualizar(sedeSelecionada.id, dadosParaEnvio);
      } else {
        // Criar (sempre cria como ATIVA)
        await SedeAPIService.criar(dadosParaEnvio);
      }

      handleCloseDialog();
      carregarSedes();
    } catch (err: any) {
      console.error("Erro ao salvar sede:", err);
      setError(
        err.response?.data?.message ||
        `Erro ao ${sedeSelecionada ? "atualizar" : "criar"} sede. Por favor, tente novamente.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDesativarDialog = (sede: SedeResponse) => {
    setSedeSelecionada(sede);
    setOpenDesativarDialog(true);
  };

  const handleCloseDesativarDialog = () => {
    setOpenDesativarDialog(false);
    setSedeSelecionada(null);
  };

  const handleDesativar = async () => {
    if (!sedeSelecionada) return;

    try {
      setSubmitting(true);
      setError(null);
      await SedeAPIService.desativar(sedeSelecionada.id);
      handleCloseDesativarDialog();
      carregarSedes();
    } catch (err: any) {
      console.error("Erro ao desativar sede:", err);
      setError(
        err.response?.data?.message ||
        "Erro ao desativar sede. Por favor, tente novamente."
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
      title="Cadastro de Sedes"
      subtitle="Gerencie as sedes da empresa"
      breadcrumbs={[
        { label: "Início", path: "/" },
        { label: "Sedes" },
      ]}
    >
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
          sx={{ minWidth: 150 }}
        >
          Nova Sede
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
                <TableCell sx={{ fontWeight: 600, minWidth: 250 }}>Endereço</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Identificador</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, minWidth: 150 }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : sedes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma sede cadastrada
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sedes.map((sede) => (
                  <TableRow key={sede.id} hover>
                    <TableCell>{sede.nome}</TableCell>
                    <TableCell>{sede.endereco || "-"}</TableCell>
                    <TableCell>{sede.identificadorUnico || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(sede.status)}
                        color={getStatusChipColor(sede.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar Sede">
                        <IconButton
                          onClick={() => handleOpenDialog(sede)}
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
                      {sede.status === "ATIVA" && (
                        <Tooltip title="Desativar Sede">
                          <IconButton
                            onClick={() => handleOpenDesativarDialog(sede)}
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
          {sedeSelecionada ? "Editar Sede" : "Nova Sede"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Nome da Sede"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              error={!formData.nome.trim()}
              helperText={!formData.nome.trim() ? "O nome é obrigatório" : ""}
            />
            <TextField
              fullWidth
              label="Endereço"
              multiline
              rows={3}
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            />
            <TextField
              fullWidth
              label="Identificador Único"
              value={formData.identificadorUnico}
              onChange={(e) =>
                setFormData({ ...formData, identificadorUnico: e.target.value })
              }
              helperText="Identificador para mapeamento com hardware físico (opcional)"
            />
            {sedeSelecionada && (
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
                {formData.status === "INATIVA" && sedeSelecionada.status === "ATIVA" && (
                  <Alert severity="warning">
                    Ao desativar esta sede, certifique-se de que não há funcionários ativos
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
            {submitting ? <CircularProgress size={20} /> : sedeSelecionada ? "Atualizar" : "Cadastrar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Desativação */}
      <Dialog open={openDesativarDialog} onClose={handleCloseDesativarDialog}>
        <DialogTitle>Desativar Sede</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja desativar a sede <strong>{sedeSelecionada?.nome}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            A sede não poderá ser desativada se possuir funcionários ativos associados a ela.
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

export default ListaSedes;

