// src/Components/funcionario/lista/LinhaFuncionario.tsx

import React from "react";
import { TableCell, TableRow, IconButton, Tooltip, Chip, Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import { type FuncionarioAPI } from "../../../interfaces/funcionarioInterfaces";
import { useNavigate } from "react-router-dom";

interface LinhaFuncionarioProps {
  funcionario: FuncionarioAPI;
  // 🔑 CORRIGIDO: onDesligar é uma função que não recebe argumentos, pois ListaFuncionarios já mapeia o objeto.
  onDesligar: () => void;
}

const LinhaFuncionario: React.FC<LinhaFuncionarioProps> = ({
  funcionario,
  onDesligar,
}) => {
  const navigate = useNavigate();

  // 🔑 NOVO HANDLER: Apenas chama a função de prop que abre o modal.
  const handleDesligarClick = () => {
    onDesligar();
  };

  const handleEditClick = () => {
    navigate(`/funcionarios/editar/${funcionario.id}`);
  };

  const statusFuncionario = funcionario.status;

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="body2" fontWeight={500}>
          {funcionario.nome}
        </Typography>
      </TableCell>
      <TableCell>{funcionario.matricula}</TableCell>
      <TableCell>{funcionario.sedePrincipalNome || "-"}</TableCell>
      <TableCell>{funcionario.funcaoNome || "-"}</TableCell>
      <TableCell>
        <Chip
          label={statusFuncionario}
          color={statusFuncionario === "ATIVO" ? "success" : "default"}
          size="small"
        />
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title="Editar Cadastro">
            <IconButton size="small" color="primary" onClick={handleEditClick}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {funcionario.status === "ATIVO" && (
            <Tooltip title="Desligar Funcionário">
              <IconButton size="small" color="error" onClick={handleDesligarClick}>
                <PersonOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default LinhaFuncionario;
