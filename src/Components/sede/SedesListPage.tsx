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
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import FmdBadIcon from "@mui/icons-material/FmdBad";

import type { SedeDTO } from "../../types/SedeTypes";
import { listarSedes } from "../../services/SedeService";

const SedesListPage = () => {
  const navigate = useNavigate();
  const [sedes, setSedes] = useState<SedeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listarSedes();
        setSedes(data);
      } catch (err) {
        console.error("[Sedes] Erro ao carregar sedes:", err);
        setError("Não foi possível carregar as sedes. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, []);

  const possuiGeolocalizacao = (sede: SedeDTO) =>
    sede.latitude != null &&
    sede.longitude != null &&
    sede.raioPermitido != null &&
    sede.raioPermitido > 0;

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
            Sedes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure latitude, longitude e o raio permitido para habilitar a
            aprovação automática dos pontos.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddLocationAltIcon />}
          onClick={() => navigate("/sedes/nova")}
        >
          Nova sede
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
        ) : sedes.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography variant="body1">
              Nenhuma sede cadastrada ainda. Clique em “Nova sede” para começar.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table aria-label="Sedes cadastradas">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell align="center">Latitude</TableCell>
                  <TableCell align="center">Longitude</TableCell>
                  <TableCell align="center">Raio (m)</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sedes.map((sede) => {
                  const comGeo = possuiGeolocalizacao(sede);
                  return (
                    <TableRow key={sede.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{sede.nome}</Typography>
                      </TableCell>
                      <TableCell>{sede.endereco ?? "—"}</TableCell>
                      <TableCell align="center">
                        {sede.latitude?.toFixed(6) ?? "—"}
                      </TableCell>
                      <TableCell align="center">
                        {sede.longitude?.toFixed(6) ?? "—"}
                      </TableCell>
                      <TableCell align="center">
                        {sede.raioPermitido != null
                          ? sede.raioPermitido.toFixed(2)
                          : "—"}
                      </TableCell>
                      <TableCell align="center">
                        {comGeo ? (
                          <Chip
                            size="small"
                            color="success"
                            label="Pronta para app"
                          />
                        ) : (
                          <Tooltip title="Complete latitude, longitude e raio para permitir aprovação automática.">
                            <Chip
                              size="small"
                              color="warning"
                              icon={<FmdBadIcon />}
                              label="Geolocalização incompleta"
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar sede">
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/sedes/${sede.id}/editar`)}
                          >
                            <EditLocationAltIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default SedesListPage;

