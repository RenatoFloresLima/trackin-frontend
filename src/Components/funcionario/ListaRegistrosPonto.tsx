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

const formatDateBR = (dateString: string): string => {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
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
          sx={{ maxHeight: 400, border: "1px solid #eee" }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhum registro encontrado no período.
                  </TableCell>
                </TableRow>
              ) : (
                registros.map((registro) => (
                  <TableRow
                    key={registro.id}
                    sx={getRowStyle(registro.status || "")}
                  >
                    <TableCell>{formatDateBR(registro.dataRegistro)}</TableCell>

                    <TableCell>
                      {registro.horaRegistro}
                      {registro.horaSaida && ` - ${registro.horaSaida}`}
                    </TableCell>

                    <TableCell>
                      {(registro.tipoRegistro || "").replace(/_/g, " ")}
                    </TableCell>

                    <TableCell>
                      {(registro.status || "").replace(/_/g, " ")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ListaRegistrosPonto;
