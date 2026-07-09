import { createContext, useContext, useMemo, useState } from "react";
import {
  autenticar,
  encerrarSessao,
  getSessao,
  HOME_POR_PERFIL,
} from "../services/auth/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => getSessao());

  async function login(identificador, senha) {
    const sessao = await autenticar(identificador, senha);
    setUsuario(sessao);
    return sessao;
  }

  function logout() {
    encerrarSessao();
    setUsuario(null);
  }

  const valor = useMemo(
    () => ({
      usuario,
      isAuthenticated: Boolean(usuario),
      homePath: usuario ? HOME_POR_PERFIL[usuario.role] ?? "/login" : "/login",
      login,
      logout,
    }),
    [usuario]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return contexto;
}
