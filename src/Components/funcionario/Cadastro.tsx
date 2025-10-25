import { useForm } from "react-hook-form";
import "./Cadastro.css";

const Cadastro = () => {
  const { register } = useForm();

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Formulário enviado");
  };

  return (
    <div className="container">
      <h1>Cadastro de Funcionário</h1>
      <div className="form-group">
        <label>Nome:</label>
        <input
          type="text"
          className="form-control"
          placeholder="Digite o nome"
          {...register("nome")}
        />
      </div>
      <div className="form-group">
        <label>Endereço:</label>
        <input
          type="text"
          className="form-control"
          placeholder="Digite a endereço"
          {...register("endereco")}
        />
      </div>
      <div className="form-group">
        <label>Telefone:</label>
        <input
          type="text"
          className="form-control"
          placeholder="Digite o telefone"
          {...register("telefone")}
        />
      </div>
      <div className="form-group">
        <label>CPF:</label>
        <input
          type="text"
          className="form-control"
          placeholder="Digite o CPF"
          {...register("cpf")}
        />
      </div>
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          className="form-control"
          placeholder="Digite o email"
          {...register("email")}
        />
      </div>
      <div className="form-group">
        <label>Sede:</label>
        <select {...register("sede")} className="form-control">
          <option value="Sede A">Sede A</option>
          <option value="Sede B">Sede B</option>
          <option value="Sede C">Sede C</option>
        </select>
      </div>
      <div className="form-group">
        <label>Função:</label>
        <select {...register("funcao")} className="form-control">
          <option value="Recepcionista">Recepcionista</option>
          <option value="Faxineira">Faxineira</option>
          <option value="Gerente de Adminstrativa">
            Gerente de Adminstrativa
          </option>
        </select>
      </div>
      <button onClick={onSubmit} className="btn btn-primary">
        Cadastrar
      </button>
    </div>
  );
};

export default Cadastro;
