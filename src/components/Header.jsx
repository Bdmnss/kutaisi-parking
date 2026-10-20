import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { NAV } from '../data/nav.js';


const linkCls = ({ isActive }) =>
  `flex min-h-[44px] items-center rounded-lg px-3 font-medium transition hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${isActive ? 'text-primary bg-primary-50' : 'text-slate-700'}`;

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-2">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => <NavLink key={n.to} to={n.to} end className={linkCls}>{n.label}</NavLink>)}
          <Link to="/booking" className="btn-primary ml-2">Book now</Link>
        </nav>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-primary hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-slate-200 bg-white lg:hidden" aria-label="Mobile">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV.map((n) => <NavLink key={n.to} to={n.to} end className={linkCls} onClick={() => setOpen(false)}>{n.label}</NavLink>)}
            <Link to="/booking" className="btn-primary mt-2" onClick={() => setOpen(false)}>Book now</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
