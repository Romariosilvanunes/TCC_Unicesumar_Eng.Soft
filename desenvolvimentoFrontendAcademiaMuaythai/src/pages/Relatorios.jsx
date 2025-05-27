import React, { useState, useEffect } from "react";
import "./Relatorios.css";

export default function Relatorios() {
  const [dados, setDados] = useState({
    alunos: 0,
    modalidades: 0,
    pagamentos: 0,
    totalRecebido: 0,
    totalRegistrado: 0,
  });

  // carrega do localStorage sempre que a página abrir
  useEffect(() => {
    const alunos = JSON.parse(localStorage.getItem("alunos")) || [];
    const modalidades = JSON.parse(localStorage.getItem("modalidades")) || [];
    const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];

    const totalRegistrado = pagamentos.reduce(
      (soma, p) => soma + Number(p.valor),
      0
    );
    const totalRecebido = pagamentos
      .filter((p) => p.status === "Pago")
      .reduce((soma, p) => soma + Number(p.valor), 0);

    setDados({
      alunos: alunos.length,
      modalidades: modalidades.length,
      pagamentos: pagamentos.length,
      totalRegistrado,
      totalRecebido,
    });
  }, []);

  return (
    <div className="relatorios-container">
      <h2>Relatórios Gerais</h2>

      <div className="cards">
        <div className="card">
          <h3>Alunos</h3>
          <p>{dados.alunos}</p>
        </div>

        <div className="card">
          <h3>Modalidades</h3>
          <p>{dados.modalidades}</p>
        </div>

        <div className="card">
          <h3>Pagamentos</h3>
          <p>{dados.pagamentos}</p>
        </div>
      </div>

      <div className="financeiro">
        <h3>Financeiro</h3>
        <p>
          <strong>Total registrado:</strong> R${" "}
          {dados.totalRegistrado.toFixed(2)}
        </p>
        <p>
          <strong>Total recebido:</strong> R$ {dados.totalRecebido.toFixed(2)}
        </p>
        <p>
          <strong>Total a receber:</strong> R${" "}
          {(dados.totalRegistrado - dados.totalRecebido).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
