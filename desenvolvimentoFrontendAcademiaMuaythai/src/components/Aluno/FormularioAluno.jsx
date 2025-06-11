import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FormularioAluno.css";

const initialFormData = {
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
};

const FormularioAluno = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [alunos, setAlunos] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [indiceEdicao, setIndiceEdicao] = useState(null);

  const navigate = useNavigate();

  // Carrega os alunos salvos
  useEffect(() => {
    const salvos = JSON.parse(localStorage.getItem("alunos")) || [];
    setAlunos(salvos);
  }, []);

  // Carrega os responsáveis cadastrados
  useEffect(() => {
    const dadosResp = JSON.parse(localStorage.getItem("responsaveis")) || [];
    setResponsaveis(dadosResp);
  }, []);

  // Recupera os dados temporários do aluno (quando redirecionou para cadastro de responsável)
  useEffect(() => {
    const tempData = localStorage.getItem("formDataTemp");
    if (tempData) {
      setFormData(JSON.parse(tempData));
      localStorage.removeItem("formDataTemp");
    }
  }, []);

  // Se houver um novo responsável cadastrado, preenche automaticamente o campo
  useEffect(() => {
    const novoResp = localStorage.getItem("novoResponsavel");
    if (novoResp && !formData.responsavel) {
      const dadosResponsavel = JSON.parse(novoResp);
      setFormData((prev) => ({
        ...prev,
        responsavel: `${dadosResponsavel.nome} (${dadosResponsavel.parentesco})`,
      }));
      localStorage.removeItem("novoResponsavel");
    }
  }, [formData]);

  // Carrega também as modalidades armazenadas (ajuste conforme sua lógica)
  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem("modalidades")) || [];
    setModalidades(lista);
  }, []);

  // Sempre que a modalidade mudar, reseta os campos relacionados
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

  // Gerencia a seleção dos dias
  const handleDiaSelecionado = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const novosDias = checked
        ? [...prev.diasSelecionados, value]
        : prev.diasSelecionados.filter((dia) => dia !== value);
      return { ...prev, diasSelecionados: novosDias };
    });
  };

  // Gerencia a seleção dos horários por dia e recalcula o valor da mensalidade
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

  // Função para redirecionar para o cadastro de responsável
  const handleRedirectResponsavel = () => {
    localStorage.setItem("formDataTemp", JSON.stringify(formData));
    navigate("/dashboard/cadastro-responsavel");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submete o formulário: atualiza em modo de edição ou adiciona um novo aluno
  const handleSubmit = (e) => {
    e.preventDefault();
    let novaLista = [...alunos];
    if (indiceEdicao !== null) {
      novaLista[indiceEdicao] = formData;
      alert("Aluno atualizado com sucesso!");
    } else {
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
    setFormData(initialFormData);
    setIndiceEdicao(null);
  };

  // Funções para editar e excluir alunos
  const editarAluno = (index) => {
    const alunoEditado = alunos[index];
    setFormData(alunoEditado);
    setIndiceEdicao(index);
  };

  const excluirAluno = (index) => {
    const novaLista = [...alunos];
    novaLista.splice(index, 1);
    setAlunos(novaLista);
    localStorage.setItem("alunos", JSON.stringify(novaLista));
  };

  // Seleciona a modalidade atual para exibir horários/dias
  const modalidadeSelecionada = modalidades.find(
    (m) => m.nome === formData.modalidade
  );

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

        {/* Se o aluno for menor de 18 */}
        {formData.nascimento && computeAge(formData.nascimento) < 18 ? (
          <>
            {formData.responsavel ? (
              <div className="responsavel-preenchido">
                <p>
                  Responsável: <strong>{formData.responsavel}</strong>
                </p>
                <button type="button" onClick={handleRedirectResponsavel}>
                  Cadastrar Novo Responsável
                </button>
              </div>
            ) : (
              <>
                <select
                  name="responsavel"
                  value={formData.responsavel}
                  onChange={(e) =>
                    setFormData({ ...formData, responsavel: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione um responsável</option>
                  {responsaveis.map((resp, index) => (
                    <option
                      key={index}
                      value={`${resp.nome} (${resp.parentesco})`}
                    >
                      {resp.nome} ({resp.parentesco})
                    </option>
                  ))}
                </select>
                <button type="button" onClick={handleRedirectResponsavel}>
                  Cadastrar Responsável
                </button>
              </>
            )}
          </>
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
            <fieldset className="info-modalidade">
              <legend>Horários Disponíveis</legend>
              {modalidadeSelecionada?.horarios &&
                Object.entries(modalidadeSelecionada.horarios).map(
                  ([dia, intervalos]) => (
                    <p key={dia}>
                      <strong>{dia}:</strong>{" "}
                      {intervalos
                        .map((i) => `${i.inicio} às ${i.fim}`)
                        .join(" / ")}
                    </p>
                  )
                )}
            </fieldset>
            <fieldset className="dias-selecao">
              <legend>Selecione os dias da semana</legend>
              {modalidadeSelecionada?.horarios &&
                Object.keys(modalidadeSelecionada.horarios).map((dia) => (
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
                {modalidadeSelecionada?.horarios[dia] &&
                  modalidadeSelecionada.horarios[dia].map(
                    (intervalo, index) => (
                      <label key={index}>
                        <input
                          type="checkbox"
                          value={`${intervalo.inicio}-${intervalo.fim}`}
                          onChange={(e) => handleHorarioSelecionado(e, dia)}
                        />{" "}
                        {intervalo.inicio} às {intervalo.fim}
                      </label>
                    )
                  )}
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

      {/* Listagem dos alunos com botões de editar e excluir */}
      <div className="lista-alunos">
        <h3>Alunos Cadastrados</h3>
        {alunos.length === 0 ? (
          <p>Nenhum aluno cadastrado.</p>
        ) : (
          <ul>
            {alunos.map((aluno, index) => (
              <li key={index}>
                {aluno.nome} - {aluno.cpf}{" "}
                <button onClick={() => editarAluno(index)}>Editar</button>{" "}
                <button onClick={() => excluirAluno(index)}>Excluir</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FormularioAluno;
