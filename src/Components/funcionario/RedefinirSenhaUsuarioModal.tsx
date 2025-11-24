import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { FuncionarioAPIService } from "../../services/FuncionarioAPIService";
import type { UsuarioRedefinirSenhaRequest } from "../../types/FuncionarioTypes";

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

interface RedefinirSenhaUsuarioModalProps {
  open: boolean;
  onClose: () => void;
}

const RedefinirSenhaUsuarioModal: React.FC<RedefinirSenhaUsuarioModalProps> = ({
  open,
  onClose,
}) => {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);

    // Validações básicas
    if (novaSenha !== confirmarSenha) {
      setMensagem({
        type: "error",
        text: "A nova senha e a confirmação não coincidem.",
      });
      return;
    }
    if (novaSenha.length < 6) {
      setMensagem({
        type: "error",
        text: "A nova senha deve ter no mínimo 6 caracteres.",
      });
      return;
    }
    if (senhaAtual === novaSenha) {
      setMensagem({
        type: "error",
        text: "A nova senha deve ser diferente da senha atual.",
      });
      return;
    }

    setLoading(true);

    try {
      const payload: UsuarioRedefinirSenhaRequest = {
        senhaAtual,
        novaSenha,
        confirmacaoSenha: confirmarSenha,
      };

      await FuncionarioAPIService.redefinirSenhaUsuario(payload);

      // Sucesso
      setMensagem({ type: "success", text: "Senha alterada com sucesso!" });
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setTimeout(onClose, 1500); // Fecha após 1.5s no sucesso
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error.response);

      let errorMessage = "Erro desconhecido ao tentar alterar a senha.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMensagem({
        type: "error",
        text: errorMessage.includes("incorreta")
          ? "Senha atual incorreta."
          : "Falha na alteração: " + errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-title">
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
          Redefinir Senha
        </Typography>

        <TextField
          label="Senha Atual"
          type="password"
          fullWidth
          margin="normal"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          required
          disabled={loading}
          autoComplete="current-password"
        />
        <TextField
          label="Nova Senha"
          type="password"
          fullWidth
          margin="normal"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          required
          disabled={loading}
          autoComplete="new-password"
          helperText="Mínimo de 6 caracteres"
        />
        <TextField
          label="Confirmar Nova Senha"
          type="password"
          fullWidth
          margin="normal"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          required
          disabled={loading}
          autoComplete="new-password"
        />

        {mensagem && (
          <Alert severity={mensagem.type} sx={{ mt: 2 }}>
            {mensagem.text}
          </Alert>
        )}

        <Box
          sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}
        >
          <Button onClick={onClose} variant="outlined" disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar Nova Senha"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RedefinirSenhaUsuarioModal;

