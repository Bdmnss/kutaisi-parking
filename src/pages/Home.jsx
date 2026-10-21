import { Link } from 'react-router-dom';
import { SITE } from '../data/site.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Home() {
  const { t } = useLanguage();
  return (
    <>
      <section className="bg-primary text-white">
        <div className="container-page grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
          <div>
            <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-sm font-medium">{t.home.badge}</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl xl:text-6xl">{t.home.title}</h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">{t.home.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/booking" className="btn-white">{t.home.bookParking}</Link>
              <Link to="/prices" className="btn border-2 border-white/70 text-white hover:bg-white/10">{t.home.seePrices}</Link>
            </div>
          </div>
          <div className="card border-0 text-slate-800">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-light">{t.home.from}</p>
            <p className="text-5xl font-bold text-primary">10 {t.common.currency}<span className="text-xl font-medium text-slate-500"> {t.home.perDay}</span></p>
            <ul className="mt-5 space-y-2">
              {t.home.bullets.map((b) => <li key={b}>✓ {b}</li>)}
            </ul>
            <a href={SITE.phoneHref} className="btn-outline mt-6 w-full">{t.common.call} {SITE.phone}</a>
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <h2 className="h2">{t.home.whyTitle}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.features.map((f) => (
            <div key={f.t} className="card">
              <h3 className="text-lg font-semibold text-primary">{f.t}</h3>
              <p className="mt-2 text-slate-600">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary-50">
        <div className="container-page py-14 sm:py-20">
          <h2 className="h2">{t.home.howTitle}</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.home.steps.map((s, i) => (
              <li key={s} className="flex items-start gap-4 rounded-2xl bg-white p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">{i + 1}</span>
                <span className="pt-2 font-medium">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary p-6 text-white sm:p-10 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">{t.home.esimKicker}</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{t.home.esimTitle}</h2>
            <p className="mt-2 text-white/85">{t.home.esimSubtitle}</p>
          </div>
          <Link to="/esim" className="btn-white shrink-0">{t.home.exploreEsim}</Link>
        </div>
      </section>
    </>
  );
}
