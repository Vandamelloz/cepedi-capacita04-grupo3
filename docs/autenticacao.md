# Autenticação e layout — GIPAR

Guia curto para a equipe seguir o mesmo padrão ao criar novas telas autenticadas.

## Visão geral

```
Login → auth.service (json-server) → sessionStorage → AuthContext → ProtectedRoute → LayoutUsuario → BarraLateral / Cabecalho
```

| Camada | Responsabilidade |
|---|---|
| `auth.service.js` | Validar credenciais, persistir sessão em `sessionStorage` (`gipar_usuario`) |
| `AuthContext` | Estado global do usuário logado (`usuario`, `login`, `logout`) |
| `ProtectedRoute` | Bloquear rotas sem sessão; validar perfil × rota |
| `LayoutUsuario` | **Única fonte de exibição** do usuário nas telas admin |
| `BarraLateral` / `Cabecalho` | Apresentação pura — recebem props, não conhecem auth |

## Objeto de sessão

Após login bem-sucedido, `usuario` contém:

```js
{
  id, nome, email, login, perfil, status,
  role  // "adm" | "estagiario" | "aluno" | "professor"
}
```

- `perfil` → exibido como cargo ("Administrador", "Aluno", …)
- `role` → define o menu lateral (`menuByRole` em `config/menuItems.js`)

## Criando uma nova tela admin

1. Registrar a rota em `App.jsx` dentro de `<ProtectedRoute>`.
2. Adicionar o path em `ROTAS_POR_PERFIL.adm` em `auth.service.js` (se ainda não existir).
3. Usar o layout **sem** passar dados do usuário:

```jsx
import LayoutUsuario from "../../layouts/usuario/LayoutUsuario";

export default function MinhaTela() {
  return (
    <LayoutUsuario titulo="Minha Tela">
      <main>{/* conteúdo */}</main>
    </LayoutUsuario>
  );
}
```

### Props do `LayoutUsuario` (telas admin)

| Prop | Obrigatória | Descrição |
|---|---|---|
| `titulo` | Sim | Título exibido no header |
| `children` | Sim | Conteúdo da página |
| `notificacoes` | Não | Lista de notificações (ex.: Dashboard) |
| `onMarcarNotificacaoLida` | Não | Handler de notificação |
| `onMarcarTodasNotificacoesLidas` | Não | Handler de notificação |

### Props que páginas admin **não devem** passar

- `nome`, `cargo`, `tipoUsuario`, `onLogout` — resolvidos internamente via `useAuth()`.

## Logout

O `LayoutUsuario` chama `logout()` do `AuthContext` e redireciona para `/login`. Páginas admin não implementam logout.

## Modo legado (temporário)

Estagiário e Aluno ainda passam `nome`, `cargo`, `tipoUsuario` e `onLogout` diretamente ao layout. Isso é **compatibilidade de migração**, não arquitetura definitiva.

```jsx
// TEMPORÁRIO — será removido
<LayoutUsuario nome="..." cargo="..." tipoUsuario="..." onLogout={...} />
```

### Tarefa futura

Quando Estagiário e Aluno forem migrados:

1. Remover props legadas e o `modoLegado` em `LayoutUsuario.jsx`.
2. Remover `MOCK_USUARIO_ALUNO` de `useMeusEmprestimos.js`.
3. Todas as telas autenticadas passam apenas `titulo` (+ notificações, se aplicável).

## O que não alterar sem necessidade

- `AuthContext.jsx` — ponto único de estado de sessão.
- `auth.service.js` — única camada que grava `sessionStorage`.
- `BarraLateral` / `Cabecalho` — componentes de apresentação.

## Checklist para code review

- [ ] Página admin usa `<LayoutUsuario titulo="...">` sem props de usuário?
- [ ] Rota protegida com `<ProtectedRoute>`?
- [ ] Path incluído em `ROTAS_POR_PERFIL` para o perfil correto?
- [ ] Nenhum hardcode de nome/cargo em páginas autenticadas?
- [ ] Nenhum `useAuth()` na página só para alimentar o layout?

## Referência rápida — telas admin migradas

| Tela | Arquivo |
|---|---|
| Dashboard | `pages/adm/admDashboard.jsx` |
| Equipamentos | `pages/adm/equipamentos.jsx` |
| Empréstimos | `pages/adm/Emprestimo.jsx` |
| Manutenções | `pages/adm/Manutencoes.jsx` |
| Usuários | `pages/adm/Usuarios.jsx` |
| Relatórios | `pages/adm/Relatorios.jsx` |
