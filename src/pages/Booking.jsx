import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPrices, getEsimPackages, validateVoucher, createBooking } from '../services/api.js';
import { countDays, calculateTotal } from '../services/pricing.js';
import { PageHeader, Spinner, Field, Alert } from '../components/ui.jsx';
import { money } from '../services/format.js';

const STEPS = ['Dates & car', 'Contact', 'eSIM & voucher', 'Payment & summary'];
const PAYMENT_OPTIONS = [
  { id: 'full', title: 'Pay in full now', desc: 'Your space is guaranteed.', guaranteed: true },
  { id: 'deposit', title: '1-day fee now, rest on arrival', desc: 'Your space is guaranteed. Recommended.', guaranteed: true },
  { id: 'arrival', title: 'Pay on arrival', desc: 'Space is NOT guaranteed.', guaranteed: false },
];

const pad = (n) => String(n).padStart(2, '0');
const toLocalDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = toLocalDate(new Date());
const plusDays = (n) => toLocalDate(new Date(Date.now() + n * 864e5));

const initial = {
  fromDate: plusDays(1), fromTime: '10:00', toDate: plusDays(4), toTime: '10:00',
  plate: '', carModel: '',
  name: '', email: '', phone: '',
  esimChoice: 'none', esimPackage: '', voucher: '',
  paymentOption: 'deposit', terms: false,
};

function validate(step, f) {
  const e = {};
  if (step === 0) {
    const from = new Date(`${f.fromDate}T${f.fromTime}`);
    const to = new Date(`${f.toDate}T${f.toTime}`);
    if (!f.fromDate || !f.fromTime) e.from = 'Choose arrival date and time.';
    else if (from < new Date(Date.now() - 6e4)) e.from = 'Arrival cannot be in the past.';
    if (!f.toDate || !f.toTime) e.to = 'Choose departure date and time.';
    else if (to <= from) e.to = 'Departure must be after arrival.';
    if (!f.plate.trim()) e.plate = 'Car plate number is required for automatic gate opening.';
    else if (!/^[A-Z0-9][A-Z0-9 -]{2,11}$/i.test(f.plate.trim())) e.plate = 'Enter a valid plate (3–12 letters/digits), e.g. AA-123-BB.';
  }
  if (step === 1) {
    if (f.name.trim().length < 2) e.name = 'Please enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Please enter a valid email address.';
    if (!/^\+?[\d\s()-]{7,20}$/.test(f.phone)) e.phone = 'Please enter a valid phone number, e.g. +995 5XX XX XX XX.';
  }
  if (step === 2 && f.esimChoice === 'buy' && !f.esimPackage) e.esimPackage = 'Choose an eSIM package.';
  if (step === 3 && !f.terms) e.terms = 'Please accept the booking terms.';
  return e;
}

