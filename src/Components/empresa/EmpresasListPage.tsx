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
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import type { EmpresaDTO } from "../../types/EmpresaTypes";
import { listarEmpresas, ativarEmpresa, desativarEmpresa } from "../../services/EmpresaService";

const EmpresasListPage = () => {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<EmpresaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listarEmpresas();
        setEmpresas(data);
      } catch (err) {
        console.error("[Empresas] Erro ao carregar empresas:", err);
        setError("Não foi possível carregar as empresas. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, []);

  const handleToggleStatus = async (id: number, statusAtual: string) => {
    try {
      setProcessingId(id);
      if (statusAtual === "ATIVA") {
        await desativarEmpresa(id);
      } else {
        await ativarEmpresa(id);
      }
      // Recarrega a lista
      const data = await listarEmpresas();
      setEmpresas(data);
    } catch (err) {
      console.error("[Empresas] Erro ao alterar status:", err);
      alert("Não foi possível alterar o status da empresa.");
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
            Empresas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as empresas cadastradas no sistema.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddBusinessIcon />}
          onClick={() => navigate("/empresas/nova")}
        >
          Nova Empresa
        </Button>
      </Stack>

      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>CNPJ</TableCell>
              <TableCell>Razão Social</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {empresas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma empresa cadastrada.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              empresas.map((empresa) => (
                <TableRow key={empresa.id} hover>
                  <TableCell>{empresa.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {empresa.nome}
                    </Typography>
                  </TableCell>
                  <TableCell>{empresa.cnpj || "-"}</TableCell>
                  <TableCell>{empresa.razaoSocial || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={empresa.status}
                      color={empresa.status === "ATIVA" ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/empresas/${empresa.id}/editar`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={empresa.status === "ATIVA" ? "Desativar" : "Ativar"}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(empresa.id, empresa.status)}
                          disabled={processingId === empresa.id}
                        >
                          {processingId === empresa.id ? (
                            <CircularProgress size={16} />
                          ) : empresa.status === "ATIVA" ? (
                            <CancelIcon fontSize="small" />
                          ) : (
                            <CheckCircleIcon fontSize="small" />
                          )}
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

export default EmpresasListPage;

