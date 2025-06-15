import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../components/Login/LoginPage";
import CadastroProprietario from "../components/Proprietario/CadastroProprietario";
import FormularioResponsavel from "../components/CadastroResponsavel/FormularioResponsavel";

import Dashboard from "../pages/Dashboard";
import AlunoCadastro from "../components/Aluno/FormularioAluno";
import Modalidades from "../pages/Modalidade";
import Pagamentos from "../pages/Pagamentos";
import Relatorios from "../pages/Relatorios";
import ContasPagar from "../pages/ContasPagar";

import PrivateRoute from "./PrivateRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/Proprietario" element={<CadastroProprietario />} />

        {/* ROTA PÚBLICA PARA CADASTRO DE RESPONSÁVEL */}
        <Route path="/responsavel" element={<FormularioResponsavel />} />

        {/* ROTAS PROTEGIDAS DENTRO DO DASHBOARD */}
        <Route path="/dashboard" element={<PrivateRoute />}>
          <Route element={<Dashboard />}>
            <Route path="cadastro-aluno" element={<AlunoCadastro />} />
            <Route
              path="cadastro-responsavel"
              element={<FormularioResponsavel />}
            />
            <Route path="modalidades" element={<Modalidades />} />
            <Route path="pagamentos" element={<Pagamentos />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="contas-pagar" element={<ContasPagar />} />
            <Route index element={<h2>Bem-vindo ao painel!</h2>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
