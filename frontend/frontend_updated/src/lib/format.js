const FALLBACKS = {
  SINGLE:
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80&auto=format&fit=crop',
  DOUBLE:
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80&auto=format&fit=crop',
  SUITE:
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80&auto=format&fit=crop',
  DELUXE:
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&q=80&auto=format&fit=crop',
};

const HOTEL_FALLBACK =
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80&auto=format&fit=crop';

export function roomImage(type) {
  return FALLBACKS[type] ?? FALLBACKS.DOUBLE;
}

export function hotelImage(imageUrl) {
  if (imageUrl && /^https?:\/\//.test(imageUrl)) return imageUrl;
  // New backend serves uploaded images at /uploads/** (WebConfig added static handler)
  if (imageUrl && imageUrl.startsWith('uploads/')) return `/${imageUrl}`;
  return HOTEL_FALLBACK;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function nightsBetween(checkIn, checkOut) {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export const ROOM_TYPE_LABELS = {
  SINGLE: 'Single',
  DOUBLE: 'Double',
  SUITE: 'Suite',
  DELUXE: 'Deluxe',
};

export const ROOM_TYPE_DESCRIPTIONS = {
  SINGLE: 'A quiet single room, ideal for solo travel.',
  DOUBLE: 'A comfortable double room with space to settle in.',
  SUITE: 'A generous suite with a separate sitting area.',
  DELUXE: 'Our most considered rooms, with extra space and finish.',
};
