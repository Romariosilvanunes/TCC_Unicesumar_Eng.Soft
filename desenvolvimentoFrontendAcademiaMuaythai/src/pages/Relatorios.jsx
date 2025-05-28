import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./Relatorios.css";

const COLORS = ["#de5d0c", "#ffa726", "#42a5f5", "#66bb6a", "#ab47bc"];

export default function Relatorios() {
  const [dados, setDados] = useState({
    alunos: 0,
    modalidades: 0,
    pagamentos: 0,
    totalRegistrado: 0,
    totalRecebido: 0,
  });

  const [grafAlunosPorModalidade, setGrafAlunosPorModalidade] = useState([]);
  const [grafPagPorStatus, setGrafPagPorStatus] = useState([]);
  const [grafPagPorMes, setGrafPagPorMes] = useState([]);

  useEffect(() => {
    /* ---------- coleta localStorage ---------- */
    const alunos = JSON.parse(localStorage.getItem("alunos")) || [];
    const modalidades = JSON.parse(localStorage.getItem("modalidades")) || [];
    const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];

    /* ---------- totais simples ---------- */
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

    /* ---------- gráfico 1: Alunos por Modalidade ---------- */
    const contagemModalidade = {};
    alunos.forEach((a) => {
      const m = a.modalidade || "Não informado";
      contagemModalidade[m] = (contagemModalidade[m] || 0) + 1;
    });
    setGrafAlunosPorModalidade(
      Object.entries(contagemModalidade).map(([mod, qt]) => ({
        name: mod,
        value: qt,
      }))
    );

    /* ---------- gráfico 2: Pagamentos por Status ---------- */
    const statusData = [
      {
        name: "Pago",
        value: pagamentos.filter((p) => p.status === "Pago").length,
      },
      {
        name: "Pendente",
        value: pagamentos.filter((p) => p.status === "Pendente").length,
      },
    ];
    setGrafPagPorStatus(statusData);

    /* ---------- gráfico 3: Valores por Mês (Pago × Pendente) ---------- */
    const porMes = {};
    pagamentos.forEach((p) => {
      const data = new Date(p.data || p.nascimento || Date.now()); // se tiver campo data
      const chaveMes = `${data.getFullYear()}-${String(
        data.getMonth() + 1
      ).padStart(2, "0")}`;

      porMes[chaveMes] = porMes[chaveMes] || {
        mes: chaveMes,
        Pago: 0,
        Pendente: 0,
      };
      porMes[chaveMes][p.status] += Number(p.valor);
    });
    setGrafPagPorMes(Object.values(porMes));
  }, []);

  return (
    <div className="relatorios-container">
      <h2>Relatórios Gerais</h2>

      {/* ---- cards numéricos ---- */}
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

      {/* ---- financeiro ---- */}
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

      {/* ---- gráfico alunos x modalidade ---- */}
      {grafAlunosPorModalidade.length > 0 && (
        <div className="grafico">
          <h3>Alunos por Modalidade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={grafAlunosPorModalidade}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
                dataKey="value"
              >
                {grafAlunosPorModalidade.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ---- gráfico pagamentos por status ---- */}
      {grafPagPorStatus.some((g) => g.value > 0) && (
        <div className="grafico">
          <h3>Pagamentos por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={grafPagPorStatus}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
                dataKey="value"
              >
                {grafPagPorStatus.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ---- gráfico valores por mês ---- */}
      {grafPagPorMes.length > 0 && (
        <div className="grafico">
          <h3>Valores por Mês (Pago × Pendente)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={grafPagPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Pago" stackId="a" fill="#66bb6a" />
              <Bar dataKey="Pendente" stackId="a" fill="#e57373" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
