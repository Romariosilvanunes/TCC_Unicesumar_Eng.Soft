export const authService = {
  login(email, senha) {
    const saved = JSON.parse(localStorage.getItem("proprietario"));
    if (!saved) return false;
    return saved.email === email && saved.senha === senha;
  },
  logout() {
    localStorage.removeItem("isAuth");
  },
  isAuthenticated() {
    return localStorage.getItem("isAuth") === "true";
  },
};
