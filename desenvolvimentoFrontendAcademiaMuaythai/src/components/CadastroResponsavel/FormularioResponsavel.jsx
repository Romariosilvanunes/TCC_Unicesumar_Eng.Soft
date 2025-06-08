import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FormularioResponsavel.css";

const FormularioResponsavel = () => {
  const navigate = useNavigate();

  const [responsavelData, setResponsavelData] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    telefone: "",
    email: "",
    endereco: "",
    parentesco: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponsavelData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("responsavel", JSON.stringify(responsavelData));
    navigate("/dashboard/cadastro-aluno"); // ✅ ROTA FIXA
  };

  return (
    <div className="cadastroResponsavel">
      <h2>Cadastro de Responsável</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          placeholder="Nome Completo"
          value={responsavelData.nome}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="cpf"
          placeholder="CPF"
          value={responsavelData.cpf}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="dataNascimento"
          placeholder="Data de Nascimento"
          value={responsavelData.dataNascimento}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="telefone"
          placeholder="Telefone"
          value={responsavelData.telefone}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={responsavelData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="endereco"
          placeholder="Endereço"
          value={responsavelData.endereco}
          onChange={handleChange}
        />
        <input
          type="text"
          name="parentesco"
          placeholder="Parentesco com o Aluno"
          value={responsavelData.parentesco}
          onChange={handleChange}
        />

        <button type="submit">Concluir Cadastro</button>

        <button
          type="button"
          className="botao-voltar"
          onClick={() => navigate("/dashboard/cadastro-aluno")} // ✅ ROTA FIXA
        >
          Voltar
        </button>
      </form>
    </div>
  );
};

export default FormularioResponsavel;
