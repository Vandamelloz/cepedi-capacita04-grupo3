const API_URL = "http://localhost:3001/usuarios";
const API_BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const SESSION_KEY = "gipar_usuario";

export const HOME_POR_PERFIL = {
  adm: "/dashboard",
  estagiario: "/dashboard",
  professor: "/dashboard",
  aluno: "/alunoEmprestimos",
};

export const ROTAS_POR_PERFIL = {
  adm: ["/dashboard", "/equipamentos", "/equipamento", "/emprestimos", "/manutencoes", "/usuarios", "/relatorios"],
  estagiario: ["/dashboard", "/equipamentos", "/equipamento", "/EstagEquipamentos", "/EstagEmprestimos"],

  professor: ["/dashboard", "/equipamentos", "/equipamento", "/manutencoes"],
  aluno: ["/alunoEmprestimos", "/catalogo", "/equipamentos", "/equipamento"],
};

export function mapPerfilToRole(perfil) {
  const mapa = {
    Administrador: "adm",
    Estagiário: "estagiario",
    Aluno: "aluno",
    Professor: "professor",
  };

  return mapa[perfil] ?? "aluno";
}

export function getSessao() {
  const dados = sessionStorage.getItem(SESSION_KEY);
  if (!dados) return null;

  try {
    return JSON.parse(dados);
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function salvarSessao(usuario) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
}

export function encerrarSessao() {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Token JWT do FastAPI (necessário para rotas protegidas como /relatorios/*). */
export function getAccessToken() {
  return getSessao()?.access_token ?? null;
}

/**
 * Obtém JWT via POST /login (OAuth2PasswordRequestForm).
 * Não interrompe o login do json-server se a API estiver indisponível.
 */
async function tentarObterTokenBackend(email, senha) {
  try {
    const corpo = new URLSearchParams();
    corpo.set("username", email);
    corpo.set("password", senha);

    const resposta = await fetch(`${API_BACKEND_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: corpo,
    });

    if (!resposta.ok) return null;

    const dados = await resposta.json();
    return dados.access_token ?? null;
  } catch {
    return null;
  }
}

export function usuarioTemAcesso(role, pathname) {
  const rotasPermitidas = ROTAS_POR_PERFIL[role] ?? [];
  return rotasPermitidas.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  );
}

export async function buscarUsuariosAtivos() {
  const resposta = await fetch(API_URL);

  if (!resposta.ok) {
    throw new Error(
      "Não foi possível carregar os usuários. Verifique se o json-server está rodando na porta 3001."
    );
  }

  const usuarios = await resposta.json();
  return usuarios.filter((usuario) => usuario.status === "Ativo");
}

export async function autenticar(identificador, senha) {
  const resposta = await fetch(API_URL);

  if (!resposta.ok) {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se o json-server está rodando na porta 3001."
    );
  }

  const usuarios = await resposta.json();
  const identificadorNormalizado = identificador.trim().toLowerCase();

  const usuario = usuarios.find((item) => {
    const email = (item.email ?? "").toLowerCase();
    const login = (item.login ?? "").toLowerCase();

    return (
      (email === identificadorNormalizado || login === identificadorNormalizado) &&
      item.senha === senha
    );
  });

  if (!usuario) {
    throw new Error("E-mail/login ou senha incorretos.");
  }

  if (usuario.status !== "Ativo") {
    throw new Error("Usuário inativo. Entre em contato com o administrador.");
  }

  const access_token = await tentarObterTokenBackend(usuario.email, senha);

  const sessao = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    login: usuario.login,
    perfil: usuario.perfil,
    status: usuario.status,
    role: mapPerfilToRole(usuario.perfil),
    access_token,
  };

  salvarSessao(sessao);
  return sessao;
}
