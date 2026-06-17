// Note que as primeiras letras agora são maiúsculas! (PascalCase)
import { 
  LayoutDashboard, 
  PackageOpen, 
  ArrowRightLeft, 
  Wrench, 
  Users, 
  BookOpen, 
  ClipboardMinus 
} from 'lucide-react';

export const menuByRole = {
  adm: [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Equipamentos', path: '/equipamentos', icon: PackageOpen },
    { label: 'Empréstimos', path: '/emprestimos', icon: ArrowRightLeft },
    { label: 'Manutenção', path: '/manutencao', icon: Wrench },
    { label: 'Usuários', path: '/usuarios', icon: Users },
    { label: 'Relatórios', path: '/relatorios', icon: ClipboardMinus },
  ],
  aluno: [
    { label: 'Meus Empréstimos', path: '/', icon: ClipboardMinus },
    { label: 'Catálogo', path: '/catalogo', icon: BookOpen }
  ],
  estagiario: [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Equipamentos', path: '/equipamentos', icon: PackageOpen },
    { label: 'Empréstimos', path: '/emprestimos', icon: ArrowRightLeft }
  ]
};