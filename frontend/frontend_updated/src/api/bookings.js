import { api } from './client';

export const bookingsApi = {
  // New backend BookingRequest now supports: payLater (bool) + advancePaid (decimal)
  // checkIn validation relaxed to FutureOrPresent (was @Future)
  create: (payload) =>
    api.post('/bookings', payload).then((r) => r.data),

  getById: (id) => api.get(`/bookings/${id}`).then((r) => r.data),

  getAll: (page = 0, size = 10) =>
    api
      .get('/bookings', { params: { page, size } })
      .then((r) => r.data),

  getMine: (page = 0, size = 10) =>
    api
      .get('/bookings/my', { params: { page, size } })
      .then((r) => r.data),

  cancel: (id) =>
    api.put(`/bookings/${id}/cancel`).then((r) => r.data),
};
