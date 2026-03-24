// src/lib/nav-items.ts
import type { UserRole } from './types';
import {
  Users,
  Briefcase,
  BookOpen,
  Target,
  Settings,
  HeartPulse,
  ClipboardCheck,
  Star,
  BarChart3,
  User as UserIcon,
  CalendarPlus,
  LucideIcon
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  children?: NavItem[];
}

export const navItems: NavItem[] = [
  { href: '/employees', label: 'Employees', icon: Users, roles: ['admin', 'manager'] },
  { href: '/roles', label: 'Job Roles', icon: Briefcase, roles: ['admin', 'manager'] },
  { href: '/competencies', label: 'Competencies', icon: Star, roles: ['admin', 'manager'] },
  {
    href: '/evaluations',
    label: 'Evaluations',
    icon: UserIcon,
    roles: ['admin', 'manager', 'employee'],
    children: [
        { href: '/evaluations', label: 'My Evaluations', icon: UserIcon, roles: ['admin', 'manager', 'employee'] },
        { href: '/evaluations/results', label: 'Evaluation Results', icon: BarChart3, roles: ['admin', 'manager'] },
    ]
  },
  { href: '/audits', label: 'Auditorías Técnicas', icon: ClipboardCheck, roles: ['admin', 'manager'] },
  { href: '/courses', label: 'Courses', icon: BookOpen, roles: ['admin', 'manager'] },
  { href: '/training', label: 'Training', icon: Target, roles: ['admin', 'manager', 'employee'] },
  { href: '/psychosocial-risks', label: 'Psychosocial Risks', icon: HeartPulse, roles: ['admin', 'manager', 'employee'] },
  {
    href: '/requests',
    label: 'Leave Requests',
    icon: CalendarPlus,
    roles: ['admin', 'manager', 'employee'],
    children: [
        { href: '/requests', label: 'My Requests', icon: CalendarPlus, roles: ['admin', 'manager', 'employee'] },
        { href: '/reports/leave-summary', label: 'Leave Summary', icon: BarChart3, roles: ['admin', 'manager'] },
    ]
  },
];

export const bottomNavItems: NavItem[] = [
    { href: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];
