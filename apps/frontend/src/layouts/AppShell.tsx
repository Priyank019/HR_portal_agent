import { NavLink, Outlet } from 'react-router-dom';
import {
  Bell,
  BriefcaseBusiness,
  ChartColumnIncreasing,
  CircleUserRound,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  FileText,
  History,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import type { AuthRole } from '@hr-portal/auth-contracts';
import { useAuth } from '../context/auth-context';

type SidebarItem = {
  label: string;
  icon: typeof LayoutDashboard;
  to: string;
  roles?: AuthRole[];
};

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'AI Assistant', icon: Sparkles, to: '/assistant' },
  { label: 'Documents', icon: FileText, to: '/documents' },
  { label: 'Chat History', icon: History, to: '/history' },
  { label: 'Analytics', icon: ChartColumnIncreasing, to: '/analytics' },
  { label: 'HR Dashboard', icon: BriefcaseBusiness, to: '/hr', roles: ['HR', 'ADMIN'] },
  { label: 'HR Management', icon: ShieldCheck, to: '/admin/hr', roles: ['ADMIN'] },
  { label: 'Profile', icon: CircleUserRound, to: '/profile' },
  { label: 'Settings', icon: Settings, to: '/settings' },
];

export function AppShell() {
  const { user, logout } = useAuth();

  const visibleItems = sidebarItems.filter((item) => !item.roles || (user ? item.roles.includes(user.role) : false));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 px-6 py-4 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2 text-white">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h1 className="text-xl font-semibold">HR Copilot</h1>
              <p className="text-sm text-slate-500">Employee support workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
              <Search size={16} />
              <input className="w-40 bg-transparent outline-none" placeholder="Search" aria-label="Search" />
            </label>
            <button className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100" type="button">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2">
              <CircleUserRound size={18} />
              <span className="text-sm font-medium">{user ? `${user.name} · ${user.role}` : 'Profile'}</span>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              type="button"
              onClick={() => {
                void logout();
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden min-h-[calc(100vh-73px)] w-72 border-r border-slate-200 bg-white px-4 py-6 lg:block">
          <nav className="space-y-2">
            {visibleItems.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
