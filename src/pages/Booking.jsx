import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPrices, getEsimPackages, validateVoucher, createBooking } from '../services/api.js';
import { countDays, calculateTotal } from '../services/pricing.js';
import { PageHeader, Spinner, Field, Alert } from '../components/ui.jsx';
import { money, formatValidity } from '../services/format.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { interpolate } from '../i18n/translations.js';

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

function validate(step, f, t) {
  const e = {};
  if (step === 0) {
    const from = new Date(`${f.fromDate}T${f.fromTime}`);
    const to = new Date(`${f.toDate}T${f.toTime}`);
    if (!f.fromDate || !f.fromTime) e.from = t.booking.errors.fromRequired;
    else if (from < new Date(Date.now() - 6e4)) e.from = t.booking.errors.fromPast;
    if (!f.toDate || !f.toTime) e.to = t.booking.errors.toRequired;
    else if (to <= from) e.to = t.booking.errors.toAfter;
    if (!f.plate.trim()) e.plate = t.booking.errors.plateRequired;
    else if (!/^[A-Z0-9][A-Z0-9 -]{2,11}$/i.test(f.plate.trim())) e.plate = t.booking.errors.plateInvalid;
  }
  if (step === 1) {
    if (f.name.trim().length < 2) e.name = t.booking.errors.name;
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = t.booking.errors.email;
    if (!/^\+?[\d\s()-]{7,20}$/.test(f.phone)) e.phone = t.booking.errors.phone;
  }
  if (step === 2 && f.esimChoice === 'buy' && !f.esimPackage) e.esimPackage = t.booking.errors.esimPackage;
  if (step === 3 && !f.terms) e.terms = t.booking.errors.terms;
  return e;
}

