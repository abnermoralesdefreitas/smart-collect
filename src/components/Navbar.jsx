import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6
      bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {user?.email}
        </span>

        <button
          onClick={toggleTheme}
          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100
            dark:border-gray-700 dark:hover:bg-gray-800 transition"
        >
          Tema: {theme}
        </button>

        <button
          onClick={handleLogout}
          className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
        >
          Sair
        </button>
      </div>
    </header>
  );
}

export default Navbar;
