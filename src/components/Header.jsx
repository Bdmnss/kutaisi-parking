import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import { NAV } from '../data/nav.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

const linkCls = ({ isActive }) =>
  `flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-2.5 font-medium transition hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 xl:px-3 ${isActive ? 'text-primary bg-primary-50' : 'text-slate-700'}`;

export default function Header() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-2">
        <Logo />
        <nav className="hidden min-w-0 flex-1 items-center justify-end gap-1 xl:flex" aria-label={t.common.mainNav}>
          {NAV.map((n) => <NavLink key={n.to} to={n.to} end className={linkCls}>{t.nav[n.key]}</NavLink>)}
          <div className="flex shrink-0 items-center gap-2 pl-1">
            <LanguageSwitcher />
            <Link to="/booking" className="btn-primary">{t.nav.bookNow}</Link>
          </div>
        </nav>
        <div className="flex items-center gap-2 xl:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-primary hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.common.closeMenu : t.common.openMenu}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-slate-200 bg-white xl:hidden" aria-label={t.common.mobileNav}>
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV.map((n) => <NavLink key={n.to} to={n.to} end className={linkCls} onClick={() => setOpen(false)}>{t.nav[n.key]}</NavLink>)}
            <Link to="/booking" className="btn-primary mt-2" onClick={() => setOpen(false)}>{t.nav.bookNow}</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
