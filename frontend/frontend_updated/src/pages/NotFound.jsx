import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center">
      <p className="font-display text-8xl text-paper-300 mb-4">404</p>
      <h1 className="font-display text-2xl text-paper-950 mb-2">Page not found</h1>
      <p className="text-paper-700 text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-meridian-900 hover:bg-meridian-800 text-paper-50 rounded-lg text-sm font-semibold transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
