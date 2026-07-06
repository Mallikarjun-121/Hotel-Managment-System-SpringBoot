import { api } from './client';

export const roomsApi = {
  // New backend: GET /api/rooms accepts optional ?hotelId= param
  // to filter rooms by hotel (combined endpoint, replaces separate getByHotel)
  getAll: (page = 0, size = 12) =>
    api.get('/rooms', { params: { page, size } }).then((r) => r.data),

  getByHotel: (hotelId, page = 0, size = 12) =>
    api
      .get('/rooms', { params: { hotelId, page, size } })
      .then((r) => r.data),

  getById: (id) => api.get(`/rooms/${id}`).then((r) => r.data),

  getAvailable: (hotelId, checkIn, checkOut) =>
    api
      .get('/rooms/available', { params: { hotelId, checkIn, checkOut } })
      .then((r) => r.data),

  create: (payload) => api.post('/rooms', payload).then((r) => r.data),

  update: (id, payload) =>
    api.put(`/rooms/${id}`, payload).then((r) => r.data),

  remove: (id) => api.delete(`/rooms/${id}`).then((r) => r.data),
};
