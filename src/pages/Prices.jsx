import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPrices, getEsimPackages } from '../services/api.js';
import { PageHeader, Spinner, EmptyState } from '../components/ui.jsx';
import { money, formatValidity } from '../services/format.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Prices() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [esims, setEsims] = useState(null);
  useEffect(() => {
    getPrices().then(setData);
    getEsimPackages().then(setEsims);
  }, []);

  return (
    <>
      <PageHeader title={t.prices.title} subtitle={t.prices.subtitle} />
      <section className="container-page py-12">
        {!data ? <Spinner label={t.prices.loadingPrices} /> : (
          <>
            <div className="grid gap-5 sm:grid-cols-3">
              {data.tiers.map((tier) => (
                <div key={tier.id} className="card text-center">
                  <h2 className="text-lg font-semibold text-slate-700">{t.prices.tiers[tier.id] ?? tier.label}</h2>
                  <p className="mt-2 text-4xl font-bold text-primary">{money(tier.pricePerDay, t.common.currency)}</p>
                  <p className="text-slate-500">{t.prices.perDay}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left">
                <caption className="sr-only">{t.prices.exampleTotals}</caption>
                <thead className="bg-primary-50 text-primary"><tr><th className="p-3">{t.prices.days}</th><th className="p-3">{t.prices.standard}</th><th className="p-3">{t.prices.withEsim}</th></tr></thead>
                <tbody>
                  {[1, 3, 7, 14].map((d) => (
                    <tr key={d} className="border-t border-slate-200">
                      <td className="p-3">{d}</td>
                      <td className="p-3">{money(d * data.dailyRate, t.common.currency)}</td>
                      <td className="p-3 font-semibold text-primary">{money((d - data.freeDaysWithEsim) * data.dailyRate, t.common.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-slate-600">{t.prices.note}</p>
          </>
        )}
        <h2 className="h2 mt-14">{t.prices.esimPackages}</h2>
        {!esims ? <Spinner label={t.prices.loadingPackages} /> : esims.length === 0 ? <EmptyState title={t.prices.noPackages} /> : (
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {esims.map((p) => (
              <div key={p.id} className="card">
                <h3 className="font-semibold text-primary">{p.name}</h3>
                <p className="text-slate-600">{p.data} · {formatValidity(p.validity, t)}</p>
                <p className="mt-2 text-2xl font-bold">{money(p.price, t.common.currency)}</p>
              </div>
            ))}
          </div>
        )}
        <Link to="/booking" className="btn-primary mt-10 w-full sm:w-auto">{t.prices.bookParking}</Link>
      </section>
    </>
  );
}
