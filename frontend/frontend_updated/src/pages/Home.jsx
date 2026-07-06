import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Compass, MapPin, ShieldCheck } from 'lucide-react';
import { hotelsApi } from '@/api/hotels';
import { hotelImage } from '@/lib/format';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    hotelsApi
      .getAll(0, 6, 'id', 'desc')
      .then((res) => setHotels(res.content))
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-meridian-950">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=2000&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-meridian-950/40 via-meridian-950/70 to-meridian-950" />
        </div>

        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-28 pb-24 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-brass-300 text-xs font-semibold uppercase tracking-[0.2em] mb-5"
          >
            <Compass className="w-3.5 h-3.5" />
            Considered stays
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="font-display text-4xl sm:text-6xl text-paper-50 leading-[1.05] tracking-tight mb-5"
          >
            A quieter way<br className="hidden sm:block" /> to book a room.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="text-paper-200/80 text-base sm:text-lg max-w-xl mx-auto mb-10"
          >
            Meridian Stay gathers a small set of well-kept hotels and rooms — clear pricing,
            honest availability, no surprises at check-in.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            onSubmit={handleSearch}
            className="bg-paper-50 rounded-2xl p-2.5 shadow-2xl max-w-lg mx-auto flex items-stretch gap-2"
          >
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by city or hotel name"
              className="flex-1 px-4 py-3 text-sm text-paper-950 placeholder:text-paper-500 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-meridian-900 hover:bg-meridian-800 text-paper-50 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors flex-shrink-0"
            >
              Search
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-paper-50 border-b border-paper-300/60">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">
          <Feature
            icon={BadgeCheck}
            title="Transparent pricing"
            description="The price per night you see is the price you pay — no fees revealed at checkout."
          />
          <Feature
            icon={ShieldCheck}
            title="Verified availability"
            description="Rooms are checked against live bookings, so what you see is what's actually free."
          />
          <Feature
            icon={MapPin}
            title="Well-placed hotels"
            description="Every property in the collection is chosen for its location, not just its photos."
          />
        </div>
      </section>

      {/* Featured hotels */}
      <section className="bg-paper-100/60 py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl text-paper-950 mb-2">The collection</h2>
              <p className="text-paper-700">A handful of hotels, each one walked through in person.</p>
            </div>
            <Link
              to="/rooms"
              className="hidden md:flex items-center gap-1.5 text-meridian-800 font-semibold hover:text-meridian-900 text-sm"
            >
              Browse all rooms <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : hotels.length === 0 ? (
            <p className="text-paper-700 text-center py-16">
              No hotels are listed yet — check back soon, or sign in as an admin to add the first one.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {hotels.map((hotel, i) => (
                <HotelCard key={hotel.id} hotel={hotel} index={i} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center md:hidden">
            <Link to="/rooms" className="inline-flex items-center gap-1.5 text-meridian-800 font-semibold text-sm">
              Browse all rooms <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon: Icon, title, description }) {
  return (
    <div className="flex gap-4">
      <span className="w-11 h-11 rounded-full bg-meridian-100 flex items-center justify-center text-meridian-700 flex-shrink-0">
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </span>
      <div>
        <h3 className="font-semibold text-paper-950 mb-1">{title}</h3>
        <p className="text-sm text-paper-700 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function HotelCard({ hotel, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.2) }}
      whileHover={{ y: -3 }}
      className="bg-paper-50 rounded-2xl overflow-hidden border border-paper-300/60 shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="relative h-48">
        <img src={hotelImage(hotel.imageUrl)} alt={hotel.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-meridian-950/30 to-transparent" />
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
