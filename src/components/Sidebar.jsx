import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  }

  const base = "block px-4 py-3 rounded-xl font-medium transition text-sm";
  const active = "bg-blue-600 text-white";
  const inactive =
    "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800";

  return (
    <aside className="w-72 bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800 p-6 flex flex-col justify-between">

      {/* ===== LOGO NOVA ===== */}
      <div>
        <div className="mb-8">
          <div className="text-3xl font-extrabold tracking-tight
                          bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600
                          bg-clip-text text-transparent">
            SmartCollect
          </div>

          <div className="text-xs mt-1 text-gray-500 dark:text-gray-400 tracking-wider">
            OPERATIONS • MANAGEMENT • INSIGHTS
          </div>
        </div>

        {/* Sessão */}
        <div className="mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-200
                        dark:bg-gray-950/40 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Sessão ativa
          </div>
          <div className="mt-1 font-semibold text-gray-900 dark:text-white">
            {user?.email || "Usuário"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {user?.role || "—"}
          </div>
        </div>

        {/* Menu */}
        <nav className="space-y-2">
          <NavLink to="/dashboard" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
            Dashboard
          </NavLink>

          <NavLink to="/analytics" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
            Analytics
          </NavLink>

          <NavLink to="/promessas" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
            Promessas
          </NavLink>

          <NavLink to="/carteira" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
            Carteira
          </NavLink>

          <NavLink to="/kanban" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
            Kanban
          </NavLink>

          <NavLink to="/minha-fila" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
            Minha Fila
          </NavLink>

          {user?.role === "admin" && (
            <NavLink to="/operadores" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
              Operadores
            </NavLink>
          )}
        </nav>
      </div>

      {/* Bottom */}
      <div className="space-y-3">
        <button
          onClick={toggleTheme}
          className="w-full px-4 py-2 rounded-xl bg-gray-200 text-gray-900 hover:bg-gray-300 transition
          dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        >
          {dark ? "Modo Claro ☀️" : "Modo Escuro 🌙"}
        </button>

        <button
          onClick={logout}
          className="w-full px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
