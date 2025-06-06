import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "./FormularioAluno.css";

const AlunoCadastro = () => {
  const [formData, setFormData] = useState({
    nome: "",
    nascimento: "",
    cpf: "",
    endereco: "",
    responsavel: "",
    graduacao: "",
    modalidade: "",
    // Esses campos serão usados apenas para exibição, pois os horários vêm da modalidade
    infoHorarios: [], 
  });

  const [alunos, setAlunos] = useState(() => {
    const dadosSalvos = localStorage.getItem("alunos");
    return dadosSalvos ? JSON.parse(dadosSalvos) : [];
  });

  const [modalidades, setModalidades] = useState([]);
  const [indiceEdicao, setIndiceEdicao] = useState(null);

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem("modalidades")) || [];
    setModalidades(lista);
  }, [alunos]);

  // Atualiza a exibição dos horários com base na modalidade selecionada
  useEffect(() => {
    if (formData.modalidade) {
      const mod = modalidades.find((m) => m.nome === formData.modalidade);
      if (mod) {
        // A nova estrutura possui "horarios" sendo um objeto 
        // em que cada chave é um dia e o valor é um array de intervalos
        const displayHorarios = Object.entries(mod.horarios).map(([day, intervals]) => {
          const intervalsStr = intervals
            .map((i) => `${i.inicio} às ${i.fim}`)
            .join(" / ");
          return `${day}: ${intervalsStr}`;
        });
        setFormData((prev) => ({
          ...prev,
          infoHorarios: displayHorarios,
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, infoHorarios: [] }));
    }
  }, [formData.modalidade, modalidades]);

  // Removemos "type" da desestruturação, pois não está sendo usado
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Se os campos de horário vierem da modalidade, eles não devem ser editáveis
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let novaLista = [...alunos];

    if (indiceEdicao !== null) {
      novaLista[indiceEdicao] = formData;
      alert("Aluno atualizado com sucesso!");
    } else {
      novaLista.push(formData);
      alert("Aluno cadastrado com sucesso!");
    }

    setAlunos(novaLista);
    localStorage.setItem("alunos", JSON.stringify(novaLista));

    setFormData({
      nome: "",
      nascimento: "",
      cpf: "",
      endereco: "",
      responsavel: "",
      graduacao: "",
      modalidade: "",
      infoHorarios: [],
    });
    setIndiceEdicao(null);
  };

  const excluirAluno = (index) => {
    const novaLista = [...alunos];
    novaLista.splice(index, 1);
    setAlunos(novaLista);
    localStorage.setItem("alunos", JSON.stringify(novaLista));
  };

  const editarAluno = (index) => {
    setFormData(alunos[index]);
    setIndiceEdicao(index);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Alunos Cadastrados", 14, 16);

    const dadosTabela = alunos.map((a) => [
      a.nome,
      a.modalidade,
      a.infoHorarios.join(", "),
    ]);

    doc.autoTable({
      head: [["Nome", "Modalidade", "Horários"]],
      body: dadosTabela,
      startY: 20,
    });

    doc.save("relatorio_alunos.pdf");
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
          {modalidades.map((m, index) => (
            <option key={index} value={m.nome}>
              {m.nome}
            </option>
          ))}
        </select>

        {/* Exibe as informações da modalidade selecionada */}
        {formData.modalidade && formData.infoHorarios.length > 0 && (
          <div className="info-modalidade">
            <p>
              <strong>Horários Disponíveis:</strong>
            </p>
            <ul>
              {formData.infoHorarios.map((inf, idx) => (
                <li key={idx}>{inf}</li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit">
          {indiceEdicao !== null ? "Atualizar Aluno" : "Cadastrar Aluno"}
        </button>
      </form>

      <div className="lista-alunos">
        <h3>Alunos Cadastrados</h3>
        {alunos.length === 0 ? (
          <p>Nenhum aluno cadastrado ainda.</p>
        ) : (
          <>
            <ul>
              {alunos.map((aluno, index) => (
                <li key={index}>
                  <span>
                    <strong>{aluno.nome}</strong> — {aluno.modalidade}
                  </span>
                  <div>
                    <button onClick={() => editarAluno(index)}>Editar</button>
                    <button onClick={() => excluirAluno(index)}>Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
            <button onClick={exportarPDF} className="exportar-pdf">
              Exportar PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AlunoCadastro;

