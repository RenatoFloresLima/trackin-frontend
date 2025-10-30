// src/Components/funcionario/lista/LinhaFuncionario.tsx
import React from "react";
import { TableCell, TableRow, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import { type FuncionarioAPI } from "../../../interfaces/funcionarioInterfaces"; // Caminho OK
import { useNavigate } from "react-router-dom";

interface LinhaFuncionarioProps {
  funcionario: FuncionarioAPI;
  onDesligar: (id: number) => void;
  onInformacoes: (id: number) => void;
}

const LinhaFuncionario: React.FC<LinhaFuncionarioProps> = ({
  funcionario,
  onDesligar,
  onInformacoes,
}) => {
  const navigate = useNavigate();
  // Função de Desligamento com Confirmação e Aviso
  const handleDesligar = () => {
    if (
      window.confirm(
        `Tem certeza que deseja solicitar o desligamento de ${funcionario.nome}? (Requer Aprovação)`
      )
    ) {
      onDesligar(funcionario.id);
    }
  };

  const handleEditClick = () => {
    navigate(`/funcionarios/editar/${funcionario.id}`);
  };

  // Simula a verificação de status (mantido)
  const statusFuncionario = funcionario.usuarioAssociado ? "Ativo" : "Pendente";

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

        {/* Botão Desligar (Requer Aprovação) */}
        <Tooltip title="Desligar Funcionário (Requer Aprovação)">
          <IconButton color="error" onClick={handleDesligar}>
            <PersonOffIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default LinhaFuncionario;