export default function Booking() {
  const { t } = useLanguage();
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
    const e = validate(step, f, t);
    setErrors(e);
    if (!Object.keys(e).length) { setStep((s) => s + 1); window.scrollTo(0, 0); }
  };
  const back = () => { setErrors({}); setStep((s) => s - 1); };

  const applyVoucher = async () => {
    if (!f.voucher.trim()) { setVoucherState({ loading: false, error: t.booking.enterVoucher }); return; }
    setVoucherState({ loading: true, error: '' });
    try {
      const v = await validateVoucher(f.voucher);
      if (v.appliesTo === 'esim' && f.esimChoice !== 'buy') throw new Error('voucherEsimOnly');
      setVoucher(v); setVoucherState({ loading: false, error: '' });
    } catch (err) {
      setVoucher(null);
      setVoucherState({ loading: false, error: t.errors[err.message] || err.message });
    }
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate(3, f, t);
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
  const paymentOptions = [
    { id: 'full', title: t.booking.payFullTitle, desc: t.booking.payFullDesc, guaranteed: true },
    { id: 'deposit', title: t.booking.payDepositTitle, desc: t.booking.payDepositDesc, guaranteed: true },
    { id: 'arrival', title: t.booking.payArrivalTitle, desc: t.booking.payArrivalDesc, guaranteed: false },
  ];
  const esimOptions = [
    { id: 'none', title: t.booking.esimNoneTitle, desc: t.booking.esimNoneDesc },
    { id: 'buy', title: t.booking.esimBuyTitle, desc: t.booking.esimBuyDesc },
    { id: 'have', title: t.booking.esimHaveTitle, desc: t.booking.esimHaveDesc },
  ];
  const voucherDescription = voucher ? (t.vouchers[voucher.code] ?? voucher.description) : '';

  return (
    <>
      <PageHeader title={t.booking.title} subtitle={t.booking.subtitle} />
      <section className="container-page py-10">
        <ol className="mb-8 grid grid-cols-4 gap-2" aria-label={t.booking.progress}>
          {t.booking.steps.map((s, i) => (
            <li key={s} className="min-w-0" aria-current={i === step ? 'step' : undefined}>
              <div className={`h-1.5 rounded-full ${i <= step ? 'bg-primary' : 'bg-slate-200'}`} />
              <p className={`mt-2 truncate text-xs sm:text-sm ${i === step ? 'font-semibold text-primary' : 'text-slate-500'}`}>
                <span className="sm:hidden">{i + 1}</span><span className="hidden sm:inline">{i + 1}. {s}</span>
              </p>
            </li>
          ))}
        </ol>

        {!prices ? <Spinner label={t.booking.loading} /> : (
          <div className="grid gap-8 lg:grid-cols-3">
            <form onSubmit={step === 3 ? submit : (e) => { e.preventDefault(); next(); }} noValidate className="card space-y-5 lg:col-span-2">
              <h2 className="text-xl font-bold text-primary">{t.booking.steps[step]}</h2>

              {step === 0 && (
                <>
                  <fieldset className="grid gap-4 sm:grid-cols-2">
                    <legend className="mb-2 font-semibold text-slate-800">{t.booking.arrivalLegend}</legend>
                    <Field label={t.booking.date} id="fromDate" error={errors.from}><input id="fromDate" type="date" min={today} className={`input ${err('from')}`} value={f.fromDate} onChange={set('fromDate')} /></Field>
                    <Field label={t.booking.time} id="fromTime"><input id="fromTime" type="time" className={`input ${err('from')}`} value={f.fromTime} onChange={set('fromTime')} /></Field>
                  </fieldset>
                  <fieldset className="grid gap-4 sm:grid-cols-2">
                    <legend className="mb-2 font-semibold text-slate-800">{t.booking.departureLegend}</legend>
                    <Field label={t.booking.date} id="toDate" error={errors.to}><input id="toDate" type="date" min={f.fromDate || today} className={`input ${err('to')}`} value={f.toDate} onChange={set('toDate')} /></Field>
                    <Field label={t.booking.time} id="toTime"><input id="toTime" type="time" className={`input ${err('to')}`} value={f.toTime} onChange={set('toTime')} /></Field>
                  </fieldset>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t.booking.plate} id="plate" error={errors.plate} hint={t.booking.plateHint}>
                      <input id="plate" required autoComplete="off" placeholder={t.booking.platePlaceholder} className={`input uppercase ${err('plate')}`} value={f.plate} onChange={set('plate')} aria-invalid={!!errors.plate} />
                    </Field>
                    <Field label={t.booking.carModel} id="carModel"><input id="carModel" className="input" value={f.carModel} onChange={set('carModel')} placeholder={t.booking.carModelPlaceholder} /></Field>
                  </div>
                </>
              )}

              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2"><Field label={t.booking.fullName} id="name" error={errors.name}><input id="name" autoComplete="name" className={`input ${err('name')}`} value={f.name} onChange={set('name')} aria-invalid={!!errors.name} /></Field></div>
                  <Field label={t.booking.email} id="email" error={errors.email}><input id="email" type="email" autoComplete="email" className={`input ${err('email')}`} value={f.email} onChange={set('email')} aria-invalid={!!errors.email} /></Field>
                  <Field label={t.booking.phone} id="phone" error={errors.phone}><input id="phone" type="tel" autoComplete="tel" placeholder={t.booking.phonePlaceholder} className={`input ${err('phone')}`} value={f.phone} onChange={set('phone')} aria-invalid={!!errors.phone} /></Field>
                </div>
              )}

              {step === 2 && (
                <>
                  <fieldset>
                    <legend className="font-semibold text-slate-800">{t.booking.esimLegend}</legend>
                    <div className="mt-3 grid gap-3">
                      {esimOptions.map((o) => (
                        <label key={o.id} className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition hover:border-primary/60 ${f.esimChoice === o.id ? 'border-primary bg-primary-50' : 'border-slate-200'}`}>
                          <input type="radio" name="esim" value={o.id} checked={f.esimChoice === o.id} onChange={set('esimChoice')} className="mt-1 h-5 w-5 accent-primary" />
                          <span><span className="block font-semibold">{o.title}</span><span className="text-sm text-slate-600">{o.desc}</span></span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {f.esimChoice === 'buy' && (
                    <Field label={t.booking.esimPackage} id="esimPackage" error={errors.esimPackage}>
                      <select id="esimPackage" className={`input ${err('esimPackage')}`} value={f.esimPackage} onChange={set('esimPackage')}>
                        <option value="">{t.booking.selectPackage}</option>
                        {packages.map((p) => <option key={p.id} value={p.id}>{p.name} – {p.data}, {formatValidity(p.validity, t)} – {money(p.price, t.common.currency)}</option>)}
                      </select>
                    </Field>
                  )}
                  <Field label={t.booking.voucher} id="voucher" error={voucherState.error} hint={t.booking.voucherHint}>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input id="voucher" className={`input uppercase ${voucherState.error ? 'input-error' : ''}`} value={f.voucher} onChange={(e) => { set('voucher')(e); setVoucher(null); }} />
                      <button type="button" className="btn-outline shrink-0" onClick={applyVoucher} disabled={voucherState.loading}>{voucherState.loading ? t.booking.checking : t.booking.apply}</button>
                    </div>
                  </Field>
                  {voucher && <Alert tone="success">{interpolate(t.booking.voucherApplied, { code: voucher.code, description: voucherDescription })}</Alert>}
                </>
              )}

              {step === 3 && (
                <>
                  <fieldset>
                    <legend className="font-semibold text-slate-800">{t.booking.paymentLegend}</legend>
                    <div className="mt-3 grid gap-3">
                      {paymentOptions.map((o) => (
                        <label key={o.id} className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition hover:border-primary/60 ${f.paymentOption === o.id ? (o.guaranteed ? 'border-primary bg-primary-50' : 'border-amber-500 bg-amber-50') : 'border-slate-200'}`}>
                          <input type="radio" name="payment" value={o.id} checked={f.paymentOption === o.id} onChange={set('paymentOption')} className="mt-1 h-5 w-5 accent-primary" />
                          <span className="flex-1">
                            <span className="block font-semibold">{o.title}{o.id === 'deposit' && <span className="ml-2 rounded bg-primary px-2 py-0.5 text-xs text-white">{t.booking.defaultBadge}</span>}</span>
                            <span className={`text-sm ${o.guaranteed ? 'text-slate-600' : 'font-medium text-amber-800'}`}>{o.desc}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {f.paymentOption === 'arrival' && (
                    <Alert tone="warning"><strong>{t.booking.arrivalWarning}</strong></Alert>
                  )}
                  <label className="flex min-h-[44px] cursor-pointer items-start gap-3">
                    <input type="checkbox" checked={f.terms} onChange={set('terms')} className="mt-1 h-5 w-5 accent-primary" aria-invalid={!!errors.terms} />
                    <span>{t.booking.terms}</span>
                  </label>
                  {errors.terms && <p className="text-sm font-medium text-red-700" role="alert">{errors.terms}</p>}
                </>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
                {step > 0 ? <button type="button" className="btn-outline" onClick={back}>{t.common.back}</button> : <span />}
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {step < 3 ? t.common.continue : submitting ? t.booking.processing : f.paymentOption === 'arrival' ? t.booking.sendRequest : interpolate(t.booking.pay, { amount: money(dueNow, t.common.currency) })}
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
  const { t } = useLanguage();
  const dayWord = days === 1 ? t.common.day : t.common.days;
  return (
    <aside className="card h-fit lg:sticky lg:top-24" aria-label={t.booking.summary}>
      <h2 className="text-lg font-bold text-primary">{t.booking.summaryTitle}</h2>
      <dl className="mt-4 space-y-2 text-sm sm:text-base">
        <Row label={t.booking.arrival} value={`${f.fromDate} ${f.fromTime}`} />
        <Row label={t.booking.departure} value={`${f.toDate} ${f.toTime}`} />
        {f.plate && <Row label={t.booking.plateLabel} value={f.plate.toUpperCase()} />}
        <hr className="border-slate-200" />
        <Row label={interpolate(t.booking.parkingLine, { days, dayWord, rate: money(rate, t.common.currency) })} value={money(calc.parkingGross, t.common.currency)} />
        {calc.freeDays > 0 && <Row label={t.booking.freeDay} value={`−${money(calc.freeDiscount, t.common.currency)}`} />}
        {calc.parkingVoucher > 0 && <Row label={interpolate(t.booking.voucherLine, { code: voucher.code })} value={`−${money(calc.parkingVoucher, t.common.currency)}`} />}
        {pkg && f.esimChoice === 'buy' && <Row label={interpolate(t.booking.esimLine, { name: pkg.name })} value={money(pkg.price, t.common.currency)} />}
        {calc.esimVoucher > 0 && <Row label={interpolate(t.booking.voucherLine, { code: voucher.code })} value={`−${money(calc.esimVoucher, t.common.currency)}`} />}
        <hr className="border-slate-200" />
        <Row label={t.booking.total} value={money(calc.total, t.common.currency)} strong />
        <Row label={t.booking.dueNow} value={money(dueNow, t.common.currency)} />
        <Row label={t.booking.dueOnArrival} value={money(calc.total - dueNow, t.common.currency)} />
      </dl>
      {days === 0 && <p className="mt-3 text-sm text-red-700">{t.booking.invalidRange}</p>}
    </aside>
  );
}

function Confirmation({ booking }) {
  const { t } = useLanguage();
  const isRequest = booking.paymentOption === 'arrival';
  return (
    <section className="container-page max-w-2xl py-14">
      <div className="card text-center">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${isRequest ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'}`} aria-hidden="true">{isRequest ? '!' : '✓'}</div>
        <h1 className="mt-4 text-2xl font-bold text-primary sm:text-3xl">{isRequest ? t.booking.requestTitle : t.booking.confirmedTitle}</h1>
        <p className="mt-2 text-slate-600">{t.booking.codeAndPlate.split('{code}')[0]}<strong className="text-primary">{booking.code}</strong>{t.booking.codeAndPlate.split('{code}')[1].split('{plate}')[0]}<strong>{booking.plate}</strong>{t.booking.codeAndPlate.split('{plate}')[1]}</p>
        {isRequest
          ? <div className="mt-6 text-left"><Alert tone="warning">{interpolate(t.booking.requestAlert, { total: money(booking.total, t.common.currency), email: booking.email })}</Alert></div>
          : <div className="mt-6 text-left"><Alert tone="success">{interpolate(t.booking.confirmedAlert, { dueNow: money(booking.dueNow, t.common.currency), dueLater: money(booking.total - booking.dueNow, t.common.currency), email: booking.email })}</Alert></div>}
        <p className="mt-6 text-slate-600">{t.booking.gateHint}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/my-booking" className="btn-primary">{t.booking.viewBooking}</Link>
          <Link to="/" className="btn-outline">{t.booking.backHome}</Link>
        </div>
      </div>
    </section>
  );
}
