// src/Components/funcionario/lista/LinhaFuncionario.tsx

import React from "react";
import { TableCell, TableRow, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import { type FuncionarioAPI } from "../../../interfaces/funcionarioInterfaces";
import { useNavigate } from "react-router-dom";

interface LinhaFuncionarioProps {
  funcionario: FuncionarioAPI;
  // 🔑 CORRIGIDO: onDesligar é uma função que não recebe argumentos, pois ListaFuncionarios já mapeia o objeto.
  onDesligar: () => void;
  onInformacoes: (id: number) => void;
}

const LinhaFuncionario: React.FC<LinhaFuncionarioProps> = ({
  funcionario,
  onDesligar,
  onInformacoes,
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
      <TableCell>{funcionario.nome}</TableCell>
      <TableCell>{funcionario.matricula}</TableCell>
      <TableCell>{funcionario.sedePrincipalNome}</TableCell>
      <TableCell>{funcionario.funcaoNome}</TableCell>
      <TableCell>{statusFuncionario}</TableCell>

      <TableCell align="center">
        {/* Botão Informações */}
        <Tooltip title="Informações Detalhadas">
          <IconButton
            color="info"
            onClick={() => onInformacoes(funcionario.id)}
          >
            <InfoIcon />
          </IconButton>
        </Tooltip>

        {/* Botão Editar */}
        <Tooltip title="Editar Cadastro">
          <IconButton color="primary" onClick={handleEditClick}>
            <EditIcon />
          </IconButton>
        </Tooltip>

        {/* 🔑 Botão Desligar (Só ATIVO pode ser desligado) */}
        {funcionario.status === "ATIVO" && (
          <Tooltip title="Desligar Funcionário">
            {/* Chama o handler simplificado */}
            <IconButton color="error" onClick={handleDesligarClick}>
              <PersonOffIcon />
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
};

export default LinhaFuncionario;
