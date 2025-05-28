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
    window.location.href = "/";
  };

  return (
    <div className="dashboard">
      <aside className={`sidebar ${open ? "open" : "closed"}`}>
        <div className="sidebar-header">
          {open && (
            <h2 className="sidebar-title">
              Academia
              <br />
              MuayThai
            </h2>
          )}
          <button className="menu-btn" onClick={toggleSidebar}>
            <AiOutlineMenu />
          </button>
        </div>

        <nav>
          <Link to="/dashboard/cadastro-aluno">
            <AiOutlineUserAdd />
            {open && "Cadastrar Aluno"}
          </Link>
          <Link to="/dashboard/modalidades">
            <AiOutlineSchedule />
            {open && "Modalidades"}
          </Link>
          <Link to="/dashboard/pagamentos">
            <AiOutlineDollarCircle />
            {open && "Pagamentos"}
          </Link>
          <Link to="/dashboard/relatorios">
            <AiOutlineBarChart />
            {open && "Relatórios"}
          </Link>
        </nav>

        <button className="logout-btn" onClick={logout}>
          <AiOutlineLogout />
          {open && "Sair"}
        </button>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
