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
  Chip,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { TurnoAPIService, type TurnoResponse } from "../../services/TurnoAPIService";

const TurnosListPage = () => {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState<TurnoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    carregarTurnos();
  }, []);

  const carregarTurnos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TurnoAPIService.listarTodos();
      setTurnos(data);
    } catch (err) {
      console.error("[Turnos] Erro ao carregar turnos:", err);
      setError("Não foi possível carregar os turnos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este turno?")) {
      return;
    }

    try {
      setDeletingId(id);
      await TurnoAPIService.deletar(id);
      await carregarTurnos();
    } catch (err: any) {
      console.error("[Turnos] Erro ao deletar turno:", err);
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.mensagem ??
        "Não foi possível excluir o turno. Verifique se não há funcionários ou funções vinculados.";
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
            Turnos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os turnos de trabalho da empresa.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CalendarTodayIcon />}
          onClick={() => navigate("/turnos/novo")}
        >
          Novo turno
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e0e0" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : turnos.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              Nenhum turno cadastrado.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Horário de Início</TableCell>
                  <TableCell>Horário de Fim</TableCell>
                  <TableCell>Empresa</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {turnos.map((turno) => (
                  <TableRow key={turno.id} hover>
                    <TableCell>{turno.nome}</TableCell>
                    <TableCell>{turno.horaInicio}</TableCell>
                    <TableCell>{turno.horaFim}</TableCell>
                    <TableCell>{turno.empresaNome}</TableCell>
                    <TableCell>
                      <Chip
                        label={turno.ativo ? "Ativo" : "Inativo"}
                        color={turno.ativo ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/turnos/${turno.id}/editar`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(turno.id)}
                            disabled={deletingId === turno.id}
                          >
                            <DeleteIcon fontSize="small" />
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

export default TurnosListPage;

