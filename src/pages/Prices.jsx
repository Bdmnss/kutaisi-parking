import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPrices, getEsimPackages } from '../services/api.js';
import { PageHeader, Spinner, EmptyState } from '../components/ui.jsx';
import { money } from '../services/format.js';

export default function Prices() {
  const [data, setData] = useState(null);
  const [esims, setEsims] = useState(null);
  useEffect(() => {
    getPrices().then(setData);
    getEsimPackages().then(setEsims);
  }, []);

  return (
    <>
      <PageHeader title="Prices" subtitle="One simple daily rate. Every started 24 hours counts as one day." />
      <section className="container-page py-12">
        {!data ? <Spinner label="Loading prices…" /> : (
          <>
            <div className="grid gap-5 sm:grid-cols-3">
              {data.tiers.map((t) => (
                <div key={t.id} className="card text-center">
                  <h2 className="text-lg font-semibold text-slate-700">{t.label}</h2>
                  <p className="mt-2 text-4xl font-bold text-primary">{money(t.pricePerDay)}</p>
                  <p className="text-slate-500">per day</p>
                </div>
              ))}
            </div>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left">
                <caption className="sr-only">Example totals</caption>
                <thead className="bg-primary-50 text-primary"><tr><th className="p-3">Days</th><th className="p-3">Standard</th><th className="p-3">With GLOBALCELL eSIM</th></tr></thead>
                <tbody>
                  {[1, 3, 7, 14].map((d) => (
                    <tr key={d} className="border-t border-slate-200">
                      <td className="p-3">{d}</td>
                      <td className="p-3">{money(d * data.dailyRate)}</td>
                      <td className="p-3 font-semibold text-primary">{money((d - data.freeDaysWithEsim) * data.dailyRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-slate-600">1 free parking day per booking when you buy a GLOBALCELL eSIM in the booking or already have one. Voucher codes are applied after the free day.</p>
          </>
        )}
        <h2 className="h2 mt-14">eSIM packages</h2>
        {!esims ? <Spinner label="Loading packages…" /> : esims.length === 0 ? <EmptyState title="No packages available" /> : (
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {esims.map((p) => (
              <div key={p.id} className="card">
                <h3 className="font-semibold text-primary">{p.name}</h3>
                <p className="text-slate-600">{p.data} · {p.validity}</p>
                <p className="mt-2 text-2xl font-bold">{money(p.price)}</p>
              </div>
            ))}
          </div>
        )}
        <Link to="/booking" className="btn-primary mt-10 w-full sm:w-auto">Book parking</Link>
      </section>
    </>
  );
}
