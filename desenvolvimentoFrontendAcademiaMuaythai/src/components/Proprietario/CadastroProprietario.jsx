import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CadastroProprietario.css";

const CadastroProprietario = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Salvando no localStorage
    localStorage.setItem("proprietario", JSON.stringify(formData));

    alert("Cadastro realizado! Faça o login.");
    navigate("/"); // Redireciona para a tela de login
  };

  return (
    <div className="cadastroProprietario">
      <h2>Cadastro do Proprietário</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          placeholder="Nome completo"
          value={formData.nome}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="senha"
          placeholder="Senha"
          value={formData.senha}
          onChange={handleChange}
          required
        />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default CadastroProprietario;
