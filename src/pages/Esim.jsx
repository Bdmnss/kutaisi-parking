import { useEffect, useState } from 'react';
import { getEsimPackages, buyEsim, addEsim, getEsim, addPackage } from '../services/api.js';
import { PageHeader, Spinner, EmptyState, Field, Alert } from '../components/ui.jsx';
import { money } from '../services/format.js';

const TABS = [
  { id: 'buy', label: 'Buy eSIM' },
  { id: 'add', label: 'Add your eSIM' },
  { id: 'balance', label: 'Check balance' },
  { id: 'package', label: 'Check package' },
  { id: 'addpkg', label: 'Add package' },
];

export default function Esim() {
  const [tab, setTab] = useState('buy');
  const [packages, setPackages] = useState(null);
  useEffect(() => { getEsimPackages().then(setPackages); }, []);

  return (
    <>
      <PageHeader title="Travel eSIM for Georgia" subtitle="Stay connected from the moment you land. Get 1 free parking day with your GLOBALCELL eSIM." />
      <section className="container-page py-10">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">Empowered by GLOBALCELL</p>
        <div role="tablist" aria-label="eSIM actions" className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={`btn ${tab === t.id ? 'bg-primary text-white' : 'border border-slate-300 text-slate-700 hover:bg-primary-50'}`}>{t.label}</button>
          ))}
        </div>
        <div className="mt-6" role="tabpanel">
          {!packages ? <Spinner label="Loading packages…" /> : (
            <>
              {tab === 'buy' && <BuyEsim packages={packages} />}
              {tab === 'add' && <IccidAction title="Add your eSIM" button="Add eSIM" action={addEsim} render={(e) => <Alert tone="success">eSIM {e.iccid} added to your account.</Alert>} />}
              {tab === 'balance' && <IccidAction title="Check balance" button="Check balance" action={getEsim} render={(e) => <Alert tone="info">Balance: <strong>{money(e.balance)}</strong> · Data left: <strong>{e.packages.reduce((s, p) => s + p.remainingGb, 0)} GB</strong></Alert>} />}
              {tab === 'package' && <IccidAction title="Check package" button="Check package" action={getEsim} render={(e) => e.packages.length === 0
                ? <EmptyState title="No active packages">Use “Add package” to top up.</EmptyState>
                : <ul className="space-y-2">{e.packages.map((p, i) => <li key={i} className="rounded-lg bg-primary-50 p-3"><strong>{p.name}</strong> – {p.remainingGb} GB left · {p.validity}</li>)}</ul>} />}
              {tab === 'addpkg' && <AddPackage packages={packages} />}
            </>
          )}
        </div>
      </section>
    </>
  );
}

function BuyEsim({ packages }) {
  const [sel, setSel] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ loading: false, result: null });
  if (!packages.length) return <EmptyState title="No eSIM packages available right now" />;
  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!sel) er.sel = 'Choose a package.';
    if (!/^\S+@\S+\.\S+$/.test(email)) er.email = 'Enter a valid email for the QR code.';
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
            <span className="block text-slate-600">{p.data} · {p.validity}</span>
            <span className="mt-2 block text-2xl font-bold">{money(p.price)}</span>
          </label>
        ))}
      </div>
      {errors.sel && <p className="text-sm font-medium text-red-700" role="alert">{errors.sel}</p>}
      <div className="max-w-md"><Field label="Email" id="esim-email" error={errors.email}><input id="esim-email" type="email" className={`input ${errors.email ? 'input-error' : ''}`} value={email} onChange={(e) => setEmail(e.target.value)} /></Field></div>
      <button className="btn-primary" disabled={state.loading}>{state.loading ? 'Processing…' : 'Buy eSIM'}</button>
      {state.result && <Alert tone="success">eSIM purchased (demo). ICCID: <strong className="break-all">{state.result.iccid}</strong>. Installation QR code sent to {state.result.email}. Use this eSIM in your parking booking for 1 free day.</Alert>}
    </form>
  );
}

function IccidAction({ title, button, action, render }) {
  const [iccid, setIccid] = useState('');
  const [state, setState] = useState({ loading: false, error: '', result: null });
  const submit = async (e) => {
    e.preventDefault();
    if (!iccid.trim()) { setState({ loading: false, error: 'Enter your eSIM ICCID.', result: null }); return; }
    setState({ loading: true, error: '', result: null });
    try { setState({ loading: false, error: '', result: await action(iccid.trim()) }); }
    catch (err) { setState({ loading: false, error: err.message, result: null }); }
  };
  return (
    <form onSubmit={submit} noValidate className="card max-w-xl space-y-4">
      <h2 className="text-xl font-bold text-primary">{title}</h2>
      <Field label="ICCID" id={`iccid-${title}`} error={state.error} hint="18–20 digits, found in your eSIM settings.">
        <input id={`iccid-${title}`} inputMode="numeric" className={`input ${state.error ? 'input-error' : ''}`} value={iccid} onChange={(e) => setIccid(e.target.value)} />
      </Field>
      <button className="btn-primary" disabled={state.loading}>{state.loading ? 'Please wait…' : button}</button>
      {state.loading && <Spinner />}
      {state.result && render(state.result)}
    </form>
  );
}

function AddPackage({ packages }) {
  const [iccid, setIccid] = useState('');
  const [pkg, setPkg] = useState('');
  const [state, setState] = useState({ loading: false, error: '', ok: false });
  const submit = async (e) => {
    e.preventDefault();
    if (!iccid.trim() || !pkg) { setState({ loading: false, error: 'Enter ICCID and choose a package.', ok: false }); return; }
    setState({ loading: true, error: '', ok: false });
    try { await addPackage(iccid, pkg); setState({ loading: false, error: '', ok: true }); }
    catch (err) { setState({ loading: false, error: err.message, ok: false }); }
  };
  return (
    <form onSubmit={submit} noValidate className="card max-w-xl space-y-4">
      <h2 className="text-xl font-bold text-primary">Add package</h2>
      <Field label="ICCID" id="ap-iccid"><input id="ap-iccid" inputMode="numeric" className="input" value={iccid} onChange={(e) => setIccid(e.target.value)} /></Field>
      <Field label="Package" id="ap-pkg">
        <select id="ap-pkg" className="input" value={pkg} onChange={(e) => setPkg(e.target.value)}>
          <option value="">Select a package</option>
          {packages.map((p) => <option key={p.id} value={p.id}>{p.name} – {p.data} – {money(p.price)}</option>)}
        </select>
      </Field>
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <button className="btn-primary" disabled={state.loading}>{state.loading ? 'Adding…' : 'Add package'}</button>
      {state.ok && <Alert tone="success">Package added (demo).</Alert>}
    </form>
  );
}
