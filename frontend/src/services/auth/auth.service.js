const API_URL = "http://localhost:3001/usuarios";
const SESSION_KEY = "gipar_usuario";

export const HOME_POR_PERFIL = {
  adm: "/dashboard",
  estagiario: "/dashboard",
  professor: "/dashboard",
  aluno: "/alunoEmprestimos",
};

export const ROTAS_POR_PERFIL = {
  adm: ["/dashboard", "/equipamentos", "/equipamento", "/manutencoes", "/usuarios", "/emprestimos"],
  estagiario: ["/dashboard", "/EstagEquipamentos", "/equipamento", "/emprestimos"],
  professor: ["/dashboard", "/equipamentos", "/equipamento", "/manutencoes", "/emprestimos"],
  aluno: ["/alunoEmprestimos", "/equipamentos", "/equipamento",],
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

  const sessao = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    login: usuario.login,
    perfil: usuario.perfil,
    status: usuario.status,
    role: mapPerfilToRole(usuario.perfil),
  };

  salvarSessao(sessao);
  return sessao;
}
