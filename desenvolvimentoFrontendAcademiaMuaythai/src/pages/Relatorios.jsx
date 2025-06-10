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
  // Dados gerais e filtros do painel
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
  const [tipoPagamento, setTipoPagamento] = useState("todos");

  // Modos do relatório
  // "resumo", "alunos", "pagamentos" ou "contasAPagar"
  const [reportMode, setReportMode] = useState("resumo");

  // Dados específicos
  const [alunosData, setAlunosData] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [contasAPagar, setContasAPagar] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Estados para relatório de contas a pagar interativo
  // Opções: "geral", "mes", "semana", "ano"
  const [contaReportType, setContaReportType] = useState("geral");
  // Status desejado: "pago" ou "pendente"
  const [contaStatus, setContaStatus] = useState("pago");
  // Para relatórios por mês: armazenamos o mês (em "MM") e o ano (em "YYYY")
  const [contaPeriodo, setContaPeriodo] = useState("");
  const [contaAno, setContaAno] = useState(String(new Date().getFullYear()));
  // Para a opção "semana", guardamos o número da semana (de 1 a 5)
  const [contaSemana, setContaSemana] = useState("1");

  // Retorna um array de anos para seleção (por exemplo, do ano atual-5 até o ano atual+1)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear - 5; y <= currentYear + 1; y++) {
      years.push(y);
    }
    return years;
  };

  useEffect(() => {
    // Recupera os dados do localStorage
    const alunos = JSON.parse(localStorage.getItem("alunos")) || [];
    const modalidades = JSON.parse(localStorage.getItem("modalidades")) || [];
    const pagamentosLocal = JSON.parse(localStorage.getItem("pagamentos")) || [];
    // Para contas a pagar, a chave é "contasPagar"
    const contasStorage = JSON.parse(localStorage.getItem("contasPagar")) || [];

    setAlunosData(alunos);
    setPagamentos(pagamentosLocal);
    setContasAPagar(contasStorage);

    const totalRegistrado = pagamentosLocal.reduce(
      (acc, p) => acc + Number(p.valor),
      0
    );
    const totalRecebido = pagamentosLocal
      .filter((p) => p.status === "Pago")
      .reduce((acc, p) => acc + Number(p.valor), 0);

    setDados({
      alunos: alunos.length,
      modalidades: modalidades.length,
      pagamentos: pagamentosLocal.length,
      totalRegistrado,
      totalRecebido,
    });

    // Gráfico: Alunos por Modalidade
    const contagem = alunos.reduce((acc, a) => {
      const mod = a.modalidade || "Não informado";
      acc[mod] = (acc[mod] || 0) + 1;
      return acc;
    }, {});
    setGrafAlunosPorModalidade(
      Object.entries(contagem).map(([name, value]) => ({ name, value }))
    );

    // Gráfico: Pagamentos por Status
    setGrafPagPorStatus([
      { name: "Pago", value: pagamentosLocal.filter((p) => p.status === "Pago").length },
      { name: "Pendente", value: pagamentosLocal.filter((p) => p.status === "Pendente").length },
    ]);

    // Gráfico: Valores por Mês (Pago x Pendente)
    const porMes = pagamentosLocal.reduce((acc, p) => {
      const d = new Date(p.data || Date.now());
      const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!acc[chave]) {
        acc[chave] = { mes: chave, Pago: 0, Pendente: 0 };
      }
      acc[chave][p.status] += Number(p.valor);
      return acc;
    }, {});
    setGrafPagPorMes(Object.values(porMes));
  }, []);

  // Funções de manipulação de pagamentos (todos os módulos de pagamentos)
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

  const gerarPDFPagamentosRecebidos = () => {
    const recebidos = pagamentos.filter((p) => p.status === "Pago");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório de Pagamentos Recebidos", 20, 20);
    const body = recebidos.map((p) => [
      p.aluno || "-",
      `R$ ${Number(p.valor).toFixed(2)}`,
      p.status,
    ]);
    doc.autoTable({
      head: [["Aluno", "Valor", "Status"]],
      body,
      startY: 30,
      styles: { halign: "center" },
      headStyles: { fillColor: [222, 93, 12] },
    });
    const totalRecebido = recebidos.reduce((acc, p) => acc + Number(p.valor), 0);
    doc.text(`Total Recebido: R$ ${totalRecebido.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 10);
    doc.save("relatorio_pagamentos_recebidos.pdf");
  };

  const gerarPDFPagamentosPendentes = () => {
    const pendentes = pagamentos.filter((p) => p.status === "Pendente");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório de Pagamentos Pendentes", 20, 20);
    const body = pendentes.map((p) => [
      p.aluno || "-",
      `R$ ${Number(p.valor).toFixed(2)}`,
      p.status,
    ]);
    doc.autoTable({
      head: [["Aluno", "Valor", "Status"]],
      body,
      startY: 30,
      styles: { halign: "center" },
      headStyles: { fillColor: [222, 93, 12] },
    });
    const totalPendentes = pendentes.reduce((acc, p) => acc + Number(p.valor), 0);
    doc.text(`Total Pendente: R$ ${totalPendentes.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 10);
    doc.save("relatorio_pagamentos_pendentes.pdf");
  };

  const gerarPDFAluno = (aluno) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Detalhes do Aluno", 20, 20);
    let y = 30;
    doc.setFontSize(12);
    doc.text(`Nome: ${aluno.nome || "-"}`, 20, y); y += 10;
    doc.text(`Nascimento: ${aluno.nascimento || "-"}`, 20, y); y += 10;
    doc.text(`CPF: ${aluno.cpf || "-"}`, 20, y); y += 10;
    doc.text(`Endereço: ${aluno.endereco || "-"}`, 20, y); y += 10;
    doc.text(`Responsável: ${aluno.responsavel || "-"}`, 20, y); y += 10;
    doc.text(`Graduação: ${aluno.graduacao || "-"}`, 20, y); y += 10;
    doc.text(`Modalidade: ${aluno.modalidade || "-"}`, 20, y); y += 10;
    doc.text(`Mensalidade: R$ ${Number(aluno.valorMensalidade).toFixed(2)}`, 20, y); y += 10;
    doc.text(`Forma de Pagamento: ${aluno.formaPagamento || "-"}`, 20, y); y += 10;
    const horariosStr = 
      aluno.diasSelecionados && aluno.diasSelecionados.length > 0
        ? aluno.diasSelecionados
            .map((dia) => {
              const horarios = aluno.horariosSelecionados && aluno.horariosSelecionados[dia];
              return `${dia}: ${horarios ? horarios.join(", ") : "-"}`;
            })
            .join(" | ")
        : "-";
    doc.text(`Horários: ${horariosStr}`, 20, y);
    doc.save(`relatorio_${aluno.nome}.pdf`);
  };

  const gerarPDFContasAPagar = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório de Contas a Pagar (Geral)", 20, 20);
    const body = contasAPagar.map((c) => [
      c.descricao || "-",
      `R$ ${Number(c.valor).toFixed(2)}`,
      c.vencimento || "-",
      c.status || "-"
    ]);
    doc.autoTable({
      head: [["Descrição", "Valor", "Vencimento", "Status"]],
      body,
      startY: 30,
      styles: { halign: "center" },
      headStyles: { fillColor: [222, 93, 12] },
    });
    const total = contasAPagar.reduce((acc, c) => acc + Number(c.valor), 0);
    const pagas = contasAPagar.filter((c) => c.status.toLowerCase() === "pago").reduce((acc, c) => acc + Number(c.valor), 0);
    const aPagar = total - pagas;
    doc.text(`Total: R$ ${total.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 10);
    doc.text(`Pagas: R$ ${pagas.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 20);
    doc.text(`A Pagar: R$ ${aPagar.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 30);
    doc.save("relatorio_contas_a_pagar.pdf");
  };

  // Função central para gerar o relatório de contas a pagar agrupadas (por mês, semana ou ano)
  const handleGerarPDFContaRelatorio = () => {
    let filtered = [];
    if (contaReportType === "geral") {
      if (!contasAPagar.length) {
        alert("Nenhuma conta cadastrada.");
        return;
      }
      gerarPDFContasAPagar();
      return;
    } else if (contaReportType === "mes") {
      if (!contaAno || !contaPeriodo) {
        alert("Selecione mês e ano.");
        return;
      }
      // Filtra contas cujo vencimento (substring 0-7) corresponda a "YYYY-MM" e que tenham o status desejado
      filtered = contasAPagar.filter((c) => {
        if (!c.vencimento) return false;
        return c.vencimento.substring(0, 7) === `${contaAno}-${contaPeriodo}`
               && c.status.toLowerCase() === contaStatus;
      });
    } else if (contaReportType === "semana") {
      if (!contaAno || !contaPeriodo || !contaSemana) {
        alert("Selecione mês, ano e semana.");
        return;
      }
      const semana = Number(contaSemana);
      const startDay = (semana - 1) * 7 + 1;
      const endDay = semana * 7;
      filtered = contasAPagar.filter((c) => {
        if (!c.vencimento) return false;
        const year = c.vencimento.substring(0, 4);
        const month = c.vencimento.substring(5, 7);
        const day = Number(c.vencimento.substring(8, 10));
        return year === String(contaAno) && month === contaPeriodo && day >= startDay && day <= endDay
               && c.status.toLowerCase() === contaStatus;
      });
    } else if (contaReportType === "ano") {
      if (!contaAno) {
        alert("Selecione o ano.");
        return;
      }
      filtered = contasAPagar.filter((c) => {
        if (!c.vencimento) return false;
        return c.vencimento.substring(0, 4) === String(contaAno)
               && c.status.toLowerCase() === contaStatus;
      });
    }
    if (filtered.length === 0) {
      alert("Nenhuma conta encontrada para o período selecionado.");
      return;
    }
    // Gera o PDF com os dados filtrados
    const doc = new jsPDF();
    let title = "Relatório de Contas";
    if (contaReportType === "mes") {
      title += ` - ${contaStatus === "pago" ? "Pagas" : "Pendentes"} - Mês: ${contaAno}-${contaPeriodo}`;
    } else if (contaReportType === "semana") {
      title += ` - ${contaStatus === "pago" ? "Pagas" : "Pendentes"} - Semana ${contaSemana} do Mês: ${contaAno}-${contaPeriodo}`;
    } else if (contaReportType === "ano") {
      title += ` - ${contaStatus === "pago" ? "Pagas" : "Pendentes"} - Ano: ${contaAno}`;
    }
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    const body = filtered.map((c) => [
      c.descricao || "-",
      `R$ ${Number(c.valor).toFixed(2)}`,
      c.vencimento || "-",
      c.status || "-"
    ]);
    doc.autoTable({
      head: [["Descrição", "Valor", "Vencimento", "Status"]],
      body,
      startY: 30,
      styles: { halign: "center" },
      headStyles: { fillColor: [222, 93, 12] },
      margin: { left: 20, right: 20 }
    });
    const total = filtered.reduce((acc, c) => acc + Number(c.valor), 0);
    doc.text(`Total: R$ ${total.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 10);
    doc.save(`relatorio_contas_${contaReportType}_${contaStatus}_${contaAno}_${contaPeriodo}_${contaSemana}.pdf`);
  };

  return (
    <div className="relatorios-container">
      <h2>Relatórios Interativos</h2>
      <div className="menu-relatorios">
        <button onClick={() => setReportMode("resumo")} className={reportMode === "resumo" ? "active" : ""}>
          Resumo Geral
        </button>
        <button
          onClick={() => {
            setReportMode("alunos");
            setSelectedStudent(null);
          }}
          className={reportMode === "alunos" ? "active" : ""}
        >
          Relatório de Alunos
        </button>
        <button onClick={() => setReportMode("pagamentos")} className={reportMode === "pagamentos" ? "active" : ""}>
          Relatório de Pagamentos
        </button>
        <button onClick={() => setReportMode("contasAPagar")} className={reportMode === "contasAPagar" ? "active" : ""}>
          Relatório de Contas a Pagar
        </button>
      </div>

      {reportMode === "resumo" && (
        <>
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
            <p><strong>Total registrado:</strong> R$ {dados.totalRegistrado.toFixed(2)}</p>
            <p><strong>Total recebido:</strong> R$ {dados.totalRecebido.toFixed(2)}</p>
            <p>
              <strong>Total a receber:</strong> R$ {(dados.totalRegistrado - dados.totalRecebido).toFixed(2)}
            </p>
          </div>
        </>
      )}

      {reportMode === "alunos" && (
        <div className="relatorio-alunos">
          <div className="alunos-container">
            <div className="alunos-list">
              {alunosData.length ? (
                <ul>
                  {alunosData.map((aluno, i) => (
                    <li
                      key={i}
                      onClick={() => setSelectedStudent(aluno)}
                      className={selectedStudent && selectedStudent.cpf === aluno.cpf ? "active" : ""}
                    >
                      {aluno.nome}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum aluno cadastrado.</p>
              )}
            </div>
            <div className="aluno-detalhe">
              {selectedStudent ? (
                <div className="detalhe-content">
                  <h4>Detalhes do Aluno</h4>
                  <p><strong>Nome:</strong> {selectedStudent.nome}</p>
                  <p><strong>Nascimento:</strong> {selectedStudent.nascimento}</p>
                  <p><strong>CPF:</strong> {selectedStudent.cpf}</p>
                  <p><strong>Endereço:</strong> {selectedStudent.endereco}</p>
                  <p><strong>Responsável:</strong> {selectedStudent.responsavel}</p>
                  <p><strong>Graduação:</strong> {selectedStudent.graduacao}</p>
                  <p><strong>Modalidade:</strong> {selectedStudent.modalidade}</p>
                  <p><strong>Mensalidade:</strong> R$ {Number(selectedStudent.valorMensalidade).toFixed(2)}</p>
                  <p><strong>Forma de Pagamento:</strong> {selectedStudent.formaPagamento}</p>
                  <div className="detalhe-horarios">
                    <strong>Horários:</strong>
                    {selectedStudent.diasSelecionados && selectedStudent.diasSelecionados.length ? (
                      selectedStudent.diasSelecionados.map((dia) => {
                        const horarios =
                          selectedStudent.horariosSelecionados && selectedStudent.horariosSelecionados[dia];
                        return (
                          <div key={dia}>
                            {dia}: {horarios ? horarios.join(", ") : "-"}
                          </div>
                        );
                      })
                    ) : (
                      <p>-</p>
                    )}
                  </div>
                  <button className="btn-pdf" onClick={() => gerarPDFAluno(selectedStudent)}>
                    Exportar PDF
                  </button>
                </div>
              ) : (
                <div className="aluno-detalhe-placeholder">
                  <p>Selecione um aluno para ver os detalhes.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {reportMode === "pagamentos" && (
        <div className="relatorio-pagamentos">
          <h3>Relatório de Pagamentos</h3>
          <div className="botoes-pagamentos">
            <button className="btn-pdf" onClick={gerarPDFPagamentosRecebidos}>
              Exportar PDF - Recebidos
            </button>
            <button className="btn-pdf" onClick={gerarPDFPagamentosPendentes}>
              Exportar PDF - Pendentes
            </button>
          </div>
          <ul className="lista-pagamentos">
            {pagamentos.length === 0 ? (
              <p>Nenhum pagamento registrado.</p>
            ) : (
              pagamentos.map((p, index) => (
                <li key={index} className={p.status === "Pago" ? "pago" : "pendente"}>
                  <div className="info-pagamento">
                    <strong>{p.aluno}</strong> - R$ {p.valor} ({p.status})
                  </div>
                  <div className="acoes-pagamento">
                    {p.status === "Pendente" && (
                      <button className="btn-marcar" onClick={() => marcarComoPago(index)}>
                        Marcar como Pago
                      </button>
                    )}
                    <button className="btn-excluir" onClick={() => excluirPagamento(index)}>
                      Excluir
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {reportMode === "contasAPagar" && (
        <div className="relatorio-contas-pagar">
          <h3>Relatório de Contas a Pagar</h3>
          <div className="opcoes-relatorio">
            <h4>Opções de Relatório</h4>
            <div className="opcoes-buttons">
              <button onClick={() => setContaReportType("geral")}
                className={contaReportType === "geral" ? "active" : ""}>
                Geral
              </button>
              <button onClick={() => setContaReportType("mes")}
                className={contaReportType === "mes" ? "active" : ""}>
                Por Mês
              </button>
              <button onClick={() => setContaReportType("semana")}
                className={contaReportType === "semana" ? "active" : ""}>
                Por Semana
              </button>
              <button onClick={() => setContaReportType("ano")}
                className={contaReportType === "ano" ? "active" : ""}>
                Por Ano
              </button>
            </div>
            <div className="opcoes-status">
              <span>Status: </span>
              <label>
                <input type="radio" value="pago" checked={contaStatus === "pago"} onChange={(e) => setContaStatus(e.target.value)} />
                Pagas
              </label>
              <label>
                <input type="radio" value="pendente" checked={contaStatus === "pendente"} onChange={(e) => setContaStatus(e.target.value)} />
                Pendentes
              </label>
            </div>
            {contaReportType === "mes" && (
              <div className="opcoes-periodo">
                <span>Selecione o Mês:</span>
                <select value={contaPeriodo} onChange={(e) => setContaPeriodo(e.target.value)}>
                  {Array.from(new Array(12), (v, i) => {
                    const month = String(i + 1).padStart(2, "0");
                    return <option key={i} value={month}>{month}</option>;
                  })}
                </select>
                <div className="opcoes-ano">
                  <span>Selecione o Ano:</span>
                  <select value={contaAno} onChange={(e) => setContaAno(e.target.value)}>
                    {getYearOptions().map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {contaReportType === "semana" && (
              <div className="opcoes-periodo">
                <span>Selecione o Mês:</span>
                <select value={contaPeriodo} onChange={(e) => setContaPeriodo(e.target.value)}>
                  {Array.from(new Array(12), (v, i) => {
                    const month = String(i + 1).padStart(2, "0");
                    return <option key={i} value={month}>{month}</option>;
                  })}
                </select>
                <div className="opcoes-ano">
                  <span>Selecione o Ano:</span>
                  <select value={contaAno} onChange={(e) => setContaAno(e.target.value)}>
                    {getYearOptions().map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="opcoes-semana">
                  <span>Selecione a Semana:</span>
                  <select value={contaSemana} onChange={(e) => setContaSemana(e.target.value)}>
                    <option value="1">Semana 1 (1-7)</option>
                    <option value="2">Semana 2 (8-14)</option>
                    <option value="3">Semana 3 (15-21)</option>
                    <option value="4">Semana 4 (22-28)</option>
                    <option value="5">Semana 5 (29-31)</option>
                  </select>
                </div>
              </div>
            )}
            {contaReportType === "ano" && (
              <div className="opcoes-periodo">
                <span>Selecione o Ano:</span>
                <select value={contaAno} onChange={(e) => setContaAno(e.target.value)}>
                  {getYearOptions().map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
            <button className="btn-pdf" onClick={handleGerarPDFContaRelatorio}>
              Gerar Relatório
            </button>
          </div>
          {contaReportType === "geral" && (
            <>
              <table className="table-contasPagar">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Vencimento</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contasAPagar.map((c, i) => (
                    <tr key={i}>
                      <td>{c.descricao || "-"}</td>
                      <td>R$ {Number(c.valor).toFixed(2)}</td>
                      <td>{c.vencimento || "-"}</td>
                      <td>{c.status || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="btn-pdf" onClick={gerarPDFContasAPagar}>
                Exportar PDF Contas a Pagar (Geral)
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
