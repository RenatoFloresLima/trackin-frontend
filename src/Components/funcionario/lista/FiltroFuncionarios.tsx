// src/Components/funcionario/lista/FiltroFuncionarios.tsx
import React, { type ChangeEvent, useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import SearchIcon from "@mui/icons-material/Search";

// ✅ Importa a API e as tipagens
import api from "../../../services/api";
import {
  type FiltrosFuncionario,
  type Sede,
  type Funcao,
} from "../../../interfaces/funcionarioInterfaces";

// ------------------------------------------
// Constantes de API
// ------------------------------------------
const API_BASE_URL = "/api";
const API_SEDES = `${API_BASE_URL}/sedes`;
const API_FUNCOES = `${API_BASE_URL}/funcoes`;

interface FiltroFuncionariosProps {
  filtros: FiltrosFuncionario;
  onFiltroChange: (novosFiltros: Partial<FiltrosFuncionario>) => void;
  // ✅ PROPRIEDADES REMOVIDAS: sedeAdmin, sedeAdminId
}

const FiltroFuncionarios: React.FC<FiltroFuncionariosProps> = ({
  filtros,
  onFiltroChange,
}) => {
  // ------------------------------------------
  // ESTADOS DE DADOS
  // ------------------------------------------
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // ------------------------------------------
  // Lógica de Carregamento de Dados (useEffect)
  // ------------------------------------------
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [sedesResponse, funcoesResponse] = await Promise.all([
          api.get<Sede[]>(API_SEDES),
          api.get<Funcao[]>(API_FUNCOES),
        ]);

        setSedes(sedesResponse.data);
        setFuncoes(funcoesResponse.data);
      } catch (error) {
        console.error(
          "Erro ao carregar Sedes ou Funções para o Filtro:",
          error
        );
      } finally {
        setDataLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  // ------------------------------------------
  // HANDLER DE MUDANÇA (Genérico e CORRIGIDO para Select e Text)
  // ------------------------------------------
  const handleTextChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    if (!name) return;

    onFiltroChange({ [name]: value } as Partial<FiltrosFuncionario>);
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    if (!name) return;

    let finalValue: string | number | null = null;

    if (name === "sedePrincipalId") {
      finalValue = value === "" ? null : Number(value);
    } else if (name === "funcaoNome") {
      finalValue = value === "" ? null : value;
    }

    onFiltroChange({ [name]: finalValue } as Partial<FiltrosFuncionario>);
  };

  // Renderiza uma mensagem de loading enquanto busca os dados
  if (dataLoading) {
    return (
      <Paper elevation={1} sx={{ p: 2, mb: 2, textAlign: "center" }}>
        Carregando opções de filtro...
      </Paper>
    );
  }

  // ------------------------------------------
  // RENDERIZAÇÃO
  // ------------------------------------------
  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {/* 1. Campo de Pesquisa Geral (Nome, Matrícula) */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            label="Pesquisar por Nome, Matrícula ou E-mail"
            name="termoBusca"
            value={filtros.termoBusca}
            onChange={handleTextChange}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* 2. SELECT FUNÇÃO (Filtro por nome da função) */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Filtrar por Função</InputLabel>
            <Select
              label="Filtrar por Função"
              name="funcaoNome"
              // O valor do filtro é a string do nome da função, ou '' se for null
              value={filtros.funcaoNome ?? ""}
              onChange={handleSelectChange}
            >
              <MenuItem value="">Todas as Funções</MenuItem>
              {funcoes.map((funcao) => (
                <MenuItem key={funcao.id} value={funcao.nome}>
                  {funcao.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 3. SELECT SEDE (Filtro por ID da sede) */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Filtrar por Sede</InputLabel>
            <Select
              label="Filtrar por Sede"
              name="sedePrincipalId"
              // Se o valor for null, o Select deve receber a string vazia ''
              value={
                filtros.sedePrincipalId === null
                  ? ""
                  : String(filtros.sedePrincipalId)
              }
              onChange={handleSelectChange}
            >
              <MenuItem value="">Todas as Sedes</MenuItem>
              {sedes.map((sede) => (
                // O valor é o ID numérico da sede
                <MenuItem key={sede.id} value={String(sede.id)}>
                  {sede.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FiltroFuncionarios;
