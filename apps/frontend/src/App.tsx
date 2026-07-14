import { NavLink, Route, Routes } from 'react-router-dom';
import {
  Bell,
  BriefcaseBusiness,
  ChartColumnIncreasing,
  CircleUserRound,
  LayoutDashboard,
  MessageSquareText,
  Search,
  Settings,
  Sparkles,
  FileText,
  History,
  ShieldCheck,
} from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'AI Assistant', icon: Sparkles, to: '/assistant' },
  { label: 'Documents', icon: FileText, to: '/documents' },
  { label: 'Chat History', icon: History, to: '/history' },
  { label: 'Analytics', icon: ChartColumnIncreasing, to: '/analytics' },
  { label: 'HR Dashboard', icon: BriefcaseBusiness, to: '/hr-dashboard' },
  { label: 'Profile', icon: CircleUserRound, to: '/profile' },
  { label: 'Settings', icon: Settings, to: '/settings' },
];


function App() {
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
              <input
                className="w-40 bg-transparent outline-none"
                placeholder="Search"
                aria-label="Search"
              />
            </label>
            <button className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2">
              <CircleUserRound size={18} />
              <span className="text-sm font-medium">Profile</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden min-h-[calc(100vh-73px)] w-72 border-r border-slate-200 bg-white px-4 py-6 lg:block">
          <nav className="space-y-2">
            {sidebarItems.map(({ label, icon: Icon, to }) => (
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
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/assistant" element={<PlaceholderPage title="AI Assistant" />} />
            <Route path="/documents" element={<PlaceholderPage title="Documents" />} />
            <Route path="/history" element={<PlaceholderPage title="Chat History" />} />
            <Route path="/analytics" element={<PlaceholderPage title="Analytics" />} />
            <Route path="/hr-dashboard" element={<HRDashboardPage />} />
            <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Employee view</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Welcome, Maya</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Access your recent documents, jump into the AI assistant, and pick up conversations where you left off.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Quick Actions</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button className="rounded-full bg-slate-900 px-3 py-2 text-white">Ask AI</button>
              <button className="rounded-full border border-slate-200 bg-white px-3 py-2">View Docs</button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Documents</h3>
            <button className="text-sm font-medium text-slate-500">View all</button>
          </div>
          <div className="space-y-3">
            {['Offer Letter', 'Benefits Guide', 'Payroll Summary'].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{item}</p>
                  <p className="text-sm text-slate-500">Updated just now</p>
                </div>
                <FileText size={18} className="text-slate-400" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Chats</h3>
            <button className="text-sm font-medium text-slate-500">Open</button>
          </div>
          <div className="space-y-3">
            {['Leave policy question', 'Benefits clarification', 'Document upload help'].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{item}</p>
                  <p className="text-sm text-slate-500">Last activity 2h ago</p>
                </div>
                <MessageSquareText size={18} className="text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function HRDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">HR view</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">HR Dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">Monitor uploaded documents and pending feedback at a glance.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Documents Uploaded</h3>
          <div className="mt-4 space-y-3">
            {['12 new submissions', '7 verified files', '3 pending review'].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Pending Feedback</h3>
          <div className="mt-4 space-y-3">
            {['3 policy questions', '2 onboarding requests', '1 document follow-up'].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">This section is ready for the next UI pass.</p>
    </div>
  );
}


// export default App;

export default App;
