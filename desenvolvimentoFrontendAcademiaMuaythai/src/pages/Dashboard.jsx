import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  AiOutlineMenu,
  AiOutlineUserAdd,
  AiOutlineSchedule,
  AiOutlineDollarCircle,
  AiOutlineBarChart,
  AiOutlineLogout,
} from "react-icons/ai";
import "./Dashboard.css";

const Dashboard = () => {
  const [open, setOpen] = useState(true);

  const toggleSidebar = () => setOpen(!open);

  const logout = () => {
    // Futuramente: remover token, navegar para /
    window.location.href = "/";
  };

  return (
    <div className="dashboard">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="sidebar-header">
          <h2>
            Academia
            <br />
            MuayThai
          </h2>
          <button className="menu-btn" onClick={toggleSidebar}>
            <AiOutlineMenu />
          </button>
        </div>

        <nav>
          <Link to="/dashboard/cadastro-aluno">
            <AiOutlineUserAdd /> Cadastrar Aluno
          </Link>
          <Link to="/dashboard/modalidades">
            <AiOutlineSchedule /> Modalidades
          </Link>
          <Link to="/dashboard/pagamentos">
            <AiOutlineDollarCircle /> Pagamentos
          </Link>
          <Link to="/dashboard/relatorios">
            <AiOutlineBarChart /> Relatórios
          </Link>
        </nav>

        <button className="logout-btn" onClick={logout}>
          <AiOutlineLogout /> Sair
        </button>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
