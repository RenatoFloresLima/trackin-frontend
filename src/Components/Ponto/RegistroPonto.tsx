import { useForm } from "react-hook-form";
import "./RegistroPonto.css";

const RegistroPonto = () => {
  const { register } = useForm();

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Ponto registrado");
  };

  return (
    <div className="container">
      <h1>Registro de Ponto</h1>
      <div className="form-group">
        <label>Sede:</label>
        <select className="form-control" {...register("sede")}>
          <option>Selecione sua sede</option>
          <option value="sede1">Sede 1</option>
          <option value="sede2">Sede 2</option>
          <option value="sede3">Sede 3</option>
        </select>
      </div>
      <div className="form-group">
        <label>Matricula:</label>
        <input
          type="text"
          className="form-control"
          placeholder="Digite sua matrícula"
          {...register("matricula")}
        />
      </div>
      <div className="form-group">
        <label>Senha:</label>
        <input
          type="password"
          className="form-control"
          placeholder="Digite sua senha"
          {...register("senha")}
        />
      </div>
      <div className="form-group">
        <label>Justificativa:</label>
        <input
          type="justificativa"
          className="form-justify"
          placeholder="Justifique seu ponto"
          {...register("justificativa")}
        />
      </div>
      <button className="btn btn-primary" onClick={onSubmit}>
        Registrar Ponto
      </button>
    </div>
  );
};

export default RegistroPonto;
