
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
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Equipamentos', path: '/equipamentos', icon: PackageOpen },
    { label: 'Empréstimos', path: '/emprestimos', icon: ArrowRightLeft },
    { label: 'Manutenções', path: '/manutencoes', icon: Wrench },
    { label: 'Usuários', path: '/usuarios', icon: Users },
    { label: 'Relatórios', path: '/relatorios', icon: ClipboardMinus },
  ],
  aluno: [
    { label: 'Meus Empréstimos', path: '/alunoEmprestimos', icon: ClipboardMinus },
    { label: 'Catálogo', path: '/catalogo', icon: BookOpen }
  ],
  estagiario: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Equipamentos', path: '/EstagEquipamentos', icon: PackageOpen },
    { label: 'Empréstimos', path: '/emprestimos', icon: ArrowRightLeft }
  ],
  professor: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Equipamentos', path: '/equipamentos', icon: PackageOpen },
    { label: 'Empréstimos', path: '/emprestimos', icon: ArrowRightLeft },
    { label: 'Manutenções', path: '/manutencoes', icon: Wrench },
  ]
};