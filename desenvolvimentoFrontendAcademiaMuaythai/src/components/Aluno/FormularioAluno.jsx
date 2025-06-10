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
    formaPagamento: "",
  });

  const [alunos, setAlunos] = useState(() => {
    const dadosSalvos = localStorage.getItem("alunos");
    return dadosSalvos ? JSON.parse(dadosSalvos) : [];
  });

  const [modalidades, setModalidades] = useState([]);
  const [indiceEdicao, setIndiceEdicao] = useState(null);

  // Recupera o array de responsáveis cadastrados ou inicia com array vazio
  const responsaveisRegistrados =
    JSON.parse(localStorage.getItem("responsaveis")) || [];

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem("modalidades")) || [];
    setModalidades(lista);
  }, [alunos]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleDiaSelecionado = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const novosDias = checked
        ? [...prev.diasSelecionados, value]
        : prev.diasSelecionados.filter((dia) => dia !== value);
      return { ...prev, diasSelecionados: novosDias };
    });
  };

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
      // Aluno menor de 18 precisa ter responsável selecionado ou cadastrado
      if (formData.nascimento && computeAge(formData.nascimento) < 18) {
        if (!formData.responsavel) {
          alert(
            "Para alunos menores de 18 anos, é obrigatório selecionar ou cadastrar um responsável."
          );
          return;
        }
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
      formaPagamento: "",
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
          responsaveisRegistrados.length > 0 ? (
            <select
              name="responsavel"
              value={formData.responsavel}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um responsável</option>
              {responsaveisRegistrados.map((resp, index) => (
                <option key={index} value={resp.nome}>
                  {resp.nome} ({resp.parentesco})
                </option>
              ))}
            </select>
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

        {/* NOVO CAMPO - Forma de Pagamento */}
        {formData.modalidade && (
          <div className="forma-pagamento">
            <label htmlFor="formaPagamento">Forma de Pagamento:</label>
            <select
              name="formaPagamento"
              id="formaPagamento"
              value={formData.formaPagamento}
              onChange={handleChange}
              required
            >
              <option value="">Selecione a forma de pagamento</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Pix">Pix</option>
              <option value="Cartão">Cartão</option>
            </select>
          </div>
        )}

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
