import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { RegistroPontoAPIService } from "../../services/RegistroPontoAPIService";
import type { RegistroPontoFullDTO } from "../../types/PontoTypes";

interface ListaRegistrosPontoProps {
  funcionarioId: number;
}

const formatDateTime = (dateTimeString: string): { date: string; time: string } => {
  if (!dateTimeString) return { date: "", time: "" };
  
  try {
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString("pt-BR");
    const timeStr = date.toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
    return { date: dateStr, time: timeStr };
  } catch (e) {
    return { date: dateTimeString, time: "" };
  }
};

const formatTipoRegistro = (tipo: string): string => {
  if (!tipo) return "";
  return tipo
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const getStatusColor = (status: string): "default" | "warning" | "success" | "error" => {
  const statusUpper = status?.toUpperCase() || "";
  if (statusUpper.includes("PENDENTE")) {
    return "warning";
  }
  if (statusUpper.includes("APROVADO")) {
    return "success";
  }
  if (statusUpper.includes("REJEITADO")) {
    return "error";
  }
  return "default";
};

const getStatusLabel = (status: string): string => {
  if (!status) return "";
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const isPendente = (status: string): boolean => {
  const statusUpper = status?.toUpperCase() || "";
  return statusUpper.includes("PENDENTE");
};

const ListaRegistrosPonto: React.FC<ListaRegistrosPontoProps> = ({
  funcionarioId,
}) => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const todayDateString = today.toISOString().split("T")[0];

  const [dataInicio, setDataInicio] = useState(firstDayOfMonth);
  const [dataFim, setDataFim] = useState(todayDateString);
  const [registros, setRegistros] = useState<RegistroPontoFullDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrosPonto = useCallback(async () => {
    if (!funcionarioId) {
      setRegistros([]);
      return;
    }

    setLoading(true);
    setError(null);
    setRegistros([]);

    try {
      const filtro = { dataInicio, dataFim };

      const data =
        await RegistroPontoAPIService.buscarRegistrosPorFuncionarioEPeriodo(
          funcionarioId,
          filtro
        );

      setRegistros(data);
    } catch (err: any) {
      console.error("Erro ao buscar registros de ponto:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Falha ao carregar registros. Verifique o período e a conexão.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [funcionarioId, dataInicio, dataFim]);

  useEffect(() => {
    fetchRegistrosPonto();
  }, [fetchRegistrosPonto]);

  const handleSearch = () => {
    fetchRegistrosPonto();
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          Registros de Ponto
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <TextField
            label="Data Início"
            type="date"
            size="small"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: { xs: "100%", sm: "180px" },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />
          <TextField
            label="Data Fim"
            type="date"
            size="small"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: { xs: "100%", sm: "180px" },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSearch}
            disabled={loading}
            sx={{
              borderRadius: "8px",
              bgcolor: "primary.main",
              color: "white",
              "&:hover": {
                bgcolor: "primary.dark",
              },
              "&.Mui-disabled": {
                bgcolor: "action.disabledBackground",
                color: "action.disabled",
              },
            }}
          >
            <SearchIcon />
          </IconButton>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            maxHeight: 600,
            overflow: "auto",
          }}
        >
          <Table stickyHeader size="medium">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                  Data
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                  Horário
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                  Tipo
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                  Observação
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nenhum registro encontrado no período selecionado.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                registros.map((registro) => {
                  const pendente = isPendente(registro.status || "");
                  const { date, time } = formatDateTime(registro.horario || "");
                  
                  return (
                    <TableRow
                      key={registro.id}
                      sx={{
                        backgroundColor: pendente
                          ? "warning.50"
                          : "transparent",
                        "&:hover": {
                          backgroundColor: pendente
                            ? "warning.100"
                            : "action.hover",
                        },
                        borderLeft: pendente
                          ? "4px solid"
                          : "4px solid transparent",
                        borderLeftColor: pendente ? "warning.main" : "transparent",
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={pendente ? 600 : 400}>
                          {date || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {time || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {formatTipoRegistro(registro.tipo || "")}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getStatusLabel(registro.status || "")}
                          color={getStatusColor(registro.status || "")}
                          size="small"
                          icon={
                            pendente ? (
                              <WarningAmberIcon sx={{ fontSize: 16 }} />
                            ) : undefined
                          }
                        />
                      </TableCell>

                      <TableCell>
                        {pendente && registro.observacao ? (
                          <Tooltip title={registro.observacao} arrow>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                maxWidth: 300,
                              }}
                            >
                              <WarningAmberIcon
                                sx={{ fontSize: 16, color: "warning.main" }}
                              />
                              <Typography
                                variant="body2"
                                color="warning.dark"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {registro.observacao}
                              </Typography>
                            </Box>
                          </Tooltip>
                        ) : registro.observacao ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: 300,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {registro.observacao}
                          </Typography>
                        ) : pendente ? (
                          <Typography variant="body2" color="warning.dark" fontWeight={500}>
                            Aguardando aprovação
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ListaRegistrosPonto;
