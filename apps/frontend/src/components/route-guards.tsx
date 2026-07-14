import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { AuthRole } from '@hr-portal/auth-contracts';
import { useAuth } from '../context/auth-context';

export function RequireAuth() {
  const { isAuthenticated, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-200 shadow-2xl">
          Restoring session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RequireRole({ allowedRoles }: { allowedRoles: AuthRole[] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}
