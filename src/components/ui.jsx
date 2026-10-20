export function Spinner({ label = 'Loading…' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-10 text-slate-600">
      <span className="h-6 w-6 animate-spin rounded-full border-4 border-primary/20 border-t-primary" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center">
      <p className="font-semibold text-primary">{title}</p>
      {children && <div className="mt-2 text-slate-600">{children}</div>}
    </div>
  );
}

export function Field({ label, id, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-sm font-medium text-red-700" role="alert">{error}</p>}
    </div>
  );
}

export function Alert({ tone = 'info', children }) {
  const tones = {
    info: 'border-primary/30 bg-primary-50 text-primary',
    warning: 'border-amber-400 bg-amber-50 text-amber-900',
    success: 'border-green-500 bg-green-50 text-green-900',
    error: 'border-red-400 bg-red-50 text-red-800',
  };
  return <div role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'} className={`rounded-lg border-l-4 p-4 text-sm sm:text-base ${tones[tone]}`}>{children}</div>;
}

export function PageHeader({ title, subtitle }) {
  return (
    <section className="bg-primary-50">
      <div className="container-page py-10 sm:py-14">
        <h1 className="h1">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-lg text-slate-700">{subtitle}</p>}
      </div>
    </section>
  );
}

