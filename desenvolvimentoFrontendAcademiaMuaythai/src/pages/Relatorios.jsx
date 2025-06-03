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
import jsPDF from "jspdf";
import "jspdf-autotable";
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

  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroModalidade, setFiltroModalidade] = useState("todas");
  const [filtroMes, setFiltroMes] = useState("todos");

  const [listaModalidades, setListaModalidades] = useState([]);
  const [listaMeses, setListaMeses] = useState([]);

  useEffect(() => {
    const alunos = JSON.parse(localStorage.getItem("alunos")) || [];
    const modalidades = JSON.parse(localStorage.getItem("modalidades")) || [];
    const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];

    const totalRegistrado = pagamentos.reduce((s, p) => s + Number(p.valor), 0);
    const totalRecebido = pagamentos
      .filter((p) => p.status === "Pago")
      .reduce((s, p) => s + Number(p.valor), 0);

    setDados({
      alunos: alunos.length,
      modalidades: modalidades.length,
      pagamentos: pagamentos.length,
      totalRegistrado,
      totalRecebido,
    });

    const modalSet = new Set(alunos.map((a) => a.modalidade || "-").filter(Boolean));
    setListaModalidades(["todas", ...Array.from(modalSet)]);

    const mesesSet = new Set();
    pagamentos.forEach((p) => {
      const d = new Date(p.data || Date.now());
      const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      mesesSet.add(chave);
    });
    setListaMeses(["todos", ...Array.from(mesesSet)]);

    const contagem = {};
    alunos.forEach((a) => {
      const m = a.modalidade || "Não informado";
      contagem[m] = (contagem[m] || 0) + 1;
    });
    setGrafAlunosPorModalidade(
      Object.entries(contagem).map(([name, value]) => ({ name, value }))
    );

    setGrafPagPorStatus([
      { name: "Pago", value: pagamentos.filter((p) => p.status === "Pago").length },
      { name: "Pendente", value: pagamentos.filter((p) => p.status === "Pendente").length },
    ]);

    const porMes = {};
    pagamentos.forEach((p) => {
      const d = new Date(p.data || Date.now());
      const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      porMes[chave] = porMes[chave] || { mes: chave, Pago: 0, Pendente: 0 };
      porMes[chave][p.status] += Number(p.valor);
    });
    setGrafPagPorMes(Object.values(porMes));
  }, []);

  const gerarPDF = () => {
    const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];

    const filtrados = pagamentos.filter((p) => {
      const statusOk = filtroStatus === "todos" || p.status.toLowerCase() === filtroStatus;
      const modalidadeOk = filtroModalidade === "todas" || p.modalidade === filtroModalidade;
      const d = new Date(p.data || Date.now());
      const mesRef = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const mesOk = filtroMes === "todos" || mesRef === filtroMes;
      return statusOk && modalidadeOk && mesOk;
    });

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório Financeiro - Academia MuayThai", 20, 20);

    const body = filtrados.map((p) => [
      p.nome || "-",
      p.modalidade || "-",
      `R$ ${Number(p.valor).toFixed(2)}`,
      p.status,
    ]);

    doc.autoTable({
      head: [["Aluno", "Modalidade", "Valor", "Status"]],
      body,
      startY: 30,
      styles: { halign: "center" },
      headStyles: { fillColor: [222, 93, 12] },
    });

    const total = filtrados.reduce((s, p) => s + Number(p.valor), 0);
    const recebido = filtrados
      .filter((p) => p.status === "Pago")
      .reduce((s, p) => s + Number(p.valor), 0);
    const inadimplente = total - recebido;

    doc.text(`Total Registrado: R$ ${total.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 10);
    doc.text(`Total Recebido:   R$ ${recebido.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 20);
    doc.text(`Inadimplente:     R$ ${inadimplente.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 30);

    doc.save("relatorio-financeiro.pdf");
  };

  return (
    <div className="relatorios-container">
      <h2>Relatórios Gerais</h2>

      <div className="cards">
        <div className="card"><h3>Alunos</h3><p>{dados.alunos}</p></div>
        <div className="card"><h3>Modalidades</h3><p>{dados.modalidades}</p></div>
        <div className="card"><h3>Pagamentos</h3><p>{dados.pagamentos}</p></div>
      </div>

      <div className="financeiro">
        <h3>Financeiro</h3>
        <p><strong>Total registrado:</strong> R$ {dados.totalRegistrado.toFixed(2)}</p>
        <p><strong>Total recebido:</strong> R$ {dados.totalRecebido.toFixed(2)}</p>
        <p><strong>Total a receber:</strong> R$ {(dados.totalRegistrado - dados.totalRecebido).toFixed(2)}</p>
      </div>

      <div className="filtros-wrapper">
        <select className="filtro-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="todos">Status: Todos</option>
          <option value="pago">Status: Pago</option>
          <option value="pendente">Status: Pendente</option>
        </select>
        <select className="filtro-select" value={filtroModalidade} onChange={(e) => setFiltroModalidade(e.target.value)}>
          {listaModalidades.map((m) => (
            <option key={m} value={m}>{`Modalidade: ${m}`}</option>
          ))}
        </select>
        <select className="filtro-select" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
          {listaMeses.map((m) => (
            <option key={m} value={m}>{`Mês: ${m}`}</option>
          ))}
        </select>
      </div>

      <button className="btn-pdf" onClick={gerarPDF}>Exportar PDF</button>

      {/* Gráfico Alunos por Modalidade */}
      {grafAlunosPorModalidade.length > 0 && (
        <div className="grafico">
          <h3>Alunos por Modalidade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={grafAlunosPorModalidade} cx="50%" cy="50%" outerRadius={100} label dataKey="value">
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

      {/* Gráfico Pagamentos por Status */}
      {grafPagPorStatus.some((g) => g.value > 0) && (
        <div className="grafico">
          <h3>Pagamentos por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={grafPagPorStatus} cx="50%" cy="50%" outerRadius={100} label dataKey="value">
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

      {/* Gráfico por Mês */}
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
