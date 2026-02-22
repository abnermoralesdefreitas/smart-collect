import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  function login(email, password) {
    if (email === "admin@smartcollect.com" && password === "admin123") {
      setUser({ email, role: "admin" });
      return { ok: true };
    }
    return { ok: false, error: "Credenciais inválidas" };
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
