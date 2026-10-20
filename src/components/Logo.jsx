import { Link } from 'react-router-dom';
import { SITE } from '../data/site.js';

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="flex min-h-[44px] items-center gap-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
      <img src={SITE.logo} alt="" className="h-10 w-10 rounded-lg bg-white object-contain" width="40" height="40" />
      <span className={`text-base font-bold leading-tight sm:text-lg ${light ? 'text-white' : 'text-primary'}`}>
        Parking Airport <span className="whitespace-nowrap">Kutaisi</span>
      </span>
    </Link>
  );
}
