import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
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
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import type { CompanyAdminDTO } from "../../types/EmpresaTypes";
import {
  listarCompanyAdmins,
  deletarCompanyAdmin,
  ativarCompanyAdmin,
  desativarCompanyAdmin,
} from "../../services/CompanyAdminService";

const CompanyAdminsListPage = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<CompanyAdminDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listarCompanyAdmins();
        setAdmins(data);
      } catch (err) {
        console.error("[CompanyAdmins] Erro ao carregar:", err);
        setError("Não foi possível carregar os administradores. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este administrador?")) {
      return;
    }

    try {
      setProcessingId(id);
      await deletarCompanyAdmin(id);
      const data = await listarCompanyAdmins();
      setAdmins(data);
    } catch (err) {
      console.error("[CompanyAdmins] Erro ao deletar:", err);
      alert("Não foi possível excluir o administrador.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (id: number, enabled: boolean) => {
    try {
      setProcessingId(id);
      if (enabled) {
        await desativarCompanyAdmin(id);
      } else {
        await ativarCompanyAdmin(id);
      }
      const data = await listarCompanyAdmins();
      setAdmins(data);
    } catch (err) {
      console.error("[CompanyAdmins] Erro ao alterar status:", err);
      alert("Não foi possível alterar o status do administrador.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
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
            Administradores de Empresa
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os administradores de empresa cadastrados.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate("/company-admins/novo")}
        >
          Novo Administrador
        </Button>
      </Stack>

      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Login</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhum administrador cadastrado.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.id} hover>
                  <TableCell>{admin.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {admin.login}
                    </Typography>
                  </TableCell>
                  <TableCell>{admin.empresaNome}</TableCell>
                  <TableCell>
                    <Chip
                      label={admin.enabled ? "Ativo" : "Inativo"}
                      color={admin.enabled ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title={admin.enabled ? "Desativar" : "Ativar"}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(admin.id, admin.enabled)}
                          disabled={processingId === admin.id}
                        >
                          {processingId === admin.id ? (
                            <CircularProgress size={16} />
                          ) : admin.enabled ? (
                            <CancelIcon fontSize="small" />
                          ) : (
                            <CheckCircleIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(admin.id)}
                          disabled={processingId === admin.id}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default CompanyAdminsListPage;


