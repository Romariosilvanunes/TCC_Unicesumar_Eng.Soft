import React from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  return (
    <div className="fundoLogin">
      <main className="conteudoLogin">
        <form>
          <h1>Acesso ao Sistema Academia De MuayThai</h1>

          <div className="formularioLogin">
            <input
              id="email"
              name="email"
              placeholder="Usuário"
              type="email"
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
