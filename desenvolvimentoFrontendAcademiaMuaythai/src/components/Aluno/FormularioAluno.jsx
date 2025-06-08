import React, { useState, useEffect } from "react";
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
    diasSelecionados: [],
    horariosSelecionados: {},
    valorMensalidade: 0,
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

  // Atualiza os dias e horários disponíveis com base na modalidade selecionada
  useEffect(() => {
    if (formData.modalidade) {
      const mod = modalidades.find((m) => m.nome === formData.modalidade);
      if (mod) {
        setFormData((prev) => ({
          ...prev,
          diasSelecionados: [],
          horariosSelecionados: {},
          valorMensalidade: 0,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        diasSelecionados: [],
        horariosSelecionados: {},
        valorMensalidade: 0,
      }));
    }
  }, [formData.modalidade, modalidades]);

  // Função unificada para atualizar os campos de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manipula a seleção dos dias
  const handleDiaSelecionado = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const novosDias = checked
        ? [...prev.diasSelecionados, value]
        : prev.diasSelecionados.filter((dia) => dia !== value);
      return { ...prev, diasSelecionados: novosDias };
    });
  };

  // Manipula a seleção de horários para cada dia e atualiza o valor da mensalidade
  const handleHorarioSelecionado = (e, dia) => {
    const { value, checked } = e.target;
    setFormData((prevState) => {
      const novosHorarios = { ...prevState.horariosSelecionados };

      if (checked) {
        if (!novosHorarios[dia]) {
          novosHorarios[dia] = [];
        }
        if (!novosHorarios[dia].includes(value)) {
          novosHorarios[dia].push(value);
        }
      } else {
        if (novosHorarios[dia]) {
          novosHorarios[dia] = novosHorarios[dia].filter(
            (horario) => horario !== value
          );
        }
      }

      const totalAulas = Object.values(novosHorarios).reduce(
        (acc, horarios) => acc + horarios.length,
        0
      );

      const mod = modalidades.find((m) => m.nome === prevState.modalidade);
      const regraPreco = mod?.precificacao.find(
        (p) => parseInt(p.quantidade, 10) === totalAulas
      );

      return {
        ...prevState,
        horariosSelecionados: novosHorarios,
        valorMensalidade: regraPreco ? regraPreco.valor : 0,
      };
    });
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
      diasSelecionados: [],
      horariosSelecionados: {},
      valorMensalidade: 0,
    });
    setIndiceEdicao(null);
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

        {formData.modalidade && (
          <>
            <fieldset className="info-modalidade">
              <legend>Horários Disponíveis</legend>
              {modalidades.find((m) => m.nome === formData.modalidade)
                ?.horarios &&
                Object.entries(
                  modalidades.find((m) => m.nome === formData.modalidade)
                    .horarios
                ).map(([dia, intervalos]) => (
                  <p key={dia}>
                    <strong>{dia}:</strong>{" "}
                    {intervalos
                      .map((i) => `${i.inicio} às ${i.fim}`)
                      .join(" / ")}
                  </p>
                ))}
            </fieldset>

            <fieldset className="dias-selecao">
              <legend>Selecione os dias da semana</legend>
              {Object.keys(
                modalidades.find((m) => m.nome === formData.modalidade).horarios
              ).map((dia) => (
                <label key={dia}>
                  <input
                    type="checkbox"
                    value={dia}
                    checked={formData.diasSelecionados.includes(dia)}
                    onChange={handleDiaSelecionado}
                  />{" "}
                  {dia}
                </label>
              ))}
            </fieldset>

            {formData.diasSelecionados.map((dia) => (
              <fieldset key={dia} className="horarios-selecao">
                <legend>Horários disponíveis para {dia}</legend>
                {modalidades
                  .find((m) => m.nome === formData.modalidade)
                  .horarios[dia].map((intervalo, index) => (
                    <label key={index}>
                      <input
                        type="checkbox"
                        value={`${intervalo.inicio}-${intervalo.fim}`}
                        onChange={(e) => handleHorarioSelecionado(e, dia)}
                      />{" "}
                      {intervalo.inicio} às {intervalo.fim}
                    </label>
                  ))}
              </fieldset>
            ))}
          </>
        )}

        <p>
          <strong>Valor da Mensalidade:</strong> R$ {formData.valorMensalidade}
        </p>

        <button type="submit">
          {indiceEdicao !== null ? "Atualizar Aluno" : "Cadastrar Aluno"}
        </button>
      </form>
    </div>
  );
};

export default AlunoCadastro;
