import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./AlunoCadastro.css";

const AlunoCadastro = () => {
  const [formData, setFormData] = useState({
    nome: "",
    nascimento: "",
    cpf: "",
    endereco: "",
    responsavel: "",
    graduacao: "",
    modalidade: "",
    dias: [],
    horario: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        dias: checked
          ? [...prev.dias, value]
          : prev.dias.filter((dia) => dia !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados do aluno:", formData);
    // Aqui você pode chamar o backend futuramente com axios ou fetch
  };

  return (
    <div className="cadastroAluno">
      <h2>Cadastro de Aluno</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          placeholder="Nome Completo"
          value={formData.nome}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="nascimento"
          value={formData.nascimento}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="cpf"
          placeholder="CPF"
          value={formData.cpf}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="endereco"
          placeholder="Endereço"
          value={formData.endereco}
          onChange={handleChange}
        />
        <input
          type="text"
          name="responsavel"
          placeholder="Responsável (se menor)"
          value={formData.responsavel}
          onChange={handleChange}
        />
        <input
          type="text"
          name="graduacao"
          placeholder="Graduação em Muaythai"
          value={formData.graduacao}
          onChange={handleChange}
        />
        <select
          name="modalidade"
          value={formData.modalidade}
          onChange={handleChange}
          required
        >
          <option value="">Selecione a Modalidade</option>
          <option value="Muaythai">Muaythai</option>
          <option value="Kickboxing">Kickboxing</option>
          <option value="Taekwondo">Taekwondo</option>
          <option value="Kids">Aula Infantil</option>
        </select>

        <fieldset>
          <legend>Dias da Semana</legend>
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
            <label key={dia}>
              <input
                type="radio"
                name="dias"
                value={dia}
                checked={formData.dias.includes(dia)}
                onChange={handleChange}
              />
              {dia}
            </label>
          ))}
        </fieldset>
        <input
          type="time"
          name="horario"
          value={formData.horario}
          onChange={handleChange}
          required
        />

        <button type="submit">Cadastrar Aluno</button>
        <Link to="/">Voltar ao Login</Link>
      </form>
    </div>
  );
};

export default AlunoCadastro;
