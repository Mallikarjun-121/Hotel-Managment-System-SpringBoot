import { api } from './client';

export const hotelsApi = {
  getAll: (page = 0, size = 12, sortBy = 'id', sortDir = 'asc') =>
    api
      .get('/hotels', { params: { page, size, sortBy, sortDir } })
      .then((r) => r.data),

  getById: (id) => api.get(`/hotels/${id}`).then((r) => r.data),

  search: (keyword, page = 0, size = 12) =>
    api
      .get('/hotels/search', { params: { keyword, page, size } })
      .then((r) => r.data),

  create: (payload) => api.post('/hotels', payload).then((r) => r.data),

  update: (id, payload) =>
    api.put(`/hotels/${id}`, payload).then((r) => r.data),

  remove: (id) => api.delete(`/hotels/${id}`).then((r) => r.data),

  uploadImage: (id, file) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post(`/hotels/${id}/image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};
