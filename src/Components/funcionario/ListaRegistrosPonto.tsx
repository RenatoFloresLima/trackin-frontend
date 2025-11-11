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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import { RegistroPontoAPIService } from "../../services/RegistroPontoAPIService";
import type { RegistroPontoDetalheResponse } from "../../types/PontoTypes";

interface ListaRegistrosPontoProps {
  funcionarioId: number;
}

// formatDateBR removido - não usado

const formatDateTime = (dateTimeString: string): { date: string; time: string } => {
  if (!dateTimeString) return { date: "", time: "" };
  try {
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString("pt-BR");
    const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return { date: dateStr, time: timeStr };
  } catch {
    return { date: dateTimeString, time: "" };
  }
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
  const [registros, setRegistros] = useState<RegistroPontoDetalheResponse[]>(
    []
  );
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

  const getRowStyle = (status: string) => {
    if (status === "PENDENTE_APROVACAO") {
      return { backgroundColor: "#ff7e051a", fontWeight: "bold" }; // 🔑 Fundo amarelado suave
    }
    return {};
  };

  return (
    <Box>
      <Typography
        variant="h6"
        component="h2"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        Registros de Ponto
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          label="Data Início"
          type="date"
          size="small"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
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
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
        <IconButton color="primary" onClick={handleSearch} disabled={loading}>
          <SearchIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        // 🔑 TableContainer sem sombra (elevation=0), mas com TableHead sticky
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ 
            maxHeight: 400, 
            border: "1px solid #eee",
            width: "100%",
            overflowX: "auto"
          }}
        >
          <Table stickyHeader size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 100 }}>Data</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Hora</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Tipo</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Status</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Sede</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Observação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nenhum registro encontrado no período.
                  </TableCell>
                </TableRow>
              ) : (
                registros.map((registro) => {
                  const { date, time } = formatDateTime(registro.horario);
                  return (
                    <TableRow
                      key={registro.id}
                      sx={getRowStyle(registro.status || "")}
                    >
                      <TableCell>{date}</TableCell>
                      <TableCell>{time}</TableCell>
                      <TableCell>
                        {(registro.tipo || "").replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>
                        {(registro.status || "").replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>
                        {registro.sedeNome || "-"}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={registro.observacao || ""}>
                        {registro.observacao || "-"}
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
