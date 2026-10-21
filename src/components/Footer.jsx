import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { NAV } from '../data/nav.js';
import { SITE } from '../data/site.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { interpolate } from '../i18n/translations.js';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-primary text-white">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-3 text-sm text-white/80">{t.common.footerBlurb}</p>
        </div>
        <nav aria-label={t.common.footerNav}>
          <h2 className="font-semibold">{t.common.pages}</h2>
          <ul className="mt-2 grid grid-cols-2 gap-x-4">
            {[...NAV, { to: '/booking', key: 'booking' }].map((n) => (
              <li key={n.to}><Link to={n.to} className="inline-flex min-h-[44px] items-center text-white/85 underline-offset-4 hover:text-white hover:underline focus:outline-none focus-visible:underline">{t.nav[n.key]}</Link></li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="font-semibold">{t.common.contact}</h2>
          <ul className="mt-2 text-white/85">
            <li><a href={SITE.phoneHref} className="inline-flex min-h-[44px] items-center hover:text-white hover:underline">{SITE.phone}</a></li>
            <li><a href={`mailto:${SITE.email}`} className="inline-flex min-h-[44px] items-center break-all hover:text-white hover:underline">{SITE.email}</a></li>
            <li className="text-sm">{interpolate(t.open247Short, { address: SITE.address })}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="container-page flex flex-col gap-1 py-4 text-sm text-white/75 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          <span>{t.common.craftedBy}</span>
        </div>
      </div>
    </footer>
  );
}
