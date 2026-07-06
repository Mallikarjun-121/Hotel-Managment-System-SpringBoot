import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BedDouble, Calendar, CheckCircle2, CreditCard, MapPin, Moon } from 'lucide-react';
import { roomsApi } from '@/api/rooms';
import { bookingsApi } from '@/api/bookings';
import { extractErrorMessage } from '@/api/client';
import { formatCurrency, nightsBetween, roomImage, ROOM_TYPE_LABELS } from '@/lib/format';
import { useAuth } from '@/context/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import Banner from '@/components/Banner';

export default function BookingPage() {
  const { id } = useParams();
  const roomId = Number(id);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') ?? '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') ?? '');

  // New backend fields
  const [payLater, setPayLater] = useState(false);
  const [advancePaid, setAdvancePaid] = useState('');

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    if (!roomId) return;
    roomsApi
      .getById(roomId)
      .then(setRoom)
      .catch((err) => setLoadError(extractErrorMessage(err, 'This room could not be found.')))
      .finally(() => setLoading(false));
  }, [roomId]);

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const total = room && nights > 0 ? room.price * nights : 0;
  const advancePaidNum = parseFloat(advancePaid) || 0;
  const remaining = payLater ? total - advancePaidNum : 0;

  const handleConfirm = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/book/${roomId}` } } });
      return;
    }
    if (!checkIn || !checkOut) {
      setSubmitError('Choose both a check-in and check-out date.');
      return;
    }
    if (checkOut <= checkIn) {
      setSubmitError('Check-out must be after check-in.');
      return;
    }
    if (payLater && advancePaidNum <= 0) {
      setSubmitError('Enter an advance payment amount when paying later.');
      return;
    }
    if (payLater && advancePaidNum >= total) {
      setSubmitError('Advance paid cannot exceed total price. Uncheck "Pay later" for full payment.');
      return;
    }

    setSubmitting(true);
    try {
      // Build payload with new backend fields
      const payload = { roomId, checkIn, checkOut, payLater };
      if (payLater && advancePaidNum > 0) {
        payload.advancePaid = advancePaidNum;
      }
      const booking = await bookingsApi.create(payload);
      setConfirmedBooking(booking);
    } catch (err) {
      setSubmitError(extractErrorMessage(err, 'Could not complete the booking. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loadError || !room) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <Banner variant="error">{loadError || 'Room not found.'}</Banner>
        <Link to="/rooms" className="inline-block mt-6 text-meridian-800 font-semibold text-sm">
          Back to all hotels
        </Link>
      </div>
    );
  }

  if (confirmedBooking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center bg-paper-50 border border-paper-300/60 rounded-2xl p-10 shadow-sm"
        >
          <div className="w-14 h-14 rounded-full bg-meridian-100 text-meridian-700 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="font-display text-2xl text-paper-950 mb-2">Booking confirmed</h1>
          <p className="text-paper-700 text-sm mb-4">
            Your stay at <strong>{room.hotelName}</strong> is set for {checkIn} to {checkOut}.
            Booking reference #{confirmedBooking.id}.
          </p>

          {/* Show payment breakdown from new backend response */}
          {confirmedBooking.payLater && (
            <div className="bg-brass-100 border border-brass-200 rounded-lg px-4 py-3 text-sm text-brass-700 mb-6 text-left">
              <div className="flex justify-between mb-1">
                <span>Total amount</span>
                <span className="font-semibold">{formatCurrency(confirmedBooking.totalPrice)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Advance paid</span>
                <span className="font-semibold">{formatCurrency(confirmedBooking.advancePaid)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-brass-300 pt-1 mt-1">
                <span>Due at check-in</span>
                <span>{formatCurrency(confirmedBooking.remainingAmount)}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/my-bookings"
              className="px-5 py-2.5 bg-meridian-900 hover:bg-meridian-800 text-paper-50 rounded-lg text-sm font-semibold transition-colors"
            >
              View my bookings
            </Link>
            <Link
              to="/rooms"
              className="px-5 py-2.5 border border-paper-300 text-paper-700 hover:border-meridian-700 rounded-lg text-sm font-semibold transition-colors"
            >
              Browse more rooms
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-paper-100/40 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <h1 className="font-display text-3xl text-paper-950 mb-2">Confirm your stay</h1>
        <p className="text-paper-700 mb-8">Review the details below, then confirm to lock in this room.</p>

        {/* Room card */}
        <div className="bg-paper-50 border border-paper-300/60 rounded-2xl overflow-hidden shadow-sm mb-7">
          <div className="flex flex-col sm:flex-row">
            <img
              src={roomImage(room.type)}
              alt={ROOM_TYPE_LABELS[room.type]}
              className="w-full sm:w-56 h-44 object-cover"
            />
            <div className="p-6 flex-1">
              <div className="flex items-center gap-1.5 text-paper-500 text-xs font-medium uppercase tracking-wide mb-2">
                <MapPin className="w-3.5 h-3.5" />
                {room.hotelName}
              </div>
              <h2 className="font-display text-xl text-paper-950 mb-1">
                {ROOM_TYPE_LABELS[room.type]} Room {room.roomNumber}
              </h2>
              <div className="flex items-center gap-1.5 text-sm text-paper-700">
                <BedDouble className="w-3.5 h-3.5" />
                {formatCurrency(room.price)} / night
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleConfirm} className="bg-paper-50 border border-paper-300/60 rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <DateField label="Check-in" value={checkIn} onChange={setCheckIn} />
            <DateField label="Check-out" value={checkOut} onChange={setCheckOut} />
          </div>

          {nights > 0 && (
            <div className="flex items-center justify-between py-4 border-t border-paper-300/60 text-sm text-paper-700 mb-4">
              <span className="flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5" />
                {nights} night{nights > 1 ? 's' : ''} &times; {formatCurrency(room.price)}
              </span>
              <span className="font-display text-lg text-brass-700">{formatCurrency(total)}</span>
            </div>
          )}

          {/* NEW: Pay Later option from new backend */}
          <div className="border border-paper-300/60 rounded-xl p-4 mb-5 bg-paper-100/50">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={payLater}
                onChange={(e) => setPayLater(e.target.checked)}
                className="w-4 h-4 accent-meridian-800 rounded"
              />
              <span className="text-sm font-medium text-paper-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-paper-500" />
                Pay later (pay a portion now, rest at check-in)
              </span>
            </label>

            {payLater && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-paper-500 uppercase tracking-wider mb-1.5">
                  Advance payment (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  max={total - 1}
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value)}
                  placeholder="Enter amount to pay now"
                  className="w-full px-3 py-2.5 border border-paper-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brass-400 text-paper-900 text-sm"
                />
                {advancePaidNum > 0 && total > 0 && (
                  <div className="mt-3 text-xs text-paper-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Paying now</span>
                      <span className="font-semibold text-meridian-800">{formatCurrency(advancePaidNum)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Due at check-in</span>
                      <span className="font-semibold text-brass-700">{formatCurrency(remaining)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {submitError && (
            <div className="mb-4">
              <Banner variant="error">{submitError}</Banner>
            </div>
          )}

          {!isAuthenticated && (
            <div className="mb-4">
              <Banner variant="info">You'll need to log in to finish this booking.</Banner>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-meridian-900 hover:bg-meridian-800 disabled:opacity-60 text-paper-50 font-semibold rounded-lg transition-colors"
          >
            {submitting ? 'Confirming…' : isAuthenticated ? 'Confirm booking' : 'Log in to continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-paper-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-paper-400 pointer-events-none" />
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full pl-10 pr-3 py-2.5 border border-paper-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brass-400 text-paper-900 text-sm"
        />
      </div>
    </div>
  );
}
