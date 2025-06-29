import React, { useState, useEffect } from "react";
import "./Modalidade.css";

export default function Modalidades() {
  // Estrutura da modalidade:
  // - nome: string
  // - horarios: objeto em que cada chave (dia da semana) mapeia para um array de intervalos { inicio, fim }
  // - valores das aulas: array de regras { quantidade, valor }
  const [modalidade, setModalidade] = useState({
    nome: "",
    horarios: {},
    precificacao: [],
  });

  const [lista, setLista] = useState(() => {
    const data = localStorage.getItem("modalidades");
    return data ? JSON.parse(data) : [];
  });

  const [indiceEdicao, setIndiceEdicao] = useState(null);

  useEffect(() => {
    localStorage.setItem("modalidades", JSON.stringify(lista));
  }, [lista]);

  // Atualiza os campos simples (nome)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setModalidade((prev) => ({ ...prev, [name]: value }));
  };

  // Ao selecionar um dia via checkbox:
  // para que se marcado, adiciona o dia com um intervalo vazio inicial; se desmarcado, remove o dia.
  const handleDiasChange = (e) => {
    const { value, checked } = e.target;
    setModalidade((prev) => {
      let novosHorarios = { ...prev.horarios };
      if (checked) {
        if (!Object.prototype.hasOwnProperty.call(novosHorarios, value)) {
          novosHorarios[value] = [{ inicio: "", fim: "" }];
        }
      } else {
        delete novosHorarios[value];
      }
      return { ...prev, horarios: novosHorarios };
    });
  };

  // faz e atualiza um intervalo específico (campo "inicio" ou "fim") para um dia
  const handleIntervaloChange = (e, day, index, field) => {
    const { value } = e.target;
    setModalidade((prev) => {
      const dayIntervals = prev.horarios[day] || [];
      const updatedIntervals = dayIntervals.map((interval, i) => {
        if (i === index) {
          return { ...interval, [field]: value };
        }
        return interval;
      });
      return {
        ...prev,
        horarios: { ...prev.horarios, [day]: updatedIntervals },
      };
    });
  };

  // para adicionar um novo intervalo para um dia específico
  const handleAdicionarIntervalo = (day) => {
    setModalidade((prev) => {
      const dayIntervals = prev.horarios[day] || [];
      return {
        ...prev,
        horarios: {
          ...prev.horarios,
          [day]: [...dayIntervals, { inicio: "", fim: "" }],
        },
      };
    });
  };

  //para  remover um intervalo do dia
  const handleRemoverIntervalo = (day, index) => {
    setModalidade((prev) => {
      const dayIntervals = prev.horarios[day] || [];
      const updatedIntervals = dayIntervals.filter((_, i) => i !== index);
      return {
        ...prev,
        horarios: { ...prev.horarios, [day]: updatedIntervals },
      };
    });
  };

  // valor da aula: altera o valor ou a  quantidade de uma regra específica
  const handlePrecoChange = (e, index, field) => {
    const { value } = e.target;
    setModalidade((prev) => {
      const updatedPrecificacao = prev.precificacao.map((rule, i) => {
        if (i === index) {
          return { ...rule, [field]: value };
        }
        return rule;
      });
      return { ...prev, precificacao: updatedPrecificacao };
    });
  };

  const handleAdicionarPreco = () => {
    setModalidade((prev) => ({
      ...prev,
      precificacao: [...prev.precificacao, { quantidade: "", valor: "" }],
    }));
  };

  const handleRemoverPreco = (index) => {
    setModalidade((prev) => {
      const updatedPrecificacao = prev.precificacao.filter(
        (_, i) => i !== index
      );
      return { ...prev, precificacao: updatedPrecificacao };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Valida o nome
    if (!modalidade.nome.trim()) return;

    // Valida os horários:
    const days = Object.keys(modalidade.horarios);
    if (days.length === 0) {
      alert("Selecione pelo menos um dia e defina os intervalos de horário.");
      return;
    }
    for (const day of days) {
      if (modalidade.horarios[day].length === 0) {
        alert(`Defina pelo menos um horário para ${day}.`);
        return;
      }
      for (const interval of modalidade.horarios[day]) {
        if (!interval.inicio || !interval.fim) {
          alert(`Preencha o horário de início e fim para ${day}.`);
          return;
        }
      }
    }

    // Valida os valores  – deve haver pelo menos uma regra com quantidade e valor preenchidos
    if (modalidade.precificacao.length === 0) {
      alert("Adicione ao menos uma regra de precificação.");
      return;
    }
    for (const rule of modalidade.precificacao) {
      if (!rule.quantidade || !rule.valor) {
        alert("Preencha quantidade e valor para cada regra de precificação.");
        return;
      }
    }

    // para validação de conflito: não permitir cadastrar duas modalidades com o mesmo dia e mesmo intervalo (início e fim)
    for (let m of lista) {
      const diasExistentes = Object.keys(m.horarios);
      for (let day of days) {
        if (diasExistentes.includes(day)) {
          for (let interval of modalidade.horarios[day]) {
            const conflict = m.horarios[day].some(
              (i) => i.inicio === interval.inicio && i.fim === interval.fim
            );
            if (conflict) {
              alert(
                `Conflito: já existe uma modalidade com horário de ${interval.inicio} às ${interval.fim} em ${day}.`
              );
              return;
            }
          }
        }
      }
    }

    if (indiceEdicao !== null) {
      const novaLista = [...lista];
      novaLista[indiceEdicao] = modalidade;
      setLista(novaLista);
      alert("Modalidade atualizada com sucesso!");
    } else {
      setLista((prev) => [...prev, modalidade]);
      alert("Modalidade cadastrada com sucesso!");
    }

    // para resetar o formulário
    setModalidade({
      nome: "",
      horarios: {},
      precificacao: [],
    });
    setIndiceEdicao(null);
  };

  const excluirModalidade = (index) => {
    const novaLista = [...lista];
    novaLista.splice(index, 1);
    setLista(novaLista);
    if (indiceEdicao === index) {
      setModalidade({ nome: "", horarios: {}, precificacao: [] });
      setIndiceEdicao(null);
    }
  };

  const editarModalidade = (index) => {
    setModalidade(lista[index]);
    setIndiceEdicao(index);
  };

  return (
    <div className="modalidade-container">
      <h2>Cadastro de Modalidades</h2>
      <form className="modalidade-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          placeholder="Nome da modalidade"
          value={modalidade.nome}
          onChange={handleChange}
          required
        />

        <fieldset className="checkbox-group">
          <legend>Selecione os dias da semana</legend>
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((dia) => (
            <label key={dia}>
              <input
                type="checkbox"
                name="dias"
                value={dia}
                checked={Object.prototype.hasOwnProperty.call(
                  modalidade.horarios,
                  dia
                )}
                onChange={handleDiasChange}
              />
              {dia}
            </label>
          ))}
        </fieldset>

        {/* Para cada dia selecionado: */}
        {Object.keys(modalidade.horarios).map((day) => (
          <div key={day} className="dia-section">
            <h4>{day}</h4>
            {modalidade.horarios[day].map((interval, index) => (
              <div key={index} className="horario-intervalo">
                <label>
                  Início:
                  <input
                    type="time"
                    value={interval.inicio}
                    onChange={(e) =>
                      handleIntervaloChange(e, day, index, "inicio")
                    }
                    required
                  />
                </label>
                <label>
                  Fim:
                  <input
                    type="time"
                    value={interval.fim}
                    onChange={(e) =>
                      handleIntervaloChange(e, day, index, "fim")
                    }
                    required
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoverIntervalo(day, index)}
                >
                  Remover Horário
                </button>
              </div>
            ))}
            <button type="button" onClick={() => handleAdicionarIntervalo(day)}>
              Adicionar Outro Horário para {day}
            </button>
          </div>
        ))}

        {/* Seção dos valores por aula precificação das aulas */}
        <fieldset className="precificacao-group">
          <legend>Valores (por quantidade de aulas)</legend>
          {modalidade.precificacao.map((rule, index) => (
            <div key={index} className="precificacao-regra">
              <label>
                Quantidade de Aulas:
                <input
                  type="number"
                  min="1"
                  value={rule.quantidade}
                  onChange={(e) => handlePrecoChange(e, index, "quantidade")}
                  required
                />
              </label>
              <label>
                Valor:
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={rule.valor}
                  onChange={(e) => handlePrecoChange(e, index, "valor")}
                  required
                />
              </label>
              <button type="button" onClick={() => handleRemoverPreco(index)}>
                Remover Valor
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAdicionarPreco}>
            Adicionar Valor por Aula
          </button>
        </fieldset>

        <button type="submit">
          {indiceEdicao !== null
            ? "Atualizar Modalidade"
            : "Cadastrar Modalidade"}
        </button>
      </form>

      <div className="lista-modalidades">
        <h3>Modalidades Cadastradas</h3>
        {lista.length === 0 ? (
          <p>Nenhuma modalidade cadastrada.</p>
        ) : (
          <ul>
            {lista.map((mod, index) => (
              <li key={index}>
                <div className="modalidade-info">
                  <strong>{mod.nome}</strong>
                  {Object.entries(mod.horarios).map(([day, intervals], i) => (
                    <div key={i}>
                      <span>{day}:</span>
                      {intervals.map((intv, j) => (
                        <span key={j}>
                          {intv.inicio} às {intv.fim}
                        </span>
                      ))}
                    </div>
                  ))}
                  <div className="precificacao-info">
                    {mod.precificacao.map((rule, i) => (
                      <span key={i}>
                        {rule.quantidade} aula(s): R$ {rule.valor}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="acoes">
                  <button onClick={() => editarModalidade(index)}>
                    Editar
                  </button>
                  <button onClick={() => excluirModalidade(index)}>
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
