import { Link } from 'react-router-dom';
import { Plus, Users2 } from 'lucide-react';

export function EmployeeManagementPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">HR view</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Employee Management</h2>
            <p className="mt-2 text-sm text-slate-600">Manage employee onboarding from the same layout used for HR management.</p>
          </div>

          <Link
            to="/hr/employees/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus size={16} />
            Create Employee
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-slate-900 p-3 text-white">
            <Users2 size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Employees</h3>
            <p className="text-sm text-slate-600">Employee list will appear here once records are available.</p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-600">
          No employees have been created yet.
        </div>
      </section>
    </div>
  );
}