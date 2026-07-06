import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-meridian-950 text-paper-100/80 mt-auto">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5 text-paper-50 mb-3">
              <span className="w-8 h-8 rounded-full bg-paper-50/10 flex items-center justify-center text-brass-300">
                <Compass className="w-4 h-4" strokeWidth={1.75} />
              </span>
              <span className="font-display text-lg tracking-tight">Meridian Stay</span>
            </div>
            <p className="text-sm text-paper-100/60 leading-relaxed">
              A small collection of considered rooms, booked simply and held to a quiet standard of care.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-paper-100/50 mb-3">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/rooms" className="hover:text-brass-300 transition-colors">All rooms</Link></li>
                <li><Link to="/my-bookings" className="hover:text-brass-300 transition-colors">My bookings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-paper-100/50 mb-3">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-brass-300 transition-colors">Log in</Link></li>
                <li><Link to="/signup" className="hover:text-brass-300 transition-colors">Sign up</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-paper-50/10 mt-10 pt-6 text-xs text-paper-100/40 flex flex-col sm:flex-row justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Meridian Stay. All rights reserved.</span>
          <span>Built on a Spring Boot &amp; React stack.</span>
        </div>
      </div>
    </footer>
  );
}
