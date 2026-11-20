import { cn } from '../../utils/helpers.js';

export function StatCard({ label, value, hint, icon: Icon, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-50 text-slate-600',
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 truncate text-2xl font-semibold text-slate-900 sm:text-3xl">
            {value ?? 0}
          </p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={cn('rounded-xl p-2.5', tones[tone] || tones.slate)}>
            <Icon size={18} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function DetailCard({ title, description, actions, children, className = '' }) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-sm',
        className
      )}
    >
      {(title || actions) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            {title ? <h3 className="text-base font-semibold text-slate-900">{title}</h3> : null}
            {description ? <p className="mt-0.5 text-sm text-slate-500">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      )}
      <div className="px-4 py-4 sm:px-5 sm:py-5">{children}</div>
    </section>
  );
}

export function DetailGrid({ children, cols = 2, className = '' }) {
  const colClass =
    cols === 3
      ? 'sm:grid-cols-2 xl:grid-cols-3'
      : cols === 1
        ? 'grid-cols-1'
        : 'sm:grid-cols-2';

  return <div className={cn('grid gap-3 sm:gap-4', colClass, className)}>{children}</div>;
}

export function DetailItem({ label, value, className = '' }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3',
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1.5 break-words text-sm font-medium text-slate-900">
        {value ?? '—'}
      </div>
    </div>
  );
}

export function SectionHeader({ title, description, actions, className = '' }) {
  return (
    <div
      className={cn(
        'mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {description ? <p className="mt-0.5 text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AlertBanner({ tone = 'error', children }) {
  const tones = {
    error: 'border-red-200 bg-red-50 text-red-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  };

  return (
    <div className={cn('mb-4 rounded-xl border px-3.5 py-3 text-sm sm:px-4', tones[tone])}>
      {children}
    </div>
  );
}

export function HeroIdentity({
  title,
  subtitle,
  badge,
  meta = [],
  avatarText,
  className = '',
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
        className
      )}
    >
      <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-lg font-semibold text-white shadow-sm">
            {avatarText || (title || '?').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold text-slate-900 sm:text-2xl">
                {title}
              </h2>
              {badge}
            </div>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
            {meta.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {meta.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-lg bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