export default function Booking() {
  const [prices, setPrices] = useState(null);
  const [packages, setPackages] = useState([]);
  const [step, setStep] = useState(0);
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const [voucher, setVoucher] = useState(null);
  const [voucherState, setVoucherState] = useState({ loading: false, error: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    Promise.all([getPrices(), getEsimPackages()]).then(([p, e]) => { setPrices(p); setPackages(e); });
  }, []);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const days = countDays(`${f.fromDate}T${f.fromTime}`, `${f.toDate}T${f.toTime}`);
  const pkg = packages.find((p) => p.id === f.esimPackage);
  const esimPrice = f.esimChoice === 'buy' && pkg ? pkg.price : 0;
  const calc = useMemo(() => calculateTotal({
    days, rate: prices?.dailyRate ?? 10, hasEsim: f.esimChoice !== 'none' && (f.esimChoice === 'have' || !!pkg), esimPrice, voucher,
  }), [days, prices, f.esimChoice, pkg, esimPrice, voucher]);

  const dueNow = f.paymentOption === 'full' ? calc.total
    : f.paymentOption === 'deposit' ? Math.min(calc.total, (prices?.dailyRate ?? 10) + calc.esim) : 0;

  const next = () => {
    const e = validate(step, f);
    setErrors(e);
    if (!Object.keys(e).length) { setStep((s) => s + 1); window.scrollTo(0, 0); }
  };
  const back = () => { setErrors({}); setStep((s) => s - 1); };

  const applyVoucher = async () => {
    if (!f.voucher.trim()) { setVoucherState({ loading: false, error: 'Enter a voucher code.' }); return; }
    setVoucherState({ loading: true, error: '' });
    try {
      const v = await validateVoucher(f.voucher);
      if (v.appliesTo === 'esim' && f.esimChoice !== 'buy') throw new Error('This voucher applies to eSIM purchases only.');
      setVoucher(v); setVoucherState({ loading: false, error: '' });
    } catch (err) { setVoucher(null); setVoucherState({ loading: false, error: err.message }); }
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate(3, f);
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    const booking = await createBooking({
      plate: f.plate.trim().toUpperCase(), carModel: f.carModel, name: f.name, email: f.email, phone: f.phone,
      from: `${f.fromDate}T${f.fromTime}`, to: `${f.toDate}T${f.toTime}`, days,
      esim: f.esimChoice, esimPackage: pkg?.name ?? null, voucher: voucher?.code ?? null,
      total: calc.total, dueNow, paymentOption: f.paymentOption,
    });
    setSubmitting(false); setResult(booking); window.scrollTo(0, 0);
  };

  if (result) return <Confirmation booking={result} />;

  const err = (k) => (errors[k] ? 'input-error' : '');

  return (
    <>
      <PageHeader title="Book parking" subtitle="Reserve your space at Kutaisi airport in a few steps." />
      <section className="container-page py-10">
        <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Booking progress">
          {STEPS.map((s, i) => (
            <li key={s} className="min-w-0" aria-current={i === step ? 'step' : undefined}>
              <div className={`h-1.5 rounded-full ${i <= step ? 'bg-primary' : 'bg-slate-200'}`} />
              <p className={`mt-2 truncate text-xs sm:text-sm ${i === step ? 'font-semibold text-primary' : 'text-slate-500'}`}>
                <span className="sm:hidden">{i + 1}</span><span className="hidden sm:inline">{i + 1}. {s}</span>
              </p>
            </li>
          ))}
        </ol>

        {!prices ? <Spinner label="Loading booking options…" /> : (
          <div className="grid gap-8 lg:grid-cols-3">
            <form onSubmit={step === 3 ? submit : (e) => { e.preventDefault(); next(); }} noValidate className="card space-y-5 lg:col-span-2">
              <h2 className="text-xl font-bold text-primary">{STEPS[step]}</h2>

              {step === 0 && (
                <>
                  <fieldset className="grid gap-4 sm:grid-cols-2">
                    <legend className="mb-2 font-semibold text-slate-800">Arrival (drop-off)</legend>
                    <Field label="Date" id="fromDate" error={errors.from}><input id="fromDate" type="date" min={today} className={`input ${err('from')}`} value={f.fromDate} onChange={set('fromDate')} /></Field>
                    <Field label="Time" id="fromTime"><input id="fromTime" type="time" className={`input ${err('from')}`} value={f.fromTime} onChange={set('fromTime')} /></Field>
                  </fieldset>
                  <fieldset className="grid gap-4 sm:grid-cols-2">
                    <legend className="mb-2 font-semibold text-slate-800">Departure (pick-up)</legend>
                    <Field label="Date" id="toDate" error={errors.to}><input id="toDate" type="date" min={f.fromDate || today} className={`input ${err('to')}`} value={f.toDate} onChange={set('toDate')} /></Field>
                    <Field label="Time" id="toTime"><input id="toTime" type="time" className={`input ${err('to')}`} value={f.toTime} onChange={set('toTime')} /></Field>
                  </fieldset>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Car plate number *" id="plate" error={errors.plate} hint="Required – the gate opens automatically for this plate.">
                      <input id="plate" required autoComplete="off" placeholder="AA-123-BB" className={`input uppercase ${err('plate')}`} value={f.plate} onChange={set('plate')} aria-invalid={!!errors.plate} />
                    </Field>
                    <Field label="Car make / model (optional)" id="carModel"><input id="carModel" className="input" value={f.carModel} onChange={set('carModel')} placeholder="Toyota Prius" /></Field>
                  </div>
                </>
              )}

              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2"><Field label="Full name *" id="name" error={errors.name}><input id="name" autoComplete="name" className={`input ${err('name')}`} value={f.name} onChange={set('name')} aria-invalid={!!errors.name} /></Field></div>
                  <Field label="Email *" id="email" error={errors.email}><input id="email" type="email" autoComplete="email" className={`input ${err('email')}`} value={f.email} onChange={set('email')} aria-invalid={!!errors.email} /></Field>
                  <Field label="Phone *" id="phone" error={errors.phone}><input id="phone" type="tel" autoComplete="tel" placeholder="+995 5XX XX XX XX" className={`input ${err('phone')}`} value={f.phone} onChange={set('phone')} aria-invalid={!!errors.phone} /></Field>
                </div>
              )}

              {step === 2 && (
                <>
                  <fieldset>
                    <legend className="font-semibold text-slate-800">GLOBALCELL eSIM – get 1 parking day free</legend>
                    <div className="mt-3 grid gap-3">
                      {[
                        { id: 'none', t: 'No eSIM', d: 'Continue without eSIM.' },
                        { id: 'buy', t: 'Buy a GLOBALCELL eSIM', d: 'From 20 GEL. Includes 1 free parking day.' },
                        { id: 'have', t: 'I already have a GLOBALCELL eSIM', d: 'Includes 1 free parking day.' },
                      ].map((o) => (
                        <label key={o.id} className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition hover:border-primary/60 ${f.esimChoice === o.id ? 'border-primary bg-primary-50' : 'border-slate-200'}`}>
                          <input type="radio" name="esim" value={o.id} checked={f.esimChoice === o.id} onChange={set('esimChoice')} className="mt-1 h-5 w-5 accent-primary" />
                          <span><span className="block font-semibold">{o.t}</span><span className="text-sm text-slate-600">{o.d}</span></span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {f.esimChoice === 'buy' && (
                    <Field label="eSIM package *" id="esimPackage" error={errors.esimPackage}>
                      <select id="esimPackage" className={`input ${err('esimPackage')}`} value={f.esimPackage} onChange={set('esimPackage')}>
                        <option value="">Select a package</option>
                        {packages.map((p) => <option key={p.id} value={p.id}>{p.name} – {p.data}, {p.validity} – {money(p.price)}</option>)}
                      </select>
                    </Field>
                  )}
                  <Field label="Voucher code (parking or eSIM)" id="voucher" error={voucherState.error} hint="Demo codes: WELCOME10, PARK5, ESIM5">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input id="voucher" className={`input uppercase ${voucherState.error ? 'input-error' : ''}`} value={f.voucher} onChange={(e) => { set('voucher')(e); setVoucher(null); }} />
                      <button type="button" className="btn-outline shrink-0" onClick={applyVoucher} disabled={voucherState.loading}>{voucherState.loading ? 'Checking…' : 'Apply'}</button>
                    </div>
                  </Field>
                  {voucher && <Alert tone="success">Voucher {voucher.code} applied: {voucher.description}.</Alert>}
                </>
              )}

              {step === 3 && (
                <>
                  <fieldset>
                    <legend className="font-semibold text-slate-800">Payment option</legend>
                    <div className="mt-3 grid gap-3">
                      {PAYMENT_OPTIONS.map((o) => (
                        <label key={o.id} className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition hover:border-primary/60 ${f.paymentOption === o.id ? (o.guaranteed ? 'border-primary bg-primary-50' : 'border-amber-500 bg-amber-50') : 'border-slate-200'}`}>
                          <input type="radio" name="payment" value={o.id} checked={f.paymentOption === o.id} onChange={set('paymentOption')} className="mt-1 h-5 w-5 accent-primary" />
                          <span className="flex-1">
                            <span className="block font-semibold">{o.title}{o.id === 'deposit' && <span className="ml-2 rounded bg-primary px-2 py-0.5 text-xs text-white">Default</span>}</span>
                            <span className={`text-sm ${o.guaranteed ? 'text-slate-600' : 'font-medium text-amber-800'}`}>{o.desc}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {f.paymentOption === 'arrival' && (
                    <Alert tone="warning"><strong>Warning:</strong> with pay on arrival your parking space is not guaranteed. Your booking will be sent as a request only.</Alert>
                  )}
                  <label className="flex min-h-[44px] cursor-pointer items-start gap-3">
                    <input type="checkbox" checked={f.terms} onChange={set('terms')} className="mt-1 h-5 w-5 accent-primary" aria-invalid={!!errors.terms} />
                    <span>I confirm the details are correct and accept the booking terms.</span>
                  </label>
                  {errors.terms && <p className="text-sm font-medium text-red-700" role="alert">{errors.terms}</p>}
                </>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
                {step > 0 ? <button type="button" className="btn-outline" onClick={back}>Back</button> : <span />}
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {step < 3 ? 'Continue' : submitting ? 'Processing…' : f.paymentOption === 'arrival' ? 'Send request' : `Pay ${money(dueNow)}`}
                </button>
              </div>
            </form>

            <Summary f={f} days={days} calc={calc} pkg={pkg} voucher={voucher} dueNow={dueNow} rate={prices.dailyRate} />
          </div>
        )}
      </section>
    </>
  );
}

function Row({ label, value, strong }) {
  return <div className={`flex justify-between gap-4 ${strong ? 'text-lg font-bold text-primary' : ''}`}><dt>{label}</dt><dd className="text-right">{value}</dd></div>;
}

function Summary({ f, days, calc, pkg, voucher, dueNow, rate }) {
  return (
    <aside className="card h-fit lg:sticky lg:top-24" aria-label="Booking summary">
      <h2 className="text-lg font-bold text-primary">Summary</h2>
      <dl className="mt-4 space-y-2 text-sm sm:text-base">
        <Row label="Arrival" value={`${f.fromDate} ${f.fromTime}`} />
        <Row label="Departure" value={`${f.toDate} ${f.toTime}`} />
        {f.plate && <Row label="Plate" value={f.plate.toUpperCase()} />}
        <hr className="border-slate-200" />
        <Row label={`Parking ${days} day${days === 1 ? '' : 's'} × ${money(rate)}`} value={money(calc.parkingGross)} />
        {calc.freeDays > 0 && <Row label="Free day (GLOBALCELL eSIM)" value={`−${money(calc.freeDiscount)}`} />}
        {calc.parkingVoucher > 0 && <Row label={`Voucher ${voucher.code}`} value={`−${money(calc.parkingVoucher)}`} />}
        {pkg && f.esimChoice === 'buy' && <Row label={`eSIM ${pkg.name}`} value={money(pkg.price)} />}
        {calc.esimVoucher > 0 && <Row label={`Voucher ${voucher.code}`} value={`−${money(calc.esimVoucher)}`} />}
        <hr className="border-slate-200" />
        <Row label="Total" value={money(calc.total)} strong />
        <Row label="Due now" value={money(dueNow)} />
        <Row label="Due on arrival" value={money(calc.total - dueNow)} />
      </dl>
      {days === 0 && <p className="mt-3 text-sm text-red-700">Select a valid date range.</p>}
    </aside>
  );
}

function Confirmation({ booking }) {
  const isRequest = booking.paymentOption === 'arrival';
  return (
    <section className="container-page max-w-2xl py-14">
      <div className="card text-center">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${isRequest ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'}`} aria-hidden="true">{isRequest ? '!' : '✓'}</div>
        <h1 className="mt-4 text-2xl font-bold text-primary sm:text-3xl">{isRequest ? 'Request received' : 'Booking confirmed'}</h1>
        <p className="mt-2 text-slate-600">Booking code <strong className="text-primary">{booking.code}</strong> · Plate <strong>{booking.plate}</strong></p>
        {isRequest
          ? <div className="mt-6 text-left"><Alert tone="warning">Your parking space is <strong>not guaranteed</strong>. Payment of {money(booking.total)} is due on arrival. We will contact you at {booking.email}.</Alert></div>
          : <div className="mt-6 text-left"><Alert tone="success">Your space is guaranteed. Paid now: {money(booking.dueNow)}. Due on arrival: {money(booking.total - booking.dueNow)}. A confirmation is sent to {booking.email}.</Alert></div>}
        <p className="mt-6 text-slate-600">On arrival, drive up to the gate – it opens automatically for your plate.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/my-booking" className="btn-primary">View my booking</Link>
          <Link to="/" className="btn-outline">Back to home</Link>
        </div>
      </div>
    </section>
  );
}
