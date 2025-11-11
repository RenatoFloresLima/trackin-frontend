// src/Components/funcionario/lista/DesligamentoModal.tsx

import React, { useState } from "react"; // ✅ Corrigido: Adicionado useState
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Stack,
  Alert,
} from "@mui/material";
import api from "../../../services/api";
import { type FuncionarioAPI } from "../../../interfaces/funcionarioInterfaces";

// ----------------------------------------------------
// TIPAGEM DA REQUISIÇÃO (Reflete DesligamentoRequest.java)
// ----------------------------------------------------
interface IDesligamentoForm {
  dataUltimoDia: string;
  motivoDetalhado: string;
  observacoes: string;
}

// ----------------------------------------------------
// PROPRIEDADES DO MODAL
// ----------------------------------------------------
interface DesligamentoModalProps {
  funcionario: FuncionarioAPI;
  onClose: () => void;
  onSuccess: () => void;
}

const API_FUNCIONARIOS = "/api/funcionarios";

const DesligamentoModal: React.FC<DesligamentoModalProps> = ({
  funcionario,
  onClose,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IDesligamentoForm>();

  const [loading, setLoading] = useState(false); // ✅ Corrigido
  const [error, setError] = useState<string | null>(null); // ✅ Corrigido

  // ----------------------------------------------------
  // LÓGICA DE SUBMISSÃO
  // ----------------------------------------------------
  const onSubmit: SubmitHandler<IDesligamentoForm> = async (data) => {
    setError(null);
    setLoading(true);

    const url = `${API_FUNCIONARIOS}/${funcionario.id}/desligar`;

    try {
      // Chama o endpoint PATCH com o corpo (data)
      await api.patch(url, data);

      onSuccess();
      // onClose(); -> Chamado dentro de onSuccess, mas é mantido aqui como redundância
      onClose();
    } catch (err: any) {
      console.error("Erro ao desligar funcionário:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Falha na comunicação com o servidor.";
      setError(`❌ Falha: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // RENDERIZAÇÃO
  // ----------------------------------------------------
  return (
    <Modal open onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h5" component="h2" gutterBottom>
          Desligar Funcionário
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
          **{funcionario.nome}** (Matrícula: {funcionario.matricula})
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            {/* Data do Último Dia */}
            <TextField
              label="Data do Último Dia de Trabalho"
              type="date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              {...register("dataUltimoDia", {
                required: "A data é obrigatória.",
              })}
              error={!!errors.dataUltimoDia}
              helperText={errors.dataUltimoDia?.message}
            />

            {/* Motivo Detalhado */}
            <TextField
              label="Motivo Detalhado do Desligamento"
              fullWidth
              required
              multiline
              rows={2}
              {...register("motivoDetalhado", {
                required: "O motivo detalhado é obrigatório.",
                minLength: {
                  value: 10,
                  message: "Detalhe com pelo menos 10 caracteres.",
                },
              })}
              error={!!errors.motivoDetalhado}
              helperText={errors.motivoDetalhado?.message}
            />

            {/* Observações */}
            <TextField
              label="Observações Adicionais (Opcional)"
              fullWidth
              multiline
              rows={2}
              {...register("observacoes")}
            />

            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-end"
              sx={{ mt: 3 }}
            >
              <Button onClick={onClose} variant="outlined" disabled={loading}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="error"
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                Confirmar Desligamento
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

export default DesligamentoModal;

// Estilo MUI para centralizar o modal
const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};
