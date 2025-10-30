import React from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import { useState } from "react";

import "./Login.css";

const Login = () => {
  const [loginInput, setLoginInput] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const userRole = await login(loginInput, senha);

      if (userRole === "ROLE_ADMIN") {
        // ROLE_ADMIN: Redireciona para a tela de cadastro de funcionários
        navigate("/cadastro", { replace: true });
      } else {
        // FUNCIONÁRIO COMUM: Redireciona para a tela de registro de ponto
        navigate("/ponto", { replace: true });
      }
    } catch (e) {
      // 5. Tratar e exibir erros da função login (API)
      setError(e.message || "Ocorreu um erro desconhecido durante o login.");
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Trackin</h1>
        {error && <p className="error-message">{error}</p>}
        <div className="input-field">
          <input
            type="text"
            placeholder="Matricula"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            required
          />
          <FaUser className="icon" />
        </div>
        <div className="input-field">
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <FaLock className="icon" />
        </div>
        <div className="recall-forget">
          <label>
            <input type="checkbox" />
            Lembrar-me
          </label>
          <a href="#">Esqueci minha senha</a>
        </div>
        <button>Entrar</button>
      </form>
    </div>
  );
};

export default Login;
