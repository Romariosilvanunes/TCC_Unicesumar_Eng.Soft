import React, { useState } from "react";
import "./Pagamentos.css";

export default function Pagamentos() {
  const [form, setForm] = useState({
    aluno: "",
    valor: "",
    status: "Pendente",
  });

  const [pagamentos, setPagamentos] = useState(() => {
    const data = localStorage.getItem("pagamentos");
    return data ? JSON.parse(data) : [];
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const novaLista = [...pagamentos, form];
    setPagamentos(novaLista);

    localStorage.setItem("pagamentos", JSON.stringify(novaLista));

    setForm({ aluno: "", valor: "", status: "Pendente" });
  };

  const marcarComoPago = (index) => {
    const novaLista = [...pagamentos];
    novaLista[index].status = "Pago";
    setPagamentos(novaLista);

    localStorage.setItem("pagamentos", JSON.stringify(novaLista));
  };

  const excluirPagamento = (index) => {
    const novaLista = pagamentos.filter((_, i) => i !== index);
    setPagamentos(novaLista);

    localStorage.setItem("pagamentos", JSON.stringify(novaLista));
  };

  const total = pagamentos.reduce((soma, p) => soma + Number(p.valor), 0);
  const totalPago = pagamentos
    .filter((p) => p.status === "Pago")
    .reduce((soma, p) => soma + Number(p.valor), 0);

  return (
    <div className="pagamentos-container">
      <h2>Registrar Pagamento</h2>
      <form className="pagamentos-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="aluno"
          placeholder="Nome do aluno"
          value={form.aluno}
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
        <button type="submit">Adicionar</button>
      </form>

      <div className="resumo">
        <p>
          <strong>Total registrado:</strong> R$ {total.toFixed(2)}
        </p>
        <p>
          <strong>Total recebido:</strong> R$ {totalPago.toFixed(2)}
        </p>
      </div>

      <h3>Pagamentos</h3>
      <ul className="lista-pagamentos">
        {pagamentos.length === 0 ? (
          <p>Nenhum pagamento registrado.</p>
        ) : (
          pagamentos.map((p, index) => (
            <li
              key={index}
              className={p.status === "Pago" ? "pago" : "pendente"}
            >
              <span>
                <strong>{p.aluno}</strong> - R$ {p.valor} ({p.status})
              </span>
              {p.status === "Pendente" && (
                <button onClick={() => marcarComoPago(index)}>
                  Marcar como pago
                </button>
              )}
              <button onClick={() => excluirPagamento(index)}>Excluir</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
