import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  ChartColumnIncreasing,
  FileText,
  LayoutDashboard,
  MessageSquareText,
} from 'lucide-react';
import { RequireAuth, RequireRole } from './components/route-guards';
import { ChatPanel } from './components/ChatPanel';
import { AppShell } from './layouts/AppShell';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { LoginPage } from './pages/LoginPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/documents" element={<PlaceholderPage title="Documents" icon={<FileText size={18} />} />} />
          <Route path="/history" element={<PlaceholderPage title="Chat History" icon={<MessageSquareText size={18} />} />} />
          <Route path="/analytics" element={<PlaceholderPage title="Analytics" icon={<ChartColumnIncreasing size={18} />} />} />

          <Route element={<RequireRole allowedRoles={['HR', 'ADMIN']} />}>
            <Route path="/hr" element={<HRDashboardPage />} />
            <Route path="/hr-dashboard" element={<Navigate to="/hr" replace />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route path="/profile" element={<PlaceholderPage title="Profile" icon={<LayoutDashboard size={18} />} />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" icon={<LayoutDashboard size={18} />} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Employee view</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Welcome back</h2>
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

function AssistantPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Assistant</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">AI Assistant</h2>
        <p className="mt-2 text-sm text-slate-600">Ask one question and receive one response from the assistant.</p>
      </section>

      <ChatPanel />
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

function AdminPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Admin view</p>
      <h2 className="mt-2 text-3xl font-semibold text-slate-900">Admin Console</h2>
      <p className="mt-2 text-sm text-slate-600">Reserved for platform administrators.</p>
    </div>
  );
}

function PlaceholderPage({ title, icon }: { title: string; icon: ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 inline-flex rounded-2xl bg-slate-100 p-3 text-slate-700">{icon}</div>
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">This section is ready for the next UI pass.</p>
    </div>
  );
}

export default App;
