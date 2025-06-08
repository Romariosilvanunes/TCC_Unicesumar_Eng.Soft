import React, { useState } from "react";
import "./ContasPagar.css";

export default function ContasPagar() {
  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    vencimento: "",
    status: "Pendente",
  });

  const [contas, setContas] = useState(() => {
    const data = localStorage.getItem("contasPagar");
    return data ? JSON.parse(data) : [];
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const novaLista = [...contas, form];
    setContas(novaLista);
    localStorage.setItem("contasPagar", JSON.stringify(novaLista));
    setForm({ descricao: "", valor: "", vencimento: "", status: "Pendente" });
  };

  const marcarComoPago = (index) => {
    const novaLista = [...contas];
    novaLista[index].status = "Pago";
    setContas(novaLista);
    localStorage.setItem("contasPagar", JSON.stringify(novaLista));
  };

  const excluirConta = (index) => {
    const novaLista = contas.filter((_, i) => i !== index);
    setContas(novaLista);
    localStorage.setItem("contasPagar", JSON.stringify(novaLista));
  };

  return (
    <div className="contas-container">
      <h2>Contas a Pagar</h2>
      <form className="contas-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="descricao"
          placeholder="Descrição"
          value={form.descricao}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="valor"
          placeholder="Valor (R$)"
          value={form.valor}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="vencimento"
          value={form.vencimento}
          onChange={handleChange}
          required
        />
        <button type="submit">Adicionar</button>
      </form>

      <h3>Lista de Contas</h3>
      <ul className="lista-contas">
        {contas.length === 0 ? (
          <p>Nenhuma conta registrada.</p>
        ) : (
          contas.map((c, index) => (
            <li
              key={index}
              className={c.status === "Pago" ? "pago" : "pendente"}
            >
              <span>
                <strong>{c.descricao}</strong> — R${c.valor} — {c.vencimento} —{" "}
                {c.status}
              </span>
              <div>
                {c.status === "Pendente" && (
                  <button onClick={() => marcarComoPago(index)}>Pagar</button>
                )}
                <button onClick={() => excluirConta(index)}>Excluir</button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
