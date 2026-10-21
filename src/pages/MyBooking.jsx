import { useState } from 'react';
import { Link } from 'react-router-dom';
import { findBooking } from '../services/api.js';
import { PageHeader, Spinner, EmptyState, Field } from '../components/ui.jsx';
import { money, formatDateTime } from '../services/format.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function MyBooking() {
  const { t, lang } = useLanguage();
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (q.trim().length < 3) { setError(t.myBooking.enterQuery); return; }
    setError(''); setLoading(true);
    setResults(await findBooking(q));
    setLoading(false);
  };

  return (
    <>
      <PageHeader title={t.myBooking.title} subtitle={t.myBooking.subtitle} />
      <section className="container-page max-w-3xl py-12">
        <form onSubmit={submit} noValidate className="card flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <Field label={t.myBooking.lookup} id="lookup" error={error} hint={t.myBooking.lookupHint}>
              <input id="lookup" className={`input uppercase ${error ? 'input-error' : ''}`} value={q} onChange={(e) => setQ(e.target.value)} aria-invalid={!!error} />
            </Field>
          </div>
          <button className="btn-primary sm:mt-6" disabled={loading}>{loading ? t.myBooking.searching : t.myBooking.find}</button>
        </form>
        <div className="mt-8">
          {loading && <Spinner label={t.myBooking.searchingBookings} />}
          {!loading && results?.length === 0 && (
            <EmptyState title={t.myBooking.noBooking}>
              {t.myBooking.noBookingHint.split('{link}')[0]}
              <Link className="font-semibold text-primary underline" to="/contact">{t.myBooking.contactUs}</Link>
              {t.myBooking.noBookingHint.split('{link}')[1]}
            </EmptyState>
          )}
          {!loading && results?.map((b) => (
            <article key={b.code} className="card mb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-primary">{b.code}</h2>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${b.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>
                  {b.status === 'Confirmed' ? t.myBooking.statusConfirmed : t.myBooking.statusRequest}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div><dt className="text-sm text-slate-500">{t.myBooking.plate}</dt><dd className="font-semibold">{b.plate}</dd></div>
                <div><dt className="text-sm text-slate-500">{t.myBooking.name}</dt><dd>{b.name}</dd></div>
                <div><dt className="text-sm text-slate-500">{t.myBooking.arrival}</dt><dd>{formatDateTime(b.from, lang)}</dd></div>
                <div><dt className="text-sm text-slate-500">{t.myBooking.departure}</dt><dd>{formatDateTime(b.to, lang)}</dd></div>
                <div><dt className="text-sm text-slate-500">{t.myBooking.days}</dt><dd>{b.days}</dd></div>
                <div><dt className="text-sm text-slate-500">{t.myBooking.total}</dt><dd className="font-semibold">{money(b.total, t.common.currency)}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
