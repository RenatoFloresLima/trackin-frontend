import { useEffect, useState, type FormEvent } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

const STORAGE_KEY = "trackin_remember_me";

const Login = () => {
  const [loginInput, setLoginInput] = useState("");
  const [senha, setSenha] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const rawCredentials = localStorage.getItem(STORAGE_KEY);
    if (!rawCredentials) {
      return;
    }

    try {
      const stored = JSON.parse(rawCredentials) as {
        login?: string;
        senha?: string;
      };

      if (stored.login) {
        setLoginInput(stored.login);
      }

      if (stored.senha) {
        setSenha(stored.senha);
      }

      if (stored.login || stored.senha) {
        setRememberMe(true);
      }
    } catch (error) {
      console.error("Não foi possível ler as credenciais salvas:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    if (!checked) {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const userRole = await login(loginInput, senha);

      if (rememberMe) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ login: loginInput, senha })
        );
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }

      if (userRole === "ROLE_ADMIN") {
        navigate("/aprovacao-pontos", { replace: true });
      } else {
        navigate("/meu-perfil", { replace: true });
      }
    } catch (e) {
      const errorMessage =
        (e instanceof Error ? e.message : undefined) ||
        "Erro de conexão. Verifique o servidor.";
      setError(errorMessage);
    }
  };

  return (
    <div className="App-login-background">
      <div className="container">
        <form onSubmit={handleSubmit}>
          <h1 className="logo-text">Trackin</h1>

          {error && <p className="error-message">{error}</p>}

          <div className="input-field">
            <input
              type="text"
              placeholder="Matricula"
              value={loginInput}
              onChange={(event) => setLoginInput(event.target.value)}
              required
            />
            <FaUser className="icon" />
          </div>

          <div className="input-field">
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
            />
            <FaLock className="icon" />
          </div>

          <div className="recall-forget">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => handleRememberMeChange(event.target.checked)}
              />
              Lembrar-me
            </label>
            <a href="#">Esqueci minha senha</a>
          </div>

          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
