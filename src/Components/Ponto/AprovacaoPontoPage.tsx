import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
  Box,
  Alert,
} from "@mui/material";

// 🔹 Tipos
import type { RegistroPonto, FiltrosPonto } from "@/services/pontoService";
// 🔹 Funções
import { buscarPontos, aprovarPonto } from "@/services/pontoService";
import { useAuth } from "@/contexts/AuthContext";

const AprovacaoPontoPage: React.FC = () => {
  const { isAdmin } = useAuth();

  const [filtros, setFiltros] = useState<FiltrosPonto>({
    nome: "",
    matricula: "",
    status: "AMBOS",
    dataInicio: "",
    dataFim: "",
    aba: "dia",
  });

  const [abaAtiva, setAbaAtiva] = useState<"dia" | "pendentes" | "todos">(
    "dia"
  );
  // O tipo RegistroPonto deve refletir RegistroPontoFullDTO do backend
  const [pontos, setPontos] = useState<RegistroPonto[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarTodosPontos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abaAtiva]);

  const buscarTodosPontos = async () => {
    setLoading(true);
    setErro(null);
    try {
      const params: FiltrosPonto = {
        ...filtros,
        aba: abaAtiva,
        // Garante que o status 'AMBOS' seja tratado como undefined para o backend
        status: filtros.status !== "AMBOS" ? filtros.status : undefined,
      };
      const data = await buscarPontos(params);
      console.log("Pontos buscados:", data);
      setPontos(data || []);
    } catch (error) {
      setErro((error instanceof Error ? error.message : undefined) || "Erro desconhecido ao buscar pontos.");
      setPontos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovarPonto = async (pontoId: number) => {
    try {
      await aprovarPonto(pontoId);
      // Recarrega a lista após a aprovação
      buscarTodosPontos();
    } catch (e: any) {
      setErro(e.message);
    }
  };

  /**
   * Função auxiliar para formatar datas ISO (String do backend)
   * @param isoString String ISO 8601 (LocalDateTime)
   * @param formatString Formato desejado (ex: 'dd/MM/yyyy' ou 'HH:mm:ss')
   * @returns String formatada ou "-"
   */
  const formatDate = (
    isoString: string | undefined,
    formatString: string
  ): string => {
    if (!isoString) return "-";
    try {
      // parseISO é necessário para strings de data/hora do Java
      return format(parseISO(isoString), formatString);
    } catch {
      return isoString;
    }
  };

  // --- Renderização do Componente ---

  return (
    <Box p={4}>
      <h2>Aprovação de Pontos</h2>

      {erro && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erro}
        </Alert>
      )}

      {/* 🔹 Filtros */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        <TextField
          label="Nome"
          value={filtros.nome}
          onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
        />
        <TextField
          label="Matrícula"
          value={filtros.matricula}
          onChange={(e) =>
            setFiltros({ ...filtros, matricula: e.target.value })
          }
        />
        <TextField
          type="date"
          label="Data Início"
          InputLabelProps={{ shrink: true }}
          value={filtros.dataInicio}
          onChange={(e) =>
            setFiltros({ ...filtros, dataInicio: e.target.value })
          }
        />
        <TextField
          type="date"
          label="Data Fim"
          InputLabelProps={{ shrink: true }}
          value={filtros.dataFim}
          onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
        />
        <TextField
          select
          label="Status"
          value={filtros.status}
          onChange={(e) =>
            setFiltros({ ...filtros, status: e.target.value as any })
          }
        >
          <MenuItem value="AMBOS">Ambos</MenuItem>
          <MenuItem value="PENDENTE_APROVACAO">Pendentes</MenuItem>
          <MenuItem value="APROVADO">Aprovados</MenuItem>
        </TextField>
        <Button variant="contained" onClick={buscarTodosPontos}>
          Filtrar
        </Button>
      </Box>

      {/* 🔹 Abas */}
      <Tabs
        value={abaAtiva}
                    onChange={(_, newValue) => setAbaAtiva(newValue as "dia" | "pendentes" | "todos")}
        sx={{ mb: 2 }}
      >
        <Tab label="Pontos do Dia" value="dia" />
        <Tab label="Pendentes" value="pendentes" />
        <Tab label="Todos" value="todos" />
      </Tabs>

      {/* 🔹 Tabela */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Matrícula</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Registro</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pontos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Nenhum ponto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                pontos.map((p) => (
                  <TableRow
                    key={p.id}
                    sx={{
                      bgcolor:
                        p.status === "PENDENTE_APROVACAO"
                          ? "warning.light"
                          : "inherit",
                    }}
                  >
                    <TableCell>{p.matricula}</TableCell>
                    <TableCell>{p.funcionarioNome}</TableCell>
                    <TableCell>{p.tipo}</TableCell>
                    <TableCell>{formatDate(p.horario, "dd/MM/yyyy")}</TableCell>
                    <TableCell>{formatDate(p.horario, "HH:mm:ss")}</TableCell>
                    <TableCell>
                      {formatDate(p.horarioCriacao, "HH:mm:ss")}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: p.status === "APROVADO" ? "green" : "orange",
                        fontWeight: "bold",
                      }}
                    >
                      {p.status === "PENDENTE_APROVACAO"
                        ? "Pendente"
                        : p.status}
                    </TableCell>
                    <TableCell>
                      {isAdmin && p.status === "PENDENTE_APROVACAO" && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleAprovarPonto(p.id)}
                        >
                          Aprovar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
};

export default AprovacaoPontoPage;
