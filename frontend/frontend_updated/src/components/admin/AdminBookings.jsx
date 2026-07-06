import { useState } from 'react';
import { ArrowUpDown, CalendarCheck2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';
import EmptyState from '@/components/EmptyState';

const PAGE_SIZE = 8;

const STATUS_STYLES = {
  CONFIRMED: 'bg-meridian-100 text-meridian-800',
  PENDING:   'bg-brass-100 text-brass-700',
  CANCELLED: 'bg-paper-300/60 text-paper-700',
};

// Sort options for the bookings table
const SORT_OPTIONS = [
  { label: 'Newest first',       key: 'createdAt',  dir: 'desc' },
  { label: 'Oldest first',       key: 'createdAt',  dir: 'asc'  },
  { label: 'Guest A → Z',        key: 'userName',   dir: 'asc'  },
  { label: 'Guest Z → A',        key: 'userName',   dir: 'desc' },
  { label: 'Hotel A → Z',        key: 'hotelName',  dir: 'asc'  },
  { label: 'Check-in ↑',         key: 'checkIn',    dir: 'asc'  },
  { label: 'Check-in ↓',         key: 'checkIn',    dir: 'desc' },
  { label: 'Total: low → high',  key: 'totalPrice', dir: 'asc'  },
  { label: 'Total: high → low',  key: 'totalPrice', dir: 'desc' },
  { label: 'Status',             key: 'status',     dir: 'asc'  },
];

function sortItems(list, sortKey, sortDir) {
  return [...list].sort((a, b) => {
    let vA = a[sortKey] ?? '';
    let vB = b[sortKey] ?? '';
    if (typeof vA === 'string') vA = vA.toLowerCase();
    if (typeof vB === 'string') vB = vB.toLowerCase();
    if (vA < vB) return sortDir === 'asc' ? -1 : 1;
    if (vA > vB) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });
}

export default function AdminBookings({ bookings }) {
  const [page, setPage]           = useState(0);
  const [sortIndex, setSortIndex] = useState(0);
  const { key: sortKey, dir: sortDir } = SORT_OPTIONS[sortIndex];

  // Reset page when sort changes
  const handleSortChange = (idx) => {
    setSortIndex(idx);
    setPage(0);
  };

  const sorted     = sortItems(bookings, sortKey, sortDir);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageItems  = sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      {/* Header row with sort controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <h3 className="font-display text-lg text-paper-950">All bookings</h3>
        {bookings.length > 0 && (
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-paper-500 flex-shrink-0" />
            <select
              value={sortIndex}
              onChange={(e) => handleSortChange(Number(e.target.value))}
              className="px-3 py-2 border border-paper-300 rounded-lg text-sm text-paper-800 bg-paper-50 focus:outline-none focus:ring-2 focus:ring-brass-400 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt, idx) => (
                <option key={idx} value={idx}>{opt.label}</option>
              ))}
            </select>
            <span className="text-xs text-paper-500 whitespace-nowrap">
              {bookings.length} total
            </span>
          </div>
        )}
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck2}
          title="No bookings yet"
          description="Bookings will appear here once guests start reserving rooms."
        />
      ) : (
        <>
          {/* ── Table ── */}
          <div className="bg-paper-50 border border-paper-300/60 rounded-2xl overflow-hidden shadow-sm mb-5">
            <div className="overflow-x-auto thin-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-paper-300/60 text-left text-paper-500 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 font-medium">#</th>
                    <th className="px-5 py-3 font-medium">Guest</th>
                    <th className="px-5 py-3 font-medium">Hotel / Room</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Check-in</th>
                    <th className="px-5 py-3 font-medium">Check-out</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Advance</th>
                    <th className="px-5 py-3 font-medium">Remaining</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((b) => (
                    <tr key={b.id} className="border-b border-paper-300/40 last:border-0 hover:bg-paper-100/40 transition-colors">
                      <td className="px-5 py-3 text-paper-400 text-xs">#{b.id}</td>
                      <td className="px-5 py-3 text-paper-900">{b.userName}</td>
                      <td className="px-5 py-3 text-paper-700">
                        {b.hotelName} · Room {b.roomNumber}
                      </td>
                      <td className="px-5 py-3 text-paper-700 whitespace-nowrap">
                        {b.roomType ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-paper-700 whitespace-nowrap">{formatDate(b.checkIn)}</td>
                      <td className="px-5 py-3 text-paper-700 whitespace-nowrap">{formatDate(b.checkOut)}</td>
                      <td className="px-5 py-3 text-brass-700 font-medium">{formatCurrency(b.totalPrice)}</td>
                      <td className="px-5 py-3 text-paper-700">
                        {b.advancePaid != null ? formatCurrency(b.advancePaid) : '—'}
                      </td>
                      <td className="px-5 py-3 text-paper-700">
                        {b.remainingAmount != null ? formatCurrency(b.remainingAmount) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status]}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                Page {page + 1} of {totalPages} · {PAGE_SIZE} rows per page
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
