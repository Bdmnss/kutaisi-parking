import { useState } from 'react';
import { SITE } from '../data/site.js';
import { PageHeader, Field, Alert } from '../components/ui.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { interpolate } from '../i18n/translations.js';

export default function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = t.contact.errors.name;
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = t.contact.errors.email;
    if (form.message.trim().length < 10) er.message = t.contact.errors.message;
    setErrors(er);
    if (!Object.keys(er).length) {
      window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(interpolate(t.contact.messageSubject, { name: form.name }))}&body=${encodeURIComponent(`${form.message}\n\n${form.email}`)}`;
      setSent(true);
    }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <PageHeader title={t.contact.title} subtitle={t.contact.subtitle} />
      <section className="container-page grid gap-10 py-12 lg:grid-cols-2">
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <a href={SITE.phoneHref} className="card block hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><span className="text-sm text-slate-500">{t.contact.phone}</span><span className="block font-semibold text-primary">{SITE.phone}</span></a>
            <a href={`mailto:${SITE.email}`} className="card block hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><span className="text-sm text-slate-500">{t.contact.email}</span><span className="block break-all font-semibold text-primary">{SITE.email}</span></a>
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="card block hover:border-primary sm:col-span-2"><span className="text-sm text-slate-500">{t.contact.whatsapp}</span><span className="block font-semibold text-primary">{t.contact.chatWithUs}</span></a>
            <div className="card sm:col-span-2"><span className="text-sm text-slate-500">{t.contact.location}</span><span className="block font-semibold text-primary">{SITE.address}</span><span className="text-sm text-slate-600">{t.contact.open247}</span></div>
          </div>
          <form onSubmit={submit} noValidate className="card mt-6 space-y-4">
            <h2 className="text-xl font-bold text-primary">{t.contact.sendMessage}</h2>
            {sent && <Alert tone="success">{t.contact.thanks}</Alert>}
            <Field label={t.contact.name} id="c-name" error={errors.name}><input id="c-name" className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={set('name')} aria-invalid={!!errors.name} /></Field>
            <Field label={t.contact.email} id="c-email" error={errors.email}><input id="c-email" type="email" className={`input ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={set('email')} aria-invalid={!!errors.email} /></Field>
            <Field label={t.contact.message} id="c-msg" error={errors.message}><textarea id="c-msg" rows="4" className={`input ${errors.message ? 'input-error' : ''}`} value={form.message} onChange={set('message')} aria-invalid={!!errors.message} /></Field>
            <button className="btn-primary w-full sm:w-auto">{t.contact.send}</button>
          </form>
        </div>
        <div>
          <h2 className="h2">{t.contact.faqTitle}</h2>
          <div className="mt-6 space-y-3">
            {t.faq.map((f) => (
              <details key={f.q} className="group rounded-xl border border-slate-200 bg-white">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 rounded-xl p-4 font-semibold text-primary hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                  {f.q}<span className="text-xl transition group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="px-4 pb-4 text-slate-700">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
