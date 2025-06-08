import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./FormularioAluno.css";

const FormularioAluno = () => {
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

  // Verifica se já há um responsável cadastrado (armazenado no localStorage)
  const responsavelRegistrado = localStorage.getItem("responsavel")
    ? JSON.parse(localStorage.getItem("responsavel"))
    : null;

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem("modalidades")) || [];
    setModalidades(lista);
  }, [alunos]);

  // Atualiza os dias e horários disponíveis conforme a modalidade selecionada
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

  // Atualiza os campos a partir dos inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Função para calcular a idade a partir da data de nascimento
  const computeAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const dob = new Date(birthDate);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Tratamento da seleção dos dias
  const handleDiaSelecionado = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const novosDias = checked
        ? [...prev.diasSelecionados, value]
        : prev.diasSelecionados.filter((dia) => dia !== value);
      return { ...prev, diasSelecionados: novosDias };
    });
  };

  // Tratamento da seleção dos horários e atualização do valor da mensalidade
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

  // Envia o formulário – se o aluno for menor de idade, exige que um responsável esteja cadastrado
  const handleSubmit = (e) => {
    e.preventDefault();
    let novaLista = [...alunos];

    if (indiceEdicao !== null) {
      novaLista[indiceEdicao] = formData;
      alert("Aluno atualizado com sucesso!");
    } else {
      // Se o aluno for menor de 18, verifica se há um responsável cadastrado
      if (formData.nascimento && computeAge(formData.nascimento) < 18) {
        if (!responsavelRegistrado) {
          alert(
            "Para alunos menores de 18 anos é obrigatório cadastrar um responsável."
          );
          return;
        }
        // Se o responsável já estiver cadastrado, atribui o nome dele automaticamente
        formData.responsavel = responsavelRegistrado.nome;
      }
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

        {formData.nascimento && computeAge(formData.nascimento) < 18 ? (
          responsavelRegistrado ? (
            <p className="responsavel-info">
              Responsável cadastrado: {responsavelRegistrado.nome}
            </p>
          ) : (
            <div className="responsavel-link-container">
              <p>Aluno menor de 18 anos. Cadastre o responsável:</p>
              <Link to="/responsavel" className="linkResponsavel">
                Cadastrar Responsável
              </Link>
            </div>
          )
        ) : (
          <input
            type="text"
            name="responsavel"
            placeholder="Responsável"
            value={formData.responsavel}
            onChange={handleChange}
          />
        )}

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
              {modalidades.find((m) => m.nome === formData.modalidade)
                ?.horarios &&
                Object.keys(
                  modalidades.find((m) => m.nome === formData.modalidade)
                    .horarios
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
                {modalidades.find((m) => m.nome === formData.modalidade)
                  ?.horarios[dia] &&
                  modalidades
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

        <p className="valor-mensalidade">
          <strong>Valor da Mensalidade:</strong> R$ {formData.valorMensalidade}
        </p>

        <button type="submit">
          {indiceEdicao !== null ? "Atualizar Aluno" : "Cadastrar Aluno"}
        </button>
      </form>
    </div>
  );
};

export default FormularioAluno;
