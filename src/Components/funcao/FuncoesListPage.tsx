import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import type { FuncaoDTO } from "../../types/FuncaoTypes";
import { listarFuncoes, deletarFuncao } from "../../services/FuncaoService";

const FuncoesListPage = () => {
  const navigate = useNavigate();
  const [funcoes, setFuncoes] = useState<FuncaoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    carregarFuncoes();
  }, []);

  const carregarFuncoes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarFuncoes();
      setFuncoes(data);
    } catch (err) {
      console.error("[Funcoes] Erro ao carregar funções:", err);
      setError("Não foi possível carregar as funções. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta função?")) {
      return;
    }

    try {
      setDeletingId(id);
      await deletarFuncao(id);
      await carregarFuncoes();
    } catch (err: any) {
      console.error("[Funcoes] Erro ao deletar função:", err);
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.mensagem ??
        "Não foi possível excluir a função. Verifique se não há funcionários vinculados.";
      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

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
            Funções
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as funções dos funcionários do sistema.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<WorkIcon />}
          onClick={() => navigate("/funcoes/nova")}
        >
          Nova função
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e0e0" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box p={3}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : funcoes.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography variant="body1">
              Nenhuma função cadastrada ainda. Clique em "Nova função" para
              começar.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table aria-label="Funções cadastradas">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {funcoes.map((funcao) => (
                  <TableRow key={funcao.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{funcao.nome}</Typography>
                    </TableCell>
                    <TableCell>
                      {funcao.descricao ?? "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Editar função">
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/funcoes/${funcao.id}/editar`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir função">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(funcao.id)}
                            disabled={deletingId === funcao.id}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default FuncoesListPage;

