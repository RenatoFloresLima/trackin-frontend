import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import KeyIcon from "@mui/icons-material/Key";

import type {
  FuncionarioDetalheResponse,
  FuncionarioDadosMutaveisRequest,
} from "../../types/FuncionarioTypes";

interface DadosPessoaisProps {
  funcionario: FuncionarioDetalheResponse;
  onUpdate: (
    novosDados: FuncionarioDadosMutaveisRequest
  ) => Promise<{ success: boolean; message: string }>;
  onOpenSenhaModal: () => void;
}

const DadosPessoais: React.FC<DadosPessoaisProps> = ({
  funcionario,
  onUpdate,
  onOpenSenhaModal,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [form, setForm] = useState<
    FuncionarioDadosMutaveisRequest & { email: string }
  >({
    endereco: funcionario.endereco || "",
    telefone: funcionario.telefone || "",
    // 🔑 ADICIONADO EMAIL AO ESTADO PARA SER EDITÁVEL
    email: funcionario.email || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFeedback(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setFeedback(null);

    // 🔑 INCLUÍDO O EMAIL NO PAYLOAD DE ATUALIZAÇÃO
    const payload: FuncionarioDadosMutaveisRequest = {
      endereco: form.endereco,
      telefone: form.telefone,
      email: form.email,
    };

    const result = await onUpdate(payload);

    setLoading(false);

    if (result.success) {
      setFeedback({ type: "success", message: result.message });
      setIsEditing(false);
    } else {
      setFeedback({ type: "error", message: result.message });
    }
  };

  const handleCancel = () => {
    // Reverte o formulário para os dados atuais do props (incluindo email)
    setForm({
      endereco: funcionario.endereco || "",
      telefone: funcionario.telefone || "",
      email: funcionario.email || "",
    });
    setFeedback(null);
    setIsEditing(false);
  };

  type FuncionarioKey = keyof FuncionarioDetalheResponse;

  const renderField = (
    label: string,
    key: FuncionarioKey,
    isMutable: boolean = false
  ) => {
    const value = funcionario[key as keyof FuncionarioDetalheResponse] || "N/A";

    // 🔑 DETERMINA SE O CAMPO DEVE USAR O VALOR DO ESTADO 'FORM'
    const fieldValue =
      isMutable && isEditing ? form[key as keyof typeof form] : value;

    return (
      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        {isEditing && isMutable ? (
          <TextField
            // 🔑 O nome do campo agora inclui 'email'
            name={key as keyof typeof form}
            fullWidth
            variant="outlined"
            size="small"
            value={fieldValue}
            onChange={handleChange}
            disabled={loading}
            sx={{
              mt: 0.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />
        ) : (
          <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
            {value}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          Informações Pessoais
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            color="secondary"
            onClick={onOpenSenhaModal}
            disabled={isEditing || loading}
            title="Redefinir Senha"
          >
            <KeyIcon />
          </IconButton>

          {!isEditing ? (
            <IconButton
              color="primary"
              onClick={() => setIsEditing(true)}
              title="Editar Dados"
            >
              <EditIcon />
            </IconButton>
          ) : (
            <Box>
              <IconButton
                color="primary"
                onClick={handleSave}
                disabled={loading}
                title="Salvar Alterações"
              >
                {loading ? <CircularProgress size={24} /> : <SaveIcon />}
              </IconButton>
              <IconButton
                color="error"
                onClick={handleCancel}
                disabled={loading}
                title="Cancelar Edição"
              >
                <CancelIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>

      {feedback && (
        <Alert severity={feedback.type} sx={{ mb: 2 }}>
          {feedback.message}
        </Alert>
      )}

      {/* 🔑 CORREÇÃO DO GRID: Ajustando spacing e garantindo a estrutura de 3 linhas */}
      <Grid container spacing={3}>
        {/* LINHA 1: Matrícula (4), Nome (4), Sede (4) = Total 12 */}
        <Grid size={{ xs: 12, sm: 4 }}>
          {renderField("Matrícula", "matricula")}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {renderField("Nome", "nome")}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {renderField("Sede Principal", "sedePrincipalNome")}
        </Grid>

        {/* 🔑 LINHA 2: Email (3 - AGORA EDITÁVEL), CPF (3), Função (3), Data Admissão (3) = Total 12 */}
        <Grid size={{ xs: 12, sm: 3 }}>
          {/* 🔑 EMAIL AGORA É MUTÁVEL/EDITÁVEL */}
          {renderField("Email", "email", true)}
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          {renderField("CPF", "cpf")}
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          {renderField("Função", "funcaoNome")}
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          {renderField("Data Admissão", "dataContratacao")}
        </Grid>

        {/* 🔑 LINHA 3: Endereço (4), Telefone (4), Status (4 - Alinhado à Direita) = Total 12 */}
        <Grid size={{ xs: 12, sm: 4 }}>
          {renderField("Endereço", "endereco", true)}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {renderField("Telefone", "telefone", true)}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: "right" }}>
          {renderField("Status", "status")}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DadosPessoais;
