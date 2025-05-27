import React, { useState } from "react";
import { Link } from "react-router-dom";
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
    dias: [],
    horario: "",
  });

  const [alunos, setAlunos] = useState(() => {
    const dadosSalvos = localStorage.getItem("alunos");
    return dadosSalvos ? JSON.parse(dadosSalvos) : [];
  });

  const [indiceEdicao, setIndiceEdicao] = useState(null); // novo estado

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "dias") {
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
      dias: [],
      horario: "",
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
    const alunoSelecionado = alunos[index];
    setFormData(alunoSelecionado);
    setIndiceEdicao(index);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Alunos Cadastrados", 14, 16);

    const dadosTabela = alunos.map((a) => [
      a.nome,
      a.modalidade,
      a.horario,
      a.dias.join(", "),
    ]);

    doc.autoTable({
      head: [["Nome", "Modalidade", "Horário", "Dias"]],
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
                type="checkbox"
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

        <button type="submit">
          {indiceEdicao !== null ? "Atualizar Aluno" : "Cadastrar Aluno"}
        </button>
        <Link to="/">Voltar ao Login</Link>
      </form>

      {/* LISTAGEM DOS ALUNOS */}
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
                    <strong>{aluno.nome}</strong> — {aluno.modalidade} às{" "}
                    {aluno.horario}
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
