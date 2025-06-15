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

  const [erros, setErros] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponsavelData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErros((prev) => ({
      ...prev,
      [name]: "", // limpa erro ao digitar
    }));
  };

  const validarCampos = () => {
    const novosErros = {};

    // CPF válido (11 dígitos e verificação simples)
    const cpf = responsavelData.cpf.replace(/\D/g, "");
    if (!/^\d{11}$/.test(cpf)) {
      novosErros.cpf = "CPF deve conter 11 dígitos numéricos.";
    }

    // Telefone (formato simples brasileiro)
    if (!/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(responsavelData.telefone)) {
      novosErros.telefone = "Telefone deve conter DDD e número válido.";
    }

    // Email válido
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responsavelData.email)) {
      novosErros.email = "Formato de email inválido.";
    }

    // Parentesco obrigatório
    if (!responsavelData.parentesco.trim()) {
      novosErros.parentesco = "Informe o parentesco com o aluno.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validarCampos()) return;

    // Salva o responsável em lista
    const responsaveisSalvos =
      JSON.parse(localStorage.getItem("responsaveis")) || [];
    responsaveisSalvos.push(responsavelData);
    localStorage.setItem("responsaveis", JSON.stringify(responsaveisSalvos));

    // Salva para preenchimento automático
    localStorage.setItem("novoResponsavel", JSON.stringify(responsavelData));

    navigate("/dashboard/cadastro-aluno");
  };

  return (
    <div className="cadastroResponsavel">
      <h2>Cadastro de Responsável</h2>
      <form onSubmit={handleSubmit} noValidate>
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
        {erros.cpf && <p className="erro">{erros.cpf}</p>}

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
          placeholder="Telefone (com DDD)"
          value={responsavelData.telefone}
          onChange={handleChange}
          required
        />
        {erros.telefone && <p className="erro">{erros.telefone}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={responsavelData.email}
          onChange={handleChange}
          required
        />
        {erros.email && <p className="erro">{erros.email}</p>}

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
          required
        />
        {erros.parentesco && <p className="erro">{erros.parentesco}</p>}

        <button type="submit">Concluir Cadastro</button>

        <button
          type="button"
          className="botao-voltar"
          onClick={() => navigate("/dashboard/cadastro-aluno")}
        >
          Voltar
        </button>
      </form>
    </div>
  );
};

export default FormularioResponsavel;
