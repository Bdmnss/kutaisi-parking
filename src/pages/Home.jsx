import { Link } from 'react-router-dom';
import { SITE } from '../data/site.js';

const FEATURES = [
  { t: 'Open 24/7', d: 'Arrive or leave at any hour – the car park never closes.' },
  { t: 'Automatic gate', d: 'Your plate number opens the gate. No tickets, no queues.' },
  { t: 'Next to the terminal', d: 'Park at Kutaisi International Airport and walk to departures.' },
  { t: '10 GEL per day', d: 'Simple daily price. 1 day free with a GLOBALCELL eSIM.' },
];

const STEPS = ['Choose your dates and times', 'Enter your car plate number', 'Pick a payment option', 'Drive in – the gate opens automatically'];

export default function Home() {
  return (
    <>
      <section className="bg-primary text-white">
        <div className="container-page grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
          <div>
            <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-sm font-medium">Kutaisi International Airport · Georgia</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl xl:text-6xl">Airport parking, simple and secure.</h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">24/7 car park at Kutaisi airport. Book online in a minute, drive in with automatic plate recognition.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/booking" className="btn-white">Book parking</Link>
              <Link to="/prices" className="btn border-2 border-white/70 text-white hover:bg-white/10">See prices</Link>
            </div>
          </div>
          <div className="card border-0 text-slate-800">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-light">From</p>
            <p className="text-5xl font-bold text-primary">10 GEL<span className="text-xl font-medium text-slate-500"> / day</span></p>
            <ul className="mt-5 space-y-2">
              <li>✓ Guaranteed space with online prepayment</li>
              <li>✓ 1 free day with a GLOBALCELL eSIM</li>
              <li>✓ Voucher codes accepted</li>
            </ul>
            <a href={SITE.phoneHref} className="btn-outline mt-6 w-full">Call {SITE.phone}</a>
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <h2 className="h2">Why park with us</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.t} className="card">
              <h3 className="text-lg font-semibold text-primary">{f.t}</h3>
              <p className="mt-2 text-slate-600">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary-50">
        <div className="container-page py-14 sm:py-20">
          <h2 className="h2">How it works</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
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
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Empowered by GLOBALCELL</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Get an eSIM, get a free parking day</h2>
            <p className="mt-2 text-white/85">Mobile data in Georgia from 20 GEL. Already have a GLOBALCELL eSIM? The free day is yours too.</p>
          </div>
          <Link to="/esim" className="btn-white shrink-0">Explore eSIM</Link>
        </div>
      </section>
    </>
  );
}
