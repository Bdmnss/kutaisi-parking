import { useState } from 'react';
import { Link } from 'react-router-dom';
import { findBooking } from '../services/api.js';
import { PageHeader, Spinner, EmptyState, Field } from '../components/ui.jsx';
import { money } from '../services/format.js';

const fmt = (d) => new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export default function MyBooking() {
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (q.trim().length < 3) { setError('Enter your plate number or booking code (e.g. KP-1001).'); return; }
    setError(''); setLoading(true);
    setResults(await findBooking(q));
    setLoading(false);
  };

  return (
    <>
      <PageHeader title="My booking" subtitle="Find your booking by car plate number or booking code." />
      <section className="container-page max-w-3xl py-12">
        <form onSubmit={submit} noValidate className="card flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <Field label="Plate number or booking code" id="lookup" error={error} hint="Try demo: KP-1001 or AA-123-BB">
              <input id="lookup" className={`input uppercase ${error ? 'input-error' : ''}`} value={q} onChange={(e) => setQ(e.target.value)} aria-invalid={!!error} />
            </Field>
          </div>
          <button className="btn-primary sm:mt-6" disabled={loading}>{loading ? 'Searching…' : 'Find booking'}</button>
        </form>
        <div className="mt-8">
          {loading && <Spinner label="Searching bookings…" />}
          {!loading && results?.length === 0 && (
            <EmptyState title="No booking found">Check the plate or code, or <Link className="font-semibold text-primary underline" to="/contact">contact us</Link>.</EmptyState>
          )}
          {!loading && results?.map((b) => (
            <article key={b.code} className="card mb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-primary">{b.code}</h2>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${b.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>{b.status}</span>
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div><dt className="text-sm text-slate-500">Plate</dt><dd className="font-semibold">{b.plate}</dd></div>
                <div><dt className="text-sm text-slate-500">Name</dt><dd>{b.name}</dd></div>
                <div><dt className="text-sm text-slate-500">Arrival</dt><dd>{fmt(b.from)}</dd></div>
                <div><dt className="text-sm text-slate-500">Departure</dt><dd>{fmt(b.to)}</dd></div>
                <div><dt className="text-sm text-slate-500">Days</dt><dd>{b.days}</dd></div>
                <div><dt className="text-sm text-slate-500">Total</dt><dd className="font-semibold">{money(b.total)}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
