import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

export function AccessDeniedPage() {
  const { logout, user } = useAuth();

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-6 text-slate-900">
      <div className="max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 inline-flex rounded-2xl bg-rose-50 p-4 text-rose-600">
          <ShieldAlert size={24} />
        </div>
        <h1 className="text-3xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-slate-600">
          {user ? `Your current role (${user.role}) cannot access this area.` : 'You do not have permission to open this page.'}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link to="/dashboard" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Go to dashboard
          </Link>
          <button
            type="button"
            onClick={() => {
              void logout();
            }}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
