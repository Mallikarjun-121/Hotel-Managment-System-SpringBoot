import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpDown, ChevronLeft, ChevronRight, MapPin, Search } from 'lucide-react';
import { hotelsApi } from '@/api/hotels';
import { hotelImage } from '@/lib/format';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

const PAGE_SIZE = 9;

// Sort options that match your backend's HotelController sortBy/sortDir params
const SORT_OPTIONS = [
  { label: 'Newest first',  sortBy: 'id',       sortDir: 'desc' },
  { label: 'Oldest first',  sortBy: 'id',       sortDir: 'asc'  },
  { label: 'Name A → Z',   sortBy: 'name',     sortDir: 'asc'  },
  { label: 'Name Z → A',   sortBy: 'name',     sortDir: 'desc' },
  { label: 'Location A → Z', sortBy: 'location', sortDir: 'asc' },
  { label: 'Location Z → A', sortBy: 'location', sortDir: 'desc'},
];

export default function Rooms() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery]           = useState(initialQuery);
  const [hotels, setHotels]         = useState([]);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]       = useState(true);

  // Sorting state — default: Newest first (matches original getAll call)
  const [sortIndex, setSortIndex]   = useState(0);
  const { sortBy, sortDir }         = SORT_OPTIONS[sortIndex];

  // Reset to page 0 whenever sort or search changes
  useEffect(() => { setPage(0); }, [sortIndex, initialQuery]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        // When searching, backend search endpoint doesn't support sortBy/sortDir
        // so we sort client-side for search results
        const res = initialQuery
          ? await hotelsApi.search(initialQuery, page, PAGE_SIZE)
          : await hotelsApi.getAll(page, PAGE_SIZE, sortBy, sortDir);

        if (cancelled) return;

        let content = res.content;

        // Client-side sort for search results (search API has no sort params)
        if (initialQuery) {
          content = [...content].sort((a, b) => {
            const valA = (a[sortBy] ?? '').toString().toLowerCase();
            const valB = (b[sortBy] ?? '').toString().toLowerCase();
            const cmp  = valA.localeCompare(valB);
            return sortDir === 'asc' ? cmp : -cmp;
          });
        }

        setHotels(content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      } catch {
        if (cancelled) return;
        setHotels([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [page, initialQuery, sortBy, sortDir]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    const trimmed = query.trim();
    setSearchParams(trimmed ? { q: trimmed } : {});
  };

  return (
    <div className="bg-paper-100/40 min-h-screen">
      {/* Header */}
      <section className="bg-meridian-950 py-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <h1 className="font-display text-3xl sm:text-4xl text-paper-50 mb-3">The collection</h1>
          <p className="text-paper-200/70 max-w-lg mb-7">
            Every hotel currently open for booking. Choose one to see its rooms and check live availability.
          </p>
          <form onSubmit={handleSearch} className="flex items-stretch gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-paper-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by city or hotel name"
                className="w-full pl-10 pr-3 py-3 rounded-xl bg-paper-50 text-sm text-paper-950 placeholder:text-paper-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-brass-500 hover:bg-brass-600 text-meridian-950 rounded-xl text-sm font-semibold transition-colors flex-shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14">

        {/* ── Sort bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <p className="text-sm text-paper-600">
            {!loading && totalElements > 0 && (
              <>
                {initialQuery
                  ? <>Results for <strong className="text-paper-900">"{initialQuery}"</strong> — </>
                  : ''}
                <strong className="text-paper-900">{totalElements}</strong>{' '}
                hotel{totalElements !== 1 ? 's' : ''} found
              </>
            )}
          </p>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-paper-500 flex-shrink-0" />
            <label className="text-sm text-paper-600 sr-only">Sort by</label>
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

        {/* ── Content ── */}
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : hotels.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No hotels found"
            description={
              initialQuery
                ? `Nothing matched "${initialQuery}". Try a different city or hotel name.`
                : 'There are no hotels listed yet.'
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mb-10">
              {hotels.map((hotel, i) => (
                <HotelCard key={hotel.id} hotel={hotel} index={i} />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4">
                {/* Page number buttons */}
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
                  Page {page + 1} of {totalPages} · {PAGE_SIZE} hotels per page
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function HotelCard({ hotel, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.2) }}
      whileHover={{ y: -3 }}
      className="bg-paper-50 rounded-2xl overflow-hidden border border-paper-300/60 shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="relative h-48">
        <img src={hotelImage(hotel.imageUrl)} alt={hotel.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1.5 text-paper-500 text-xs font-medium uppercase tracking-wide mb-2">
          <MapPin className="w-3.5 h-3.5" />
          {hotel.location}
        </div>
        <h3 className="font-display text-xl text-paper-950 mb-2">{hotel.name}</h3>
        <p className="text-sm text-paper-700 line-clamp-2 mb-4 min-h-[2.5rem]">
          {hotel.description || 'A well-kept property in the Meridian Stay collection.'}
        </p>
        <Link
          to={`/hotels/${hotel.id}`}
          className="block text-center w-full py-2.5 border border-meridian-700 text-meridian-800 hover:bg-meridian-900 hover:text-paper-50 hover:border-meridian-900 rounded-lg font-medium text-sm transition-colors"
        >
          View rooms
        </Link>
      </div>
    </motion.div>
  );
}
