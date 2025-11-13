import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState, type FormEvent } from "react";
import "./Login.css";

const Login = () => {
  const [loginInput, setLoginInput] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const userRole = await login(loginInput, senha);

      if (userRole === "ROLE_ADMIN") {
        // ROLE_ADMIN: Redireciona para a tela de aprovação de pontos
        navigate("/aprovacao-pontos", { replace: true });
      } else {
        // FUNCIONÁRIO COMUM: Redireciona para a tela de perfil
        navigate("/meu-perfil", { replace: true });
      }
    } catch (e) {
      // Tratar e exibir erros da função login (API)
      // Usamos e.message se for um erro de exceção lançado pelo useAuth/API
      const errorMessage =
        (e instanceof Error ? e.message : undefined) || "Erro de conexão. Verifique o servidor.";
      setError(errorMessage);
    }
  };

  return (
    // 🔑 MUDANÇA CRÍTICA: Envolvemos o contêiner com a classe de fundo.
    // Esta classe deve ter height: 100vh e a background-image definida no App.css
    <div className="App-login-background">
      <div className="container">
        <form onSubmit={handleSubmit}>
          <h1 className="logo-text">Trackin</h1>

          {/* Exibição da mensagem de erro */}
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
          {/* 🔑 Adicionamos type="submit" para maior compatibilidade, embora o form já lide com o submit */}
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
