// src/Components/funcionario/lista/LinhaFuncionario.tsx

import React from "react";
import { TableCell, TableRow, IconButton, Tooltip, Box, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import { type FuncionarioAPI } from "../../../interfaces/funcionarioInterfaces";
import { useNavigate } from "react-router-dom";
import "./LinhaFuncionario.css";

interface LinhaFuncionarioProps {
  funcionario: FuncionarioAPI;
  onDesligar: () => void;
  onInformacoes: (id: number) => void;
}

const LinhaFuncionario: React.FC<LinhaFuncionarioProps> = ({
  funcionario,
  onDesligar,
  onInformacoes,
}) => {
  const navigate = useNavigate();

  const handleDesligarClick = () => {
    onDesligar();
  };

  const handleEditClick = () => {
    navigate(`/funcionarios/editar/${funcionario.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ATIVO":
        return "success";
      case "DESLIGADO":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <TableRow 
      hover 
      sx={{ 
        '&:hover': { 
          backgroundColor: 'rgba(26, 188, 156, 0.04)' 
        } 
      }}
    >
      <TableCell sx={{ fontWeight: 500 }}>{funcionario.nome}</TableCell>
      <TableCell>{funcionario.matricula}</TableCell>
      <TableCell>{funcionario.sedePrincipalNome}</TableCell>
      <TableCell>{funcionario.funcaoNome}</TableCell>
      <TableCell>
        <Chip 
          label={funcionario.status} 
          color={getStatusColor(funcionario.status) as any}
          size="small"
          sx={{ 
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        />
      </TableCell>

      <TableCell align="center">
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
          {/* Botão Informações */}
          <Tooltip title="Ver Detalhes" arrow>
            <IconButton
              className="action-button action-button-info"
              onClick={() => onInformacoes(funcionario.id)}
              size="small"
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Botão Editar */}
          <Tooltip title="Editar" arrow>
            <IconButton
              className="action-button action-button-edit"
              onClick={handleEditClick}
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Botão Desligar (Só ATIVO pode ser desligado) */}
          {funcionario.status === "ATIVO" && (
            <Tooltip title="Desligar Funcionário" arrow>
              <IconButton
                className="action-button action-button-delete"
                onClick={handleDesligarClick}
                size="small"
              >
                <PersonOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default LinhaFuncionario;
