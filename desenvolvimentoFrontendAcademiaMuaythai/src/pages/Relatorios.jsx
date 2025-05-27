import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./Relatorios.css";

const COLORS = ["#de5d0c", "#ffa726", "#42a5f5", "#66bb6a", "#ab47bc"];

export default function Relatorios() {
  const [dados, setDados] = useState({
    alunos: 0,
    modalidades: 0,
    pagamentos: 0,
    totalRecebido: 0,
    totalRegistrado: 0,
  });

  const [dadosGrafico, setDadosGrafico] = useState([]);

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

    // Agrupar por modalidade
    const contagemPorModalidade = {};
    alunos.forEach((aluno) => {
      const mod = aluno.modalidade || "Não informado";
      contagemPorModalidade[mod] = (contagemPorModalidade[mod] || 0) + 1;
    });

    const dadosGrafico = Object.entries(contagemPorModalidade).map(
      ([modalidade, quantidade]) => ({
        name: modalidade,
        value: quantidade,
      })
    );

    setDados({
      alunos: alunos.length,
      modalidades: modalidades.length,
      pagamentos: pagamentos.length,
      totalRegistrado,
      totalRecebido,
    });

    setDadosGrafico(dadosGrafico);
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

      {dadosGrafico.length > 0 && (
        <div className="grafico">
          <h3>Distribuição de Alunos por Modalidade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosGrafico}
                cx="50%"
                cy="50%"
                label
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosGrafico.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
