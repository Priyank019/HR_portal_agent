import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginRequestSchema, type LoginRequest } from '@hr-portal/auth-contracts';
import { useAuth } from '../context/auth-context';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, status } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      email: 'maya@example.com',
      password: 'Password123!',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      await login(values);
      navigate(fromPath, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in';
      setServerError(message);
    }
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.95),_rgba(15,23,42,0.78)_45%,_rgba(30,41,59,0.94))] text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-slate-200 backdrop-blur">
            <ShieldCheck size={16} />
            Secure HR workspace
          </div>

          <div className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-slate-300">Gateway-authenticated access</p>
            <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-white lg:text-6xl">
              Sign in once and move through the portal with protected access.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-300">
              The frontend talks only to the API Gateway. Your access token stays in memory, while refresh happens through the cookie flow behind the scenes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              'JWT access token in memory',
              'Refresh cookies via gateway',
              'Role-based route protection',
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-2xl backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white p-6 text-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.35)] lg:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Welcome back</h2>
              <p className="text-sm text-slate-500">Sign in to continue to your dashboard.</p>
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400"
                type="email"
                placeholder="maya@example.com"
                {...register('email')}
              />
              {errors.email ? <span className="text-sm text-rose-600">{errors.email.message}</span> : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-slate-400">
                <LockKeyhole size={16} className="text-slate-400" />
                <input
                  className="w-full bg-transparent outline-none"
                  type="password"
                  placeholder="Your password"
                  {...register('password')}
                />
              </div>
              {errors.password ? <span className="text-sm text-rose-600">{errors.password.message}</span> : null}
            </label>

            {serverError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {serverError}
              </div>
            ) : null}

            <button
              className="flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting || status === 'loading'}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="text-center text-sm text-slate-500">
              Demo account defaults are prefilled for local testing.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
