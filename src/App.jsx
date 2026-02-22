
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import MainLayout from "./layout/MainLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Promessas from "./pages/Promessas";
import Carteira from "./pages/Carteira";
import Kanban from "./pages/Kanban";
import MinhaFila from "./pages/MinhaFila";
import Operadores from "./pages/Operadores";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="promessas" element={<Promessas />} />
        <Route path="carteira" element={<Carteira />} />
        <Route path="kanban" element={<Kanban />} />
        <Route path="minha-fila" element={<MinhaFila />} />
        {user?.role === "admin" && (
          <Route path="operadores" element={<Operadores />} />
        )}
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
