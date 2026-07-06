import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BedDouble, Calendar, MapPin } from 'lucide-react';
import { hotelsApi } from '@/api/hotels';
import { roomsApi } from '@/api/rooms';
import { formatCurrency, hotelImage, roomImage, ROOM_TYPE_DESCRIPTIONS, ROOM_TYPE_LABELS } from '@/lib/format';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Banner from '@/components/Banner';
import { extractErrorMessage } from '@/api/client';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}
function tomorrowISO() {
  return new Date(Date.now() + 86400000).toISOString().split('T')[0];
}

export default function HotelDetail() {
  const { id } = useParams();
  const hotelId = Number(id);

  const [hotel, setHotel] = useState(null);
  const [loadingHotel, setLoadingHotel] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    if (!hotelId) return;
    hotelsApi
      .getById(hotelId)
      .then(setHotel)
      .catch((err) => setLoadError(extractErrorMessage(err, 'This hotel could not be found.')))
      .finally(() => setLoadingHotel(false));
  }, [hotelId]);

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    setSearchError('');
    if (!checkIn || !checkOut) {
      setSearchError('Choose both a check-in and check-out date.');
      return;
    }
    if (checkOut <= checkIn) {
      setSearchError('Check-out must be after check-in.');
      return;
    }
    setSearching(true);
    try {
      const available = await roomsApi.getAvailable(hotelId, checkIn, checkOut);
      setRooms(available);
    } catch (err) {
      setSearchError(extractErrorMessage(err, 'Could not check availability right now.'));
      setRooms(null);
    } finally {
      setSearching(false);
    }
  };

  if (loadingHotel) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loadError || !hotel) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-20">
        <EmptyState
          icon={MapPin}
          title="Hotel not found"
          description={loadError || 'This hotel may have been removed.'}
          action={
            <Link to="/rooms" className="text-meridian-800 font-semibold text-sm hover:text-meridian-900">
              Back to all hotels
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-paper-100/40 min-h-screen">
      {/* Hero image */}
      <div className="relative h-[320px] sm:h-[400px]">
        <img src={hotelImage(hotel.imageUrl)} alt={hotel.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-meridian-950/80 via-meridian-950/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-8">
            <div className="flex items-center gap-1.5 text-brass-300 text-sm font-medium mb-2">
              <MapPin className="w-4 h-4" />
              {hotel.location}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-paper-50">{hotel.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">
        {hotel.description && (
          <p className="text-paper-700 leading-relaxed max-w-2xl mb-12">{hotel.description}</p>
        )}

        {/* Availability search */}
        <div className="bg-paper-50 border border-paper-300/60 rounded-2xl p-6 sm:p-7 shadow-sm mb-12">
          <h2 className="font-display text-xl text-paper-950 mb-5">Check availability</h2>
          <form onSubmit={handleCheckAvailability} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DateField label="Check-in" value={checkIn} min={todayISO()} onChange={setCheckIn} />
            <DateField label="Check-out" value={checkOut} min={checkIn || tomorrowISO()} onChange={setCheckOut} />
            <div className="flex flex-col">
              <span className="block text-xs font-semibold text-paper-500 uppercase tracking-wider mb-1.5 invisible sm:visible">
                &nbsp;
              </span>
              <button
                type="submit"
                disabled={searching}
                className="h-full bg-meridian-900 hover:bg-meridian-800 disabled:opacity-60 text-paper-50 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {searching ? 'Checking…' : 'Check rooms'}
              </button>
            </div>
          </form>
          {searchError && (
            <div className="mt-4">
              <Banner variant="error">{searchError}</Banner>
            </div>
          )}
        </div>

        {/* Results */}
        {rooms !== null && (
          <div>
            <h2 className="font-display text-xl text-paper-950 mb-5">
              {rooms.length > 0
                ? `${rooms.length} room${rooms.length > 1 ? 's' : ''} available`
                : 'No rooms available for these dates'}
            </h2>
            {rooms.length === 0 ? (
              <EmptyState
                icon={BedDouble}
                title="Fully booked for these dates"
                description="Try a different set of dates, or check back later — cancellations happen."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {rooms.map((room, i) => (
                  <RoomCard key={room.id} room={room} checkIn={checkIn} checkOut={checkOut} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DateField({ label, value, min, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-paper-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-paper-400 pointer-events-none" />
        <input
          type="date"
          min={min}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 border border-paper-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brass-400 text-paper-900 text-sm"
        />
      </div>
    </div>
  );
}

function RoomCard({ room, checkIn, checkOut, index }) {
  const bookLink = `/book/${room.id}?checkIn=${checkIn}&checkOut=${checkOut}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.2) }}
      className="bg-paper-50 border border-paper-300/60 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row"
    >
      <img src={roomImage(room.type)} alt={ROOM_TYPE_LABELS[room.type]} className="w-full sm:w-40 h-40 object-cover" />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-paper-500 text-xs font-medium uppercase tracking-wide mb-1.5">
          <BedDouble className="w-3.5 h-3.5" />
          {ROOM_TYPE_LABELS[room.type]}
          <span>·</span>
          Room {room.roomNumber}
        </div>
        <p className="text-sm text-paper-700 mb-3 flex-1">{ROOM_TYPE_DESCRIPTIONS[room.type]}</p>
        <div className="flex items-end justify-between">
          <div>
            <span className="font-display text-xl text-brass-700">{formatCurrency(room.price)}</span>
            <span className="text-xs text-paper-500"> / night</span>
          </div>
          <Link
            to={bookLink}
            className="px-4 py-2 bg-brass-500 hover:bg-brass-600 text-meridian-950 rounded-lg text-sm font-semibold transition-colors"
          >
            Book now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
