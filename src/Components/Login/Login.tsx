import React from "react";
import { FaUser, FaLock } from "react-icons/fa";

import { useState } from "react";

import "./Login.css";

const Login = () => {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(matricula, senha);
    console.log("Envio");
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Trackin</h1>
        <div className="input-field">
          <input
            type="text"
            placeholder="Matricula"
            onChange={(e) => setMatricula(e.target.value)}
          />
          <FaUser className="icon" />
        </div>
        <div className="input-field">
          <input
            type="password"
            placeholder="Senha"
            onChange={(e) => setSenha(e.target.value)}
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
