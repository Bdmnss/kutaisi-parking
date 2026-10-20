import { useEffect, useState } from 'react';
import { getFaq } from '../services/api.js';
import { SITE } from '../data/site.js';
import { PageHeader, Spinner, EmptyState, Field, Alert } from '../components/ui.jsx';

export default function Contact() {
  const [faq, setFaq] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  useEffect(() => { getFaq().then(setFaq); }, []);

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Please enter a valid email.';
    if (form.message.trim().length < 10) er.message = 'Message should be at least 10 characters.';
    setErrors(er);
    if (!Object.keys(er).length) {
      window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`Message from ${form.name}`)}&body=${encodeURIComponent(`${form.message}\n\n${form.email}`)}`;
      setSent(true);
    }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <PageHeader title="Contact & FAQ" subtitle="We are available 24/7 by phone, email and WhatsApp." />
      <section className="container-page grid gap-10 py-12 lg:grid-cols-2">
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <a href={SITE.phoneHref} className="card block hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><span className="text-sm text-slate-500">Phone</span><span className="block font-semibold text-primary">{SITE.phone}</span></a>
            <a href={`mailto:${SITE.email}`} className="card block hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><span className="text-sm text-slate-500">Email</span><span className="block break-all font-semibold text-primary">{SITE.email}</span></a>
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="card block hover:border-primary sm:col-span-2"><span className="text-sm text-slate-500">WhatsApp</span><span className="block font-semibold text-primary">Chat with us</span></a>
            <div className="card sm:col-span-2"><span className="text-sm text-slate-500">Location</span><span className="block font-semibold text-primary">{SITE.address}</span><span className="text-sm text-slate-600">Open 24 hours, 7 days a week</span></div>
          </div>
          <form onSubmit={submit} noValidate className="card mt-6 space-y-4">
            <h2 className="text-xl font-bold text-primary">Send a message</h2>
            {sent && <Alert tone="success">Thanks! Your email app should open to send the message.</Alert>}
            <Field label="Name" id="c-name" error={errors.name}><input id="c-name" className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={set('name')} aria-invalid={!!errors.name} /></Field>
            <Field label="Email" id="c-email" error={errors.email}><input id="c-email" type="email" className={`input ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={set('email')} aria-invalid={!!errors.email} /></Field>
            <Field label="Message" id="c-msg" error={errors.message}><textarea id="c-msg" rows="4" className={`input ${errors.message ? 'input-error' : ''}`} value={form.message} onChange={set('message')} aria-invalid={!!errors.message} /></Field>
            <button className="btn-primary w-full sm:w-auto">Send</button>
          </form>
        </div>
        <div>
          <h2 className="h2">Frequently asked questions</h2>
          {!faq ? <Spinner label="Loading FAQ…" /> : faq.length === 0 ? <EmptyState title="No questions yet" /> : (
            <div className="mt-6 space-y-3">
              {faq.map((f) => (
                <details key={f.q} className="group rounded-xl border border-slate-200 bg-white">
                  <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 rounded-xl p-4 font-semibold text-primary hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                    {f.q}<span className="text-xl transition group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="px-4 pb-4 text-slate-700">{f.a}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
