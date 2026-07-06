import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpDown, CalendarDays, ChevronLeft, ChevronRight,
  CreditCard, MapPin, Moon, X,
} from 'lucide-react';
import { bookingsApi } from '@/api/bookings';
import { extractErrorMessage } from '@/api/client';
import { formatCurrency, formatDate, nightsBetween } from '@/lib/format';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Banner from '@/components/Banner';

const PAGE_SIZE = 5;

const STATUS_STYLES = {
  CONFIRMED: 'bg-meridian-100 text-meridian-800',
  PENDING:   'bg-brass-100 text-brass-700',
  CANCELLED: 'bg-paper-300/60 text-paper-700',
};

// Sort options applied client-side (booking list is already loaded per page)
const SORT_OPTIONS = [
  { label: 'Newest first',       key: 'createdAt', dir: 'desc' },
  { label: 'Oldest first',       key: 'createdAt', dir: 'asc'  },
  { label: 'Check-in ↑',        key: 'checkIn',   dir: 'asc'  },
  { label: 'Check-in ↓',        key: 'checkIn',   dir: 'desc' },
  { label: 'Price: low → high',  key: 'totalPrice',dir: 'asc'  },
  { label: 'Price: high → low',  key: 'totalPrice',dir: 'desc' },
];

function sortBookings(list, sortKey, sortDir) {
  return [...list].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];
    // Dates and strings compare naturally; numbers too
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1  : -1;
    return 0;
  });
}

export default function MyBookings() {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  // Pagination state
  const [page, setPage]               = useState(0);

  // Sort state
  const [sortIndex, setSortIndex]     = useState(0);
  const { key: sortKey, dir: sortDir } = SORT_OPTIONS[sortIndex];

  // Reset page on sort change
  useEffect(() => { setPage(0); }, [sortIndex]);

  const load = async () => {
    setLoading(true);
    try {
      // Fetch a generous page from backend; we paginate client-side
      // so all bookings are available for client-side sorting too
      const res = await bookingsApi.getMine(0, 200);
      setAllBookings(res.content);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load your bookings.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      const updated = await bookingsApi.cancel(id);
      setAllBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not cancel this booking.'));
    } finally {
      setCancellingId(null);
    }
  };

  // Apply sort then slice for current page
  const sorted     = sortBookings(allBookings, sortKey, sortDir);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageItems  = sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="bg-paper-100/40 min-h-screen">
      <section className="bg-meridian-950 py-14">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <h1 className="font-display text-3xl sm:text-4xl text-paper-50 mb-2">My bookings</h1>
          <p className="text-paper-200/70">Everything you've booked with Meridian Stay, in one place.</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-12">
        {error && (
          <div className="mb-6">
            <Banner variant="error">{error}</Banner>
          </div>
        )}

        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : allBookings.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No bookings yet"
            description="Once you book a room, it'll show up here with all the details."
            action={
              <Link
                to="/rooms"
                className="px-5 py-2.5 bg-meridian-900 hover:bg-meridian-800 text-paper-50 rounded-lg text-sm font-semibold transition-colors"
              >
                Browse rooms
              </Link>
            }
          />
        ) : (
          <>
            {/* ── Sort & count bar ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-sm text-paper-600">
                <strong className="text-paper-900">{allBookings.length}</strong>{' '}
                booking{allBookings.length !== 1 ? 's' : ''} total
              </p>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-paper-500 flex-shrink-0" />
                <select
                  value={sortIndex}
                  onChange={(e) => setSortIndex(Number(e.target.value))}
                  className="px-3 py-2 border border-paper-300 rounded-lg text-sm text-paper-800 bg-paper-50 focus:outline-none focus:ring-2 focus:ring-brass-400 cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt, idx) => (
                    <option key={idx} value={idx}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Booking cards ── */}
            <div className="flex flex-col gap-4 mb-8">
              {pageItems.map((booking, i) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  index={i}
                  cancelling={cancellingId === booking.id}
                  onCancel={() => handleCancel(booking.id)}
                />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-2 rounded-full border border-paper-300 text-paper-700 disabled:opacity-40 hover:border-meridian-700 hover:text-meridian-800 transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-meridian-900 text-paper-50'
                          : 'border border-paper-300 text-paper-700 hover:border-meridian-700 hover:text-meridian-800'
                      }`}
                    >
                      {p + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-2 rounded-full border border-paper-300 text-paper-700 disabled:opacity-40 hover:border-meridian-700 hover:text-meridian-800 transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-paper-500">
                  Page {page + 1} of {totalPages} · {PAGE_SIZE} bookings per page
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function BookingRow({ booking, index, cancelling, onCancel }) {
  const nights   = nightsBetween(booking.checkIn, booking.checkOut);
  const canCancel = booking.status !== 'CANCELLED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.2) }}
      className="bg-paper-50 border border-paper-300/60 rounded-2xl p-5 sm:p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="flex items-center gap-1.5 text-paper-500 text-xs font-medium uppercase tracking-wide">
              <MapPin className="w-3.5 h-3.5" />
              {booking.hotelName}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[booking.status]}`}>
              {booking.status}
            </span>
            {booking.roomType && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-paper-200/60 text-paper-700">
                {booking.roomType}
              </span>
            )}
          </div>
          <h3 className="font-display text-lg text-paper-950 mb-1.5">Room {booking.roomNumber}</h3>
          <div className="flex items-center gap-4 text-sm text-paper-700 flex-wrap">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              {formatDate(booking.checkIn)} &rarr; {formatDate(booking.checkOut)}
            </span>
            <span className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5" />
              {nights} night{nights > 1 ? 's' : ''}
            </span>
          </div>

          {booking.payLater && (
            <div className="mt-3 bg-brass-100/60 rounded-lg px-3 py-2.5 text-xs text-brass-700 flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Pay later
              </span>
              {booking.advancePaid != null && (
                <span>Advance: <strong>{formatCurrency(booking.advancePaid)}</strong></span>
              )}
              {booking.remainingAmount != null && booking.remainingAmount > 0 && (
                <span>Due at check-in: <strong>{formatCurrency(booking.remainingAmount)}</strong></span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:items-end">
          <span className="font-display text-xl text-brass-700">{formatCurrency(booking.totalPrice)}</span>
          {canCancel && (
            <button
              onClick={onCancel}
              disabled={cancelling}
              className="flex items-center gap-1.5 text-sm font-medium text-paper-600 hover:text-red-600 disabled:opacity-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              {cancelling ? 'Cancelling…' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
