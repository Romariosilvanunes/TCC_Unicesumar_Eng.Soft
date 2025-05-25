import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../components/Login/LoginPage";
import CadastroProprietario from "../components/Proprietario/CadastroProprietario";
import AlunoCadastro from "../components/AlunoCadastro/AlunoCadastro";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/Proprietario" element={<CadastroProprietario />} />
        <Route path="/dashboard/cadastro-aluno" element={<AlunoCadastro />} />
        {/* Outras rotas do sistema virão aqui */}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
