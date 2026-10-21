import { useEffect, useState } from 'react';
import { getEsimPackages, buyEsim, addEsim, getEsim, addPackage } from '../services/api.js';
import { PageHeader, Spinner, EmptyState, Field, Alert } from '../components/ui.jsx';
import { money, formatValidity } from '../services/format.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { interpolate } from '../i18n/translations.js';

const TAB_IDS = ['buy', 'add', 'balance', 'package', 'addpkg'];

export default function Esim() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('buy');
  const [packages, setPackages] = useState(null);
  useEffect(() => { getEsimPackages().then(setPackages); }, []);

  return (
    <>
      <PageHeader title={t.esim.title} subtitle={t.esim.subtitle} />
      <section className="container-page py-10">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">{t.esim.empowered}</p>
        <div role="tablist" aria-label={t.esim.actions} className="flex flex-wrap gap-2">
          {TAB_IDS.map((id) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={`btn ${tab === id ? 'bg-primary text-white' : 'border border-slate-300 text-slate-700 hover:bg-primary-50'}`}>{t.esim.tabs[id]}</button>
          ))}
        </div>
        <div className="mt-6" role="tabpanel">
          {!packages ? <Spinner label={t.esim.loading} /> : (
            <>
              {tab === 'buy' && <BuyEsim packages={packages} />}
              {tab === 'add' && <IccidAction title={t.esim.addTitle} button={t.esim.addButton} action={addEsim} render={(e) => <Alert tone="success">{interpolate(t.esim.addSuccess, { iccid: e.iccid })}</Alert>} />}
              {tab === 'balance' && <IccidAction title={t.esim.balanceTitle} button={t.esim.balanceButton} action={getEsim} render={(e) => <Alert tone="info">{interpolate(t.esim.balanceResult, { balance: money(e.balance, t.common.currency), data: e.packages.reduce((s, p) => s + p.remainingGb, 0) })}</Alert>} />}
              {tab === 'package' && <IccidAction title={t.esim.packageTitle} button={t.esim.packageButton} action={getEsim} render={(e) => e.packages.length === 0
                ? <EmptyState title={t.esim.noActive}>{t.esim.noActiveHint}</EmptyState>
                : <ul className="space-y-2">{e.packages.map((p, i) => <li key={i} className="rounded-lg bg-primary-50 p-3">{interpolate(t.esim.remaining, { name: p.name, gb: p.remainingGb, validity: formatValidity(p.validity, t) })}</li>)}</ul>} />}
              {tab === 'addpkg' && <AddPackage packages={packages} />}
            </>
          )}
        </div>
      </section>
    </>
  );
}

function BuyEsim({ packages }) {
  const { t } = useLanguage();
  const [sel, setSel] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ loading: false, result: null });
  if (!packages.length) return <EmptyState title={t.esim.noPackages} />;
  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!sel) er.sel = t.esim.choosePackage;
    if (!/^\S+@\S+\.\S+$/.test(email)) er.email = t.esim.emailInvalid;
    setErrors(er);
    if (Object.keys(er).length) return;
    setState({ loading: true, result: null });
    setState({ loading: false, result: await buyEsim(sel, email) });
  };
  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {packages.map((p) => (
          <label key={p.id} className={`card cursor-pointer transition hover:border-primary/60 ${sel === p.id ? 'border-2 border-primary bg-primary-50' : ''}`}>
            <input type="radio" name="pkg" value={p.id} checked={sel === p.id} onChange={() => setSel(p.id)} className="sr-only" />
            <span className="block font-semibold text-primary">{p.name}</span>
            <span className="block text-slate-600">{p.data} · {formatValidity(p.validity, t)}</span>
            <span className="mt-2 block text-2xl font-bold">{money(p.price, t.common.currency)}</span>
          </label>
        ))}
      </div>
      {errors.sel && <p className="text-sm font-medium text-red-700" role="alert">{errors.sel}</p>}
      <div className="max-w-md"><Field label={t.esim.email} id="esim-email" error={errors.email}><input id="esim-email" type="email" className={`input ${errors.email ? 'input-error' : ''}`} value={email} onChange={(e) => setEmail(e.target.value)} /></Field></div>
      <button className="btn-primary" disabled={state.loading}>{state.loading ? t.esim.processing : t.esim.buyButton}</button>
      {state.result && <Alert tone="success">{interpolate(t.esim.buySuccess, { iccid: state.result.iccid, email: state.result.email })}</Alert>}
    </form>
  );
}

function IccidAction({ title, button, action, render }) {
  const { t } = useLanguage();
  const [iccid, setIccid] = useState('');
  const [state, setState] = useState({ loading: false, error: '', result: null });
  const submit = async (e) => {
    e.preventDefault();
    if (!iccid.trim()) { setState({ loading: false, error: t.esim.enterIccid, result: null }); return; }
    setState({ loading: true, error: '', result: null });
    try { setState({ loading: false, error: '', result: await action(iccid.trim()) }); }
    catch (err) { setState({ loading: false, error: t.errors[err.message] || err.message, result: null }); }
  };
  return (
    <form onSubmit={submit} noValidate className="card max-w-xl space-y-4">
      <h2 className="text-xl font-bold text-primary">{title}</h2>
      <Field label={t.esim.iccid} id={`iccid-${title}`} error={state.error} hint={t.esim.iccidHint}>
        <input id={`iccid-${title}`} inputMode="numeric" className={`input ${state.error ? 'input-error' : ''}`} value={iccid} onChange={(e) => setIccid(e.target.value)} />
      </Field>
      <button className="btn-primary" disabled={state.loading}>{state.loading ? t.esim.pleaseWait : button}</button>
      {state.loading && <Spinner label={t.esim.pleaseWait} />}
      {state.result && render(state.result)}
    </form>
  );
}

function AddPackage({ packages }) {
  const { t } = useLanguage();
  const [iccid, setIccid] = useState('');
  const [pkg, setPkg] = useState('');
  const [state, setState] = useState({ loading: false, error: '', ok: false });
  const submit = async (e) => {
    e.preventDefault();
    if (!iccid.trim() || !pkg) { setState({ loading: false, error: t.esim.enterIccidAndPackage, ok: false }); return; }
    setState({ loading: true, error: '', ok: false });
    try { await addPackage(iccid, pkg); setState({ loading: false, error: '', ok: true }); }
    catch (err) { setState({ loading: false, error: t.errors[err.message] || err.message, ok: false }); }
  };
  return (
    <form onSubmit={submit} noValidate className="card max-w-xl space-y-4">
      <h2 className="text-xl font-bold text-primary">{t.esim.addPkgTitle}</h2>
      <Field label={t.esim.iccid} id="ap-iccid"><input id="ap-iccid" inputMode="numeric" className="input" value={iccid} onChange={(e) => setIccid(e.target.value)} /></Field>
      <Field label={t.esim.packageLabel} id="ap-pkg">
        <select id="ap-pkg" className="input" value={pkg} onChange={(e) => setPkg(e.target.value)}>
          <option value="">{t.esim.selectPackage}</option>
          {packages.map((p) => <option key={p.id} value={p.id}>{p.name} – {p.data} – {money(p.price, t.common.currency)}</option>)}
        </select>
      </Field>
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <button className="btn-primary" disabled={state.loading}>{state.loading ? t.esim.adding : t.esim.addPkgButton}</button>
      {state.ok && <Alert tone="success">{t.esim.addPkgSuccess}</Alert>}
    </form>
  );
}
