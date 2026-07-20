import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BadgeCheck, BriefcaseBusiness, LockKeyhole, ShieldCheck, UserRound, AtSign, IdCard } from 'lucide-react';
import { toast } from 'sonner';
import { createHrRequestSchema, type CreateHrRequest } from '@hr-portal/auth-contracts';
import { useAuth } from '../context/auth-context';
import { adminApi } from '../lib/admin-api';

const fieldClassName =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400';

export function CreateHrPage() {
  const { accessToken, user } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateHrRequest>({
    resolver: zodResolver(createHrRequestSchema),
    defaultValues: {
      employeeId: '',
      name: '',
      email: '',
      department: '',
      designation: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    if (!accessToken) {
      setServerError('Authentication is required to create HR accounts.');
      return;
    }

    try {
      await adminApi.createHr(values, accessToken);
      toast.success('HR account created successfully.');
      reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create HR account';
      setServerError(message);
      toast.error(message);
    }
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">HR Management</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Create HR</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Create a new HR account from the admin dashboard. The role is fixed to HR and the temporary password will require a change on first sign-in.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Signed in as</p>
            <p className="mt-1">{user ? `${user.name} · ${user.role}` : 'Admin'}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-slate-900 p-3 text-white">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">New HR account</h3>
            <p className="text-sm text-slate-600">All fields are required. Role is assigned automatically.</p>
          </div>
        </div>

        <form className="grid gap-5 lg:grid-cols-2" onSubmit={onSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Full Name</span>
            <div className="relative">
              <UserRound size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className={`${fieldClassName} pl-11`} placeholder="Enter full name" {...register('name')} />
            </div>
            {errors.name ? <span className="text-sm text-rose-600">{errors.name.message}</span> : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Employee ID</span>
            <div className="relative">
              <IdCard size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className={`${fieldClassName} pl-11`} placeholder="HR-001" {...register('employeeId')} />
            </div>
            {errors.employeeId ? <span className="text-sm text-rose-600">{errors.employeeId.message}</span> : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <div className="relative">
              <AtSign size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className={`${fieldClassName} pl-11`} type="email" placeholder="hr@example.com" {...register('email')} />
            </div>
            {errors.email ? <span className="text-sm text-rose-600">{errors.email.message}</span> : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Department</span>
            <div className="relative">
              <BriefcaseBusiness size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className={`${fieldClassName} pl-11`} placeholder="Human Resources" {...register('department')} />
            </div>
            {errors.department ? <span className="text-sm text-rose-600">{errors.department.message}</span> : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Designation</span>
            <input className={fieldClassName} placeholder="HR Manager" {...register('designation')} />
            {errors.designation ? <span className="text-sm text-rose-600">{errors.designation.message}</span> : null}
          </label>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 lg:col-span-1">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
                <BadgeCheck size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">Role</p>
                <p className="text-sm text-slate-600">Automatically assigned as HR</p>
              </div>
            </div>
            <div className="mt-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              HR
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Temporary Password</span>
            <div className="relative">
              <LockKeyhole size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className={`${fieldClassName} pl-11`} type="password" placeholder="Create a secure password" {...register('password')} />
            </div>
            {errors.password ? <span className="text-sm text-rose-600">{errors.password.message}</span> : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Confirm Password</span>
            <div className="relative">
              <LockKeyhole size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className={`${fieldClassName} pl-11`} type="password" placeholder="Repeat password" {...register('confirmPassword')} />
            </div>
            {errors.confirmPassword ? <span className="text-sm text-rose-600">{errors.confirmPassword.message}</span> : null}
          </label>

          {serverError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 lg:col-span-2">
              {serverError}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <button
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating HR account...' : 'Create HR'}
            </button>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Employees must change this password after their first login.
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}