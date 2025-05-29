import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { authService } from "../../services/auth";
import "./Login.css";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", senha: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = authService.login(form.email, form.senha);
    if (ok) {
      login(); // Marca autenticado
      navigate("/dashboard");
    } else {
      alert("Usuário ou senha inválidos!");
    }
  };

  return (
    <div className="fundoLogin">
      <main className="conteudoLogin">
        <form onSubmit={handleSubmit}>
          <h1>Acesso ao Sistema Academia De MuayThai</h1>

          <div className="formularioLogin">
            <input
              id="email"
              name="email"
              placeholder="Usuário"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <i className="bx bxs-user"></i>
          </div>

          <div className="formularioLogin">
            <input
              id="senha"
              name="senha"
              placeholder="Senha"
              type="password"
              value={form.senha}
              onChange={handleChange}
              required
            />
            <i className="bx bxs-lock-alt"></i>
          </div>

          <div className="registrarNova-Senha">
            <label>
              <input type="checkbox" /> Lembrar Senha
            </label>
            <a href="#">Esqueci a Senha</a>
          </div>

          <button type="submit" className="login">
            Login
          </button>

          <div className="registrar-conta">
            <p>
              Não tem conta? <Link to="/Proprietario">Cadastre-se</Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Login;
