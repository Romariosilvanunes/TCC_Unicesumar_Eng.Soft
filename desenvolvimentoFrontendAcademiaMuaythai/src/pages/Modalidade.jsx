import React, { useState, useEffect } from "react";
import "./Modalidade.css";

export default function Modalidades() {
  const [modalidade, setModalidade] = useState({
    nome: "",
    dias: "",
    horario: "",
    valor: "",
  });

  const [lista, setLista] = useState(() => {
    const data = localStorage.getItem("modalidades");
    return data ? JSON.parse(data) : [];
  });

  useEffect(() => {
    localStorage.setItem("modalidades", JSON.stringify(lista));
  }, [lista]);

  const handleChange = (e) => {
    setModalidade({ ...modalidade, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!modalidade.nome.trim()) return;

    const novaLista = [...lista, modalidade];
    setLista(novaLista);
    setModalidade({ nome: "", dias: "", horario: "", valor: "" });
  };

  const excluirModalidade = (index) => {
    const novaLista = [...lista];
    novaLista.splice(index, 1);
    setLista(novaLista);
  };

  return (
    <div className="modalidade-container">
      <h2>Cadastro de Modalidades</h2>
      <form className="modalidade-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          placeholder="Nome da modalidade"
          value={modalidade.nome}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="dias"
          placeholder="Dias da semana (ex: Seg, Qua, Sex)"
          value={modalidade.dias}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="horario"
          placeholder="Horário (ex: 18h às 20h)"
          value={modalidade.horario}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="valor"
          placeholder="Valor mensal (R$)"
          value={modalidade.valor}
          onChange={handleChange}
          required
        />
        <button type="submit">Cadastrar</button>
      </form>

      <div className="lista-modalidades">
        <h3>Modalidades cadastradas</h3>
        {lista.length === 0 ? (
          <p>Nenhuma modalidade cadastrada.</p>
        ) : (
          <ul>
            {lista.map((item, index) => (
              <li key={index}>
                <strong>{item.nome}</strong> - {item.dias}, {item.horario} - R${" "}
                {item.valor}
                <button onClick={() => excluirModalidade(index)}>
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
