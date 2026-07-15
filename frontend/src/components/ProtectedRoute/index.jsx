import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usuarioTemAcesso } from "../../services/auth/auth.service";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { usuario, isAuthenticated, homePath } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!usuarioTemAcesso(usuario.role, location.pathname)) {
    return <Navigate to={homePath} replace />;
  }

  return children;
}
