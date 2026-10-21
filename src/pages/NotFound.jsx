import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <section className="container-page py-20 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-800">{t.notFound.title}</h1>
      <p className="mt-2 text-slate-600">{t.notFound.body}</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/" className="btn-primary">{t.notFound.goHome}</Link>
        <Link to="/booking" className="btn-outline">{t.notFound.bookParking}</Link>
      </div>
    </section>
  );
}
