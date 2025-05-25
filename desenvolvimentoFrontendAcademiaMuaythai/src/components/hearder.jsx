import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/">Início</Link>
          </li>
          <li>
            <Link to="/alunos">Alunos</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
