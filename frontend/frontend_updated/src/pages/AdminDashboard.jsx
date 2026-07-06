import { useEffect, useState } from 'react';
import { BedDouble, Building2, CalendarCheck2, LayoutDashboard } from 'lucide-react';
import { hotelsApi } from '@/api/hotels';
import { roomsApi } from '@/api/rooms';
import { bookingsApi } from '@/api/bookings';
import { extractErrorMessage } from '@/api/client';
import LoadingSpinner from '@/components/LoadingSpinner';
import Banner from '@/components/Banner';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminHotels from '@/components/admin/AdminHotels';
import AdminRooms from '@/components/admin/AdminRooms';
import AdminBookings from '@/components/admin/AdminBookings';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'hotels', label: 'Hotels', icon: Building2 },
  { key: 'rooms', label: 'Rooms', icon: BedDouble },
  { key: 'bookings', label: 'Bookings', icon: CalendarCheck2 },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [hotelsRes, roomsRes, bookingsRes] = await Promise.all([
        hotelsApi.getAll(0, 100, 'id', 'desc'),
        roomsApi.getAll(0, 200),
        bookingsApi.getAll(0, 200),
      ]);
      setHotels(hotelsRes.content);
      setRooms(roomsRes.content);
      setBookings(bookingsRes.content);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load the dashboard.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="bg-paper-100/40 min-h-screen">
      <section className="bg-meridian-950 py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <h1 className="font-display text-3xl sm:text-4xl text-paper-50 mb-2">Admin dashboard</h1>
          <p className="text-paper-200/70">Manage hotels, rooms, and bookings for Meridian Stay.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 -mt-6">
        <div className="bg-paper-50 border border-paper-300/60 rounded-2xl shadow-sm p-1.5 flex gap-1 overflow-x-auto thin-scroll mb-8 w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.key ? 'bg-meridian-900 text-paper-50' : 'text-paper-700 hover:bg-paper-100'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        {error && (
          <div className="mb-6">
            <Banner variant="error">{error}</Banner>
          </div>
        )}

        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {tab === 'overview' && <AdminOverview hotels={hotels} rooms={rooms} bookings={bookings} />}
            {tab === 'hotels' && <AdminHotels hotels={hotels} onChanged={loadAll} />}
            {tab === 'rooms' && <AdminRooms rooms={rooms} hotels={hotels} onChanged={loadAll} />}
            {tab === 'bookings' && <AdminBookings bookings={bookings} />}
          </>
        )}
      </section>
    </div>
  );
}
