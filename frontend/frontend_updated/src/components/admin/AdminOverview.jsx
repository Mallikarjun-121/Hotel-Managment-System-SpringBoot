import { BedDouble, Building2, CalendarCheck2, IndianRupee } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

export default function AdminOverview({ hotels, rooms, bookings }) {
  const confirmed = bookings.filter((b) => b.status === 'CONFIRMED');
  const revenue = confirmed.reduce((sum, b) => sum + (b.totalPrice ?? 0), 0);

  const stats = [
    { icon: Building2, label: 'Hotels', value: hotels.length },
    { icon: BedDouble, label: 'Rooms', value: rooms.length },
    { icon: CalendarCheck2, label: 'Confirmed bookings', value: confirmed.length },
    { icon: IndianRupee, label: 'Revenue (confirmed)', value: formatCurrency(revenue) },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-paper-50 border border-paper-300/60 rounded-2xl p-5 shadow-sm">
            <span className="w-9 h-9 rounded-full bg-meridian-100 text-meridian-700 flex items-center justify-center mb-3">
              <stat.icon className="w-4.5 h-4.5" strokeWidth={1.75} />
            </span>
            <div className="font-display text-2xl text-paper-950">{stat.value}</div>
            <div className="text-xs text-paper-500 uppercase tracking-wide font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <h3 className="font-display text-lg text-paper-950 mb-4">Most recent bookings</h3>
      <div className="bg-paper-50 border border-paper-300/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-paper-300/60 text-left text-paper-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Guest</th>
                <th className="px-5 py-3 font-medium">Hotel / Room</th>
                <th className="px-5 py-3 font-medium">Dates</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Pay Later</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 8).map((b) => (
                <tr key={b.id} className="border-b border-paper-300/40 last:border-0">
                  <td className="px-5 py-3 text-paper-900">{b.userName}</td>
                  <td className="px-5 py-3 text-paper-700">
                    {b.hotelName} · Room {b.roomNumber}
                  </td>
                  <td className="px-5 py-3 text-paper-700 whitespace-nowrap">
                    {b.checkIn} &rarr; {b.checkOut}
                  </td>
                  <td className="px-5 py-3 text-brass-700 font-medium">{formatCurrency(b.totalPrice)}</td>
                  <td className="px-5 py-3">
                    {b.payLater ? (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-brass-100 text-brass-700">
                        Yes
                      </span>
                    ) : (
                      <span className="text-xs text-paper-400">Full</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-meridian-100 text-meridian-800">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-paper-500">
                    No bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
