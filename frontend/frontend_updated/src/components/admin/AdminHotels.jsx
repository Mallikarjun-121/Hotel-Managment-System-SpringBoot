import { useState } from 'react';
import { ArrowUpDown, Building2, ChevronLeft, ChevronRight, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { hotelsApi } from '@/api/hotels';
import { extractErrorMessage } from '@/api/client';
import { hotelImage } from '@/lib/format';
import Modal from '@/components/Modal';
import Banner from '@/components/Banner';
import EmptyState from '@/components/EmptyState';

const PAGE_SIZE = 6;
const EMPTY_FORM = { name: '', location: '', description: '' };

const SORT_OPTIONS = [
  { label: 'Newest first',   key: 'id',       dir: 'desc' },
  { label: 'Oldest first',   key: 'id',       dir: 'asc'  },
  { label: 'Name A → Z',    key: 'name',     dir: 'asc'  },
  { label: 'Name Z → A',    key: 'name',     dir: 'desc' },
  { label: 'Location A → Z',key: 'location', dir: 'asc'  },
  { label: 'Location Z → A',key: 'location', dir: 'desc' },
];

function sortItems(list, sortKey, sortDir) {
  return [...list].sort((a, b) => {
    let vA = (a[sortKey] ?? '').toString().toLowerCase();
    let vB = (b[sortKey] ?? '').toString().toLowerCase();
    if (vA < vB) return sortDir === 'asc' ? -1 : 1;
    if (vA > vB) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });
}

export default function AdminHotels({ hotels, onChanged }) {
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formError, setFormError]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [listError, setListError]   = useState('');

  // Pagination
  const [page, setPage]             = useState(0);

  // Sorting
  const [sortIndex, setSortIndex]   = useState(0);
  const { key: sortKey, dir: sortDir } = SORT_OPTIONS[sortIndex];

  const handleSortChange = (idx) => { setSortIndex(idx); setPage(0); };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (hotel) => {
    setEditing(hotel);
    setForm({ name: hotel.name, location: hotel.location, description: hotel.description });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.location.trim()) {
      setFormError('Name and location are required.');
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await hotelsApi.update(editing.id, form);
      } else {
        await hotelsApi.create(form);
      }
      setModalOpen(false);
      onChanged();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Could not save this hotel.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hotel? Its rooms will be removed too.')) return;
    setDeletingId(id);
    setListError('');
    try {
      await hotelsApi.remove(id);
      onChanged();
    } catch (err) {
      setListError(extractErrorMessage(err, 'Could not delete this hotel.'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleImageUpload = async (id, file) => {
    setUploadingId(id);
    setListError('');
    try {
      await hotelsApi.uploadImage(id, file);
      onChanged();
    } catch (err) {
      setListError(extractErrorMessage(err, 'Could not upload that image.'));
    } finally {
      setUploadingId(null);
    }
  };

  // Sort then paginate
  const sorted     = sortItems(hotels, sortKey, sortDir);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageItems  = sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <h3 className="font-display text-lg text-paper-950">Hotels</h3>
        <div className="flex items-center gap-3 flex-wrap">
          {hotels.length > 0 && (
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
            className="flex items-center gap-1.5 px-4 py-2 bg-meridian-900 hover:bg-meridian-800 text-paper-50 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add hotel
          </button>
        </div>
      </div>

      {listError && (
        <div className="mb-5">
          <Banner variant="error">{listError}</Banner>
        </div>
      )}

      {hotels.length === 0 ? (
        <EmptyState icon={Building2} title="No hotels yet" description="Add your first hotel to get started." />
      ) : (
        <>
          {/* Hotel cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {pageItems.map((hotel) => (
              <div key={hotel.id} className="bg-paper-50 border border-paper-300/60 rounded-2xl overflow-hidden shadow-sm">
                <div className="relative h-32">
                  <img src={hotelImage(hotel.imageUrl)} alt={hotel.name} className="w-full h-full object-cover" />
                  <label
                    className="absolute bottom-2 right-2 bg-paper-50/90 hover:bg-paper-50 text-paper-700 rounded-full p-1.5 cursor-pointer transition-colors"
                    title={uploadingId === hotel.id ? 'Uploading…' : 'Upload image'}
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingId === hotel.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(hotel.id, file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
                <div className="p-4">
                  <h4 className="font-display text-base text-paper-950 mb-0.5">{hotel.name}</h4>
                  <p className="text-xs text-paper-500 mb-2">{hotel.location}</p>
                  <p className="text-xs text-paper-700 line-clamp-2 mb-3 min-h-[2rem]">
                    {hotel.description || 'No description yet.'}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(hotel)}
                      className="flex items-center gap-1 text-xs font-medium text-meridian-800 hover:text-meridian-900"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(hotel.id)}
                      disabled={deletingId === hotel.id}
                      className="flex items-center gap-1 text-xs font-medium text-paper-500 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      {deletingId === hotel.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                Page {page + 1} of {totalPages} · {PAGE_SIZE} hotels per page
              </p>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal — unchanged */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit hotel' : 'Add hotel'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Banner variant="error">{formError}</Banner>}
          <FormField label="Name">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={150}
              required
              className="w-full px-3 py-2.5 border border-paper-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brass-400"
            />
          </FormField>
          <FormField label="Location">
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              maxLength={200}
              required
              className="w-full px-3 py-2.5 border border-paper-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brass-400"
            />
          </FormField>
          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 border border-paper-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brass-400 resize-none"
            />
          </FormField>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-meridian-900 hover:bg-meridian-800 disabled:opacity-60 text-paper-50 font-semibold rounded-lg transition-colors"
          >
            {submitting ? 'Saving…' : editing ? 'Save changes' : 'Add hotel'}
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
