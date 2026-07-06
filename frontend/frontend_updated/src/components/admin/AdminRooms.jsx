import { useState } from 'react';
import { ArrowUpDown, BedDouble, ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { roomsApi } from '@/api/rooms';
import { extractErrorMessage } from '@/api/client';
import { formatCurrency, ROOM_TYPE_LABELS } from '@/lib/format';
import Modal from '@/components/Modal';
import Banner from '@/components/Banner';
import EmptyState from '@/components/EmptyState';

const PAGE_SIZE  = 10;
const ROOM_TYPES = ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE'];

const SORT_OPTIONS = [
  { label: 'Newest first',    key: 'id',         dir: 'desc' },
  { label: 'Oldest first',    key: 'id',         dir: 'asc'  },
  { label: 'Room No. ↑',     key: 'roomNumber',  dir: 'asc'  },
  { label: 'Room No. ↓',     key: 'roomNumber',  dir: 'desc' },
  { label: 'Hotel A → Z',    key: 'hotelName',   dir: 'asc'  },
  { label: 'Type A → Z',     key: 'type',        dir: 'asc'  },
  { label: 'Price: low → high', key: 'price',    dir: 'asc'  },
  { label: 'Price: high → low', key: 'price',    dir: 'desc' },
  { label: 'Available first', key: 'available',  dir: 'desc' },
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

function emptyForm(hotels) {
  return { hotelId: hotels[0]?.id ?? 0, roomNumber: '', type: 'SINGLE', price: 0 };
}

export default function AdminRooms({ rooms, hotels, onChanged }) {
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState(null);
  const [form, setForm]               = useState(emptyForm(hotels));
  const [formError, setFormError]     = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [deletingId, setDeletingId]   = useState(null);
  const [listError, setListError]     = useState('');
  const [filterHotelId, setFilterHotelId] = useState('all');

  // Pagination
  const [page, setPage]               = useState(0);

  // Sorting
  const [sortIndex, setSortIndex]     = useState(0);
  const { key: sortKey, dir: sortDir } = SORT_OPTIONS[sortIndex];

  const handleSortChange = (idx) => { setSortIndex(idx); setPage(0); };
  const handleFilterChange = (val) => { setFilterHotelId(val); setPage(0); };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm(hotels));
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (room) => {
    setEditing(room);
    setForm({ hotelId: room.hotelId, roomNumber: room.roomNumber, type: room.type, price: room.price });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.hotelId)           { setFormError('Choose a hotel for this room.'); return; }
    if (!form.roomNumber.trim()) { setFormError('Room number is required.'); return; }
    if (!form.price || form.price <= 0) { setFormError('Price must be greater than 0.'); return; }

    setSubmitting(true);
    try {
      if (editing) {
        await roomsApi.update(editing.id, form);
      } else {
        await roomsApi.create(form);
      }
      setModalOpen(false);
      onChanged();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Could not save this room.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room? Existing bookings reference it, so this may fail if any exist.')) return;
    setDeletingId(id);
    setListError('');
    try {
      await roomsApi.remove(id);
      onChanged();
    } catch (err) {
      setListError(extractErrorMessage(err, 'Could not delete this room.'));
    } finally {
      setDeletingId(null);
    }
  };

  // Filter → sort → paginate
  const filtered   = filterHotelId === 'all'
    ? rooms
    : rooms.filter((r) => String(r.hotelId) === String(filterHotelId));

  const sorted     = sortItems(filtered, sortKey, sortDir);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageItems  = sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      {/* Header with filter + sort + add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 flex-wrap">
        <h3 className="font-display text-lg text-paper-950">Rooms</h3>
        <div className="flex items-center gap-3 flex-wrap">

          {/* Hotel filter dropdown */}
          <select
            value={filterHotelId}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-2 border border-paper-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brass-400 bg-paper-50"
          >
            <option value="all">All hotels</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>

          {/* Sort dropdown */}
          {filtered.length > 0 && (
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
            </div>
          )}

          <button
            onClick={openAdd}
            disabled={hotels.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-meridian-900 hover:bg-meridian-800 disabled:opacity-50 text-paper-50 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add room
          </button>
        </div>
      </div>

      {hotels.length === 0 && (
        <div className="mb-5">
          <Banner variant="info">Add a hotel first — rooms need to belong to one.</Banner>
        </div>
      )}

      {listError && (
        <div className="mb-5">
          <Banner variant="error">{listError}</Banner>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={BedDouble} title="No rooms yet" description="Add rooms once you have at least one hotel." />
      ) : (
        <>
          {/* Count */}
          <p className="text-xs text-paper-500 mb-3">
            Showing <strong className="text-paper-700">{filtered.length}</strong> room{filtered.length !== 1 ? 's' : ''}
            {filterHotelId !== 'all' && ` for ${hotels.find(h => String(h.id) === String(filterHotelId))?.name}`}
          </p>

          {/* Table */}
          <div className="bg-paper-50 border border-paper-300/60 rounded-2xl overflow-hidden shadow-sm mb-5">
            <div className="overflow-x-auto thin-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-paper-300/60 text-left text-paper-500 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 font-medium">Room</th>
                    <th className="px-5 py-3 font-medium">Hotel</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Price / night</th>
                    <th className="px-5 py-3 font-medium">Available</th>
                    <th className="px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((room) => (
                    <tr key={room.id} className="border-b border-paper-300/40 last:border-0 hover:bg-paper-100/40 transition-colors">
                      <td className="px-5 py-3 text-paper-900 font-medium">{room.roomNumber}</td>
                      <td className="px-5 py-3 text-paper-700">{room.hotelName}</td>
                      <td className="px-5 py-3 text-paper-700">{ROOM_TYPE_LABELS[room.type]}</td>
                      <td className="px-5 py-3 text-brass-700 font-medium">{formatCurrency(room.price)}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          room.available ? 'bg-meridian-100 text-meridian-800' : 'bg-paper-300/60 text-paper-700'
                        }`}>
                          {room.available ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openEdit(room)} className="text-meridian-800 hover:text-meridian-900">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(room.id)}
                            disabled={deletingId === room.id}
                            className="text-paper-500 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
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

      {/* Add / Edit Modal — all fields unchanged */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit room' : 'Add room'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Banner variant="error">{formError}</Banner>}
          <FormField label="Hotel">
            <select
              value={form.hotelId}
              onChange={(e) => setForm({ ...form, hotelId: Number(e.target.value) })}
              className="w-full px-3 py-2.5 border border-paper-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brass-400 bg-paper-50"
            >
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Room number">
            <input
              value={form.roomNumber}
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
              required
              className="w-full px-3 py-2.5 border border-paper-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brass-400"
            />
          </FormField>
          <FormField label="Room type">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2.5 border border-paper-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brass-400 bg-paper-50"
            >
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>{ROOM_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Price per night (₹)">
            <input
              type="number"
              min="1"
              step="0.01"
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
              className="w-full px-3 py-2.5 border border-paper-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brass-400"
            />
          </FormField>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-meridian-900 hover:bg-meridian-800 disabled:opacity-60 text-paper-50 font-semibold rounded-lg transition-colors"
          >
            {submitting ? 'Saving…' : editing ? 'Save changes' : 'Add room'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-paper-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}
