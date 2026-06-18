import { useState } from "react";
import Logo from "../../components/ui/Logo";

const CREDENCIAIS_DEMO = [
  {
    email: "admin@gipar.com",
    perfil: "Administrador",
    descricao: "Acesso total ao sistema",
    icone: "admin",
  },
  {
    email: "maria@gipar.com",
    perfil: "Estagiário",
    descricao: "Gerencia empréstimos e equipamentos",
    icone: "estagiario",
  },
  {
    email: "joao@gipar.com",
    perfil: "Aluno",
    descricao: "Visualiza catálogo e seus empréstimos",
    icone: "aluno",
  },
];

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
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <header className="flex flex-col items-center mb-8">
          <Logo altura={96} />
          <p className="mt-3 text-[15px] text-[#6B7280]">
            Sistema de Controle de Equipamentos
          </p>
        </header>

        <div className="w-full max-w-[440px] bg-white rounded-xl shadow-md px-8 py-8">
          <h1 className="text-center text-[20px] font-semibold text-[#111827] mb-6">
            Entrar no Sistema
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#1A6B74] focus:ring-1 focus:ring-[#1A6B74] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-[#374151] mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-[#D1D5DB] text-[#111827] outline-none focus:border-[#1A6B74] focus:ring-1 focus:ring-[#1A6B74] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  <IconeOlho visivel={mostrarSenha} />
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm text-[#2563EB] hover:underline">
                Esqueci minha senha
              </a>
            </div>

            <button
              type="submit"
              className="w-full h-11 flex items-center justify-center gap-2 bg-[#1A6B74] hover:bg-[#155A61] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <IconeEntrar />
              Entrar
            </button>
          </form>

          <div className="mt-8">
            <p className="text-center text-[11px] font-medium tracking-wider text-[#9CA3AF] uppercase mb-3">
              Credenciais de demonstração
            </p>

            <div className="space-y-2">
              {CREDENCIAIS_DEMO.map((credencial) => (
                <button
                  key={credencial.email}
                  type="button"
                  onClick={() => {
                    setEmail(credencial.email);
                    setSenha("123456");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#E5E7EB] hover:border-[#1A6B74] hover:bg-[#F9FAFB] transition-colors text-left"
                >
                  <IconePerfil tipo={credencial.icone} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827]">{credencial.perfil}</p>
                    <p className="text-xs text-[#6B7280] truncate">{credencial.descricao}</p>
                  </div>
                  <span className="text-[11px] text-[#6B7280] shrink-0">
                    {credencial.email}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-[#9CA3AF] mt-4">
              Senha para todos: 123456
            </p>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[#9CA3AF]">
        GIPAR - Todos os direitos reservados
      </footer>
    </div>
  );
}
