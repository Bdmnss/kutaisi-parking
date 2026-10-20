import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="container-page py-20 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-800">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you are looking for does not exist or has moved.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/" className="btn-primary">Go home</Link>
        <Link to="/booking" className="btn-outline">Book parking</Link>
      </div>
    </section>
  );
}
