import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/ui/Logo";
import { useAuth } from "../../contexts/AuthContext";
import { buscarUsuariosAtivos, HOME_POR_PERFIL } from "../../services/auth/auth.service";

const DESCRICAO_POR_PERFIL = {
  Administrador: "Acesso total ao sistema",
  Estagiário: "Gerencia empréstimos e equipamentos",
  Aluno: "Visualiza catálogo e seus empréstimos",
  Professor: "Acompanha equipamentos e manutenções",
};

function iconePorPerfil(perfil) {
  if (perfil === "Administrador") return "admin";
  if (perfil === "Estagiário") return "estagiario";
  return "aluno";
}

function IconePerfil({ tipo }) {
  const classe = "w-5 h-5 text-[#1A6B74] shrink-0";

  if (tipo === "admin") {
    return (
      <svg className={classe} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }

  if (tipo === "estagiario") {
    return (
      <svg className={classe} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }

  return (
    <svg className={classe} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </svg>
  );
}

function IconeEntrar() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function IconeOlho({ visivel }) {
  if (visivel) {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, homePath } = useAuth();

  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [usuariosDemo, setUsuariosDemo] = useState([]);
  const [erroDemo, setErroDemo] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(homePath, { replace: true });
    }
  }, [isAuthenticated, homePath, navigate]);

  useEffect(() => {
    buscarUsuariosAtivos()
      .then(setUsuariosDemo)
      .catch((err) => setErroDemo(err.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const sessao = await login(identificador, senha);
      navigate(HOME_POR_PERFIL[sessao.role] ?? "/dashboard", { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  function preencherCredencial(usuario) {
    setIdentificador(usuario.email);
    setSenha(usuario.senha);
    setErro("");
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F3F4F6] font-sans">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <header className="mb-6 flex flex-col items-center sm:mb-8">
          <Logo className="h-16 w-auto sm:h-24" altura={null} largura={null} />
          <p className="mt-3 text-center text-sm text-[#6B7280] sm:text-[15px]">
            Sistema de Controle de Equipamentos
          </p>
        </header>

        <div className="w-full max-w-[440px] rounded-xl bg-white px-5 py-6 shadow-md sm:px-8 sm:py-8">
          <h1 className="mb-5 text-center text-lg font-semibold text-[#111827] sm:mb-6 sm:text-[20px]">
            Entrar no Sistema
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="identificador" className="mb-1.5 block text-sm font-medium text-[#374151]">
                E-mail ou login
              </label>
              <input
                id="identificador"
                type="text"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="seu@email.com ou login"
                required
                className="h-10 w-full rounded-lg border border-[#D1D5DB] px-3 text-[#111827] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#1A6B74] focus:ring-1 focus:ring-[#1A6B74]"
              />
            </div>

            <div>
              <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-[#374151]">
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="h-10 w-full rounded-lg border border-[#D1D5DB] px-3 pr-10 text-[#111827] outline-none transition-colors focus:border-[#1A6B74] focus:ring-1 focus:ring-[#1A6B74]"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors hover:text-[#6B7280]"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  <IconeOlho visivel={mostrarSenha} />
                </button>
              </div>
            </div>

            {erro && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {erro}
              </p>
            )}

            <div className="flex justify-end">
              <a href="#" className="text-sm text-[#2563EB] hover:underline">
                Esqueci minha senha
              </a>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1A6B74] text-sm font-medium text-white transition-colors hover:bg-[#155A61] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <IconeEntrar />
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 sm:mt-8">
            <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-wider text-[#9CA3AF]">
              Usuários de demonstração
            </p>

            {erroDemo ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {erroDemo}
              </p>
            ) : (
              <div className="space-y-2">
                {usuariosDemo.map((usuario) => (
                  <button
                    key={usuario.id}
                    type="button"
                    onClick={() => preencherCredencial(usuario)}
                    className="flex w-full flex-col gap-1 rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-left transition-colors hover:border-[#1A6B74] hover:bg-[#F9FAFB] sm:flex-row sm:items-center sm:gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <IconePerfil tipo={iconePorPerfil(usuario.perfil)} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#111827]">{usuario.perfil}</p>
                        <p className="truncate text-xs text-[#6B7280]">
                          {DESCRICAO_POR_PERFIL[usuario.perfil] ?? usuario.nome}
                        </p>
                      </div>
                    </div>
                    <span className="pl-8 text-[11px] text-[#6B7280] sm:shrink-0 sm:pl-0">
                      {usuario.email}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <p className="mt-4 text-center text-xs text-[#9CA3AF]">
              Clique em um usuário para preencher e depois em Entrar
            </p>
          </div>
        </div>
      </main>

      <footer className="px-4 py-4 text-center text-xs text-[#9CA3AF]">
        GIPAR - Todos os direitos reservados
      </footer>
    </div>
  );
}
