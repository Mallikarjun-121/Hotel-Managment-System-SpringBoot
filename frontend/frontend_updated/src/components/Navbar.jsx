import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import { useAuth } from '@/context/useAuth';

const NAV_LINKS = [{ to: '/rooms', label: 'Rooms' }];

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-paper-50/90 backdrop-blur-md border-b border-paper-300/70">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-[68px]">
          <Link to="/" className="flex items-center gap-2.5 text-meridian-900 group">
            <span className="w-9 h-9 rounded-full bg-meridian-900 flex items-center justify-center text-brass-300 group-hover:bg-meridian-800 transition-colors">
              <Compass className="w-4.5 h-4.5" strokeWidth={1.75} />
            </span>
            <span className="font-display text-[1.35rem] tracking-tight leading-none">
              Meridian <span className="text-brass-600">Stay</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-paper-700 hover:text-meridian-800 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/my-bookings"
                className="text-sm font-medium text-paper-700 hover:text-meridian-800 transition-colors"
              >
                My Bookings
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm font-medium text-paper-700 hover:text-meridian-800 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 text-paper-900">
                  <span className="w-7 h-7 rounded-full bg-brass-100 text-brass-700 flex items-center justify-center">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-sm font-medium truncate max-w-[120px]">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-paper-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-paper-700 hover:text-meridian-800 transition-colors">
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-meridian-900 hover:bg-meridian-800 text-paper-50 rounded-full text-sm font-medium transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 text-paper-700"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-paper-300/70 bg-paper-50 overflow-hidden"
          >
            <div className="px-5 py-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-paper-700 font-medium py-1.5"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link to="/my-bookings" onClick={() => setMobileOpen(false)} className="text-paper-700 font-medium py-1.5">
                  My Bookings
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-paper-700 font-medium py-1.5">
                  Admin Dashboard
                </Link>
              )}
              <div className="pt-2 border-t border-paper-300/70">
                {isAuthenticated ? (
                  <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 font-medium py-1.5">
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="text-paper-700 font-medium py-1.5">
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-2.5 bg-meridian-900 text-paper-50 rounded-full text-center font-medium"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
