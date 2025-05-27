import React, { createContext, useState } from "react";
import { authService } from "../services/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(authService.isAuthenticated());

  const login = () => {
    localStorage.setItem("isAuth", "true");
    setIsAuth(true);
  };
  const logout = () => {
    authService.logout();
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider value={{ isAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
